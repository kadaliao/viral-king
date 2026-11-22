import { describe, it, expect } from 'vitest';
import { ALL_SPRITES, CARD_SPRITES, ICON_SPRITES, ARTIFACT_SPRITES, BOSS_SPRITES, MISC_SPRITES } from '../src/art/sprites';

const EXPECTED: Record<string, { map: Record<string, unknown>; size: [number, number]; ids: string[] }> = {
  cards: {
    map: CARD_SPRITES,
    size: [24, 24],
    ids: ['cat', 'ai', 'money', 'fun', 'drama', 'hot'].flatMap((t) => [`card_${t}_1`, `card_${t}_2`]),
  },
  icons: {
    map: ICON_SPRITES,
    size: [10, 10],
    ids: [
      'tag_cat', 'tag_ai', 'tag_money', 'tag_fun', 'tag_drama', 'tag_hot',
      'coin', 'fans', 'views', 'like', 'comment', 'share', 'discard', 'deck', 'publish', 'lock',
      'sound_on', 'sound_off', 'gear', 'star', 'crown', 'trophy', 'skull', 'arrow_left', 'arrow_right',
      'fire', 'bolt', 'x_mult', 'plus', 'boss', 'shop', 'info', 'seed',
    ],
  },
  artifacts: {
    map: ARTIFACT_SPRITES,
    size: [16, 16],
    ids: [
      'cat_overlord', 'fun_master', 'golden_3s', 'finale', 'money_talks', 'night_emo', 'hot_topic',
      'clickbait', 'repost', 'trending', 'big_v', 'hexagon', 'vertical', 'beat_sync', 'redo', 'series',
      'last_call', 'paid_promo', 'iron_fans', 'algo_child', 'comment_war', 'traffic_code', 'mystery_algo',
      'echo_chamber', 'remix', 'perpetual', 'copycat', 'matrix',
    ],
  },
  bosses: {
    map: BOSS_SPRITES,
    size: [24, 24],
    ids: ['algo_revamp', 'censor_storm', 'fatigue', 'shadowban', 'blackout'],
  },
  misc16: {
    map: MISC_SPRITES,
    size: [16, 16],
    ids: ['milestone_1', 'milestone_2', 'milestone_3', 'milestone_4', 'milestone_5'],
  },
  misc24: { map: MISC_SPRITES, size: [24, 24], ids: ['card_back'] },
  misc32: { map: MISC_SPRITES, size: [32, 32], ids: ['mascot'] },
};

describe('sprites', () => {
  for (const [id, s] of Object.entries(ALL_SPRITES)) {
    it(`${id} is well-formed`, () => {
      expect(s.rows.length).toBe(s.h);
      s.rows.forEach((row) => expect(row.length).toBe(s.w));
      for (const v of Object.values(s.palette)) expect(v).toMatch(/^#[0-9a-f]{6}$/i);
      for (const row of s.rows) {
        for (const ch of row) {
          if (ch === '.' || ch === ' ') continue;
          expect(s.palette, `${id}: unknown palette key '${ch}'`).toHaveProperty(ch);
        }
      }
    });
  }

  for (const [group, { map, size, ids }] of Object.entries(EXPECTED)) {
    it(`${group}: all required ids exist with the right size`, () => {
      for (const id of ids) {
        expect(map, `missing ${id}`).toHaveProperty(id);
        expect(ALL_SPRITES, `ALL_SPRITES missing ${id}`).toHaveProperty(id);
        const s = ALL_SPRITES[id];
        expect([s.w, s.h], id).toEqual(size);
      }
    });
  }

  it('ids do not collide across maps', () => {
    const total = [CARD_SPRITES, ICON_SPRITES, ARTIFACT_SPRITES, BOSS_SPRITES, MISC_SPRITES].reduce((n, m) => n + Object.keys(m).length, 0);
    expect(Object.keys(ALL_SPRITES).length).toBe(total);
  });
});
