import type { Sprite, SpriteMap } from '../types';
import { spr, sym, paint, tint, outline, shape, segDist, inPoly } from './helpers';
import { ICON_SPRITES } from './icons';

const recolor = (s: Sprite, map: Record<string, string>): string[] =>
  s.rows.map((r) => [...r].map((c) => map[c] ?? c).join(''));

// 猫咪统治互联网 · crowned cat on the globe
const catOverlord = paint(
  sym(16, 16, [
    '.....k.k',
    '.k..kyky',
    '.kk.kyyy',
    '.khkkryc',
    '.khOkkkk',
    '.kOOOOOO',
    'kOOOwkOO',
    'kOOOkkOO',
    'khhOOOOp',
    '.kOOOOOk',
    '..kkkkkk',
    '.kbbbbbb',
    'kbbbbbbb',
    'kbbbbbbb',
    '.kbbbbbb',
    '..kkkkkk',
  ]),
  2,
  11,
  ['..ggg.......g', '.gggg....gggg', '..gg......gg', '.........g'],
);

// 搞笑担当 · jester hat over a grinning face
const funMaster = tint(
  sym(16, 16, [
    '......kk',
    '.....kyy',
    '......kp',
    'kk...kpp',
    'kyk.kppp',
    'kykkpppp',
    '.kppppmp',
    '..kyyyyy',
    '..kkkkkk',
    '..keeeee',
    '.keekeee',
    '.kekekee',
    '.kheeeee',
    '.keekkkk',
    '..kekRRR',
    '...kkkkk',
  ]),
  8,
  15,
  { p: 'L', m: 't' },
);

// 黄金三秒 · golden stopwatch pointing at 3
const golden3s = paint(
  sym(16, 16, [
    '......kk',
    '......ky',
    '.....kkk',
    '....kkkk',
    '..kkYYYY',
    '.kYyywww',
    '.kYywwww',
    'kYywwwww',
    'kYywwwww',
    'kYywwwww',
    'kYywwwww',
    'kYywwwww',
    '.kYywwww',
    '.kYYywww',
    '..kkYYYY',
    '....kkkk',
  ]),
  3,
  0,
  [
    '..........w',
    '.........www',
    '..........w',
    '',
    '',
    '',
    '....d',
    '....k',
    '....k',
    'd...kkrrr..d',
    '....kk',
    '',
    '',
    '....d',
  ],
);

// 压轴出场 · stage curtains and spotlight
const finale = paint(
  sym(16, 16, [
    'kkkkkkkk',
    'kRrrRrrR',
    'kRrrRrrR',
    'kkRkkRkk',
    'krrk...e',
    'krrk...e',
    'krk...ee',
    'krk...ee',
    'kk...eee',
    'krk..eee',
    'krrk.eee',
    'krrrkeee',
    'krrrrkey',
    'knnnnnyy',
    'knnnnnnn',
    'kkkkkkkk',
  ]),
  6,
  7,
  ['..y', '.yyy', 'yyyyy', '.yyy', '.y.y'],
);

// 带货达人 · shopping cart piled with coins
const moneyTalks = paint(
  outline(
    spr(16, 16, [
      '................',
      '...........yy...',
      '.......yy.yyyy..',
      '.ss...yyyyyyyy..',
      '..s..yyyyyyyyy..',
      '..sppppppppppp..',
      '...pmpmpmpmpmp..',
      '...ppppppppppp..',
      '....pmpmpmpmp...',
      '....ppppppppp...',
      '....ssssssssss..',
      '.....s.....s....',
      '....dd....dd....',
      '....dd....dd....',
      '................',
      '................',
    ]),
  ),
  6,
  1,
  ['.....ww', '.w..wuuu', 'wuu.u', '.....u'],
);

// 深夜emo · crying crescent moon
const nightEmo = paint(
  outline(
    shape(16, 16, (x, y) => {
      const a = Math.hypot(x - 7, y - 8) <= 6.4;
      const b = Math.hypot(x - 10.5, y - 5.5) <= 5.2;
      if (!a || b) return '.';
      if (Math.hypot(x - 7, y - 8) > 5.4) return x < 6 ? 'e' : 'Y';
      return 'y';
    }),
  ),
  2,
  1,
  [
    '..........w',
    '.........www..w',
    '..........w',
    '',
    '',
    '',
    '..kk',
    '....k',
    '...c',
    '...c',
    '..ccc',
    '...c',
  ],
);

// 蹭热度 · thermometer bursting into flame
const hotTopic = paint(
  spr(16, 16, [
    '..kk............',
    '.kwik...........',
    '.kwik...........',
    '.kwikk..........',
    '.kwik...........',
    '.khrkk..........',
    '.khrk...........',
    '.khrkk..........',
    '.khrk...........',
    '.khrkk..........',
    '.khrk...........',
    'khrrrk..........',
    'khwrrk..........',
    'krrrrk..........',
    '.kRRk...........',
    '..kk............',
  ]),
  6,
  3,
  ICON_SPRITES.tag_hot.rows,
);

// 标题党大师 · fishing hook with a red "!" bait
const clickbait = paint(
  outline(
    spr(16, 16, [
      '..........l.....',
      '..........l.....',
      '.........sss....',
      '.........s.s....',
      '.........sss....',
      '..........ss....',
      '..........ss....',
      '..........ss....',
      '..........ss....',
      '..........ss....',
      '..........ss....',
      '..s.......ss....',
      '..ss......ss....',
      '..sss....ss.....',
      '...sssssss......',
      '................',
    ]),
  ),
  0,
  2,
  ['..kkkk', '.krrrrk', 'krrwrrrk', 'krrwrrrk', 'krrwrrrk', 'krrrrrrk', 'krrwrrrk', '.kRRRRk', '..kkkk'],
);

// 全网搬运 · retweet loop around a card
const repost = paint(
  outline(
    spr(16, 16, [
      '................',
      '...LL...........',
      '..LLLL..........',
      '.LLLLLL.LLLLL...',
      '...gg...ggggg...',
      '...gg......gg...',
      '...gg......gg...',
      '...gg......gg...',
      '...gg......gg...',
      '...gg......gg...',
      '...gg......gg...',
      '...LLLLL...gg...',
      '...ggggg.gggggg.',
      '..........gggg..',
      '...........gg...',
      '................',
    ]),
  ),
  5,
  5,
  ['kkkkkk', 'kppppk', 'kwwwwk', 'kwsswk', 'kwwwwk', 'kkkkkk'],
);

// 热搜霸榜 · podium with a flame on the winner
const trending = spr(16, 16, [
  '........k.......',
  '.......krk......',
  '......krOrk.....',
  '......kOyOk.....',
  '.....krOyOrk....',
  '.....kOywyOk....',
  '.....kkkkkkk....',
  '.....klllllk....',
  '.....kvvyvvk....',
  '.kkkkkvyyvvk....',
  'kllllkvvyvvk....',
  'kvvvvkvvyvvkkkkk',
  'kvvvvkvvyvvklllk',
  'kvvvvkvyyyvkvvvk',
  'kvvvvkvvvvvkvvvk',
  'kkkkkkkkkkkkkkkk',
]);

// 百万粉丝大V · gold verified badge
const bigV = paint(
  sym(16, 16, [
    '.....kkk',
    '...kkyyy',
    '..kyyyyy',
    '.kyyyyyy',
    '.kyyYYYY',
    'kyyYwwYY',
    'kyyYwwYY',
    'kyyYYwwY',
    'kyyYYwwY',
    'kyyYYYww',
    'kyyYYYww',
    '.kyYYYYw',
    '.kyyYYYY',
    '..kuuuuu',
    '...kkuuu',
    '.....kkk',
  ]),
  10,
  10,
  ['.kkkk.', 'kcccwk', 'kwcwck', 'kcwcck', 'kcccck', '.kkkk.'],
);

// 六边形战士 · hexagon radar chart
const HEX_COLORS = ['O', 'c', 'y', 'L', 'r', 'p'];
const hexPts = (r: number[]): [number, number][] =>
  r.map((rr, i) => {
    const a = ((-90 + 60 * i) * Math.PI) / 180;
    return [7.5 + Math.cos(a) * 7 * rr, 7.5 + Math.sin(a) * 7 * rr];
  });
const OUTER = hexPts([1, 1, 1, 1, 1, 1]);
const INNER = hexPts([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
const DATA = hexPts([0.95, 0.6, 0.9, 0.5, 0.85, 0.7]);
const edgeD = (x: number, y: number, pts: [number, number][]) =>
  Math.min(...pts.map((p, i) => segDist(x, y, p[0], p[1], pts[(i + 1) % 6][0], pts[(i + 1) % 6][1])));
const hexagon = outline(
  shape(16, 16, (x, y) => {
    const px = x + 0.5;
    const py = y + 0.5;
    const v = DATA.findIndex((p) => Math.hypot(px - p[0], py - p[1]) < 1.0);
    if (v >= 0) return HEX_COLORS[v];
    if (!inPoly(px, py, OUTER) && edgeD(px, py, OUTER) > 0.5) return '.';
    if (edgeD(px, py, OUTER) < 0.6) return 'l';
    if (inPoly(px, py, DATA)) return edgeD(px, py, DATA) < 0.7 ? 'h' : 'm';
    if (edgeD(px, py, INNER) < 0.5) return 'v';
    if (OUTER.some((p) => segDist(px, py, 7.5, 7.5, p[0], p[1]) < 0.45)) return 'v';
    return 'P';
  }),
);

// 垂直领域 · drill boring straight down
const verticalArrow = outline(
  shape(16, 16, (x, y) => {
    if (y <= 8 && x >= 6 && x <= 9) return x === 6 ? 'i' : 'c';
    const half = 14 - y;
    if (y >= 9 && y <= 14 && x >= 7.5 - half - 0.5 && x <= 7.5 + half + 0.5) return x <= 7 - half + 1 || y === 9 ? 'i' : 'c';
    return '.';
  }),
);
const vertical = paint(
  spr(16, 16, [
    '................',
    '................',
    '................',
    '................',
    'kkkkkkkkkkkkkkkk',
    'gggggggggggggggg',
    'TTTTTTTTTTTTTTTT',
    'TTTnTTTTTTTTnTTT',
    'nnnnnnnnnnnnnnnn',
    'nnTnnnnnnnnnnTnn',
    'qqqqqqqqqqqqqqqq',
    'qqqqqnqqqqqqqqqq',
    'dddddddddddddddd',
    'dsddddddddddsddd',
    'zzzzzzzzzzzzzzzz',
    'zzzzzzzzzzzzzzzz',
  ]),
  0,
  0,
  verticalArrow.rows,
);

// 卡点王 · music note with rising equalizer
const beatSync = outline(
  spr(16, 16, [
    '................',
    '.....yy.........',
    '.....yyy........',
    '.....y.yy.......',
    '.....y..y.......',
    '.....y..........',
    '..yyyy.......hh.',
    '.yyyyy.......pp.',
    '..yyy....ww..pp.',
    '.........hh..pp.',
    '.....ii..hh..pp.',
    '.....cc..hh..pp.',
    '.LL..cc..hh..pp.',
    '.gg..cc..hh..pp.',
    '.gg..cc..hh..pp.',
    '................',
  ]),
);

// 删稿重发 · trash can with a refresh loop
const redo = paint(
  outline(
    spr(16, 16, [
      '................',
      '....ssss........',
      '.wwwwwwwwww.....',
      '.ssssssssss.....',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssdssdss......',
      '..ssssssss......',
      '...ssssss.......',
      '................',
      '................',
    ]),
  ),
  6,
  6,
  recolor(ICON_SPRITES.discard, { y: 'L' }),
);

// 系列连更 · film strip of episodes 1·2·3
const series = tint(
  tint(
    tint(
      spr(16, 16, [
        '................',
        '................',
        'kkkkkkkkkkkkkkkk',
        'deddeddeddeddedd',
        'dddddddddddddddd',
        'dBBBBdBBBBdBBBBd',
        'dBBwBdBwwBdBwwBd',
        'dBwwBdBBBwdBBBwd',
        'dBBwBdBBwBdBBwBd',
        'dBBwBdBwBBdBBBwd',
        'dBwwwdBwwwdBwwBd',
        'dBBBBdBBBBdBBBBd',
        'dddddddddddddddd',
        'deddeddeddeddedd',
        'kkkkkkkkkkkkkkkk',
        '................',
      ]),
      1,
      4,
      { B: 'b' },
    ),
    6,
    9,
    { B: 'v' },
  ),
  11,
  14,
  { B: 'm' },
);

// 最后一更 · hourglass nearly run out
const lastCall = paint(
  sym(16, 16, [
    '.kkkkkkk',
    '.knnnnnn',
    '.kkkkkkk',
    '..kBBBBB',
    '..kBBBBB',
    '...kBBBy',
    '....kByy',
    '.....kBy',
    '.....kBy',
    '....kBBy',
    '...kBBBy',
    '..kBBByy',
    '..kyyyyy',
    '.kkkkkkk',
    '.knnnnnn',
    '.kkkkkkk',
  ]),
  3,
  3,
  ['i', 'i', '.i', '', '', '', '.i', '', 'i'],
);

// 投流 · rocket with a coin exhaust
const paidPromo = paint(
  tint(
    sym(16, 16, [
      '.......k',
      '......kp',
      '.....kpp',
      '....kwww',
      '....kwwk',
      '....kwkc',
      '....kwwk',
      '....kwww',
      '...kkwww',
      '..kpkwww',
      '.kppkwww',
      '.kppkkkk',
      '.kkk.kss',
      '..k..kyy',
      '.kyk.kYY',
      '..k...kk',
    ]),
    8,
    15,
    { w: 'l' },
  ),
  6,
  1,
  ['.h', '', '', '', '.i'],
);

// 铁粉团 · iron shield with a heart
const ironFans = paint(
  tint(
    sym(16, 16, [
      '.kkkkkkk',
      '.kssssss',
      '.ksdssss',
      '.kssssss',
      '.kssspps',
      '.ksspppp',
      '.ksspppp',
      '.ksssppp',
      '.ksssspp',
      '..kssssp',
      '..ksssss',
      '...kssss',
      '....ksss',
      '.....kss',
      '......ks',
      '.......k',
    ]),
    8,
    15,
    { s: 'd', d: 's' },
  ),
  2,
  1,
  ['www', 'w', 'w', '...h', '..h'],
);

// 算法亲儿子 · baby robot with a pacifier
const algoChild = sym(16, 16, [
  '......kk',
  '......kh',
  '.......k',
  '...kkkkk',
  '..kiiiii',
  '.kiiiiii',
  '.kikkkii',
  '.kiwkkii',
  '.kikkkii',
  '.khhiiik',
  '.kiiikpp',
  '.kiiikpy',
  '.kiiiikp',
  '..kiiiik',
  '...kkkkk',
  '....kkkk',
]);

// 评论区吵起来了 · pile of angry bubbles
function bubble(w: number, h: number, c: string, glyph: string[], tailLeft: boolean): string[] {
  const rows = ['.' + 'k'.repeat(w - 2) + '.'];
  for (let i = 0; i < h - 2; i++) {
    const g = glyph[i] ?? '';
    const inner = Array.from({ length: w - 2 }, (_, j) => {
      const off = Math.floor((w - 2 - (glyph[0]?.length ?? 0)) / 2);
      const ch = g[j - off];
      return ch && ch !== '.' ? ch : c;
    }).join('');
    rows.push('k' + inner + 'k');
  }
  rows.push('.' + 'k'.repeat(w - 2) + '.');
  rows.push(tailLeft ? '.k' + c + 'k' : '.'.repeat(w - 4) + 'k' + c + 'k');
  rows.push(tailLeft ? '.kk' : '.'.repeat(w - 4) + 'kk');
  return rows;
}
const commentWar = paint(
  paint(
    paint(
      shape(16, 16, () => '.'),
      0,
      0,
      bubble(9, 7, 'r', ['', '.w.', '.w.', '...', '.w.'], true),
    ),
    7,
    2,
    bubble(9, 7, 'p', ['', 'w.w.w', 'wwwww', 'w.w.w', ''], false),
  ),
  2,
  8,
  [...bubble(9, 6, 'O', ['', 'w.w', '.w.', 'w.w'], true)].slice(0, 6),
);
const commentWarSparks = paint(commentWar, 0, 0, [
  '..........y',
  '.........y.y',
  '..........y',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '',
  '...............',
  '............y..',
  '...........y.y',
  '............y',
]);

// 流量密码 · glowing code key
const trafficCode = paint(
  outline(
    spr(16, 16, [
      '................',
      '................',
      '................',
      '..ccccc.........',
      '.ciiiicc........',
      '.ci...cc........',
      '.cc...ciiiiiiii.',
      '.cc...ccccccccc.',
      '.ccccccc..cc.cc.',
      '..ccccc...cc.cc.',
      '................',
      '................',
      '................',
      '................',
      '................',
      '................',
    ]),
  ),
  0,
  11,
  ['....g.ggg.g.ggg', '....g.g.g.g.g.g', '....g.ggg.g.ggg'],
);

// 神秘算法 · crystal ball with a glowing "?"
const mysteryAlgo = paint(
  sym(16, 16, [
    '.....kkk',
    '...kkvvv',
    '..kvvvvv',
    '.kvvvvvv',
    '.kvvvvvv',
    'kvvvvvvv',
    'kvvvvvvv',
    'kvvvvvvv',
    'kvvvvvvv',
    '.kPvvvvv',
    '.kPPvvvv',
    '..kkPPPP',
    '..kkkkkk',
    '...kYYYY',
    '..kuuuuu',
    '..kkkkkk',
  ]),
  2,
  2,
  ['..ll', '.l.www', 'l..w..w', '.....w', '....w', '', '....w', '', '..........i', '.........iii', '..........i'],
);

// 回声室效应 · concentric echo rings
const echoChamber = outline(
  shape(16, 16, (x, y) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    const d = Math.hypot(dx, dy);
    if (d <= 1.7) return d < 0.8 ? 'w' : 'h';
    const side = Math.abs(dx) / d > 0.5;
    if (side && d > 2.7 && d <= 3.8) return 'p';
    if (side && d > 4.7 && d <= 5.8) return 'l';
    if (side && d > 6.6 && d <= 7.6) return 'c';
    return '.';
  }),
);

// 二创鬼才 · scissors snipping a film strip
const remix = sym(16, 16, [
  '..kkk...',
  '.kpppk..',
  '.kpkpk..',
  '.kpppk..',
  '..kkppk.',
  '....kppk',
  '.....kpd',
  '.....ksd',
  '....kssk',
  '...kssk.',
  '..kssk..',
  '..ksk...',
  'kkkkkkk.',
  'dedededk',
  'dddddddk',
  'kkkkkkk.',
]);

// 互联网永动机 · glowing infinity with gears
const INFINITY = [
  '................',
  '................',
  '................',
  '................',
  '................',
  '..iccc....hppp..',
  '.ic..cc..hp..pp.',
  '.c....ccpp....p.',
  '.p....ppcc....c.',
  '.pp..pp..cc..cc.',
  '..pppp....cccc..',
  '................',
  '................',
  '................',
  '................',
  '................',
];
const gearAt = (x: number, y: number, cx: number, cy: number) => {
  const d = Math.hypot(x - cx, y - cy);
  const a = (Math.atan2(y - cy, x - cx) * 180) / Math.PI + 360;
  if (d < 0.8) return 'k';
  if (d <= 1.6) return 'y';
  if (d <= 2.5 && a % 90 < 20) return 'Y';
  return '';
};
const perpetual = paint(
  outline(
    shape(16, 16, (x, y) => {
      const g = gearAt(x + 0.5, y + 0.5, 8, 1.9) || gearAt(x + 0.5, y + 0.5, 8, 14.1);
      if (g) return g;
      return INFINITY[y][x];
    }),
  ),
  0,
  0,
  ['.w............w', 'www..........www', '.w............w'],
);

// 抄作业 · notebook with a copy arrow pointing left
const copyArrow = outline(
  spr(12, 9, [
    '............',
    '....i.......',
    '...ii.......',
    '..iiiiiiiii.',
    '.cccccccccc.',
    '..ccccccccc.',
    '...cc.......',
    '....c.......',
    '............',
  ]),
);
const copycat = paint(
  outline(
    spr(16, 16, [
      '................',
      '......eeeeeeeee.',
      '.....seeeeeeeee.',
      '......ellllllle.',
      '.....seeeeeeeee.',
      '......ellllllle.',
      '.....seeeeeeeee.',
      '......ellllllle.',
      '.....seeeeeeeee.',
      '......ellllllle.',
      '.....seeeeeeeee.',
      '......ellllllle.',
      '.....seeeeeeeee.',
      '......eeeeeeeee.',
      '................',
      '................',
    ]),
  ),
  0,
  7,
  copyArrow.rows,
);

// 矩阵号 · 2×2 grid of phones
function phone(c: string): string[] {
  return ['.kkkkk.', 'kzzzzzk', `k${c}${c}${c}${c}${c}k`, `k${c}w${c}${c}${c}k`, `k${c}${c}${c}${c}${c}k`, `k${c}${c}${c}${c}${c}k`, 'kzzwzzk', '.kkkkk.'];
}
const matrix = paint(
  [
    [0, 0, 'c'],
    [9, 0, 'p'],
    [0, 8, 'L'],
    [9, 8, 'y'],
  ].reduce((s, [x, y, c]) => paint(s, x as number, y as number, phone(c as string)), shape(16, 16, () => '.')),
  7,
  3,
  ['hh', '', '', '', '', '', '', '', '', 'hh'],
);

export const ARTIFACT_SPRITES: SpriteMap = {
  cat_overlord: catOverlord,
  fun_master: funMaster,
  golden_3s: golden3s,
  finale,
  money_talks: moneyTalks,
  night_emo: nightEmo,
  hot_topic: hotTopic,
  clickbait,
  repost,
  trending,
  big_v: bigV,
  hexagon,
  vertical,
  beat_sync: beatSync,
  redo,
  series,
  last_call: lastCall,
  paid_promo: paidPromo,
  iron_fans: ironFans,
  algo_child: algoChild,
  comment_war: commentWarSparks,
  traffic_code: trafficCode,
  mystery_algo: mysteryAlgo,
  echo_chamber: echoChamber,
  remix,
  perpetual,
  copycat,
  matrix,
};
