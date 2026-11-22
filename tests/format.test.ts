import { describe, expect, it } from 'vitest';
import { MAX_VALUE, formatNum, safeMul, sanitize } from '../src/engine/num';
import { Rng, hashSeed } from '../src/engine/rng';

describe('formatNum', () => {
  it('abbreviates with K/M/B/T', () => {
    expect(formatNum(999)).toBe('999');
    expect(formatNum(1234)).toBe('1.23K');
    expect(formatNum(12_345_678)).toBe('12.3M');
    expect(formatNum(4.5e9)).toBe('4.5B');
    expect(formatNum(7.89e12)).toBe('7.89T');
    expect(formatNum(999_999)).toBe('999K');
  });
  it('handles astronomically large values and invalid numbers', () => {
    expect(formatNum(1.5e40)).toBe('1.5e40');
    expect(formatNum(Infinity)).not.toMatch(/Infinity|NaN/);
    expect(formatNum(NaN)).toBe('0');
    expect(sanitize(Infinity)).toBe(MAX_VALUE);
    expect(safeMul(1e200, 1e200)).toBe(MAX_VALUE);
  });
});

describe('Rng', () => {
  it('is deterministic for a seed', () => {
    const a = new Rng(hashSeed('ABC'));
    const b = new Rng(hashSeed('ABC'));
    const xs = Array.from({ length: 20 }, () => a.next());
    const ys = Array.from({ length: 20 }, () => b.next());
    expect(xs).toEqual(ys);
    expect(new Rng(hashSeed('ABD')).next()).not.toBe(xs[0]);
  });
  it('shuffle keeps all items', () => {
    const r = new Rng(1);
    const arr = Array.from({ length: 30 }, (_, i) => i);
    expect(r.shuffle(arr).sort((x, y) => x - y)).toEqual(arr);
  });
});
