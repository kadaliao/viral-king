import type { BossId } from '../engine/types';

export interface BossDef {
  id: BossId;
  name: string;
  /** rule shown at stage start */
  rule: string;
  tip: string;
  art: string;
  /** KPI multiplier vs. the base curve (bosses that hurt more ask a little less) */
  kpiFactor: number;
}

export const BOSSES: BossDef[] = [
  {
    id: 'algo_revamp', name: '算法大改版', art: 'algo_revamp', kpiFactor: 1,
    rule: '同一种标签只有前 2 张卡牌计分，多出的卡牌被限流（不计分、不参与组合）。',
    tip: '堆同标签的流派要转型：多标签组合、六边形战士、重复触发更吃香。',
  },
  {
    id: 'censor_storm', name: '内容审核风暴', art: 'censor_storm', kpiFactor: 0.85,
    rule: '争议卡牌全部被限流；视频中含有争议卡时，最终倍率 ×0.5。',
    tip: '把争议卡换掉，这一关靠其他标签撑场面。',
  },
  {
    id: 'fatigue', name: '观众审美疲劳', art: 'fatigue', kpiFactor: 0.85,
    rule: '本关每条视频的标签，在之后的视频中每出现 1 次疲劳 +1；倍率 × 0.75^(本视频各标签疲劳之和)。',
    tip: '每条视频尽量换一批标签，别让观众看腻。',
  },
  {
    id: 'shadowban', name: '平台限流', art: 'shadowban', kpiFactor: 0.75,
    rule: '每条视频只有前 3 张卡牌计分，其余卡牌被限流。',
    tip: '少而精：深夜 emo、重复触发与乘法神器是破局关键。',
  },
  {
    id: 'blackout', name: '系统维护', art: 'blackout', kpiFactor: 0.85,
    rule: '最左侧和最右侧的流量神器失效。',
    tip: '在神器栏里调整顺序，把关键神器挪到中间。',
  },
];

export const BOSS_MAP: Record<BossId, BossDef> = Object.fromEntries(BOSSES.map((b) => [b.id, b])) as Record<
  BossId,
  BossDef
>;

export const FATIGUE_FACTOR = 0.75;
export const CENSOR_FACTOR = 0.5;
