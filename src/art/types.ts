/**
 * Pixel sprite format.
 * - `rows`: each string is one row of pixels, length === w; rows.length === h.
 * - Each character is a palette key. '.' (or ' ') means transparent.
 * - `palette`: maps single characters to CSS hex colors (#rrggbb).
 */
export interface Sprite {
  w: number;
  h: number;
  palette: Record<string, string>;
  rows: string[];
}

export type SpriteMap = Record<string, Sprite>;
