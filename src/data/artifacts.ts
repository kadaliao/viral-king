import type { ArtifactDef } from '../engine/context';
import { TAGS } from '../engine/types';
import { TAG_DEFS } from './tags';
import { FAN_LEVELS } from './balance';

const tagName = (i: number) => TAG_DEFS[TAGS[((i % TAGS.length) + TAGS.length) % TAGS.length]].name;

/**
 * 流量神器 — all effects are data entries with small hook functions.
 * Order of resolution is always left → right in the player's artifact bar.
 */
export const ARTIFACTS: ArtifactDef[] = [
  // ================= COMMON =================
  {
    id: 'cat_overlord', name: '猫咪统治互联网', rarity: 'common', price: 4, art: 'cat_overlord', tags: ['cat'],
    desc: '每张猫咪卡计分时，基础流量 +50',
    flavor: '人类只是猫咪的摄影师。',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'cat') ctx.addBase(50); } },
  },
  {
    id: 'fun_master', name: '搞笑担当', rarity: 'common', price: 4, art: 'fun_master', tags: ['fun'],
    desc: '每张搞笑卡计分时，倍率 +4',
    flavor: '只要我不尴尬，尴尬的就是观众。',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'fun') ctx.addMult(4); } },
  },
  {
    id: 'golden_3s', name: '黄金三秒', rarity: 'common', price: 4, art: 'golden_3s',
    desc: '第一张计分的卡牌，基础流量 ×3',
    flavor: '前三秒留不住人，后面拍得再好也没用。',
    hooks: { onCard: (ctx, card, i) => { if (i === 0) ctx.addBase(card.base * 2, '黄金三秒 ×3'); } },
  },
  {
    id: 'finale', name: '压轴出场', rarity: 'common', price: 4, art: 'finale',
    desc: '最后一张计分的卡牌计分时，倍率 +10',
    flavor: '好戏总在最后。',
    hooks: { onCard: (ctx, _card, i) => { if (i === ctx.scored.length - 1) ctx.addMult(10); } },
  },
  {
    id: 'money_talks', name: '带货达人', rarity: 'common', price: 5, art: 'money_talks', tags: ['money'],
    desc: '每张搞钱卡计分时，获得 1 金币，倍率 +2',
    flavor: '家人们，链接在左下角。',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'money') { ctx.addCoins(1); ctx.addMult(2); } } },
  },
  {
    id: 'night_emo', name: '深夜 emo', rarity: 'common', price: 5, art: 'night_emo',
    desc: '发布的卡牌不超过 3 张时，倍率 ×3',
    flavor: '凌晨两点的短视频，最懂人心。',
    hooks: { onVideo: (ctx) => { if (ctx.played.length <= 3) ctx.xMult(3); } },
  },
  {
    id: 'hot_topic', name: '蹭热度', rarity: 'common', price: 4, art: 'hot_topic', tags: ['hot'],
    desc: '每张热点卡计分时，基础流量 +30，倍率 +2',
    flavor: '热点不等人，蹭就完事了。',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'hot') { ctx.addBase(30); ctx.addMult(2); } } },
  },

  // ================= UNCOMMON =================
  {
    id: 'clickbait', name: '标题党大师', rarity: 'uncommon', price: 6, art: 'clickbait',
    desc: '蓄力时：本条视频倍率 ×5，然后进入冷却。冷却时：本条视频基础流量减半，然后重新蓄力',
    flavor: '震惊！99% 的人都点进来了。',
    initialState: { cooldown: 0 },
    hooks: {
      onVideo: (ctx) => {
        if ((ctx.self.state.cooldown ?? 0) === 0) {
          ctx.xMult(5, '标题党 ×5');
          ctx.setState('cooldown', 1);
        } else {
          ctx.xBase(0.5, '标题党反噬 ×0.5');
          ctx.setState('cooldown', 0);
        }
      },
    },
    status: (inst) => ((inst.state.cooldown ?? 0) === 0 ? '状态：蓄力完成 ×5' : '状态：冷却中（基础减半）'),
  },
  {
    id: 'repost', name: '全网搬运', rarity: 'uncommon', price: 6, art: 'repost',
    desc: '第一张计分的卡牌额外触发 1 次',
    flavor: '原创？那是什么，能吃吗。',
    hooks: { retrigger: (_ctx, _card, i) => (i === 0 ? 1 : 0) },
  },
  {
    id: 'trending', name: '热搜霸榜', rarity: 'uncommon', price: 7, art: 'trending', tags: ['hot'],
    desc: '每张热点卡额外触发 1 次',
    flavor: '前十条热搜，有八条是我的。',
    hooks: { retrigger: (_ctx, card) => (card.tag === 'hot' ? 1 : 0) },
  },
  {
    id: 'big_v', name: '百万粉丝大V', rarity: 'uncommon', price: 7, art: 'big_v',
    desc: '倍率 ×(1 + 0.5 × 粉丝等级)',
    flavor: '一条动态，全网转发。',
    hooks: { onVideo: (ctx) => { if (ctx.run.fanLevel > 0) ctx.xMult(1 + 0.5 * ctx.run.fanLevel); } },
    status: (_inst, run) => `当前：${FAN_LEVELS[run.fanLevel].name} ×${1 + 0.5 * run.fanLevel}`,
  },
  {
    id: 'hexagon', name: '六边形战士', rarity: 'uncommon', price: 6, art: 'hexagon',
    desc: '视频包含 4 种及以上不同标签时，倍率 ×3',
    flavor: '什么都会一点，流量全都要。',
    hooks: { onVideo: (ctx) => { if (ctx.distinct >= 4) ctx.xMult(3); } },
  },
  {
    id: 'vertical', name: '垂直领域', rarity: 'uncommon', price: 6, art: 'vertical',
    desc: '至少 3 张计分卡牌且标签全部相同时，倍率 ×4',
    flavor: '只做一件事，做到算法都记住你。',
    hooks: { onVideo: (ctx) => { if (ctx.scored.length >= 3 && ctx.distinct === 1) ctx.xMult(4); } },
  },
  {
    id: 'beat_sync', name: '卡点王', rarity: 'uncommon', price: 6, art: 'beat_sync',
    desc: '至少 3 张计分卡牌，且基础流量从左到右不递减时，倍率 ×3',
    flavor: '动次打次，每一帧都踩在点上。',
    hooks: {
      onVideo: (ctx) => {
        const s = ctx.scored;
        if (s.length < 3) return;
        for (let i = 1; i < s.length; i++) if (s[i].base < s[i - 1].base) return;
        ctx.xMult(3);
      },
    },
  },
  {
    id: 'redo', name: '删稿重发', rarity: 'uncommon', price: 6, art: 'redo',
    desc: '每使用 1 次换牌，本神器永久获得 倍率 +2',
    flavor: '第 37 版终于满意了。',
    initialState: { mult: 0 },
    hooks: {
      onVideo: (ctx) => { const m = ctx.self.state.mult ?? 0; if (m > 0) ctx.addMult(m); },
      onDiscard: (s) => ({ ...s, mult: (s.mult ?? 0) + 2 }),
    },
    status: (inst) => `当前：倍率 +${inst.state.mult ?? 0}`,
  },
  {
    id: 'series', name: '系列连更', rarity: 'uncommon', price: 7, art: 'series',
    desc: '视频类型与上一条视频相同时，倍率 ×3',
    flavor: '第 108 集，观众已经离不开了。',
    hooks: { onVideo: (ctx) => { if (ctx.run.lastComboId === ctx.comboId) ctx.xMult(3); } },
  },
  {
    id: 'last_call', name: '最后一更', rarity: 'uncommon', price: 6, art: 'last_call',
    desc: '本关最后一次发布时，倍率 ×4',
    flavor: 'Deadline 是第一生产力。',
    hooks: { onVideo: (ctx) => { if (ctx.run.publishesLeft === 1) ctx.xMult(4); } },
  },
  {
    id: 'paid_promo', name: '投流', rarity: 'uncommon', price: 5, art: 'paid_promo',
    desc: '发布时若金币 ≥ 3：花费 3 金币，倍率 ×3',
    flavor: '流量是买来的，快乐是真的。',
    hooks: {
      onVideo: (ctx) => {
        if (ctx.run.coins + ctx.coinsDelta >= 3) { ctx.addCoins(-3, '投流 -3 金币'); ctx.xMult(3); }
      },
    },
  },
  {
    id: 'iron_fans', name: '铁粉团', rarity: 'uncommon', price: 7, art: 'iron_fans', minFans: 1000,
    desc: '粉丝 ≥ 1000 时激活：基础流量 + 粉丝数的 2%',
    flavor: '不管发什么，他们都会点赞。',
    hooks: { onVideo: (ctx) => { const b = Math.floor(ctx.run.fans * 0.02); if (b > 0) ctx.addBase(b); } },
    status: (_inst, run) => (run.fans >= 1000 ? `当前：+${Math.floor(run.fans * 0.02)} 基础` : '未激活：粉丝不足 1000'),
  },

  // ================= RARE =================
  {
    id: 'algo_child', name: '算法亲儿子', rarity: 'rare', price: 9, art: 'algo_child', tags: ['ai'],
    desc: '每张 AI 卡计分时，倍率 ×2',
    flavor: '推荐页的每一个位置，都写着我的名字。',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'ai') ctx.xMult(2); } },
  },
  {
    id: 'comment_war', name: '评论区吵起来了', rarity: 'rare', price: 10, art: 'comment_war', tags: ['drama'],
    desc: '每张争议卡计分时，倍率 ×3',
    flavor: '你说得对，但是……',
    hooks: { onCard: (ctx, card) => { if (card.tag === 'drama') ctx.xMult(3); } },
  },
  {
    id: 'traffic_code', name: '流量密码', rarity: 'rare', price: 8, art: 'traffic_code', tags: ['cat', 'money', 'ai'],
    desc: '视频同时包含猫咪、搞钱、AI 时，倍率 ×8',
    flavor: '猫 + 钱 + AI = 宇宙的终极答案。',
    hooks: {
      onVideo: (ctx) => { if (ctx.counts.cat > 0 && ctx.counts.money > 0 && ctx.counts.ai > 0) ctx.xMult(8); },
    },
  },
  {
    id: 'mystery_algo', name: '神秘算法', rarity: 'rare', price: 8, art: 'mystery_algo',
    desc: '每关开始时随机选定一种标签；视频中该标签计分卡 ≥ 2 张时，倍率 ×5',
    flavor: '没人知道算法在想什么，包括算法自己。',
    initialState: { tag: 0 },
    hooks: {
      onStageStart: (s, rng) => ({ ...s, tag: rng.int(0, TAGS.length - 1) }),
      onVideo: (ctx) => {
        const t = TAGS[ctx.self.state.tag ?? 0];
        if (ctx.counts[t] >= 2) ctx.xMult(5, `神秘算法·${TAG_DEFS[t].name} ×5`);
      },
    },
    status: (inst) => `本关幸运标签：${tagName(inst.state.tag ?? 0)}`,
  },
  {
    id: 'echo_chamber', name: '回声室效应', rarity: 'rare', price: 8, art: 'echo_chamber',
    desc: '每当有卡牌被重复触发时，倍率 ×1.5',
    flavor: '你看到的，都是你想看到的。',
    hooks: { onCard: (ctx, _card, _i, isRetrigger) => { if (isRetrigger) ctx.xMult(1.5); } },
  },
  {
    id: 'remix', name: '二创鬼才', rarity: 'rare', price: 9, art: 'remix', copy: 'right',
    desc: '复制右侧相邻神器的效果',
    flavor: '站在巨人的肩膀上，剪巨人的视频。',
    hooks: {},
  },

  // ================= LEGENDARY =================
  {
    id: 'perpetual', name: '互联网永动机', rarity: 'legendary', price: 11, art: 'perpetual',
    desc: '本条视频已触发至少 4 次乘法效果时，再触发一次最近的乘法效果',
    flavor: '流量产生流量，流量产生更多流量。',
    hooks: {
      onVideo: (ctx) => {
        if (ctx.xmultCount >= 4 && ctx.lastXmult !== null) ctx.xMult(ctx.lastXmult, '永动机重放', { replay: true });
      },
    },
  },
  {
    id: 'copycat', name: '抄作业', rarity: 'legendary', price: 10, art: 'copycat', copy: 'leftmost',
    desc: '复制最左侧神器的效果',
    flavor: '借鉴，不叫抄。',
    hooks: {},
  },
  {
    id: 'matrix', name: '矩阵号', rarity: 'legendary', price: 12, art: 'matrix',
    desc: '所有计分卡牌额外触发 1 次',
    flavor: '一个人，一百个账号，一千种人设。',
    hooks: { retrigger: () => 1 },
  },
];

export const ARTIFACT_MAP: Record<string, ArtifactDef> = Object.fromEntries(ARTIFACTS.map((a) => [a.id, a]));

export const RARITY_INFO = {
  common: { name: '普通', color: '#8fd3ff', weight: 60 },
  uncommon: { name: '稀有', color: '#39ff88', weight: 32 },
  rare: { name: '史诗', color: '#ff3ea5', weight: 12 },
  legendary: { name: '传说', color: '#ffb020', weight: 4 },
} as const;
