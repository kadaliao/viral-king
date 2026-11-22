import { describe, expect, it } from 'vitest';
import { MAX_VALUE } from '../src/engine/num';
import { detectCombo } from '../src/engine/scoring';
import type { Tag } from '../src/engine/types';
import { art, card, score } from './helpers';

const combo = (...tags: Tag[]) => detectCombo(tags.map((t) => card(t)), {}, { fans: 0, preferredTag: null }).id;

describe('video type detection', () => {
  it('detects theme, stack and mix combos', () => {
    expect(combo('cat')).toBe('vlog');
    expect(combo('cat', 'fun')).toBe('cute_fun');
    expect(combo('ai', 'money')).toBe('ai_money');
    expect(combo('cat', 'ai', 'money')).toBe('cat_startup');
    expect(combo('ai', 'money', 'drama', 'hot')).toBe('super_wealth');
    expect(combo('cat', 'cat', 'cat', 'fun', 'fun')).toBe('full_house');
    expect(combo('cat', 'cat', 'cat', 'cat', 'cat')).toBe('five');
    expect(combo('cat', 'ai', 'money', 'fun', 'drama')).toBe('rainbow');
  });
  it('fan_live requires fans and the preferred tag', () => {
    const cards = ['cat', 'cat', 'cat'].map((t) => card(t as Tag));
    expect(detectCombo(cards, {}, { fans: 100, preferredTag: 'cat' }).id).toBe('three');
    expect(detectCombo(cards, {}, { fans: 5000, preferredTag: 'cat' }).id).toBe('fan_live');
  });
  it('different tag combinations produce different scores', () => {
    const a = score([card('cat', 20), card('cat', 20)]).score;
    const b = score([card('cat', 20), card('fun', 20)]).score;
    expect(a).not.toBe(b);
  });
  it('level-ups raise combo base and mult', () => {
    const lv0 = score([card('cat', 10), card('cat', 10)]);
    const lv2 = score([card('cat', 10), card('cat', 10)], [], {}, { pair: 2 });
    expect(lv0.score).toBe((10 + 20) * 2);
    expect(lv2.score).toBe((10 + 30 + 20) * (2 + 2));
  });
});

describe('scoring pipeline', () => {
  it('base × mult with card values', () => {
    const r = score([card('cat', 10), card('cat', 10)]);
    expect(r.comboId).toBe('pair');
    expect(r.base).toBe(30);
    expect(r.mult).toBe(2);
    expect(r.score).toBe(60);
  });

  it('multiplicative effects chain multiplicatively, not additively', () => {
    const r = score([card('ai', 10), card('ai', 10)], [art('algo_child')]);
    expect(r.mult).toBe(2 * 2 * 2);
    expect(r.score).toBe(30 * 8);
    // with retriggers every AI card fires twice → ×2 four times
    const m = score([card('ai', 10), card('ai', 10)], [art('algo_child'), art('matrix')]);
    expect(m.retriggerCount).toBe(2);
    expect(m.base).toBe(10 + 20 + 20);
    expect(m.mult).toBe(2 * 16);
    expect(m.score).toBe(50 * 32);
  });

  it('steps are shown progressively and end at the final score', () => {
    const r = score([card('ai', 10), card('ai', 10)], [art('algo_child'), art('matrix')]);
    expect(r.steps.length).toBeGreaterThan(5);
    const scores = r.steps.map((s) => s.score);
    expect(scores[scores.length - 1]).toBe(r.score);
    expect(r.steps.filter((s) => s.kind === 'xmult')).toHaveLength(4);
    expect(r.steps.filter((s) => s.kind === 'retrigger')).toHaveLength(2);
  });

  it('artifact order matters (add-then-multiply beats multiply-then-add)', () => {
    const a = score([card('cat', 10)], [art('redo', { mult: 4 }), art('night_emo')]);
    const b = score([card('cat', 10)], [art('night_emo'), art('redo', { mult: 4 })]);
    expect(a.score).toBe(15 * ((1 + 4) * 3));
    expect(b.score).toBe(15 * (1 * 3 + 4));
  });

  it('per-tag and order-based artifacts', () => {
    expect(score([card('cat', 10)], [art('cat_overlord')]).base).toBe(5 + 10 + 50);
    expect(score([card('fun', 10)], [art('fun_master')]).mult).toBe(1 + 4);
    // golden 3s: first card base ×3
    expect(score([card('cat', 10), card('ai', 10)], [art('golden_3s')]).base).toBe(20 + 10 * 3 + 10);
    // finale: +10 mult on the last card
    expect(score([card('cat', 10), card('ai', 10)], [art('finale')]).mult).toBe(3 + 10);
    // beat sync: ascending bases ×3, not when descending
    expect(score([card('cat', 10), card('ai', 20), card('fun', 30)], [art('beat_sync')]).steps.some((s) => s.kind === 'xmult')).toBe(true);
    expect(score([card('cat', 30), card('ai', 20), card('fun', 10)], [art('beat_sync')]).steps.some((s) => s.kind === 'xmult')).toBe(false);
  });

  it('tag-count and history artifacts', () => {
    const tc = score([card('cat'), card('money'), card('ai')], [art('traffic_code')]);
    expect(tc.mult).toBe(5 * 8);
    expect(score([card('cat'), card('money')], [art('traffic_code')]).mult).toBe(1);
    const ser = score([card('cat'), card('cat')], [art('series')], { lastComboId: 'pair' });
    expect(ser.mult).toBe(6);
    expect(score([card('cat')], [art('last_call')], { publishesLeft: 1 }).mult).toBe(4);
    expect(score([card('cat')], [art('big_v')], { fanLevel: 2, fans: 600 }).mult).toBe(2);
    expect(score([card('cat', 10)], [art('iron_fans')], { fans: 900 }).base).toBe(5 + 10 + 30); // inactive, only exposure
    expect(score([card('cat', 10)], [art('iron_fans')], { fans: 10000 }).base).toBe(5 + 100 + 10 + 200);
  });

  it('retriggers: first card, hot cards, echo edition, and the loop cap', () => {
    const rp = score([card('cat', 10), card('ai', 10)], [art('repost')]);
    expect(rp.retriggerCount).toBe(1);
    expect(rp.base).toBe(20 + 10 + 10 + 10);
    const tr = score([card('hot', 10), card('hot', 10)], [art('trending')]);
    expect(tr.retriggerCount).toBe(2);
    // 6 retrigger sources on one card get capped to 5
    const r = score(
      [card('hot', 10, 0, 'echo')],
      [art('matrix'), art('copycat'), art('remix'), art('trending'), art('repost')],
    );
    expect(r.retriggerCount).toBe(5);
    expect(r.base).toBe(5 + 10 * 6);
  });

  it('echo chamber multiplies on every retrigger', () => {
    const r = score([card('cat', 10), card('cat', 10)], [art('matrix'), art('echo_chamber')]);
    expect(r.mult).toBeCloseTo(2 * 1.5 * 1.5);
  });

  it('copy effects: right neighbour, leftmost, and cycle protection', () => {
    expect(score([card('cat', 10)], [art('remix'), art('night_emo')]).mult).toBe(9);
    expect(score([card('cat', 10)], [art('night_emo'), art('copycat')]).mult).toBe(9);
    expect(score([card('cat', 10)], [art('remix'), art('remix')]).mult).toBe(1);
    expect(score([card('cat', 10)], [art('copycat')]).mult).toBe(1);
    expect(score([card('cat', 10)], [art('remix'), art('copycat')]).mult).toBe(1);
    // copy of a stateful artifact reads the target state but never writes it
    const cb = art('clickbait');
    const r = score([card('cat', 10)], [art('remix'), cb]);
    expect(r.mult).toBe(25);
    expect(Object.keys(r.artifactStates)).toEqual([cb.uid]);
  });

  it('perpetual machine replays the last multiplier once when ≥4 multipliers fired', () => {
    const four = [card('ai'), card('ai'), card('ai'), card('ai')];
    const without = score(four, [art('algo_child')]);
    const withP = score(four, [art('algo_child'), art('perpetual')]);
    expect(without.mult).toBe(7 * 16);
    expect(withP.mult).toBe(7 * 32);
    expect(withP.xmultCount).toBe(5);
    const three = [card('ai'), card('ai'), card('ai')];
    expect(score(three, [art('algo_child'), art('perpetual')]).xmultCount).toBe(3);
  });

  it('clickbait alternates ×5 and half base', () => {
    const ready = score([card('cat', 10)], [art('clickbait', { cooldown: 0 })]);
    expect(ready.mult).toBe(5);
    expect(Object.values(ready.artifactStates)[0].cooldown).toBe(1);
    const cool = score([card('cat', 10)], [art('clickbait', { cooldown: 1 })]);
    expect(cool.base).toBe(7.5);
    expect(Object.values(cool.artifactStates)[0].cooldown).toBe(0);
  });

  it('mystery algorithm uses the stage tag', () => {
    expect(score([card('ai'), card('ai')], [art('mystery_algo', { tag: 1 })]).mult).toBe(10);
    expect(score([card('ai'), card('ai')], [art('mystery_algo', { tag: 0 })]).mult).toBe(2);
  });

  it('paid promo spends coins only when affordable', () => {
    expect(score([card('cat')], [art('paid_promo')], { coins: 5 }).coins).toBe(-3);
    expect(score([card('cat')], [art('paid_promo')], { coins: 2 }).coins).toBe(0);
    expect(score([card('money')], [art('money_talks')]).coins).toBe(1);
  });

  it('fans give initial exposure; hot cards double on the first video', () => {
    expect(score([card('cat', 10)], [], { fans: 400 }).base).toBe(5 + 20 + 10);
    expect(score([card('hot', 10)], [], { publishesUsed: 0 }).base).toBe(5 + 10); // no trait on helper card
  });

  it('huge values never become NaN or Infinity', () => {
    const r = score([card('cat'), card('cat'), card('cat'), card('cat'), card('cat')], [], {}, { five: 1e305 });
    expect(Number.isFinite(r.score)).toBe(true);
    expect(r.score).toBeLessThanOrEqual(MAX_VALUE);
    const drama = Array.from({ length: 5 }, () => card('drama', 45));
    const big = score(drama, [art('comment_war'), art('matrix'), art('echo_chamber'), art('remix'), art('perpetual')]);
    expect(Number.isFinite(big.score)).toBe(true);
    expect(big.score).toBeGreaterThan(1e9);
  });
});

describe('boss rules', () => {
  it('平台限流: only the first 3 cards score', () => {
    const r = score([card('cat'), card('cat'), card('cat'), card('cat'), card('cat')], [], { bossId: 'shadowban' });
    expect(r.scoredUids).toHaveLength(3);
    expect(r.throttledUids).toHaveLength(2);
    expect(r.comboId).toBe('three');
  });
  it('算法大改版: max 2 cards per tag', () => {
    const r = score([card('cat'), card('cat'), card('cat'), card('cat')], [], { bossId: 'algo_revamp' });
    expect(r.scoredUids).toHaveLength(2);
    expect(r.comboId).toBe('pair');
  });
  it('内容审核风暴: drama throttled and mult halved', () => {
    const r = score([card('drama', 40), card('cat', 10)], [], { bossId: 'censor_storm' });
    expect(r.throttledUids).toHaveLength(1);
    expect(r.comboId).toBe('vlog');
    expect(r.mult).toBe(0.5);
    expect(r.steps.some((s) => s.kind === 'debuff')).toBe(true);
  });
  it('观众审美疲劳: repeated tags reduce the multiplier', () => {
    const fresh = score([card('cat', 10)], [], { bossId: 'fatigue' });
    const tired = score([card('cat', 10)], [], { bossId: 'fatigue', fatigue: { cat: 2, ai: 0, money: 0, fun: 0, drama: 0, hot: 0 } });
    expect(fresh.mult).toBe(1);
    expect(tired.mult).toBeCloseTo(0.5625);
  });
  it('系统维护: leftmost and rightmost artifacts are disabled', () => {
    const arts = [art('night_emo'), art('fun_master'), art('night_emo')];
    expect(score([card('cat')], arts).mult).toBe(9);
    expect(score([card('cat')], arts, { bossId: 'blackout' }).mult).toBe(1);
  });
});
