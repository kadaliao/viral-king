export const TAGS = ['cat', 'ai', 'money', 'fun', 'drama', 'hot'] as const;
export type Tag = (typeof TAGS)[number];

/** Special property attached to a content card (bought in the shop). */
export type Edition = 'hd' | 'meme' | 'golden' | 'echo' | 'sponsor';

/** Intrinsic trait of a card definition. */
export type CardTrait = 'firstPost';

export interface Card {
  uid: string;
  tag: Tag;
  name: string;
  base: number;
  /** additive mult granted when the card scores */
  mult: number;
  trait?: CardTrait;
  edition?: Edition;
  art: string;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface ArtifactInstance {
  uid: string;
  id: string;
  /** per-instance numeric state (counters, cooldowns, chosen tag index...) */
  state: Record<string, number>;
}

export type BossId = 'algo_revamp' | 'censor_storm' | 'fatigue' | 'shadowban' | 'blackout';

export interface VideoStats {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  fansGained: number;
}

export interface TriggerSummary {
  label: string;
  kind: StepKind;
  amount: number;
  count: number;
}

export interface VideoRecord {
  stage: number;
  title: string;
  comboId: string;
  tags: Tag[];
  stats: VideoStats;
  base: number;
  mult: number;
}

export type Phase = 'stageIntro' | 'playing' | 'result' | 'stageClear' | 'shop' | 'gameOver';

export interface StageState {
  index: number;
  kpi: number;
  bossId: BossId | null;
  total: number;
  publishesLeft: number;
  discardsLeft: number;
  publishesUsed: number;
  discardsUsed: number;
  /** boss: 观众审美疲劳 — number of previous videos in this stage containing the tag */
  fatigue: Record<Tag, number>;
  videos: VideoRecord[];
}

export interface ShopArtifactOffer {
  id: string;
  price: number;
}
export interface ShopCardOffer {
  card: Card;
  price: number;
}
export interface ShopUpgradeOffer {
  comboId: string;
  price: number;
}

export interface ShopState {
  artifacts: (ShopArtifactOffer | null)[];
  upgrades: (ShopUpgradeOffer | null)[];
  cards: (ShopCardOffer | null)[];
  rerollCost: number;
  removeCost: number;
  removeCount: number;
}

export interface RewardBreakdown {
  base: number;
  publishesBonus: number;
  interest: number;
  sponsor: number;
  total: number;
}

export interface LastVideo {
  record: VideoRecord;
  result: ScoreResult;
  playedUids: string[];
  milestone: number;
}

export interface RunHistory {
  videosPublished: number;
  totalViews: number;
  best: VideoRecord | null;
  lastComboId: string | null;
  tagCounts: Record<Tag, number>;
  comboCounts: Record<string, number>;
  stagesCleared: number;
}

export interface RunState {
  version: number;
  seed: string;
  rng: number;
  phase: Phase;
  stage: number;
  bossOrder: BossId[];
  coins: number;
  fans: number;
  maxArtifacts: number;
  handSize: number;
  deck: Card[];
  drawPile: string[];
  hand: string[];
  discardPile: string[];
  artifacts: ArtifactInstance[];
  comboLevels: Record<string, number>;
  stageState: StageState;
  history: RunHistory;
  lastVideo: LastVideo | null;
  shop: ShopState | null;
  reward: RewardBreakdown | null;
  outcome: 'win' | 'lose' | null;
  recentTitles: string[];
  uidCounter: number;
  /** pending "标题党" etc. handled inside artifact state */
}

// ---------- scoring ----------

export type StepKind =
  | 'combo'
  | 'fans'
  | 'base'
  | 'mult'
  | 'xmult'
  | 'xbase'
  | 'retrigger'
  | 'coins'
  | 'debuff'
  | 'info';

export type StepSource =
  | { type: 'combo' }
  | { type: 'fans' }
  | { type: 'boss' }
  | { type: 'card'; index: number; uid: string }
  | { type: 'artifact'; index: number; uid: string };

export interface ScoreStep {
  kind: StepKind;
  source: StepSource;
  /** amount added (base/mult/coins) or factor (xmult/xbase) */
  amount: number;
  label: string;
  base: number;
  mult: number;
  score: number;
  /** true when produced by a retrigger or a replay */
  echo?: boolean;
}

export interface ScoreResult {
  comboId: string;
  comboName: string;
  steps: ScoreStep[];
  base: number;
  mult: number;
  score: number;
  coins: number;
  /** cards that were actually scored (uids), others were throttled by boss */
  scoredUids: string[];
  throttledUids: string[];
  xmultCount: number;
  retriggerCount: number;
  /** artifact uid -> new state after this video (applied on publish only) */
  artifactStates: Record<string, Record<string, number>>;
}
