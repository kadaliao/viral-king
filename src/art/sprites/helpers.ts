import type { Sprite } from '../types';
import { PAL } from '../palette';

/**
 * Shared palette keys used by most sprites. Sprites may extend this with
 * extra one-off shades. Keys:
 *  k ink outline · N night · P plum · v violet · l lilac · B navy · b blue
 *  c cyan · p pink · h hotpink · m magenta · g green · L lime · t teal
 *  y yellow · Y gold · O orange · r red · R darkred · w white · e cream
 *  s grey · d darkgrey · n brown · T tan · S skin
 *  q dark orange · u dark gold · i ice/light cyan · j dark teal · z dark blue-grey
 */
export const K: Record<string, string> = {
  k: PAL.ink,
  N: PAL.night,
  P: PAL.plum,
  v: PAL.violet,
  l: PAL.lilac,
  B: PAL.navy,
  b: PAL.blue,
  c: PAL.cyan,
  p: PAL.pink,
  h: PAL.hotpink,
  m: PAL.magenta,
  g: PAL.green,
  L: PAL.lime,
  t: PAL.teal,
  y: PAL.yellow,
  Y: PAL.gold,
  O: PAL.orange,
  r: PAL.red,
  R: PAL.darkred,
  w: PAL.white,
  e: PAL.cream,
  s: PAL.grey,
  d: PAL.darkgrey,
  n: PAL.brown,
  T: PAL.tan,
  S: PAL.skin,
  q: '#b8461a',
  u: '#b86e0a',
  i: '#b8f6ff',
  j: '#0e6b5a',
  z: '#2a2540',
};

/** Build a sprite from full-width rows. */
export function spr(w: number, h: number, rows: string[], extra: Record<string, string> = {}): Sprite {
  return { w, h, palette: { ...K, ...extra }, rows };
}

/**
 * Build a horizontally symmetric sprite. Rows of length w/2 are mirrored
 * (left half given); rows of full length w are used as-is (for asymmetric
 * details like highlights).
 */
export function sym(w: number, h: number, rows: string[], extra: Record<string, string> = {}): Sprite {
  const out = rows.map((r) => (r.length === w / 2 ? r + [...r].reverse().join('') : r));
  return { w, h, palette: { ...K, ...extra }, rows: out };
}

/** Overwrite pixels of a sprite with a patch at (x, y); '.' in the patch keeps the original pixel. */
export function paint(s: Sprite, x: number, y: number, patch: string[]): Sprite {
  const rows = s.rows.map((r) => [...r]);
  patch.forEach((pr, dy) =>
    [...pr].forEach((c, dx) => {
      const yy = y + dy;
      const xx = x + dx;
      if (c !== '.' && yy >= 0 && yy < s.h && xx >= 0 && xx < s.w) rows[yy][xx] = c;
    }),
  );
  return { ...s, rows: rows.map((r) => r.join('')) };
}

/** Swap palette keys inside the column range [x0, x1] (inclusive), e.g. recolor the right half. */
export function tint(s: Sprite, x0: number, x1: number, map: Record<string, string>): Sprite {
  const rows = s.rows.map((r) => [...r].map((c, x) => (x >= x0 && x <= x1 && map[c] ? map[c] : c)).join(''));
  return { ...s, rows };
}

/**
 * Add an outline (default ink 'k') to every transparent pixel that touches a
 * filled pixel (4-neighbourhood, or 8 with `diag`).
 */
export function outline(s: Sprite, key = 'k', diag = false): Sprite {
  const g = s.rows.map((r) => [...r]);
  const filled = (x: number, y: number) => y >= 0 && y < s.h && x >= 0 && x < s.w && g[y][x] !== '.' && g[y][x] !== ' ';
  const out = g.map((r, y) =>
    r.map((c, x) => {
      if (c !== '.' && c !== ' ') return c;
      const n = filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1);
      const d = diag && (filled(x - 1, y - 1) || filled(x + 1, y - 1) || filled(x - 1, y + 1) || filled(x + 1, y + 1));
      return n || d ? key : c;
    }),
  );
  return { ...s, rows: out.map((r) => r.join('')) };
}
