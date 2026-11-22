import { useSyncExternalStore } from 'react';
import { sound } from '../audio/sfx';
import { fx } from '../fx/fx';
import { GameError, createRun, isValidSave } from '../engine/game';
import { randomSeedString } from '../engine/rng';
import type { RunState } from '../engine/types';

const SAVE_KEY = 'viral-king/save/v1';
const SETTINGS_KEY = 'viral-king/settings/v1';
const RECORDS_KEY = 'viral-king/records/v1';
const TUTORIAL_KEY = 'viral-king/tutorial-done';

export type Screen = 'menu' | 'help' | 'game';
export type AnimSpeed = 1 | 2 | 4;

export interface Settings {
  sound: boolean;
  music: boolean;
  volume: number;
  speed: AnimSpeed;
  shake: boolean;
  particles: boolean;
  crt: boolean;
}

export interface Records {
  runs: number;
  wins: number;
  bestVideo: number;
  bestVideoTitle: string;
  bestStage: number;
}

export interface Toast {
  id: number;
  text: string;
  kind: 'error' | 'info' | 'good';
}

export interface AppState {
  screen: Screen;
  run: RunState | null;
  settings: Settings;
  records: Records;
  toasts: Toast[];
  settingsOpen: boolean;
  tutorialDone: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  sound: true,
  music: true,
  volume: 0.6,
  speed: 1,
  shake: true,
  particles: true,
  crt: true,
};

const DEFAULT_RECORDS: Records = { runs: 0, wins: 0, bestVideo: 0, bestVideoTitle: '', bestStage: 0 };

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function save(key: string, v: unknown): void {
  try {
    if (v === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(v));
  } catch {
    /* storage full / private mode — ignore */
  }
}

function loadRun(): RunState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return isValidSave(v) ? v : null;
  } catch {
    return null;
  }
}

const SCREEN_KEY = 'viral-king/screen';
const initialRun = typeof localStorage !== 'undefined' ? loadRun() : null;
/** A page refresh keeps you on the same screen (per tab); a new tab starts at the menu. */
function initialScreen(): Screen {
  try {
    const v = sessionStorage.getItem(SCREEN_KEY) as Screen | null;
    if (v === 'game') return initialRun ? 'game' : 'menu';
    if (v === 'help') return 'help';
  } catch {
    /* ignore */
  }
  return 'menu';
}

let state: AppState = {
  screen: typeof window !== 'undefined' ? initialScreen() : 'menu',
  run: initialRun,
  settings: typeof localStorage !== 'undefined' ? load(SETTINGS_KEY, DEFAULT_SETTINGS) : DEFAULT_SETTINGS,
  records: typeof localStorage !== 'undefined' ? load(RECORDS_KEY, DEFAULT_RECORDS) : DEFAULT_RECORDS,
  toasts: [],
  settingsOpen: false,
  tutorialDone: typeof localStorage !== 'undefined' ? localStorage.getItem(TUTORIAL_KEY) === '1' : false,
};

const listeners = new Set<() => void>();
function set(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  if (patch.screen) {
    try {
      sessionStorage.setItem(SCREEN_KEY, patch.screen);
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

function applySettings(s: Settings): void {
  sound.setEnabled(s.sound);
  sound.setMusic(s.music);
  sound.setVolume(s.volume);
  fx.shakeEnabled = s.shake;
  fx.enabled = s.particles;
}
applySettings(state.settings);

let toastId = 0;

function updateRecords(run: RunState): void {
  const r = { ...state.records };
  const best = run.history.best;
  if (best && best.stats.views > r.bestVideo) {
    r.bestVideo = best.stats.views;
    r.bestVideoTitle = best.title;
  }
  r.bestStage = Math.max(r.bestStage, run.history.stagesCleared);
  set({ records: r });
  save(RECORDS_KEY, r);
}

export const store = {
  get: () => state,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },

  toast(text: string, kind: Toast['kind'] = 'info') {
    const id = ++toastId;
    set({ toasts: [...state.toasts.slice(-3), { id, text, kind }] });
    window.setTimeout(() => set({ toasts: state.toasts.filter((t) => t.id !== id) }), 2600);
  },

  /** Apply a pure game action. Returns true on success. */
  act(fn: (s: RunState) => RunState): boolean {
    if (!state.run) return false;
    try {
      const prev = state.run;
      const next = fn(prev);
      set({ run: next });
      save(SAVE_KEY, next);
      if (next.phase === 'gameOver' && prev.phase !== 'gameOver') {
        const r = { ...state.records, runs: state.records.runs + 1, wins: state.records.wins + (next.outcome === 'win' ? 1 : 0) };
        set({ records: r });
        save(RECORDS_KEY, r);
      }
      if (next.history.best !== prev.history.best) updateRecords(next);
      return true;
    } catch (e) {
      if (e instanceof GameError) {
        sound.play('error');
        store.toast(e.message, 'error');
        return false;
      }
      throw e;
    }
  },

  newRun(seed?: string) {
    const s = createRun((seed && seed.trim().toUpperCase()) || randomSeedString());
    set({ run: s, screen: 'game' });
    save(SAVE_KEY, s);
  },

  continueRun() {
    if (state.run) set({ screen: 'game' });
  },

  abandonRun() {
    save(SAVE_KEY, null);
    set({ run: null, screen: 'menu' });
  },

  setScreen(screen: Screen) {
    set({ screen });
  },

  openSettings(open: boolean) {
    set({ settingsOpen: open });
  },

  updateSettings(patch: Partial<Settings>) {
    const s = { ...state.settings, ...patch };
    set({ settings: s });
    save(SETTINGS_KEY, s);
    applySettings(s);
  },

  finishTutorial() {
    try {
      localStorage.setItem(TUTORIAL_KEY, '1');
    } catch {
      /* ignore */
    }
    set({ tutorialDone: true });
  },

  resetTutorial() {
    try {
      localStorage.removeItem(TUTORIAL_KEY);
    } catch {
      /* ignore */
    }
    set({ tutorialDone: false });
  },
};

export function useApp<T>(sel: (s: AppState) => T): T {
  return useSyncExternalStore(store.subscribe, () => sel(state), () => sel(state));
}
