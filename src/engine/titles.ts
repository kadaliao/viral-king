import { COMBO_MAP } from '../data/combos';
import { COMBO_TITLES, TAG_TITLES, TITLE_POOLS, TITLE_PREFIXES, TITLE_SUFFIXES } from '../data/titles';
import type { Rng } from './rng';
import type { Card, Tag } from './types';
import { countTags } from './scoring';

function fill(tpl: string, rng: Rng, cards: Card[], depth = 0): string {
  return tpl.replace(/\{(\w+)\}/g, (_m, key: string) => {
    if (key === 'card') return cards.length ? rng.pick(cards).name : '日常';
    const pool = TITLE_POOLS[key];
    if (!pool) return '';
    const v = rng.pick(pool);
    return depth < 2 && v.includes('{') ? fill(v, rng, cards, depth + 1) : v;
  });
}

function mainTag(cards: Card[]): Tag | null {
  const c = countTags(cards);
  let best: Tag | null = null;
  let n = 0;
  (Object.keys(c) as Tag[]).forEach((t) => {
    if (c[t] > n) {
      n = c[t];
      best = t;
    }
  });
  return best;
}

/**
 * Generate a funny fake video title from the combo + cards.
 * Avoids repeating any of `recent` (tries a handful of times).
 */
export function generateTitle(comboId: string, cards: Card[], rng: Rng, recent: string[] = []): string {
  const combo = COMBO_MAP[comboId];
  const pool: string[] = [...(COMBO_TITLES[comboId] ?? COMBO_TITLES.vlog)];
  // stack / mix / basic combos borrow the main tag's templates for variety
  if (combo && (combo.family === 'stack' || combo.family === 'mix' || combo.family === 'basic')) {
    const t = mainTag(cards);
    if (t) pool.push(...TAG_TITLES[t]);
  }
  let title = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    let t = fill(rng.pick(pool), rng, cards);
    const deco = rng.next();
    if (deco < 0.18) t = rng.pick(TITLE_PREFIXES) + t;
    else if (deco < 0.42) t = t + fill(rng.pick(TITLE_SUFFIXES), rng, cards);
    title = t;
    if (!recent.includes(t)) break;
  }
  return title;
}
