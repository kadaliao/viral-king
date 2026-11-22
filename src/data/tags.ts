import type { Edition, Tag } from '../engine/types';

export interface TagDef {
  id: Tag;
  name: string;
  role: string;
  color: string;
  dark: string;
  icon: string;
}

export const TAG_DEFS: Record<Tag, TagDef> = {
  cat: { id: 'cat', name: '猫咪', role: '萌宠流量 · 基础流量高', color: '#ff9a4d', dark: '#7a3410', icon: 'tag_cat' },
  ai: { id: 'ai', name: 'AI', role: '科技流量 · 自带倍率', color: '#3ee8ff', dark: '#0d4a5c', icon: 'tag_ai' },
  money: { id: 'money', name: '搞钱', role: '财富流量 · 稳定输出', color: '#ffe14d', dark: '#6b5200', icon: 'tag_money' },
  fun: { id: 'fun', name: '搞笑', role: '娱乐流量 · 倍率加成', color: '#b6ff3e', dark: '#3a5c00', icon: 'tag_fun' },
  drama: { id: 'drama', name: '争议', role: '互动流量 · 波动极大', color: '#ff4d6d', dark: '#6b0f24', icon: 'tag_drama' },
  hot: { id: 'hot', name: '热点', role: '时效性流量 · 本关首发翻倍', color: '#ff7ac8', dark: '#6b1450', icon: 'tag_hot' },
};

export interface EditionDef {
  id: Edition;
  name: string;
  desc: string;
  color: string;
}

export const EDITION_DEFS: Record<Edition, EditionDef> = {
  hd: { id: 'hd', name: '高清', desc: '计分时 +40 基础流量', color: '#3ee8ff' },
  meme: { id: 'meme', name: '爆梗', desc: '计分时 倍率 +4', color: '#ff3ea5' },
  golden: { id: 'golden', name: '金曲', desc: '计分时 倍率 ×1.5', color: '#ffb020' },
  echo: { id: 'echo', name: '回声', desc: '这张卡额外触发 1 次', color: '#39ff88' },
  sponsor: { id: 'sponsor', name: '恰饭', desc: '计分时获得 1 金币', color: '#ffe14d' },
};

export const EDITION_VALUES = {
  hdBase: 40,
  memeMult: 4,
  goldenX: 1.5,
  sponsorCoins: 1,
} as const;
