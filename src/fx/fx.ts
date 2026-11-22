/**
 * Visual effects: pixel particles on a full-screen canvas, screen shake,
 * and floating DOM popups ("+50", "×3"…). UI code calls these imperatively.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
  gravity: number;
  drag: number;
  kind: 'square' | 'spark' | 'ring';
}

export interface BurstOpts {
  count?: number;
  colors?: string[];
  speed?: number;
  size?: number;
  gravity?: number;
  life?: number;
  spread?: number;
  angle?: number;
}

const NEON = ['#ff3ea5', '#39ff88', '#ffe14d', '#3ee8ff', '#ffffff'];

class FxEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private parts: Particle[] = [];
  private raf = 0;
  private last = 0;
  private shakeEl: HTMLElement | null = null;
  private shakeAmp = 0;
  private shakeUntil = 0;
  enabled = true;
  shakeEnabled = true;
  private scale = 1;

  attach(canvas: HTMLCanvasElement, shakeEl: HTMLElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.shakeEl = shakeEl;
    this.resize();
    window.addEventListener('resize', this.resize);
  }

  detach(): void {
    window.removeEventListener('resize', this.resize);
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.canvas = null;
    this.ctx = null;
  }

  private resize = (): void => {
    if (!this.canvas) return;
    // render at half resolution for chunky pixels, upscale with CSS
    this.scale = 0.5;
    this.canvas.width = Math.ceil(window.innerWidth * this.scale);
    this.canvas.height = Math.ceil(window.innerHeight * this.scale);
    if (this.ctx) this.ctx.imageSmoothingEnabled = false;
  };

  burst(x: number, y: number, o: BurstOpts = {}): void {
    if (!this.enabled || !this.ctx) return;
    const count = Math.min(o.count ?? 24, 400);
    const colors = o.colors ?? NEON;
    for (let i = 0; i < count; i++) {
      const a = (o.angle ?? 0) + (Math.random() - 0.5) * (o.spread ?? Math.PI * 2);
      const sp = (o.speed ?? 6) * (0.4 + Math.random() * 0.8);
      this.parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: (o.life ?? 0.9) * (0.6 + Math.random() * 0.6),
        size: (o.size ?? 4) * (0.6 + Math.random() * 0.8),
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: o.gravity ?? 0.25,
        drag: 0.96,
        kind: Math.random() < 0.25 ? 'spark' : 'square',
      });
    }
    this.kick();
  }

  ring(x: number, y: number, color = '#ffe14d', size = 60): void {
    if (!this.enabled || !this.ctx) return;
    this.parts.push({ x, y, vx: 0, vy: 0, life: 0, max: 0.45, size, color, gravity: 0, drag: 1, kind: 'ring' });
    this.kick();
  }

  /** Rain of confetti from the top of the screen. */
  confetti(count = 120, colors = NEON): void {
    if (!this.enabled || !this.ctx) return;
    const w = window.innerWidth;
    for (let i = 0; i < Math.min(count, 500); i++) {
      this.parts.push({
        x: Math.random() * w,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        life: 0,
        max: 2.5 + Math.random() * 1.5,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        gravity: 0.05,
        drag: 0.995,
        kind: 'square',
      });
    }
    this.kick();
  }

  /** Burst at the center of a DOM element. */
  burstAt(el: Element | null, o: BurstOpts = {}): void {
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.burst(r.left + r.width / 2, r.top + r.height / 2, o);
  }

  shake(amp: number, ms = 300): void {
    if (!this.shakeEnabled || !this.shakeEl) return;
    this.shakeAmp = Math.max(this.shakeAmp, Math.min(amp, 24));
    this.shakeUntil = Math.max(this.shakeUntil, performance.now() + ms);
    this.kick();
  }

  private kick(): void {
    if (!this.raf) {
      this.last = performance.now();
      this.raf = requestAnimationFrame(this.tick);
    }
  }

  private tick = (now: number): void => {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const ctx = this.ctx;
    const k = this.scale;
    if (ctx && this.canvas) {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      const f = dt * 60;
      this.parts = this.parts.filter((p) => {
        p.life += dt;
        if (p.life >= p.max) return false;
        p.vx *= Math.pow(p.drag, f);
        p.vy = p.vy * Math.pow(p.drag, f) + p.gravity * f;
        p.x += p.vx * f;
        p.y += p.vy * f;
        const t = 1 - p.life / p.max;
        ctx.globalAlpha = Math.min(1, t * 1.6);
        ctx.fillStyle = p.color;
        if (p.kind === 'ring') {
          const r = p.size * (1 - t * t) * k + 2;
          ctx.strokeStyle = p.color;
          ctx.lineWidth = Math.max(1, 3 * t);
          ctx.strokeRect(Math.round(p.x * k - r), Math.round(p.y * k - r), Math.round(r * 2), Math.round(r * 2));
        } else if (p.kind === 'spark') {
          const s = Math.max(1, Math.round(p.size * k * 0.5));
          ctx.fillRect(Math.round(p.x * k), Math.round(p.y * k), s, s * 3);
        } else {
          const s = Math.max(1, Math.round(p.size * k * (0.5 + t * 0.5)));
          ctx.fillRect(Math.round(p.x * k - s / 2), Math.round(p.y * k - s / 2), s, s);
        }
        return true;
      });
      ctx.globalAlpha = 1;
    }
    // shake
    if (this.shakeEl) {
      if (now < this.shakeUntil && this.shakeAmp > 0) {
        const a = this.shakeAmp * ((this.shakeUntil - now) / 300);
        const amp = Math.min(this.shakeAmp, a);
        const x = Math.round((Math.random() - 0.5) * 2 * amp);
        const y = Math.round((Math.random() - 0.5) * 2 * amp);
        this.shakeEl.style.transform = `translate(${x}px, ${y}px)`;
      } else if (this.shakeAmp) {
        this.shakeAmp = 0;
        this.shakeEl.style.transform = '';
      }
    }
    if (this.parts.length || now < this.shakeUntil) this.raf = requestAnimationFrame(this.tick);
    else {
      this.raf = 0;
      if (this.shakeEl) this.shakeEl.style.transform = '';
    }
  };
}

export const fx = new FxEngine();

// ------------------------------------------------------------ popups

export interface Popup {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  kind: string;
}

type PopupListener = (p: Popup[]) => void;
let popups: Popup[] = [];
let pid = 0;
const listeners = new Set<PopupListener>();

export function onPopups(l: PopupListener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function emit(): void {
  for (const l of listeners) l(popups);
}

export function popupAt(el: Element | null, text: string, color: string, opts: { size?: number; kind?: string; dy?: number } = {}): void {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const id = ++pid;
  popups = [
    ...popups.slice(-24),
    {
      id,
      x: r.left + r.width / 2 + (Math.random() - 0.5) * 16,
      y: r.top + r.height * 0.3 + (opts.dy ?? 0),
      text,
      color,
      size: opts.size ?? 24,
      kind: opts.kind ?? 'pop',
    },
  ];
  emit();
  window.setTimeout(() => {
    popups = popups.filter((p) => p.id !== id);
    emit();
  }, 1100);
}

/** Retrigger a CSS animation class on an element. */
export function bump(el: Element | null, cls = 'fx-bump'): void {
  if (!el) return;
  el.classList.remove(cls);
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
}

export function fxEl(key: string): Element | null {
  return typeof document === 'undefined' ? null : document.querySelector(`[data-fx="${key}"]`);
}
