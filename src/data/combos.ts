import type { Tag } from '../engine/types';

export interface ComboMatchInput {
  counts: Record<Tag, number>;
  n: number;
  fans: number;
  preferredTag: Tag | null;
}

export type ComboFamily = 'basic' | 'stack' | 'theme' | 'mix' | 'special';

export interface ComboDef {
  id: string;
  name: string;
  family: ComboFamily;
  /** short requirement shown in the combo table */
  req: string;
  desc: string;
  base: number;
  mult: number;
  /** per level-up (运营课程) */
  lvBase: number;
  lvMult: number;
  /** tags involved — used for titles and hints */
  tags: Tag[];
  match: (m: ComboMatchInput) => boolean;
}

const has = (m: ComboMatchInput, ...tags: Tag[]) => tags.every((t) => m.counts[t] > 0);
const sortedCounts = (m: ComboMatchInput) =>
  Object.values(m.counts)
    .filter((c) => c > 0)
    .sort((a, b) => b - a);
const distinct = (m: ComboMatchInput) => sortedCounts(m).length;

export const FAN_LIVE_MIN_FANS = 2000;

/**
 * Video types. The engine picks the combo with the highest
 * (combo base + card base) × combo mult among all that match.
 */
export const COMBOS: ComboDef[] = [
  // ----- basic / stack (same-tag shapes) -----
  {
    id: 'vlog', name: '日常碎碎念', family: 'basic', req: '任意卡牌', desc: '什么都拍一点，平台也就随便推一点。',
    base: 5, mult: 1, lvBase: 10, lvMult: 1, tags: [], match: (m) => m.n >= 1,
  },
  {
    id: 'pair', name: '双倍安利', family: 'stack', req: '2 张同标签', desc: '同一个话题说两遍，观众就记住了。',
    base: 10, mult: 2, lvBase: 15, lvMult: 1, tags: [], match: (m) => sortedCounts(m)[0] >= 2,
  },
  {
    id: 'two_pair', name: '双线并行', family: 'stack', req: '两组 2 张同标签', desc: '两条故事线并行，完播率翻倍。',
    base: 20, mult: 2, lvBase: 20, lvMult: 1, tags: [],
    match: (m) => { const c = sortedCounts(m); return c[0] >= 2 && (c[1] ?? 0) >= 2; },
  },
  {
    id: 'three', name: '垂直深耕', family: 'stack', req: '3 张同标签', desc: '算法最爱垂直账号。',
    base: 30, mult: 3, lvBase: 20, lvMult: 2, tags: [], match: (m) => sortedCounts(m)[0] >= 3,
  },
  {
    id: 'full_house', name: '主线加支线', family: 'stack', req: '3 张同标签 + 2 张同标签', desc: '主线有梗，支线有料。',
    base: 40, mult: 4, lvBase: 25, lvMult: 2, tags: [],
    match: (m) => { const c = sortedCounts(m); return c[0] >= 3 && (c[1] ?? 0) >= 2; },
  },
  {
    id: 'four', name: '垂类霸主', family: 'stack', req: '4 张同标签', desc: '这个赛道的流量，我承包了。',
    base: 60, mult: 7, lvBase: 30, lvMult: 3, tags: [], match: (m) => sortedCounts(m)[0] >= 4,
  },
  {
    id: 'five', name: '纯享版', family: 'stack', req: '5 张同标签', desc: '纯度 100%，粉丝狂喜。',
    base: 100, mult: 12, lvBase: 40, lvMult: 4, tags: [], match: (m) => sortedCounts(m)[0] >= 5,
  },
  // ----- mix (many different tags) -----
  {
    id: 'mixed4', name: '全梗大杂烩', family: 'mix', req: '4 种不同标签', desc: '什么梗都有，总有一个戳中你。',
    base: 35, mult: 4, lvBase: 25, lvMult: 2, tags: [], match: (m) => distinct(m) >= 4,
  },
  {
    id: 'rainbow', name: '全网通吃', family: 'mix', req: '5 种不同标签', desc: '老少皆宜，全平台推荐。',
    base: 80, mult: 8, lvBase: 35, lvMult: 3, tags: [], match: (m) => distinct(m) >= 5,
  },
  // ----- themes (specific tag pairs) -----
  {
    id: 'cute_fun', name: '萌宠爆笑', family: 'theme', req: '猫咪 + 搞笑', desc: '猫猫一出手，笑点全都有。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['cat', 'fun'], match: (m) => has(m, 'cat', 'fun'),
  },
  {
    id: 'ai_money', name: 'AI 财富密码', family: 'theme', req: 'AI + 搞钱', desc: '用 AI 赚钱的人，正在用 AI 教你用 AI 赚钱。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['ai', 'money'], match: (m) => has(m, 'ai', 'money'),
  },
  {
    id: 'money_drama', name: '财富争议话题', family: 'theme', req: '搞钱 + 争议', desc: '工资一晒，评论区就炸。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['money', 'drama'], match: (m) => has(m, 'money', 'drama'),
  },
  {
    id: 'ai_hot', name: '科技热点新闻', family: 'theme', req: 'AI + 热点', desc: '又一个“颠覆行业”的发布会。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['ai', 'hot'], match: (m) => has(m, 'ai', 'hot'),
  },
  {
    id: 'cat_ai', name: 'AI 云吸猫', family: 'theme', req: '猫咪 + AI', desc: '没有猫，但有 AI 生成的猫。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['cat', 'ai'], match: (m) => has(m, 'cat', 'ai'),
  },
  {
    id: 'fun_drama', name: '吵架名场面', family: 'theme', req: '搞笑 + 争议', desc: '吵得越凶，笑得越大声。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['fun', 'drama'], match: (m) => has(m, 'fun', 'drama'),
  },
  {
    id: 'drama_hot', name: '全网吃瓜', family: 'theme', req: '争议 + 热点', desc: '瓜保熟，评论区先占座。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['drama', 'hot'], match: (m) => has(m, 'drama', 'hot'),
  },
  {
    id: 'cat_hot', name: '萌宠顶流', family: 'theme', req: '猫咪 + 热点', desc: '今天的热搜，属于一只猫。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['cat', 'hot'], match: (m) => has(m, 'cat', 'hot'),
  },
  {
    id: 'money_fun', name: '搞钱段子', family: 'theme', req: '搞钱 + 搞笑', desc: '穷得很有节目效果。',
    base: 20, mult: 3, lvBase: 15, lvMult: 1, tags: ['money', 'fun'], match: (m) => has(m, 'money', 'fun'),
  },
  // ----- theme triples & specials -----
  {
    id: 'cat_startup', name: 'AI 猫咪创业', family: 'theme', req: '猫咪 + AI + 搞钱', desc: '猫当 CEO，AI 打工，你负责数钱。',
    base: 50, mult: 5, lvBase: 25, lvMult: 2, tags: ['cat', 'ai', 'money'], match: (m) => has(m, 'cat', 'ai', 'money'),
  },
  {
    id: 'melon', name: '热搜大瓜', family: 'theme', req: '搞笑 + 争议 + 热点', desc: '一个瓜，三个热搜，八百个段子。',
    base: 50, mult: 5, lvBase: 25, lvMult: 2, tags: ['fun', 'drama', 'hot'], match: (m) => has(m, 'fun', 'drama', 'hot'),
  },
  {
    id: 'pet_economy', name: '萌宠带货', family: 'theme', req: '猫咪 + 搞钱 + 热点', desc: '猫粮卖爆，铲屎官破产。',
    base: 50, mult: 5, lvBase: 25, lvMult: 2, tags: ['cat', 'money', 'hot'], match: (m) => has(m, 'cat', 'money', 'hot'),
  },
  {
    id: 'super_wealth', name: '超级财富热点', family: 'special', req: 'AI + 搞钱 + 争议 + 热点', desc: '流量、财富、争议、时效，四位一体。',
    base: 120, mult: 10, lvBase: 40, lvMult: 4, tags: ['ai', 'money', 'drama', 'hot'],
    match: (m) => has(m, 'ai', 'money', 'drama', 'hot'),
  },
  {
    id: 'fan_live', name: '宠粉直播', family: 'special', req: `粉丝 ≥ ${FAN_LIVE_MIN_FANS}，3 张「粉丝偏好」标签`,
    desc: '老粉专属福利，弹幕刷屏。粉丝偏好 = 本局发布最多的标签。',
    base: 90, mult: 9, lvBase: 35, lvMult: 3, tags: [],
    match: (m) => m.fans >= FAN_LIVE_MIN_FANS && m.preferredTag !== null && m.counts[m.preferredTag] >= 3,
  },
];

export const COMBO_MAP: Record<string, ComboDef> = Object.fromEntries(COMBOS.map((c) => [c.id, c]));

export function comboValues(id: string, level: number): { base: number; mult: number } {
  const c = COMBO_MAP[id];
  const lv = Math.max(0, level);
  return { base: c.base + c.lvBase * lv, mult: c.mult + c.lvMult * lv };
}
