import type { Sprite } from './types';

const cache = new Map<string, string>();

/** Render a sprite to a PNG data URL at 1px per pixel (scale with CSS + image-rendering: pixelated). */
export function spriteUrl(key: string, sprite: Sprite | undefined, tint?: string): string {
  const ck = tint ? `${key}|${tint}` : key;
  const hit = cache.get(ck);
  if (hit) return hit;
  if (!sprite || typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = sprite.w;
  c.height = sprite.h;
  const g = c.getContext('2d');
  if (!g) return '';
  for (let y = 0; y < sprite.h; y++) {
    const row = sprite.rows[y] ?? '';
    for (let x = 0; x < sprite.w; x++) {
      const ch = row[x];
      if (!ch || ch === '.' || ch === ' ') continue;
      const col = tint ?? sprite.palette[ch];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(x, y, 1, 1);
    }
  }
  const url = c.toDataURL('image/png');
  cache.set(ck, url);
  return url;
}
