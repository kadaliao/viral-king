import type { CardTrait, Tag } from '../engine/types';

export interface CardDef {
  tag: Tag;
  name: string;
  base: number;
  mult: number;
  trait?: CardTrait;
  art: string;
}

/**
 * Starting deck: 6 tags × 5 cards = 30 cards.
 * 猫咪: high base. AI / 搞笑: lower base but additive mult.
 * 争议: wild spread. 热点: trait `firstPost` (base ×2 on the stage's first video).
 */
export const STARTER_CARDS: CardDef[] = [
  { tag: 'cat', name: '橘猫干饭', base: 30, mult: 0, art: 'card_cat_1' },
  { tag: 'cat', name: '猫猫踩奶', base: 25, mult: 0, art: 'card_cat_2' },
  { tag: 'cat', name: '打翻水杯', base: 35, mult: 0, art: 'card_cat_1' },
  { tag: 'cat', name: '黑猫凝视', base: 20, mult: 0, art: 'card_cat_2' },
  { tag: 'cat', name: '纸箱猫猫', base: 40, mult: 0, art: 'card_cat_2' },

  { tag: 'ai', name: 'AI 写周报', base: 10, mult: 1, art: 'card_ai_1' },
  { tag: 'ai', name: '数字人带货', base: 15, mult: 1, art: 'card_ai_2' },
  { tag: 'ai', name: '大模型翻车', base: 10, mult: 2, art: 'card_ai_1' },
  { tag: 'ai', name: 'AI 绘画', base: 20, mult: 1, art: 'card_ai_2' },
  { tag: 'ai', name: '机器人跳舞', base: 15, mult: 2, art: 'card_ai_1' },

  { tag: 'money', name: '副业月入三万', base: 25, mult: 0, art: 'card_money_1' },
  { tag: 'money', name: '理财小课堂', base: 20, mult: 1, art: 'card_money_2' },
  { tag: 'money', name: '摆摊日记', base: 15, mult: 1, art: 'card_money_1' },
  { tag: 'money', name: '存钱挑战', base: 30, mult: 0, art: 'card_money_2' },
  { tag: 'money', name: '暴富秘籍', base: 10, mult: 2, art: 'card_money_1' },

  { tag: 'fun', name: '抽象整活', base: 15, mult: 1, art: 'card_fun_1' },
  { tag: 'fun', name: '鬼畜名场面', base: 20, mult: 1, art: 'card_fun_2' },
  { tag: 'fun', name: '冷笑话', base: 10, mult: 2, art: 'card_fun_1' },
  { tag: 'fun', name: '整蛊室友', base: 25, mult: 0, art: 'card_fun_2' },
  { tag: 'fun', name: '方言配音', base: 15, mult: 1, art: 'card_fun_1' },

  { tag: 'drama', name: '甜咸之争', base: 5, mult: 2, art: 'card_drama_1' },
  { tag: 'drama', name: '键盘侠互怼', base: 45, mult: 0, art: 'card_drama_2' },
  { tag: 'drama', name: '网红翻车', base: 35, mult: 0, art: 'card_drama_1' },
  { tag: 'drama', name: '职场吐槽', base: 15, mult: 1, art: 'card_drama_2' },
  { tag: 'drama', name: '深夜长文', base: 25, mult: 0, art: 'card_drama_1' },

  { tag: 'hot', name: '突发热搜', base: 20, mult: 0, trait: 'firstPost', art: 'card_hot_2' },
  { tag: 'hot', name: '官宣了', base: 25, mult: 0, trait: 'firstPost', art: 'card_hot_1' },
  { tag: 'hot', name: '节日热梗', base: 15, mult: 1, trait: 'firstPost', art: 'card_hot_1' },
  { tag: 'hot', name: '爆款 BGM', base: 20, mult: 0, trait: 'firstPost', art: 'card_hot_2' },
  { tag: 'hot', name: '全网挑战', base: 30, mult: 0, trait: 'firstPost', art: 'card_hot_1' },
];

/** Extra card names used for shop "精品内容" offers. */
export const SHOP_CARD_NAMES: Record<Tag, string[]> = {
  cat: ['猫咪开会', '猫猫偷吃', '布偶撒娇', '猫咪拆家', '流浪猫逆袭'],
  ai: ['AI 算命', 'AI 写情书', '赛博分身', 'AI 面试官', '算力大战'],
  money: ['摆摊爆单', '工资条曝光', '省钱妙招', '财富自由日记', '一夜暴富'],
  fun: ['土味情话', '反向带货', '尴尬现场', '迷惑行为', '离谱翻译'],
  drama: ['评论区开战', '退款风波', '真假测评', '甲方吐槽', '年终奖之争'],
  hot: ['刚刚爆了', '热搜第一', '全网同款', '官方回应', '限时挑战'],
};

export const TAG_ART: Record<Tag, string[]> = {
  cat: ['card_cat_1', 'card_cat_2'],
  ai: ['card_ai_1', 'card_ai_2'],
  money: ['card_money_1', 'card_money_2'],
  fun: ['card_fun_1', 'card_fun_2'],
  drama: ['card_drama_1', 'card_drama_2'],
  hot: ['card_hot_1', 'card_hot_2'],
};

export const CARD_TRAIT_TEXT: Record<CardTrait, string> = {
  firstPost: '时效性：本关第一条视频中基础流量 ×2',
};
