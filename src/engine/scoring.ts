import { ARTIFACT_MAP } from '../data/artifacts';
import { BALANCE } from '../data/balance';
import { CENSOR_FACTOR, FATIGUE_FACTOR } from '../data/bosses';
import { COMBOS, COMBO_MAP, comboValues, type ComboDef } from '../data/combos';
import { EDITION_VALUES } from '../data/tags';
import type { ArtifactDef, EffectContext, RunView } from './context';
import { safeAdd, safeMul, sanitize } from './num';
import {
  TAGS,
  type ArtifactInstance,
  type Card,
  type ScoreResult,
  type ScoreStep,
  type StepKind,
  type StepSource,
  type Tag,
} from './types';

export interface ScoreInput {
  played: Card[];
  held: Card[];
  artifacts: ArtifactInstance[];
  comboLevels: Record<string, number>;
  run: RunView;
}

export function emptyCounts(): Record<Tag, number> {
  return { cat: 0, ai: 0, money: 0, fun: 0, drama: 0, hot: 0 };
}

export function countTags(cards: Card[]): Record<Tag, number> {
  const c = emptyCounts();
  for (const card of cards) c[card.tag]++;
  return c;
}

/** Which played cards are throttled (限流) by the current boss. */
export function splitThrottled(played: Card[], run: Pick<RunView, 'bossId'>): { scored: Card[]; throttled: Card[] } {
  const scored: Card[] = [];
  const throttled: Card[] = [];
  const perTag = emptyCounts();
  played.forEach((card, i) => {
    let ok = true;
    if (run.bossId === 'censor_storm' && card.tag === 'drama') ok = false;
    if (run.bossId === 'shadowban' && i >= 3) ok = false;
    if (run.bossId === 'algo_revamp') {
      perTag[card.tag]++;
      if (perTag[card.tag] > 2) ok = false;
    }
    (ok ? scored : throttled).push(card);
  });
  return { scored, throttled };
}

export function comboLevel(levels: Record<string, number>, id: string): number {
  return levels[id] ?? 0;
}

/** Pick the best matching video type for a set of scored cards. */
export function detectCombo(
  scored: Card[],
  levels: Record<string, number>,
  run: Pick<RunView, 'fans' | 'preferredTag'>,
): ComboDef {
  const counts = countTags(scored);
  const input = { counts, n: scored.length, fans: run.fans, preferredTag: run.preferredTag };
  const cardBase = scored.reduce((s, c) => s + c.base, 0);
  let best: ComboDef = COMBO_MAP.vlog;
  let bestVal = -1;
  COMBOS.forEach((combo) => {
    if (!combo.match(input)) return;
    const v = comboValues(combo.id, comboLevel(levels, combo.id));
    const val = (v.base + cardBase) * v.mult;
    if (val >= bestVal) {
      best = combo;
      bestVal = val;
    }
  });
  return best;
}

/** All combos that currently match (for UI hints). */
export function matchingCombos(scored: Card[], run: Pick<RunView, 'fans' | 'preferredTag'>): ComboDef[] {
  const counts = countTags(scored);
  const input = { counts, n: scored.length, fans: run.fans, preferredTag: run.preferredTag };
  return COMBOS.filter((c) => c.match(input));
}

interface Resolved {
  def: ArtifactDef;
  /** instance whose state the effect reads */
  target: ArtifactInstance;
  /** label shown for this slot */
  label: string;
  isCopy: boolean;
}

/** Indices disabled by boss 系统维护. */
export function disabledArtifactIndices(count: number, run: Pick<RunView, 'bossId'>): Set<number> {
  const s = new Set<number>();
  if (run.bossId === 'blackout' && count > 0) {
    s.add(0);
    s.add(count - 1);
  }
  return s;
}

/**
 * Resolve the effective effect of the artifact at slot i, following copy chains.
 * Cycles (copy → copy → …) and disabled targets resolve to null.
 */
export function resolveArtifact(
  artifacts: ArtifactInstance[],
  i: number,
  disabled: Set<number>,
  fans: number,
): Resolved | null {
  if (disabled.has(i)) return null;
  const origin = ARTIFACT_MAP[artifacts[i]?.id];
  if (!origin) return null;
  const visited = new Set<number>();
  let idx = i;
  let def = origin;
  while (def.copy) {
    visited.add(idx);
    const next = def.copy === 'right' ? idx + 1 : 0;
    if (next >= artifacts.length || visited.has(next) || disabled.has(next)) return null;
    idx = next;
    def = ARTIFACT_MAP[artifacts[idx].id];
    if (!def) return null;
  }
  if (def.minFans !== undefined && fans < def.minFans) return null;
  const isCopy = idx !== i;
  return {
    def,
    target: artifacts[idx],
    label: isCopy ? `${origin.name}→${def.name}` : def.name,
    isCopy,
  };
}

export function scoreVideo(input: ScoreInput): ScoreResult {
  const { played, held, artifacts, comboLevels, run } = input;
  const { scored, throttled } = splitThrottled(played, run);
  const combo = detectCombo(scored, comboLevels, run);
  const lv = comboLevel(comboLevels, combo.id);
  const cv = comboValues(combo.id, lv);
  const counts = countTags(scored);
  const distinct = TAGS.filter((t) => counts[t] > 0).length;

  const steps: ScoreStep[] = [];
  let base = 0;
  let mult = 0;
  let coins = 0;
  let xmultCount = 0;
  let retriggerCount = 0;
  let lastXmult: number | null = null;
  const artifactStates: Record<string, Record<string, number>> = {};

  const score = () => sanitize(Math.floor(safeMul(Math.max(0, base), Math.max(0, mult))));
  const push = (kind: StepKind, source: StepSource, amount: number, label: string, echo?: boolean) => {
    if (steps.length >= BALANCE.maxSteps) return;
    steps.push({ kind, source, amount, label, base, mult, score: score(), echo });
  };

  // 1. video type
  base = sanitize(cv.base);
  mult = sanitize(cv.mult);
  push('combo', { type: 'combo' }, cv.base, lv > 0 ? `${combo.name} Lv.${lv + 1}` : combo.name);

  // 2. fan exposure
  const exposure = Math.floor(Math.sqrt(Math.max(0, run.fans)) * BALANCE.exposureRate);
  if (exposure > 0) {
    base = safeAdd(base, exposure);
    push('base', { type: 'fans' }, exposure, '粉丝初始曝光');
  }

  const disabled = disabledArtifactIndices(artifacts.length, run);
  const resolved = artifacts.map((_, i) => resolveArtifact(artifacts, i, disabled, run.fans));

  // generic mutable context factory
  const makeCtx = (source: StepSource, self: ArtifactInstance, defaultLabel: string, writable: boolean): EffectContext => {
    const ctx: EffectContext = {
      played,
      scored,
      held,
      counts,
      distinct,
      comboId: combo.id,
      run,
      self,
      get base() { return base; },
      get mult() { return mult; },
      get coinsDelta() { return coins; },
      get xmultCount() { return xmultCount; },
      get lastXmult() { return lastXmult; },
      addBase(n, label) {
        if (!n) return;
        base = safeAdd(base, n);
        push('base', source, n, label ?? defaultLabel);
      },
      addMult(n, label) {
        if (!n) return;
        mult = safeAdd(mult, n);
        push('mult', source, n, label ?? defaultLabel);
      },
      xMult(f, label, opts) {
        if (f === 1 || !Number.isFinite(f)) return;
        mult = safeMul(mult, f);
        xmultCount++;
        if (!opts?.replay) lastXmult = f;
        push('xmult', source, f, label ?? defaultLabel, opts?.replay);
      },
      xBase(f, label) {
        if (f === 1 || !Number.isFinite(f)) return;
        base = safeMul(base, f);
        push('xbase', source, f, label ?? defaultLabel);
      },
      addCoins(n, label) {
        if (!n) return;
        coins += n;
        push('coins', source, n, label ?? defaultLabel);
      },
      info(label) {
        push('info', source, 0, label);
      },
      setState(key, value) {
        if (!writable) return;
        const cur = artifactStates[self.uid] ?? { ...self.state };
        cur[key] = value;
        artifactStates[self.uid] = cur;
      },
    };
    return ctx;
  };

  const artifactCtx = (i: number) => {
    const r = resolved[i]!;
    return makeCtx({ type: 'artifact', index: i, uid: artifacts[i].uid }, r.target, r.label, !r.isCopy);
  };

  const fanLv = run.fanLevel;
  const firstPost = run.publishesUsed === 0;

  // 3. cards, left → right
  scored.forEach((card, i) => {
    const playedIndex = played.indexOf(card);
    const cardSource: StepSource = { type: 'card', index: playedIndex, uid: card.uid };
    const cardCtx = makeCtx(cardSource, { uid: card.uid, id: 'card', state: {} }, card.name, false);

    // gather retriggers (computed once per card — retriggers never cause more retriggers)
    const retriggerSources: string[] = [];
    if (card.edition === 'echo') retriggerSources.push('回声');
    resolved.forEach((r, ai) => {
      if (!r?.def.hooks.retrigger) return;
      const n = r.def.hooks.retrigger(artifactCtx(ai), card, i);
      for (let k = 0; k < n; k++) retriggerSources.push(r.label);
    });
    const extra = Math.min(retriggerSources.length, BALANCE.maxRetriggers);

    for (let t = 0; t <= extra; t++) {
      const isRe = t > 0;
      if (isRe) {
        retriggerCount++;
        push('retrigger', cardSource, 1, `${retriggerSources[t - 1]}：再来一次`, true);
      }
      // card's own value
      const amount = card.trait === 'firstPost' && firstPost ? card.base * 2 : card.base;
      cardCtx.addBase(amount, card.trait === 'firstPost' && firstPost ? `${card.name}（时效性 ×2）` : card.name);
      if (card.mult) cardCtx.addMult(card.mult, card.name);
      switch (card.edition) {
        case 'hd': cardCtx.addBase(EDITION_VALUES.hdBase, '高清'); break;
        case 'meme': cardCtx.addMult(EDITION_VALUES.memeMult, '爆梗'); break;
        case 'golden': cardCtx.xMult(EDITION_VALUES.goldenX, '金曲'); break;
        case 'sponsor': cardCtx.addCoins(EDITION_VALUES.sponsorCoins, '恰饭'); break;
        default: break;
      }
      if (fanLv >= 2 && run.preferredTag === card.tag) cardCtx.addBase(5 * fanLv, '铁粉偏好');
      // artifacts reacting to this card
      resolved.forEach((r, ai) => {
        if (r?.def.hooks.onCard) r.def.hooks.onCard(artifactCtx(ai), card, i, isRe);
      });
    }
  });

  // 4. independent artifact effects, left → right
  resolved.forEach((r, ai) => {
    if (r?.def.hooks.onVideo) r.def.hooks.onVideo(artifactCtx(ai));
  });

  // 5. boss penalties
  const bossSrc: StepSource = { type: 'boss' };
  if (run.bossId === 'censor_storm' && played.some((c) => c.tag === 'drama')) {
    mult = safeMul(mult, CENSOR_FACTOR);
    push('debuff', bossSrc, CENSOR_FACTOR, '内容审核：倍率 ×0.5');
  }
  if (run.bossId === 'fatigue') {
    const f = TAGS.filter((t) => counts[t] > 0).reduce((s, t) => s + (run.fatigue[t] ?? 0), 0);
    if (f > 0) {
      const factor = Math.pow(FATIGUE_FACTOR, f);
      mult = safeMul(mult, factor);
      push('debuff', bossSrc, factor, `审美疲劳 ×${FATIGUE_FACTOR}^${f}`);
    }
  }

  return {
    comboId: combo.id,
    comboName: combo.name,
    steps,
    base,
    mult,
    score: score(),
    coins,
    scoredUids: scored.map((c) => c.uid),
    throttledUids: throttled.map((c) => c.uid),
    xmultCount,
    retriggerCount,
    artifactStates,
  };
}
