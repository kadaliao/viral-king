import type { Sprite, SpriteMap } from '../types';
import { spr, sym, paint, outline } from './helpers';

const flip = (s: Sprite): Sprite => ({ ...s, rows: s.rows.map((r) => [...r].reverse().join('')) });

// ---- tag badges ----
const tagCat = sym(10, 10, [
  '.k...',
  'kOk..',
  'kOOkk',
  'kOOOO',
  'kOkOO',
  'kOkOO',
  'kOOep',
  '.kOee',
  '..kkk',
  '.....',
]);

const tagAi = sym(10, 10, [
  '....c',
  '....k',
  '.kkkk',
  'kcccc',
  'kcBBB',
  'kcBiB',
  'kcBBB',
  'kcccc',
  '.kkkk',
  '.....',
]);

const tagMoney = spr(10, 10, [
  '..kkkkkk..',
  '.kwyyuyyk.',
  'kwyyuuuyYk',
  'kyyuyyyyYk',
  'kyyyuuyyYk',
  'kyyyyyuyYk',
  'kyyuuuyyYk',
  'kYyyuyyyYk',
  '.kYYYYYYk.',
  '..kkkkkk..',
]);

const tagFun = sym(10, 10, [
  '..kkk',
  '.kLLL',
  'kLLLL',
  'kLkkL',
  'kcLLL',
  'kLkkk',
  'kLkRR',
  '.kLkp',
  '..kkk',
  '.....',
]);

const tagDrama = spr(10, 10, [
  '.kkkkkkkk.',
  'krrrwwrrrk',
  'krrrwwrrrk',
  'krrrwwrrrk',
  'krrrrrrrrk',
  'krrrwwrrrk',
  '.kRRRRRRk.',
  '..kRkkkk..',
  '.kRk......',
  '.kk.......',
]);

const flame = sym(10, 10, [
  '....k',
  '...kr',
  '..krO',
  '.krOO',
  '.kOOy',
  'krOyw',
  'krOyw',
  'krOyy',
  '.krOO',
  '..kkk',
]);

// ---- UI ----
const coin = spr(10, 10, [
  '..kkkkkk..',
  '.kyyyyyyk.',
  'kyyuuuuyyk',
  'kyuwyyyuyk',
  'kyuyyyyuYk',
  'kyuyyyyuYk',
  'kyuyyyyuYk',
  'kyyuuuuyYk',
  '.kYYYYYYk.',
  '..kkkkkk..',
]);

const fans = spr(10, 10, [
  '..kkkk....',
  '.kllllk...',
  '.kllllk...',
  '.kllllk...',
  '..kkkk.kk.',
  '.kkkhpkppk',
  'kllkpppppk',
  'klllkpppk.',
  'kllllkpk..',
  'kkkkkkk...',
]);

const views = spr(10, 10, [
  '.kkkkkkkk.',
  'kppppppppk',
  'kpppwppppk',
  'kpppwwpppk',
  'kpppwwwppk',
  'kpppwwwppk',
  'kpppwwpppk',
  'kpppwppppk',
  'kmmmmmmmmk',
  '.kkkkkkkk.',
]);

const like = paint(
  sym(10, 10, [
    '.....',
    '.kkk.',
    'kpppk',
    'kpppp',
    'kpppp',
    '.kmpp',
    '..kmp',
    '...km',
    '....k',
    '.....',
  ]),
  2,
  2,
  ['w', 'h'],
);

const comment = spr(10, 10, [
  '.kkkkkkkk.',
  'kwwwwwwwwk',
  'kwwwwwwwwk',
  'kwvwvvwvwk',
  'kwwwwwwwwk',
  'kllllllllk',
  '.kkllkkkk.',
  '..klk.....',
  '..kk......',
  '..........',
]);

const share = outline(
  spr(10, 10, [
    '..........',
    '......c...',
    '......cc..',
    '...iiiiic.',
    '..cccccccc',
    '.cc...cc..',
    '.cc...c...',
    '.cc.......',
    '..........',
    '..........',
  ]),
);

const discard = outline(
  spr(10, 10, [
    '..........',
    '...yyyy...',
    '..y....y..',
    '..y...yyy.',
    '.......y..',
    '..y.......',
    '.yyy...y..',
    '..y....y..',
    '...yyyy...',
    '..........',
  ]),
);

const deck = spr(10, 10, [
  '...kkkkkkk',
  '...kvvvvvk',
  'kkkkkkkvvk',
  'kpppppkvvk',
  'kpppppkvvk',
  'kpphppkvvk',
  'kphhhpkvvk',
  'kpphppkkkk',
  'kpppppk...',
  'kkkkkkk...',
]);

const publish = outline(
  sym(10, 10, [
    '.....',
    '....L',
    '...LL',
    '..LLL',
    '.LLLL',
    '....g',
    '....g',
    '.g...',
    '.gggg',
    '.....',
  ]),
);

const lock = sym(10, 10, [
  '..kkk',
  '.ksss',
  '.ksk.',
  '.ksk.',
  'kkkkk',
  'kyyyy',
  'kYYYk',
  'kYYYk',
  'kuuuu',
  'kkkkk',
]);

const speaker = outline(
  spr(10, 10, [
    '..........',
    '....w.....',
    '...ww.....',
    '.wwww.....',
    '.wwww.....',
    '.wwww.....',
    '.wwww.....',
    '...ww.....',
    '....w.....',
    '..........',
  ]),
);
const soundOn = paint(speaker, 6, 1, ['..c', '...c', 'c..c', '.c.c', '.c.c', 'c..c', '...c', '..c']);
const soundOff = paint(speaker, 6, 3, ['r..r', '.rr.', '.rr.', 'r..r']);

const gear = outline(
  spr(10, 10, [
    '..........',
    '....ss....',
    '..ssssss..',
    '..ssddss..',
    '.ssd..dss.',
    '.ssd..dss.',
    '..ssddss..',
    '..ssssss..',
    '....ss....',
    '..........',
  ]),
);

const star = paint(
  sym(10, 10, [
    '....k',
    '...ky',
    'kkkky',
    'kyyyy',
    '.kyyy',
    '..kyy',
    '.kyyy',
    '.kyyk',
    '.kk..',
    '.....',
  ]),
  4,
  2,
  ['w'],
);

const crown = outline(
  spr(10, 10, [
    '..........',
    '..........',
    '.y..yy..y.',
    '.yy.yy.yy.',
    '.yyyyyyyy.',
    '.yryccyry.',
    '.yyyyyyyy.',
    '.uuuuuuuu.',
    '..........',
    '..........',
  ]),
);

const trophy = outline(
  spr(10, 10, [
    '..........',
    '..yyyyyy..',
    '.yywyyyYy.',
    '.y.wyyY.y.',
    '..yyyyYy..',
    '...yyYy...',
    '....yY....',
    '...yyyy...',
    '..uuuuuu..',
    '..........',
  ]),
);

const skull = sym(10, 10, [
  '..kkk',
  '.kwww',
  'kwwww',
  'kwkkw',
  'kwkkw',
  'kwwwk',
  '.kwww',
  '.kwkw',
  '..kkk',
  '.....',
]);

const arrowRight = outline(
  spr(10, 10, [
    '..........',
    '.....w....',
    '.....ww...',
    '.wwwwwww..',
    '.wwwwwwww.',
    '.llllllll.',
    '.lllllll..',
    '.....ll...',
    '.....l....',
    '..........',
  ]),
);

const bolt = outline(
  spr(10, 10, [
    '..........',
    '....yyy...',
    '...yyy....',
    '..yyy.....',
    '..yyyyyy..',
    '....yyy...',
    '...yyy....',
    '...yy.....',
    '...y......',
    '..........',
  ]),
);

const xMult = outline(
  spr(10, 10, [
    '..........',
    '.hh....pp.',
    '.hpp..ppp.',
    '..pppppp..',
    '...pppp...',
    '...pppp...',
    '..pppppp..',
    '.ppp..ppp.',
    '.pp....pp.',
    '..........',
  ]),
);

const plus = outline(
  spr(10, 10, [
    '..........',
    '....ic....',
    '....ic....',
    '....ic....',
    '.iiiiiiii.',
    '.cccccccc.',
    '....ic....',
    '....ic....',
    '....ic....',
    '..........',
  ]),
);

const boss = sym(10, 10, [
  '....k',
  '...kr',
  '..krw',
  '..krw',
  '.krrw',
  '.krrr',
  'krrrw',
  'kRRRR',
  'kkkkk',
  '.....',
]);

const shop = spr(10, 10, [
  '.kkkkkkkk.',
  'kpwwppwwpk',
  'kpwwppwwpk',
  'kkkkkkkkkk',
  '.kllllllk.',
  '.kcclnnlk.',
  '.kcclnnlk.',
  '.klllnnlk.',
  '.klllnnlk.',
  'kkkkkkkkkk',
]);

const info = sym(10, 10, [
  '..kkk',
  '.kbbb',
  'kbbbw',
  'kbbbb',
  'kbbbw',
  'kbbbw',
  'kbbbw',
  '.kbbb',
  '..kkk',
  '.....',
]);

const seed = outline(
  spr(10, 10, [
    '..........',
    '......LL..',
    '.LL..LLL..',
    '.LLLgLL...',
    '..LLg.....',
    '....g.....',
    '....g.....',
    '..nnnnnn..',
    '.nnnnnnnn.',
    '..........',
  ]),
);

export const ICON_SPRITES: SpriteMap = {
  tag_cat: tagCat,
  tag_ai: tagAi,
  tag_money: tagMoney,
  tag_fun: tagFun,
  tag_drama: tagDrama,
  tag_hot: flame,
  coin,
  fans,
  views,
  like,
  comment,
  share,
  discard,
  deck,
  publish,
  lock,
  sound_on: soundOn,
  sound_off: soundOff,
  gear,
  star,
  crown,
  trophy,
  skull,
  arrow_left: flip(arrowRight),
  arrow_right: arrowRight,
  fire: paint(flame, 5, 0, ['k', 'r']),
  bolt,
  x_mult: xMult,
  plus,
  boss,
  shop,
  info,
  seed,
};
