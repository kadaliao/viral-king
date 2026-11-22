import type { ArtifactInstance, BossId, Card, Rarity, Tag } from './types';
import type { Rng } from './rng';

/** Read-only view of the run that effects can look at. */
export interface RunView {
  fans: number;
  fanLevel: number;
  coins: number;
  stage: number;
  /** publishes left BEFORE this video is posted (so 1 = this is the last one) */
  publishesLeft: number;
  /** videos already posted in this stage */
  publishesUsed: number;
  discardsLeft: number;
  videosPublished: number;
  lastComboId: string | null;
  bossId: BossId | null;
  preferredTag: Tag | null;
  fatigue: Record<Tag, number>;
}

export interface EffectContext {
  readonly played: Card[];
  /** cards that actually score (not throttled by the boss), in order */
  readonly scored: Card[];
  readonly held: Card[];
  readonly counts: Record<Tag, number>;
  readonly distinct: number;
  readonly comboId: string;
  readonly run: RunView;
  /** the instance whose state drives this effect (the copied target for copy artifacts) */
  readonly self: ArtifactInstance;
  readonly base: number;
  readonly mult: number;
  readonly coinsDelta: number;
  readonly xmultCount: number;
  readonly lastXmult: number | null;
  addBase(n: number, label?: string): void;
  addMult(n: number, label?: string): void;
  xMult(f: number, label?: string, opts?: { replay?: boolean }): void;
  xBase(f: number, label?: string): void;
  addCoins(n: number, label?: string): void;
  info(label: string): void;
  /** persist state on the ORIGINAL instance (ignored when executed through a copy) */
  setState(key: string, value: number): void;
}

export interface ArtifactHooks {
  /** called each time a scored card triggers (including retriggers) */
  onCard?(ctx: EffectContext, card: Card, index: number, isRetrigger: boolean): void;
  /** number of extra triggers this artifact grants to the card */
  retrigger?(ctx: EffectContext, card: Card, index: number): number;
  /** independent effect after all cards scored, in artifact order */
  onVideo?(ctx: EffectContext): void;
  /** after a discard action (换牌) — returns new state */
  onDiscard?(state: Record<string, number>): Record<string, number>;
  /** at the start of each stage — returns new state */
  onStageStart?(state: Record<string, number>, rng: Rng): Record<string, number>;
}

export interface ArtifactDef {
  id: string;
  name: string;
  rarity: Rarity;
  price: number;
  /** rule text */
  desc: string;
  /** flavor line */
  flavor: string;
  art: string;
  /** synergy hint tags for UI */
  tags?: Tag[];
  /** copy another artifact's effect */
  copy?: 'right' | 'leftmost';
  /** requires at least this many fans to work */
  minFans?: number;
  initialState?: Record<string, number>;
  hooks: ArtifactHooks;
  /** dynamic status line shown on the artifact card */
  status?(inst: ArtifactInstance, run: RunView): string | null;
}
