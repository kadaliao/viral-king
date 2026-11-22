/**
 * Retro arcade sound — everything synthesized with WebAudio (no audio files).
 */
export type SfxName =
  | 'hover' | 'click' | 'select' | 'deselect' | 'deal' | 'publish' | 'base' | 'mult' | 'xmult'
  | 'retrigger' | 'coin' | 'buy' | 'sell' | 'error' | 'milestone' | 'stageClear' | 'win' | 'lose'
  | 'reroll' | 'discard' | 'debuff' | 'count' | 'boss' | 'whoosh';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private noiseBuf: AudioBuffer | null = null;
  enabled = true;
  musicEnabled = true;
  volume = 0.6;
  private musicTimer: number | null = null;
  private musicStep = 0;
  private nextNoteTime = 0;
  private lastHover = 0;

  private ensure(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx.destination);
      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.5;
      this.sfxBus.connect(this.master);
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.16;
      this.musicBus.connect(this.master);
      const len = this.ctx.sampleRate * 0.5;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  /** Call from a user gesture to unlock audio. */
  unlock(): void {
    this.ensure();
    if (this.musicEnabled && this.enabled) this.startMusic();
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) this.stopMusic();
    else if (this.musicEnabled && this.ctx) this.startMusic();
  }

  setMusic(v: boolean): void {
    this.musicEnabled = v;
    if (v && this.enabled && this.ctx) this.startMusic();
    else this.stopMusic();
  }

  setVolume(v: number): void {
    this.volume = v;
    if (this.master) this.master.gain.value = v;
  }

  private tone(
    freq: number, dur: number, opts: { type?: OscillatorType; vol?: number; slide?: number; delay?: number; bus?: GainNode | null } = {},
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = opts.type ?? 'square';
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.slide), t0 + dur);
    const v = opts.vol ?? 0.2;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(opts.bus ?? this.sfxBus!);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, opts: { vol?: number; freq?: number; delay?: number; type?: BiquadFilterType; sweep?: number } = {}): void {
    const ctx = this.ctx;
    if (!ctx || !this.noiseBuf) return;
    const t0 = ctx.currentTime + (opts.delay ?? 0);
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const f = ctx.createBiquadFilter();
    f.type = opts.type ?? 'bandpass';
    f.frequency.setValueAtTime(opts.freq ?? 2000, t0);
    if (opts.sweep) f.frequency.exponentialRampToValueAtTime(opts.sweep, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.vol ?? 0.2, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f);
    f.connect(g);
    g.connect(this.sfxBus!);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  /** `p` is a free parameter (step index, factor, tier...) */
  play(name: SfxName, p = 0): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!ctx) return;
    const semi = (n: number) => Math.pow(2, n / 12);
    switch (name) {
      case 'hover': {
        const now = performance.now();
        if (now - this.lastHover < 40) return;
        this.lastHover = now;
        this.tone(1760, 0.03, { vol: 0.04, type: 'square' });
        break;
      }
      case 'click': this.tone(660, 0.05, { vol: 0.12, slide: 990 }); break;
      case 'select': this.tone(520 * semi(p), 0.07, { vol: 0.14, type: 'triangle', slide: 780 * semi(p) }); break;
      case 'deselect': this.tone(600, 0.06, { vol: 0.1, type: 'triangle', slide: 360 }); break;
      case 'deal': this.noise(0.04, { vol: 0.12, freq: 3200 }); this.tone(1200, 0.03, { vol: 0.04 }); break;
      case 'discard': this.noise(0.18, { vol: 0.15, freq: 1200, sweep: 300, type: 'lowpass' }); break;
      case 'whoosh': this.noise(0.25, { vol: 0.18, freq: 400, sweep: 4000 }); break;
      case 'publish':
        [0, 4, 7, 12].forEach((n, i) => this.tone(392 * semi(n), 0.1, { delay: i * 0.06, vol: 0.14 }));
        this.noise(0.35, { vol: 0.12, freq: 500, sweep: 6000, delay: 0.05 });
        break;
      case 'base': this.tone(330 * semi(Math.min(p, 24)), 0.07, { vol: 0.12, type: 'square' }); break;
      case 'mult': this.tone(523 * semi(Math.min(p, 24)), 0.09, { vol: 0.13, type: 'sawtooth', slide: 700 * semi(Math.min(p, 24)) }); break;
      case 'xmult': {
        const k = Math.min(p, 18);
        [0, 4, 7].forEach((n) => this.tone(262 * semi(k + n), 0.22, { vol: 0.1, type: 'square' }));
        this.tone(131 * semi(k), 0.3, { vol: 0.16, type: 'triangle' });
        this.noise(0.12, { vol: 0.18, freq: 5000 });
        break;
      }
      case 'retrigger':
        this.tone(440, 0.12, { vol: 0.1, slide: 1320, type: 'triangle' });
        this.tone(880, 0.08, { vol: 0.06, delay: 0.06, slide: 1760 });
        break;
      case 'debuff': this.tone(220, 0.3, { vol: 0.14, slide: 90, type: 'sawtooth' }); break;
      case 'coin':
        this.tone(988, 0.06, { vol: 0.1 });
        this.tone(1319, 0.16, { vol: 0.1, delay: 0.06 });
        break;
      case 'buy':
        this.tone(988, 0.06, { vol: 0.1 });
        this.tone(1319, 0.08, { vol: 0.1, delay: 0.05 });
        [0, 4, 7, 12].forEach((n, i) => this.tone(523 * semi(n), 0.08, { delay: 0.1 + i * 0.04, vol: 0.08 }));
        break;
      case 'sell': this.tone(784, 0.08, { vol: 0.1 }); this.tone(523, 0.12, { vol: 0.1, delay: 0.07 }); break;
      case 'error': this.tone(150, 0.16, { vol: 0.14, type: 'sawtooth' }); this.tone(110, 0.2, { vol: 0.12, type: 'sawtooth', delay: 0.08 }); break;
      case 'reroll': for (let i = 0; i < 6; i++) this.tone(400 + i * 120, 0.04, { delay: i * 0.03, vol: 0.07 }); break;
      case 'count': this.tone(1400 + (p % 8) * 60, 0.02, { vol: 0.03 }); break;
      case 'boss':
        this.tone(110, 0.6, { vol: 0.2, type: 'sawtooth', slide: 55 });
        this.tone(116, 0.6, { vol: 0.14, type: 'square', slide: 58 });
        this.noise(0.5, { vol: 0.12, freq: 300, type: 'lowpass' });
        break;
      case 'milestone': {
        const tier = Math.max(1, Math.min(6, p));
        const notes = [0, 4, 7, 12, 16, 19, 24].slice(0, 3 + tier);
        notes.forEach((n, i) => this.tone(392 * semi(n), 0.16, { delay: i * 0.07, vol: 0.12 }));
        this.tone(196, 0.2 + tier * 0.12, { vol: 0.16, type: 'triangle', delay: notes.length * 0.07 });
        this.noise(0.4 + tier * 0.1, { vol: 0.1 + tier * 0.02, freq: 800, sweep: 8000 });
        break;
      }
      case 'stageClear':
        [0, 4, 7, 12, 7, 12, 16].forEach((n, i) => this.tone(523 * semi(n), 0.14, { delay: i * 0.09, vol: 0.12 }));
        break;
      case 'win':
        [0, 4, 7, 12, 16, 19, 24, 19, 24].forEach((n, i) => this.tone(392 * semi(n), 0.2, { delay: i * 0.11, vol: 0.12 }));
        break;
      case 'lose':
        [7, 6, 5, 4, 0].forEach((n, i) => this.tone(330 * semi(n), 0.25, { delay: i * 0.18, vol: 0.12, type: 'triangle' }));
        break;
    }
  }

  // ------------------------------------------------------------ music
  // tiny chiptune loop: Am – F – C – G, square arpeggio + triangle bass
  private startMusic(): void {
    if (this.musicTimer !== null || !this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.1;
    this.musicTimer = window.setInterval(() => this.scheduleMusic(), 60);
  }

  private stopMusic(): void {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusic(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const stepDur = 60 / 112 / 2; // eighth notes @112bpm
    const chords = [
      [57, 60, 64], // Am
      [53, 57, 60], // F
      [48, 52, 55], // C
      [55, 59, 62], // G
    ];
    const pattern = [0, 1, 2, 1, 0, 2, 1, 2];
    const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
    while (this.nextNoteTime < ctx.currentTime + 0.25) {
      const bar = Math.floor(this.musicStep / 8) % 4;
      const i = this.musicStep % 8;
      const chord = chords[bar];
      const delay = Math.max(0, this.nextNoteTime - ctx.currentTime);
      this.tone(mtof(chord[pattern[i]] + 12), stepDur * 0.9, { vol: 0.12, type: 'square', delay, bus: this.musicBus });
      if (i % 4 === 0) this.tone(mtof(chord[0] - 12), stepDur * 3.5, { vol: 0.3, type: 'triangle', delay, bus: this.musicBus });
      if (i % 2 === 1) {
        // hi-hat
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuf;
        const f = ctx.createBiquadFilter();
        f.type = 'highpass';
        f.frequency.value = 7000;
        const g = ctx.createGain();
        const t0 = this.nextNoteTime;
        g.gain.setValueAtTime(0.06, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.04);
        src.connect(f);
        f.connect(g);
        g.connect(this.musicBus!);
        src.start(t0);
        src.stop(t0 + 0.05);
      }
      this.nextNoteTime += stepDur;
      this.musicStep++;
    }
  }
}

export const sound = new SoundEngine();
