/** All tunable numbers live here. Tuned with `npm run sim`. */
export const BALANCE = {
  stages: 9,
  handSize: 8,
  maxPlay: 5,
  maxDiscard: 5,
  publishesPerStage: 4,
  discardsPerStage: 2,
  maxArtifacts: 5,
  startCoins: 4,
  /** KPI (total views needed) per stage, index 0..8; stages 3/6/9 are bosses */
  kpi: [1000, 2500, 5000, 9000, 20000, 45000, 90000, 200000, 450000],
  bossStages: [2, 5, 8],
  stageReward: [3, 4, 6, 4, 5, 7, 5, 6, 0],
  rewardPerPublishLeft: 1,
  interestPer: 5,
  interestMax: 5,
  /** fans gained per video = floor(views ^ fanExp * fanRate) */
  fanExp: 0.6,
  fanRate: 1,
  /** base exposure from fans = floor(sqrt(fans) * exposureRate) */
  exposureRate: 1,
  /** max extra triggers per card (loop guard) */
  maxRetriggers: 5,
  maxSteps: 600,
  shop: {
    artifactSlots: 3,
    upgradeSlots: 2,
    cardSlots: 3,
    rerollBase: 2,
    upgradePrice: 3,
    removePrice: 3,
    plainCardPrice: 3,
    editionCardPrice: 5,
  },
} as const;

export interface FanLevel {
  min: number;
  name: string;
}

export const FAN_LEVELS: FanLevel[] = [
  { min: 0, name: '素人' },
  { min: 50, name: '小透明' },
  { min: 500, name: '新晋博主' },
  { min: 5000, name: '腰部达人' },
  { min: 50000, name: '头部网红' },
  { min: 1000000, name: '百万大V' },
];

export function fanLevel(fans: number): number {
  let lv = 0;
  for (let i = 0; i < FAN_LEVELS.length; i++) if (fans >= FAN_LEVELS[i].min) lv = i;
  return lv;
}

/** View milestones for escalating celebration. */
export const MILESTONES = [
  { value: 1e4, name: '破万播放', tier: 1 },
  { value: 1e6, name: '百万播放', tier: 2 },
  { value: 1e7, name: '千万爆款', tier: 3 },
  { value: 1e8, name: '破亿神话', tier: 4 },
  { value: 1e12, name: '万亿宇宙', tier: 5 },
  { value: 1e20, name: '互联网尽头', tier: 6 },
];

export function milestoneTier(v: number): number {
  let t = 0;
  for (const m of MILESTONES) if (v >= m.value) t = m.tier;
  return t;
}
