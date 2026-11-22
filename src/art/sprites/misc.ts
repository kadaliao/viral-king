import type { Sprite, SpriteMap } from '../types';
import { K, sym, paint, outline, shape } from './helpers';

// 吉祥物 · crowned retro CRT TV with a play-button face
const mascotBody = sym(32, 32, [
  '................',
  '...kk...........',
  '..kcck.....kk..k',
  '..kcik....kyykky',
  '...kkk....kyyyyy',
  '.....k....kyryyc',
  '......k...kyyyyy',
  '.......k..kuuuuu',
  '..kkkkkkkkkkkkkk',
  '.khhhhhhhhhhhhhh',
  '.khppppppppppppp',
  '.khpppkkkkkkkkkk',
  '.khppkcccccccccc',
  '.khppkcccccccccc',
  '.khppkcccccccccc',
  'kkhppkcccccccccc',
  'khkppkcccccccccc',
  'khkppkcccccccccc',
  'kkhppkcccccccccc',
  '.khppkcccccccccc',
  '.khppkcccccccccc',
  '.khppkcccccccccc',
  '.khpppkkkkkkkkkk',
  '.kpppppppppppppp',
  '.kpppyypppppmpmp',
  '.kpppyypppppmpmp',
  '.kmmmmmmmmmmmmmm',
  '..kkkkkkkkkkkkkk',
  '.......kvvvk....',
  '......kvvvvvk...',
  '......kkkkkkk...',
  '................',
]);
const mascot = paint(mascotBody, 0, 12, [
  '......iii..kkk',
  '......ii...kwwkk',
  '......i....kwwwwkk',
  '...........kwkwwkwkk',
  '...........kwkwwkwwwk',
  '...........kwhkkhwwwk',
  '...........kwwwwwwkk',
  '...........kwwwwkk',
  '...........kwwkk',
  '...........kkk',
]);

// 卡背 · play button inside a diamond
const cardBack = paint(
  outline(
    shape(24, 24, (x, y) => {
      const d = Math.abs(x + 0.5 - 12) + Math.abs(y + 0.5 - 12);
      const tri = [1, 3, 5, 7, 7, 5, 3, 1];
      if (y >= 8 && y <= 15 && x >= 9 && x < 9 + tri[y - 8]) return y < 12 ? 'w' : 'e';
      if (d > 11) return '.';
      if (d > 10) return 'p';
      if (d > 9) return 'm';
      if (d > 7.5) return 'v';
      if (d > 6.5) return 'h';
      return 'P';
    }),
  ),
  0,
  0,
  ['.h....................h', 'hhh..................hhh', '.h....................h', ...Array(18).fill(''), '.h....................h', 'hhh..................hhh', '.h....................h'],
);

// 里程碑 · view-milestone play-button awards
function plaque(top: number, fill: string, light: string, shade: string, stand: boolean): Sprite {
  const half = [
    '..kkkkkk',
    '.kGGGGGG',
    'kGFFFFFF',
    'kGFFFFFF',
    'kGFFFFFF',
    'kFFFFFFF',
    'kFFFFFFF',
    'kFFFFFFF',
    'kFFFFFFF',
    'kFFFFFFF',
    '.kHHHHHH',
    '..kkkkkk',
  ];
  const rows = Array<string>(16).fill('........');
  half.forEach((r, i) => (rows[top + i] = r));
  if (stand) {
    rows[top + 12] = '.....kHH';
    rows[top + 13] = '....kkkk';
  }
  const tri = outline(
    shape(16, 16, (x, y) => {
      const w = [1, 2, 3, 4, 3, 2, 1][y - (top + 3)];
      return w && x >= 6 && x < 6 + w ? 'w' : '.';
    }),
  );
  return paint(sym(16, 16, rows, { F: fill, G: light, H: shade }), 0, 0, tri.rows);
}

const sparkle = (s: Sprite, pts: [number, number, string][]): Sprite =>
  pts.reduce((acc, [x, y, c]) => paint(acc, x - 1, y - 1, [`.${c}.`, `${c}w${c}`, `.${c}.`]), s);

const milestone1 = plaque(1, '#c0743a', '#f0a868', '#7a4320', true);
const milestone2 = paint(plaque(1, '#b8bfd6', '#ffffff', '#6f7596', true), 2, 3, ['w', 'w']);
const milestone3 = sparkle(paint(plaque(1, '#ffb020', '#ffe14d', '#b86e0a', true), 2, 3, ['w', 'w']), [
  [14, 1, 'y'],
  [1, 12, 'y'],
]);

const milestone4 = sparkle(
  paint(
    outline(
      shape(16, 16, (x, y) => {
        const px = x + 0.5;
        const py = y + 0.5;
        if (py < 2 || py > 15) return '.';
        if (py <= 5.5) {
          const halfW = 4 + (py - 2) * 0.9;
          if (Math.abs(px - 8) > halfW) return '.';
          if (py < 3) return 'w';
          return Math.abs(px - 8) < halfW - 2.5 ? 'i' : 'c';
        }
        const halfW = 7.2 * (1 - (py - 5.5) / 9.5);
        if (Math.abs(px - 8) > halfW) return '.';
        if (Math.abs(Math.abs(px - 8) - halfW * 0.45) < 0.5) return 'b';
        return px < 8 ? 'c' : 'b';
      }),
    ),
    0,
    0,
    ['', '', '', '', '', '', '.......k', '......kwkk', '......kwwwk', '......kwwkk', '......kwk', '......kk'],
  ),
  [
    [14, 2, 'i'],
    [2, 10, 'c'],
  ],
);

const rainbow = ['p', 'p', 'O', 'O', 'y', 'y', 'L', 'L', 'c', 'c', 'v', 'v'];
const cosmicBase = plaque(4, K.p, K.h, K.v, false);
const milestone5 = sparkle(
  paint(
    {
      ...cosmicBase,
      rows: cosmicBase.rows.map((r, y) => r.replace(/[FGH]/g, rainbow[y - 4] ?? 'v')),
    },
    4,
    0,
    ['k..kk..k', 'kykyykyk', 'kyyyyyyk', 'kyrccryk', 'kkkkkkkk'],
  ),
  [
    [1, 1, 'y'],
    [14, 2, 'c'],
  ],
);

export const MISC_SPRITES: SpriteMap = {
  mascot,
  card_back: cardBack,
  milestone_1: milestone1,
  milestone_2: milestone2,
  milestone_3: milestone3,
  milestone_4: milestone4,
  milestone_5: milestone5,
};
