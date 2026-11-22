import { ARTIFACTS, ARTIFACT_MAP, RARITY_INFO } from '../data/artifacts';
import { BALANCE, fanLevel, milestoneTier } from '../data/balance';
import { BOSSES, BOSS_MAP } from '../data/bosses';
import { SHOP_CARD_NAMES, STARTER_CARDS, TAG_ART } from '../data/cards';
import { COMBOS } from '../data/combos';
import type { RunView } from './context';
import { sanitize, safeAdd } from './num';
import { Rng, hashSeed } from './rng';
import { emptyCounts, scoreVideo, splitThrottled } from './scoring';
import { generateTitle } from './titles';
import {
  TAGS,
  type ArtifactInstance,
  type BossId,
  type Card,
  type Edition,
  type Rarity,
  type RewardBreakdown,
  type RunState,
  type ScoreResult,
  type ShopState,
  type Tag,
  type VideoRecord,
} from './types';

export const SAVE_VERSION = 1;

export class GameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GameError';
  }
}

function fail(msg: string): never {
  throw new GameError(msg);
}

/** Immutable-update helper: clone deeply (state is plain JSON). */
function clone<T>(v: T): T {
  return structuredClone(v);
}

function nextUid(s: RunState, prefix: string): string {
  s.uidCounter++;
  return `${prefix}${s.uidCounter}`;
}

// ------------------------------------------------------------------ queries

export function cardMap(s: RunState): Map<string, Card> {
  return new Map(s.deck.map((c) => [c.uid, c]));
}

export function cardsOf(s: RunState, uids: string[]): Card[] {
  const m = cardMap(s);
  return uids.map((u) => m.get(u)).filter((c): c is Card => !!c);
}

export function handCards(s: RunState): Card[] {
  return cardsOf(s, s.hand);
}

export function preferredTag(s: Pick<RunState, 'history'>): Tag | null {
  let best: Tag | null = null;
  let n = 4; // need at least 5 published cards of a tag
  for (const t of TAGS) {
    if (s.history.tagCounts[t] > n) {
      n = s.history.tagCounts[t];
      best = t;
    }
  }
  return best;
}

export function runView(s: RunState): RunView {
  const ss = s.stageState;
  return {
    fans: s.fans,
    fanLevel: fanLevel(s.fans),
    coins: s.coins,
    stage: s.stage,
    publishesLeft: ss.publishesLeft,
    publishesUsed: ss.publishesUsed,
    discardsLeft: ss.discardsLeft,
    videosPublished: s.history.videosPublished,
    lastComboId: s.history.lastComboId,
    bossId: ss.bossId,
    preferredTag: preferredTag(s),
    fatigue: { ...ss.fatigue },
  };
}

export function isBossStage(stage: number): boolean {
  return (BALANCE.bossStages as readonly number[]).includes(stage);
}

export function bossForStage(s: Pick<RunState, 'bossOrder'>, stage: number): BossId | null {
  const idx = (BALANCE.bossStages as readonly number[]).indexOf(stage);
  return idx >= 0 ? s.bossOrder[idx] ?? null : null;
}

export function stageKpi(stage: number, bossId: BossId | null): number {
  const base = BALANCE.kpi[Math.min(stage, BALANCE.kpi.length - 1)];
  const f = bossId ? BOSS_MAP[bossId].kpiFactor : 1;
  return Math.round((base * f) / 10) * 10;
}

export function sellPrice(id: string): number {
  const def = ARTIFACT_MAP[id];
  return def ? Math.max(1, Math.floor(def.price / 2)) : 0;
}

// ------------------------------------------------------------------ setup

export function createRun(seed: string): RunState {
  const rng = new Rng(hashSeed(seed));
  const bossOrder = rng.shuffle(BOSSES.map((b) => b.id)).slice(0, BALANCE.bossStages.length);
  const s: RunState = {
    version: SAVE_VERSION,
    seed,
    rng: rng.state,
    phase: 'stageIntro',
    stage: 0,
    bossOrder,
    coins: BALANCE.startCoins,
    fans: 0,
    maxArtifacts: BALANCE.maxArtifacts,
    handSize: BALANCE.handSize,
    deck: [],
    drawPile: [],
    hand: [],
    discardPile: [],
    artifacts: [],
    comboLevels: {},
    stageState: {
      index: 0, kpi: 0, bossId: null, total: 0, publishesLeft: 0, discardsLeft: 0,
      publishesUsed: 0, discardsUsed: 0, fatigue: emptyCounts(), videos: [],
    },
    history: {
      videosPublished: 0, totalViews: 0, best: null, lastComboId: null,
      tagCounts: emptyCounts(), comboCounts: {}, stagesCleared: 0,
    },
    lastVideo: null,
    shop: null,
    reward: null,
    outcome: null,
    recentTitles: [],
    uidCounter: 0,
  };
  s.deck = STARTER_CARDS.map((d) => ({
    uid: nextUid(s, 'c'),
    tag: d.tag,
    name: d.name,
    base: d.base,
    mult: d.mult,
    trait: d.trait,
    art: d.art,
  }));
  return enterStage(s, 0);
}

/** Prepare a stage (KPI, boss, shuffled deck). Mutates and returns s. */
function enterStage(s: RunState, stage: number): RunState {
  const rng = new Rng(s.rng);
  const bossId = bossForStage(s, stage);
  s.stage = stage;
  s.phase = 'stageIntro';
  s.stageState = {
    index: stage,
    kpi: stageKpi(stage, bossId),
    bossId,
    total: 0,
    publishesLeft: BALANCE.publishesPerStage,
    discardsLeft: BALANCE.discardsPerStage,
    publishesUsed: 0,
    discardsUsed: 0,
    fatigue: emptyCounts(),
    videos: [],
  };
  s.drawPile = rng.shuffle(s.deck.map((c) => c.uid));
  s.hand = [];
  s.discardPile = [];
  s.shop = null;
  s.reward = null;
  s.lastVideo = null;
  s.artifacts = s.artifacts.map((a) => {
    const hook = ARTIFACT_MAP[a.id]?.hooks.onStageStart;
    return hook ? { ...a, state: hook({ ...a.state }, rng) } : a;
  });
  s.rng = rng.state;
  return s;
}

function drawToFull(s: RunState, rng: Rng): void {
  while (s.hand.length < s.handSize) {
    if (s.drawPile.length === 0) {
      if (s.discardPile.length === 0) break;
      s.drawPile = rng.shuffle(s.discardPile);
      s.discardPile = [];
    }
    const uid = s.drawPile.pop()!;
    s.hand.push(uid);
  }
}

// ------------------------------------------------------------------ playing

export function startStage(prev: RunState): RunState {
  if (prev.phase !== 'stageIntro') fail('不在关卡准备阶段');
  const s = clone(prev);
  const rng = new Rng(s.rng);
  drawToFull(s, rng);
  s.rng = rng.state;
  s.phase = 'playing';
  return s;
}

function validateSelection(s: RunState, uids: string[], max: number): void {
  if (uids.length === 0) fail('至少选择 1 张卡牌');
  if (uids.length > max) fail(`最多选择 ${max} 张卡牌`);
  if (new Set(uids).size !== uids.length) fail('重复选择了同一张卡');
  for (const u of uids) if (!s.hand.includes(u)) fail('所选卡牌不在手牌中');
}

export function discardCards(prev: RunState, uids: string[]): RunState {
  if (prev.phase !== 'playing') fail('现在不能换牌');
  if (prev.stageState.discardsLeft <= 0) fail('换牌次数已用完');
  validateSelection(prev, uids, BALANCE.maxDiscard);
  const s = clone(prev);
  const rng = new Rng(s.rng);
  s.hand = s.hand.filter((u) => !uids.includes(u));
  s.discardPile.push(...uids);
  drawToFull(s, rng);
  s.stageState.discardsLeft--;
  s.stageState.discardsUsed++;
  s.artifacts = s.artifacts.map((a) => {
    const hook = ARTIFACT_MAP[a.id]?.hooks.onDiscard;
    return hook ? { ...a, state: hook({ ...a.state }) } : a;
  });
  s.rng = rng.state;
  return s;
}

/** Score preview for the current selection (pure; does not change state). */
export function previewVideo(s: RunState, uids: string[]): ScoreResult | null {
  if (uids.length === 0) return null;
  const played = cardsOf(s, uids);
  const held = cardsOf(
    s,
    s.hand.filter((u) => !uids.includes(u)),
  );
  return scoreVideo({ played, held, artifacts: s.artifacts, comboLevels: s.comboLevels, run: runView(s) });
}

export function fansFromViews(views: number): number {
  const v = Math.max(0, sanitize(views));
  return Math.floor(sanitize(Math.pow(v, BALANCE.fanExp) * BALANCE.fanRate));
}

export function publishVideo(prev: RunState, uids: string[]): RunState {
  if (prev.phase !== 'playing') fail('现在不能发布视频');
  if (prev.stageState.publishesLeft <= 0) fail('发布次数已用完');
  validateSelection(prev, uids, BALANCE.maxPlay);
  const s = clone(prev);
  const rng = new Rng(s.rng);
  const played = cardsOf(s, uids);
  const held = cardsOf(
    s,
    s.hand.filter((u) => !uids.includes(u)),
  );
  const view = runView(s);
  const result = scoreVideo({ played, held, artifacts: s.artifacts, comboLevels: s.comboLevels, run: view });
  const scoredCards = played.filter((c) => result.scoredUids.includes(c.uid));

  // --- stats
  const views = result.score;
  const dramaShare = played.filter((c) => c.tag === 'drama').length / played.length;
  const likes = Math.floor(sanitize(views * (0.04 + rng.next() * 0.08)));
  const comments = Math.floor(sanitize(views * (0.003 + dramaShare * 0.02 + rng.next() * 0.006)));
  const shares = Math.floor(sanitize(views * (0.004 + rng.next() * 0.01)));
  const fansGained = fansFromViews(views);
  const title = generateTitle(result.comboId, played, rng, s.recentTitles);

  const tags = [...new Set(scoredCards.map((c) => c.tag))];
  const record: VideoRecord = {
    stage: s.stage,
    title,
    comboId: result.comboId,
    tags,
    stats: { views, likes, comments, shares, fansGained },
    base: result.base,
    mult: result.mult,
  };

  // --- apply
  const ss = s.stageState;
  ss.total = safeAdd(ss.total, views);
  ss.publishesLeft--;
  ss.publishesUsed++;
  ss.videos.push(record);
  for (const t of tags) ss.fatigue[t]++;

  s.coins = Math.max(0, s.coins + result.coins);
  s.fans = safeAdd(s.fans, fansGained);
  const h = s.history;
  h.videosPublished++;
  h.totalViews = safeAdd(h.totalViews, views);
  if (!h.best || views > h.best.stats.views) h.best = record;
  h.lastComboId = result.comboId;
  for (const c of scoredCards) h.tagCounts[c.tag]++;
  h.comboCounts[result.comboId] = (h.comboCounts[result.comboId] ?? 0) + 1;

  s.artifacts = s.artifacts.map((a) =>
    result.artifactStates[a.uid] ? { ...a, state: { ...result.artifactStates[a.uid] } } : a,
  );
  s.hand = s.hand.filter((u) => !uids.includes(u));
  s.discardPile.push(...uids);
  s.recentTitles = [...s.recentTitles, title].slice(-16);
  s.lastVideo = { record, result, playedUids: [...uids], milestone: milestoneTier(views) };
  s.phase = 'result';
  s.rng = rng.state;
  return s;
}

export function computeReward(s: RunState): RewardBreakdown {
  const base = BALANCE.stageReward[s.stage] ?? 0;
  const publishesBonus = s.stageState.publishesLeft * BALANCE.rewardPerPublishLeft;
  const interest = Math.min(Math.floor(s.coins / BALANCE.interestPer), BALANCE.interestMax);
  const sponsor = fanLevel(s.fans);
  return { base, publishesBonus, interest, sponsor, total: base + publishesBonus + interest + sponsor };
}

/** Close the result card: clear the stage, lose, or continue playing. */
export function acknowledgeResult(prev: RunState): RunState {
  if (prev.phase !== 'result') fail('没有待确认的结算');
  const s = clone(prev);
  const ss = s.stageState;
  if (ss.total >= ss.kpi) {
    s.reward = computeReward(s);
    s.history.stagesCleared++;
    s.phase = 'stageClear';
  } else if (ss.publishesLeft <= 0) {
    s.outcome = 'lose';
    s.phase = 'gameOver';
  } else {
    const rng = new Rng(s.rng);
    drawToFull(s, rng);
    s.rng = rng.state;
    s.phase = 'playing';
  }
  return s;
}

export function collectReward(prev: RunState): RunState {
  if (prev.phase !== 'stageClear' || !prev.reward) fail('没有可领取的奖励');
  const s = clone(prev);
  s.coins += s.reward!.total;
  if (s.stage >= BALANCE.stages - 1) {
    s.outcome = 'win';
    s.phase = 'gameOver';
    return s;
  }
  const rng = new Rng(s.rng);
  s.shop = generateShop(s, rng);
  s.rng = rng.state;
  s.phase = 'shop';
  return s;
}

export function nextStage(prev: RunState): RunState {
  if (prev.phase !== 'shop') fail('只能从商店进入下一关');
  const s = clone(prev);
  return enterStage(s, s.stage + 1);
}

export function sortHand(prev: RunState, mode: 'tag' | 'base'): RunState {
  const s = clone(prev);
  const m = cardMap(s);
  const tagIdx = (u: string) => TAGS.indexOf(m.get(u)!.tag);
  const val = (u: string) => m.get(u)!.base;
  s.hand.sort((a, b) =>
    mode === 'tag' ? tagIdx(a) - tagIdx(b) || val(b) - val(a) : val(b) - val(a) || tagIdx(a) - tagIdx(b),
  );
  return s;
}

// ------------------------------------------------------------------ artifacts

export function moveArtifact(prev: RunState, uid: string, dir: -1 | 1): RunState {
  const i = prev.artifacts.findIndex((a) => a.uid === uid);
  if (i < 0) fail('没有这个神器');
  const j = i + dir;
  if (j < 0 || j >= prev.artifacts.length) return prev;
  const s = clone(prev);
  [s.artifacts[i], s.artifacts[j]] = [s.artifacts[j], s.artifacts[i]];
  return s;
}

export function sellArtifact(prev: RunState, uid: string): RunState {
  if (prev.phase !== 'shop' && prev.phase !== 'playing' && prev.phase !== 'stageIntro') fail('现在不能出售神器');
  const a = prev.artifacts.find((x) => x.uid === uid);
  if (!a) fail('没有这个神器');
  const s = clone(prev);
  s.coins += sellPrice(a.id);
  s.artifacts = s.artifacts.filter((x) => x.uid !== uid);
  return s;
}

export function makeArtifact(s: RunState, id: string): ArtifactInstance {
  const def = ARTIFACT_MAP[id];
  if (!def) fail(`未知神器 ${id}`);
  return { uid: nextUid(s, 'a'), id, state: { ...(def.initialState ?? {}) } };
}

// ------------------------------------------------------------------ shop

function rarityWeights(fans: number): Record<Rarity, number> {
  const lv = fanLevel(fans);
  return {
    common: RARITY_INFO.common.weight,
    uncommon: RARITY_INFO.uncommon.weight,
    rare: RARITY_INFO.rare.weight + (lv >= 2 ? 4 : 0),
    // 传说神器：粉丝等级「腰部达人」(Lv3) 解锁
    legendary: lv >= 3 ? RARITY_INFO.legendary.weight * (lv >= 5 ? 2 : 1) : 0,
  };
}

export function legendaryUnlocked(fans: number): boolean {
  return fanLevel(fans) >= 3;
}

function rollArtifactId(s: RunState, rng: Rng, exclude: Set<string>): string | null {
  const weights = rarityWeights(s.fans);
  const rarities: Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];
  const available = ARTIFACTS.filter(
    (a) => !exclude.has(a.id) && (a.rarity !== 'legendary' || weights.legendary > 0),
  );
  if (available.length === 0) return null;
  const rarity = rng.weighted(rarities, rarities.map((r) => weights[r]));
  const pool = available.filter((a) => a.rarity === rarity);
  return rng.pick(pool.length ? pool : available).id;
}

const EDITIONS: Edition[] = ['hd', 'meme', 'golden', 'echo', 'sponsor'];

/** Tags the player's artifacts care about — shop cards lean toward them. */
export function synergyTags(s: Pick<RunState, 'artifacts'>): Tag[] {
  const set = new Set<Tag>();
  for (const a of s.artifacts) for (const t of ARTIFACT_MAP[a.id]?.tags ?? []) set.add(t);
  return [...set];
}

function rollShopCard(s: RunState, rng: Rng): { card: Card; price: number } {
  const syn = synergyTags(s);
  const tag = syn.length && rng.chance(0.6) ? rng.pick(syn) : rng.pick(TAGS);
  const edition: Edition | undefined = rng.chance(0.75) ? rng.pick(EDITIONS) : undefined;
  const base = 20 + rng.int(0, 5) * 5;
  const mult = tag === 'ai' || tag === 'fun' ? rng.int(1, 2) : rng.chance(0.3) ? 1 : 0;
  const card: Card = {
    uid: nextUid(s, 'c'),
    tag,
    name: rng.pick(SHOP_CARD_NAMES[tag]),
    base,
    mult,
    trait: tag === 'hot' ? 'firstPost' : undefined,
    edition,
    art: rng.pick(TAG_ART[tag]),
  };
  return { card, price: edition ? BALANCE.shop.editionCardPrice : BALANCE.shop.plainCardPrice };
}

export function upgradePrice(s: Pick<RunState, 'comboLevels'>, comboId: string): number {
  return BALANCE.shop.upgradePrice + Math.floor((s.comboLevels[comboId] ?? 0) / 2);
}

function rollArtifactSlots(s: RunState, rng: Rng): ShopState['artifacts'] {
  const exclude = new Set(s.artifacts.map((a) => a.id));
  const out: ShopState['artifacts'] = [];
  for (let i = 0; i < BALANCE.shop.artifactSlots; i++) {
    const id = rollArtifactId(s, rng, exclude);
    if (id) {
      exclude.add(id);
      out.push({ id, price: ARTIFACT_MAP[id].price });
    } else out.push(null);
  }
  return out;
}

export function generateShop(s: RunState, rng: Rng): ShopState {
  const comboPool = COMBOS.filter((c) => c.id !== 'vlog').map((c) => c.id);
  const upgrades = rng
    .shuffle(comboPool)
    .slice(0, BALANCE.shop.upgradeSlots)
    .map((comboId) => ({ comboId, price: upgradePrice(s, comboId) }));
  const cards = Array.from({ length: BALANCE.shop.cardSlots }, () => rollShopCard(s, rng));
  return {
    artifacts: rollArtifactSlots(s, rng),
    upgrades,
    cards,
    rerollCost: BALANCE.shop.rerollBase,
    removeCost: BALANCE.shop.removePrice,
    removeCount: 0,
  };
}

function requireShop(s: RunState): ShopState {
  if (s.phase !== 'shop' || !s.shop) fail('商店未开放');
  return s.shop!;
}

export function rerollShop(prev: RunState): RunState {
  const shop = requireShop(prev);
  if (prev.coins < shop.rerollCost) fail('金币不足');
  const s = clone(prev);
  const rng = new Rng(s.rng);
  s.coins -= shop.rerollCost;
  s.shop!.artifacts = rollArtifactSlots(s, rng);
  s.shop!.cards = Array.from({ length: BALANCE.shop.cardSlots }, () => rollShopCard(s, rng));
  s.shop!.rerollCost++;
  s.rng = rng.state;
  return s;
}

/** Buy an artifact. If the bar is full, `replaceUid` is sold first (its value counts toward the price). */
export function buyArtifact(prev: RunState, slot: number, replaceUid?: string): RunState {
  const shop = requireShop(prev);
  const offer = shop.artifacts[slot];
  if (!offer) fail('这个货架已经空了');
  let s = clone(prev);
  if (s.artifacts.length >= s.maxArtifacts) {
    if (!replaceUid) fail('神器栏已满，请选择要替换的神器');
    const victim = s.artifacts.find((a) => a.uid === replaceUid);
    if (!victim) fail('要替换的神器不存在');
    if (s.coins + sellPrice(victim.id) < offer.price) fail('金币不足');
    s = sellArtifact(s, replaceUid);
  }
  if (s.coins < offer.price) fail('金币不足');
  s.coins -= offer.price;
  s.artifacts.push(makeArtifact(s, offer.id));
  s.shop!.artifacts[slot] = null;
  return s;
}

export function buyUpgrade(prev: RunState, slot: number): RunState {
  const shop = requireShop(prev);
  const offer = shop.upgrades[slot];
  if (!offer) fail('这个货架已经空了');
  if (prev.coins < offer.price) fail('金币不足');
  const s = clone(prev);
  s.coins -= offer.price;
  s.comboLevels[offer.comboId] = (s.comboLevels[offer.comboId] ?? 0) + 1;
  s.shop!.upgrades[slot] = null;
  return s;
}

export function buyCard(prev: RunState, slot: number): RunState {
  const shop = requireShop(prev);
  const offer = shop.cards[slot];
  if (!offer) fail('这个货架已经空了');
  if (prev.coins < offer.price) fail('金币不足');
  const s = clone(prev);
  s.coins -= offer.price;
  s.deck.push({ ...offer.card });
  s.shop!.cards[slot] = null;
  return s;
}

export const MIN_DECK_SIZE = 15;

export function removeCard(prev: RunState, uid: string): RunState {
  const shop = requireShop(prev);
  if (prev.coins < shop.removeCost) fail('金币不足');
  if (prev.deck.length <= MIN_DECK_SIZE) fail(`卡组至少保留 ${MIN_DECK_SIZE} 张`);
  if (!prev.deck.some((c) => c.uid === uid)) fail('卡组里没有这张卡');
  const s = clone(prev);
  s.coins -= shop.removeCost;
  s.deck = s.deck.filter((c) => c.uid !== uid);
  s.shop!.removeCount++;
  s.shop!.removeCost++;
  return s;
}

// ------------------------------------------------------------------ misc

/** Throttled uids for the current selection (for UI greying). */
export function throttledOf(s: RunState, uids: string[]): string[] {
  return splitThrottled(cardsOf(s, uids), runView(s)).throttled.map((c) => c.uid);
}

/** Debug / testing helper: grant an artifact directly. */
export function grantArtifact(prev: RunState, id: string): RunState {
  const s = clone(prev);
  if (s.artifacts.length >= s.maxArtifacts) fail('神器栏已满');
  s.artifacts.push(makeArtifact(s, id));
  return s;
}

export function isValidSave(v: unknown): v is RunState {
  if (!v || typeof v !== 'object') return false;
  const s = v as RunState;
  return (
    s.version === SAVE_VERSION &&
    typeof s.seed === 'string' &&
    Array.isArray(s.deck) &&
    Array.isArray(s.hand) &&
    Array.isArray(s.artifacts) &&
    typeof s.stageState === 'object' &&
    s.artifacts.every((a) => !!ARTIFACT_MAP[a.id])
  );
}
