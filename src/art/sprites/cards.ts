import type { SpriteMap } from '../types';
import { spr, sym, paint, tint, outline } from './helpers';

/** Coin stack patch (5px wide): n coins, face on top. */
function coinStack(n: number): string[] {
  const r = ['.kkk.', 'kwyyk'];
  for (let i = 0; i < n; i++) {
    r.push('kYYYk');
    if (i < n - 1) r.push('kkkkk');
  }
  r.push('.kkk.');
  return r;
}

// 猫 · orange tabby face
const cat1 = sym(24, 24, [
  '............',
  '............',
  '..kk........',
  '..kOk.......',
  '..kOOk......',
  '..kOhOk.....',
  '..kOhhOkkkkk',
  '.kOOhhOOqOOq',
  '.kOOOOOOqOOq',
  '.kOOOOOOOOOq',
  'kOOOOOOOOOOO',
  'kqqOOOkkOOOO',
  'kOOOOkwkkOOO',
  'kqqOOkkkkOOO',
  'kOOOOOkkOOOO',
  'kOhhOOOOeeep',
  'kOhhOOOeeeek',
  'kOOOOOOeekke',
  'kOOOOOOOeeee',
  '.kOOOOOOOOOO',
  '.kqOOOOOOOOO',
  '..kkqOOOOOOO',
  '....kkkkkkkk',
  '............',
]);

// 猫 · grey cat loafing in a cardboard box
const cat2 = sym(24, 24, [
  '............',
  '............',
  '............',
  '.....kk.....',
  '.....ksk....',
  '.....kshk...',
  '.....kshskkk',
  '....kssssdsd',
  '....kssssssd',
  '...kssssssss',
  '...kssskssss',
  '...kssksksss',
  '...kshhssssp',
  '...ksssssssk',
  '...kssssskks',
  'kkkkkkkkkkkk',
  'knTTTTTTTTTT',
  'knTTTTTTTTTT',
  'knTTTTTTTppT',
  'knTTTTTTTppp',
  'knTTTTTTTTpp',
  'knTTTTTTTTTp',
  'knnnnnnnnnnn',
  'kkkkkkkkkkkk',
]);

// AI · cute robot head with glowing eyes
const ai1 = sym(24, 24, [
  '..........kk',
  '.........kwp',
  '.........kpp',
  '..........kk',
  '..........kd',
  '..........kd',
  '...kkkkkkkkk',
  '..kwwsssssss',
  '..kwssssssss',
  '.kkskkkkkkkk',
  'kpkskBBBBBBB',
  'kpkskBBccBBB',
  'kpkskBciicBB',
  'kpkskBBccBBB',
  '.kkskBBBBBBB',
  '..kskkkkkkkk',
  '..ksssssssss',
  '..ksssskssss',
  '..kssssskkkk',
  '..kddddddddd',
  '...kkkkkkkkk',
  '........kddd',
  '........kkkk',
  '............',
]);

// AI · glowing chip
const ai2 = spr(24, 24, [
  '........................',
  '......kkkkkkkkkkkk......',
  '......ksskksskkssk......',
  '......ksskksskkssk......',
  '....kkkkkkkkkkkkkkkk....',
  '....kvvvvvvvvvvvvvvk....',
  '.kkkkvPPPcPPPPcPPPvkkkk.',
  '.ksskvPccccccccccPvkssk.',
  '.ksskvPcBBBBBBBBcPvkssk.',
  '.kkkkvPcBBiBBiiBcPvkkkk.',
  '.kkkkvPcBiBiBiiBcPvkkkk.',
  '.ksskvccBiiiBiiBccvkssk.',
  '.ksskvPcBiBiBiiBcPvkssk.',
  '.kkkkvPcBiBiBiiBcPvkkkk.',
  '.kkkkvPcBBBBBBBBcPvkkkk.',
  '.ksskvPccccccccccPvkssk.',
  '.ksskvPPPcPPPPcPPPvkssk.',
  '.kkkkvPPPPPPPPPPPPvkkkk.',
  '....kvvvvvvvvvvvvvvk....',
  '....kkkkkkkkkkkkkkkk....',
  '......ksskksskkssk......',
  '......ksskksskkssk......',
  '......kkkkkkkkkkkk......',
  '........................',
]);

// 钱 · money bag flanked by coin stacks
const money1 = paint(
  sym(24, 24, [
    '............',
    '............',
    '........kkkk',
    '.......kTTTT',
    '........kTTT',
    '.........krr',
    '........kTTT',
    '.......kTTTT',
    '......kTTTTT',
    '.....kTTTTTT',
    '....kTTTTTTT',
    '....kTTTTTTT',
    '...kTTTTTTTT',
    '...kTTTTTTTT',
    '...kTTTTTTTT',
    '.kkkkTTTTTTT',
    'kwyyykTTTTTT',
    'kYYYYkTTTTTT',
    'kkkkkkTTTTTT',
    'kYYYYkTTTTTT',
    'kkkkkknnnnnn',
    'kYYYYkkkkkkk',
    '.kkkk.......',
    '............',
  ]),
  9,
  3,
  ['.eee', 'e', '', '', '', '', '', '..t', '.tttt', 't.t', '.ttt', '..t.t', 'tttt', '..t'],
);

// 钱 · rising chart arrow over growing coin stacks
const money2Arrow = outline(
  spr(
    24,
    24,
    Array.from({ length: 24 }, (_, y) =>
      Array.from({ length: 24 }, (_, x) => {
        if (y >= 1 && y <= 7 && x >= 13 + y && x <= 20) return y === 1 || x === 13 + y ? 'L' : 'g';
        if (y >= 4 && y <= 17 && x >= 20 - y && x <= 22 - y) return x === 20 - y ? 'L' : 'g';
        return '.';
      }).join(''),
    ),
  ),
);
const money2 = [1, 2, 3, 4].reduce((s, n, i) => paint(s, i * 6, 24 - (2 * n + 2), coinStack(n)), money2Arrow);

// 搞笑 · tears-of-joy face
const fun1 = paint(
  sym(24, 24, [
    '............',
    '............',
    '.........kkk',
    '......kkkyyy',
    '.....kyyyyyy',
    '....kyyyyyyy',
    '...kyyyyyyyy',
    '...kyyyyyyyy',
    '..kyyykkkyyy',
    '..kyykyyykyy',
    '..kcyyyyyyyy',
    '.kccyyyyyyyy',
    'kcicyhhyyyyy',
    'kcccykkkkkkk',
    'kcckykwwwwww',
    '.kkkykRRRRRR',
    '...kYykRRRpp',
    '...kYyykRppp',
    '....kYyykkkk',
    '.....kYYyyyy',
    '......kkkYYY',
    '.........kkk',
    '............',
    '............',
  ]),
  5,
  4,
  ['.ww', 'w'],
);

// 搞笑 · banana peel
const fun2 = paint(
  sym(24, 24, [
    '............',
    '............',
    '...........k',
    '..........kn',
    '..........kn',
    '.........kyy',
    '.........kyy',
    '........kyyy',
    '.......kyyyy',
    '......kyyyyy',
    '.....kyyekyy',
    '....kyyekkyy',
    '...kyyek.kyy',
    '..kyyek..kyy',
    '..kyyek..kyy',
    '.kyyek...kyy',
    '.kyyek...kYy',
    '.kyek.....kY',
    '.knk......kY',
    '..k.......kn',
    '...........k',
    '...PPPPPPPPP',
    '.....PPPPPPP',
    '............',
  ]),
  9,
  6,
  ['..n', '', '.....n', '.n'],
);

// 撕 · two angry bubbles clashing, lightning between
const drama1 = paint(
  tint(
    sym(24, 24, [
      '............',
      '............',
      '............',
      '...kkkkkkk..',
      '..krrrrrrrk.',
      '.krrrrrrrrrk',
      '.krrrwwrrrrk',
      '.krrrwwrrrrk',
      '.krrrwwrrrrk',
      '.krrrwwrrrrk',
      '.krrrrrrrrrk',
      '.krrrwwrrrrk',
      '.kRrrrrrrrRk',
      '..kRRRRRRRk.',
      '..kRkkkkkk..',
      '.kRk........',
      '.kk.........',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
      '............',
    ]),
    12,
    23,
    { r: 'p', R: 'm' },
  ),
  8,
  2,
  ['.....kkk', '....kyyk', '...kyyk.', '..kyyk..', '.kyyykkk', 'kyyyyyyk', 'kkkkyyk.', '...kyyk.', '..kyyk..', '..kyk...', '.kyk....', '.kk.....'],
);

// 撕 · megaphone shouting
const drama2 = paint(
  outline(
    spr(24, 24, [
      '........................',
      '........................',
      '........................',
      '...............ee.......',
      '..............hee.......',
      '.............hhee....y..',
      '...........hhrree.....y.',
      '.........hhrrrree.....y.',
      '.......hhrrrrrree.y...y.',
      '.....hhrrrrrrrree..y..y.',
      '.ddddrrrrrrrrrree..y..y.',
      '.ddddrrrrrrrrrree..y..y.',
      '.ddddrrrrrrrrrree..y..y.',
      '.ddddrrrrrrrrrree..y..y.',
      '.....RRrrrrrrrree..y..y.',
      '.......RRrrrrrree.y...y.',
      '.......ddRRrrrree.....y.',
      '.......dd..RRrree.....y.',
      '.......dd....RRee....y..',
      '.......dd.....Ree.......',
      '.......dd......ee.......',
      '........................',
      '........................',
      '........................',
    ]),
  ),
  15,
  3,
  ['.w', 'w', 'w'],
);

// 热 · flame
const hot1 = paint(
  sym(24, 24, [
    '............',
    '...........k',
    '..........kr',
    '.........krr',
    '.........krO',
    '....k...krrO',
    '....kk..krOO',
    '....krk.krOy',
    '...krrkkrrOy',
    '...krrrrrOOy',
    '..krrOrrOOyy',
    '..krOOOOOyyy',
    '.krrOOOOyyyy',
    '.krOOOyyyyye',
    '.krOOyyyyeee',
    'krrOOyyyeeew',
    'krOOyyyeewww',
    'krOOyyyeewww',
    'krOOyyyeeeww',
    '.krOOyyyeeee',
    '.krrOOyyyyyy',
    '..krrOOOOOOO',
    '...kkrrrrrrr',
    '.....kkkkkkk',
  ]),
  0,
  0,
  [],
);

// 热 · breaking-news siren
const hot2 = paint(
  sym(24, 24, [
    '............',
    '...........y',
    '..y........y',
    '...y.......y',
    '....y.......',
    '........kkkk',
    '......kkrrrr',
    '.....krrrrrr',
    '....krrrrrrr',
    '....krrrrrrr',
    '...kRrrrrrrr',
    'yy.kRrrrrrrr',
    'yy.kRrrrrrrr',
    '...kRrrrrrrr',
    '...kRrrrrrrr',
    '...kRRrrrrrr',
    '.kkkkkkkkkkk',
    '.kssssssssss',
    '.kssssssssss',
    '.kdddddddddd',
    '..kkkkkkkkkk',
    '............',
    '............',
    '............',
  ]),
  6,
  7,
  ['..ww', '.ww', 'ww', 'w', 'w'],
);

export const CARD_SPRITES: SpriteMap = {
  card_cat_1: cat1,
  card_cat_2: cat2,
  card_ai_1: ai1,
  card_ai_2: ai2,
  card_money_1: money1,
  card_money_2: money2,
  card_fun_1: fun1,
  card_fun_2: fun2,
  card_drama_1: drama1,
  card_drama_2: drama2,
  card_hot_1: hot1,
  card_hot_2: hot2,
};
