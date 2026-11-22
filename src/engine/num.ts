/** Hard cap for any score value — keeps everything finite (no Infinity / NaN). */
export const MAX_VALUE = 1e300;

export function sanitize(n: number): number {
  if (Number.isNaN(n)) return 0;
  if (n === Infinity || n > MAX_VALUE) return MAX_VALUE;
  if (n === -Infinity || n < -MAX_VALUE) return -MAX_VALUE;
  return n;
}

export function safeMul(a: number, b: number): number {
  return sanitize(sanitize(a) * sanitize(b));
}

export function safeAdd(a: number, b: number): number {
  return sanitize(sanitize(a) + sanitize(b));
}

const SUFFIXES = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];

/**
 * Format big numbers: 999 -> "999", 1234 -> "1.23K", 12_345_678 -> "12.3M",
 * beyond the suffix table -> scientific "1.23e45". Never prints NaN/Infinity.
 */
export function formatNum(raw: number, opts: { digits?: number } = {}): string {
  const n = sanitize(raw);
  const neg = n < 0;
  const v = Math.abs(n);
  const digits = opts.digits ?? 3;
  let out: string;
  if (v < 1000) {
    out = v < 10 && !Number.isInteger(v) ? trimZeros(v.toFixed(1)) : String(Math.floor(v));
  } else {
    const tier = Math.floor(Math.log10(v) / 3);
    if (tier < SUFFIXES.length) {
      const scaled = v / Math.pow(10, tier * 3);
      out = toSig(scaled, digits) + SUFFIXES[tier];
    } else {
      const exp = Math.floor(Math.log10(v));
      const mant = v / Math.pow(10, exp);
      out = trimZeros(mant.toFixed(2)) + 'e' + exp;
    }
  }
  return neg ? '-' + out : out;
}

function toSig(scaled: number, digits: number): string {
  // scaled in [1, 1000)
  const intDigits = scaled >= 100 ? 3 : scaled >= 10 ? 2 : 1;
  const decimals = Math.max(0, digits - intDigits);
  // floor to avoid "1000K"
  const f = Math.pow(10, decimals);
  const floored = Math.floor(scaled * f) / f;
  return trimZeros(floored.toFixed(decimals));
}

function trimZeros(s: string): string {
  return s.includes('.') ? s.replace(/\.?0+$/, '') : s;
}

/** Format a multiplier like ×2, ×1.5, ×3.2K */
export function formatMult(n: number): string {
  return formatNum(n, { digits: 3 });
}

/** Full integer with thousands separators (for small numbers only). */
export function formatInt(n: number): string {
  const v = sanitize(n);
  if (Math.abs(v) >= 1e15) return formatNum(v);
  return Math.floor(v).toLocaleString('en-US');
}
