import type { SpriteMap } from '../types';
import { sym, paint, outline, shape, segDist } from './helpers';

// 算法大改版 · glitching evil eye in a monitor
const algoRevamp = paint(
  sym(24, 24, [
    '............',
    '............',
    '.kkkkkkkkkkk',
    'kvllllllllll',
    'kvkkkkkkkkkk',
    'kvkNNNNNNNNN',
    'kvkPPPPkkkkk',
    'kvkNNkkwwwww',
    'kvkPkwwwwrrr',
    'kvkkwwwwrrRk',
    'kvkkwwwrrRkk',
    'kvkkwwwrrRkk',
    'kvkkwwwwrrRk',
    'kvkPkwwwwrrr',
    'kvkNNkkwwwww',
    'kvkPPPPkkkkk',
    'kvkNNNNNNNNN',
    'kvkkkkkkkkkk',
    'kvvvvvvvvvvv',
    '.kkkkkkkkkkk',
    '.........kdd',
    '........kddd',
    '......kkdddd',
    '......kkkkkk',
  ]),
  0,
  0,
  [
    '',
    '',
    '',
    '',
    '',
    '...rr..............rr',
    '.....rr..........rr',
    '',
    '..ccc.................cc',
    '.......................c',
    '...........w',
    '..........ww',
    'pp....................pp',
    '...ccc',
    '',
    '...................ppp',
    '',
    '',
    '...................h.h',
  ],
);

// 内容审核风暴 · angry storm cloud slamming a red stamp
const censorCloud = sym(24, 24, [
  '........kkkk',
  '...kkkk.ksss',
  '..kssskksddd',
  '.ksdddsddddd',
  '.kdddddddddd',
  'kddddddddddd',
  'kddkkddddddd',
  'kddddkkddddd',
  'kdddyyyddddd',
  'kzzdddddddkk',
  '.kzzzzzzkkzz',
  '..kkkkkkzzzz',
  '.......kkkkk',
  '.........knn',
  '........knnn',
  '.........knn',
  '..........kn',
  '......kkkkkk',
  '.....krrrrwr',
  '.....krrrrrw',
  '.....krrrrwr',
  '.....kRRRRRR',
  '......kkkkkk',
  '............',
]);
const censorStorm = paint(
  censorCloud,
  0,
  0,
  [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '.......................',
    '..kk..................kk',
    '.kyk.................kyk',
    'kyk.................kyk',
    'kyyk...............kyyk',
    '.kyk................kyk',
    '.ky..................yk',
    '.k....................k',
    '',
    '',
    '',
    '...r..r..........r..r',
    '..r....r........r....r',
  ],
);

// 观众审美疲劳 · yawning bored face with Z's
const fatigue = paint(
  sym(24, 24, [
    '............',
    '............',
    '............',
    '.......kkkkk',
    '.....kkSSSSS',
    '....kSSSSSSS',
    '...kSSSSSSSS',
    '..kSSkkkSSSS',
    '..kSSSSSkSSS',
    '.kSSkkkkkkSS',
    '.kSSkTTTTTkS',
    '.kSSkwwkkwkS',
    '.kSSSkkkkkSS',
    '.kSSSllllSSS',
    '.kSSSSSSSkkk',
    '.kSSSSSSkRRR',
    '.kSSSSSkRRRR',
    '.kSSSSSkRRpp',
    '..kSSSSkRRpp',
    '..kSSSSSkRRR',
    '...kSSSSSkkk',
    '....kkSSSSSS',
    '......kkkkkk',
    '............',
  ]),
  0,
  0,
  [
    '.................kkkkkk',
    '.................kccccck',
    '..............kkk.kkcck',
    '.............kccck.kcck',
    '..............kck.kcck',
    '.............kccckcccccck',
    '..............kkk.kkkkkk',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '..i',
    '.iii',
    '..i',
  ],
);

// 平台限流 · phone wrapped in chains and a padlock
const phone = sym(24, 24, [
  '....kkkkkkkk',
  '...kzzzzzzzz',
  '...kzzzzzzkk',
  '...kzkkkkkkk',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNPNN',
  '...kzkNNNPPN',
  '...kzkNNNPPP',
  '...kzkNNNPPP',
  '...kzkNNNPPN',
  '...kzkNNNPNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkNNNNNN',
  '...kzkkkkkkk',
  '...kzzzzzzzk',
  '...kzzzzzzzz',
  '....kkkkkkkk',
  '............',
]);
const chains = outline(
  shape(24, 24, (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    for (const [ax, ay, bx, by] of [
      [1.5, 4, 22.5, 17],
      [22.5, 4, 1.5, 17],
    ]) {
      if (segDist(px, py, ax, ay, bx, by) < 1.25) {
        const t = Math.hypot(px - ax, py - ay);
        return Math.floor(t / 2) % 2 === 0 ? 's' : 'w';
      }
    }
    return '.';
  }),
);
const shadowban = paint(paint(phone, 0, 0, chains.rows), 7, 12, [
  '..kkkkkk..',
  '.kssssssk.',
  '.ksk..ksk.',
  '.ksk..ksk.',
  'kkkkkkkkkk',
  'kwyyyyyyyk',
  'kyYYkkYYyk',
  'kyYYkkYYyk',
  'kyYYYkYYyk',
  'kuuuuuuuuk',
  'kkkkkkkkkk',
]);

// 系统维护 · dead monitor taped off for maintenance
const monitor = sym(24, 24, [
  '............',
  '............',
  '.kkkkkkkkkkk',
  'kswwwwwwwwww',
  'kskkkkkkkkkk',
  'kskNNNNNNNNN',
  'kskNNNNNNNNN',
  'kskNNsNNNsNN',
  'kskNNNsNsNNN',
  'kskNNNNsNNNN',
  'kskNNNsNsNNN',
  'kskNNsNNNsNN',
  'kskNNNNNNNNN',
  'kskNNNNNNNss',
  'kskNNNNNNsNN',
  'kskNNNNNNNNN',
  'kskNNNNNNNNN',
  'kskkkkkkkkkk',
  'kddddddddddd',
  '.kkkkkkkkkkk',
  '........kdds',
  '......kkdddd',
  '......kkkkkk',
  '............',
]);
const tape = outline(
  shape(24, 24, (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    // band along a gentle diagonal
    const c = 13.5 + (px - 12) * 0.25;
    if (Math.abs(py - c) > 1.6) return '.';
    return Math.floor((px + py) / 2) % 2 === 0 ? 'y' : 'k';
  }),
);
const blackout = paint(
  paint(monitor, 0, 0, tape.rows),
  0,
  0,
  [
    '..........................',
    '...................y...y',
    '....................y.y',
    '..................yy.w.yy',
    '....................y.y',
    '...................y...y',
    '.............w',
    '............w',
    '.............w',
    '..............w',
    '...............w',
  ],
);

export const BOSS_SPRITES: SpriteMap = {
  algo_revamp: algoRevamp,
  censor_storm: censorStorm,
  fatigue,
  shadowban,
  blackout,
};
