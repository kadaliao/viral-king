import { describe, expect, it } from 'vitest';
import { BALANCE } from '../src/data/balance';
import {
  GameError, acknowledgeResult, buyArtifact, buyCard, buyUpgrade, collectReward, createRun, discardCards, fansFromViews,
  generateShop, grantArtifact, isValidSave, nextStage, previewVideo, publishVideo, removeCard, rerollShop,
  sellArtifact, sellPrice, startStage, MIN_DECK_SIZE,
} from '../src/engine/game';
import { Rng } from '../src/engine/rng';
import { generateTitle } from '../src/engine/titles';
import type { RunState } from '../src/engine/types';
import { COMBOS } from '../src/data/combos';
import { card } from './helpers';

function allUids(s: RunState) {
  return [...s.drawPile, ...s.hand, ...s.discardPile].sort();
}

function toShop(seed = 'SHOP'): RunState {
  let s = startStage(createRun(seed));
  s = { ...s, stageState: { ...s.stageState, kpi: 1 } };
  s = acknowledgeResult(publishVideo(s, [s.hand[0]]));
  expect(s.phase).toBe('stageClear');
  return collectReward(s);
}

describe('run setup & determinism', () => {
  it('same seed gives the same run', () => {
    const a = startStage(createRun('SEED-1'));
    const b = startStage(createRun('SEED-1'));
    expect(a.hand).toEqual(b.hand);
    expect(a.bossOrder).toEqual(b.bossOrder);
    const c = startStage(createRun('SEED-2'));
    expect(c.hand).not.toEqual(a.hand);
  });

  it('starts with a 30-card deck, 8-card hand and correct counters', () => {
    const s = startStage(createRun('X'));
    expect(s.deck).toHaveLength(30);
    expect(s.hand).toHaveLength(BALANCE.handSize);
    expect(s.stageState.publishesLeft).toBe(4);
    expect(s.stageState.discardsLeft).toBe(2);
    expect(new Set(s.bossOrder).size).toBe(3);
    expect(isValidSave(JSON.parse(JSON.stringify(s)))).toBe(true);
  });
});

describe('drawing, discarding, publishing', () => {
  it('discard replaces cards and keeps the deck conserved', () => {
    const s0 = startStage(createRun('D'));
    const s1 = discardCards(s0, s0.hand.slice(0, 3));
    expect(s1.hand).toHaveLength(8);
    expect(s1.discardPile).toHaveLength(3);
    expect(s1.stageState.discardsLeft).toBe(1);
    expect(allUids(s1)).toEqual(s0.deck.map((c) => c.uid).sort());
    const s2 = discardCards(s1, [s1.hand[0]]);
    expect(() => discardCards(s2, [s2.hand[0]])).toThrow(GameError);
  });

  it('reshuffles the discard pile when the draw pile runs out', () => {
    let s = startStage(createRun('R'));
    s = { ...s, discardPile: [...s.drawPile], drawPile: [] };
    const s2 = discardCards(s, [s.hand[0], s.hand[1]]);
    expect(s2.hand).toHaveLength(8);
    expect(s2.discardPile).toHaveLength(0);
    expect(allUids(s2)).toEqual(s.deck.map((c) => c.uid).sort());
  });

  it('rejects invalid selections', () => {
    const s = startStage(createRun('V'));
    expect(() => publishVideo(s, [])).toThrow(GameError);
    expect(() => publishVideo(s, s.hand.slice(0, 6))).toThrow(GameError);
    expect(() => publishVideo(s, ['nope'])).toThrow(GameError);
    expect(() => publishVideo(s, [s.hand[0], s.hand[0]])).toThrow(GameError);
  });

  it('publishing scores exactly the preview, gains fans, and refills after the result', () => {
    let s0 = startStage(createRun('P'));
    s0 = { ...s0, stageState: { ...s0.stageState, kpi: 1e12 } };
    const sel = s0.hand.slice(0, 5);
    const pv = previewVideo(s0, sel)!;
    const s1 = publishVideo(s0, sel);
    expect(s1.phase).toBe('result');
    expect(s1.lastVideo!.record.stats.views).toBe(pv.score);
    expect(s1.stageState.total).toBe(pv.score);
    expect(s1.stageState.publishesLeft).toBe(3);
    expect(s1.fans).toBe(fansFromViews(pv.score));
    expect(s1.lastVideo!.record.title.length).toBeGreaterThan(3);
    expect(s1.hand).toHaveLength(3);
    const s2 = acknowledgeResult(s1);
    expect(s2.phase).toBe('playing');
    expect(s2.hand).toHaveLength(8);
    expect(allUids(s2)).toEqual(s0.deck.map((c) => c.uid).sort());
  });

  it('fans persist across stages and boost later videos', () => {
    let s = toShop('FANS');
    const fans = s.fans;
    expect(fans).toBeGreaterThan(0);
    s = startStage(nextStage(s));
    expect(s.fans).toBe(fans);
    const pv = previewVideo(s, [s.hand[0]])!;
    expect(pv.steps.some((st) => st.source.type === 'fans')).toBe(true);
  });
});

describe('win / lose', () => {
  it('loses when publishes run out below KPI', () => {
    let s = startStage(createRun('LOSE'));
    s = { ...s, stageState: { ...s.stageState, kpi: 1e15 } };
    for (let i = 0; i < 4; i++) {
      s = acknowledgeResult(publishVideo(s, [s.hand[0]]));
    }
    expect(s.phase).toBe('gameOver');
    expect(s.outcome).toBe('lose');
  });

  it('clears the stage as soon as KPI is reached and pays rewards', () => {
    let s = startStage(createRun('WIN'));
    s = { ...s, stageState: { ...s.stageState, kpi: 1 } };
    s = acknowledgeResult(publishVideo(s, [s.hand[0]]));
    expect(s.phase).toBe('stageClear');
    expect(s.reward!.publishesBonus).toBe(3);
    const coins = s.coins;
    const total = s.reward!.total;
    s = collectReward(s);
    expect(s.phase).toBe('shop');
    expect(s.coins).toBe(coins + total);
  });

  it('can finish all 9 stages and win', () => {
    let s = createRun('ALL');
    for (let stage = 0; stage < BALANCE.stages; stage++) {
      expect(s.stage).toBe(stage);
      if ((BALANCE.bossStages as readonly number[]).includes(stage)) expect(s.stageState.bossId).not.toBeNull();
      s = startStage(s);
      s = { ...s, stageState: { ...s.stageState, kpi: 1 } };
      s = acknowledgeResult(publishVideo(s, [s.hand[0]]));
      s = collectReward(s);
      if (stage < BALANCE.stages - 1) s = nextStage(s);
    }
    expect(s.phase).toBe('gameOver');
    expect(s.outcome).toBe('win');
  });
});

describe('shop', () => {
  it('buys, sells and refuses when broke', () => {
    let s = toShop();
    s = { ...s, coins: 100 };
    const offer = s.shop!.artifacts[0]!;
    s = buyArtifact(s, 0);
    expect(s.artifacts).toHaveLength(1);
    expect(s.coins).toBe(100 - offer.price);
    expect(s.shop!.artifacts[0]).toBeNull();
    expect(() => buyArtifact(s, 0)).toThrow(GameError);
    const uid = s.artifacts[0].uid;
    const before = s.coins;
    s = sellArtifact(s, uid);
    expect(s.artifacts).toHaveLength(0);
    expect(s.coins).toBe(before + sellPrice(offer.id));
    const broke = { ...s, coins: 0 };
    expect(() => buyArtifact(broke, 1)).toThrow(/金币不足/);
  });

  it('replaces an artifact when the bar is full', () => {
    let s = toShop('FULL');
    s = { ...s, coins: 100 };
    for (const id of ['cat_overlord', 'fun_master', 'golden_3s', 'finale', 'night_emo']) {
      s = grantArtifact(s, id);
    }
    const slot = s.shop!.artifacts.findIndex((o) => o && !s.artifacts.some((a) => a.id === o.id));
    expect(() => buyArtifact(s, slot)).toThrow(/已满/);
    const victim = s.artifacts[2];
    s = buyArtifact(s, slot, victim.uid);
    expect(s.artifacts).toHaveLength(5);
    expect(s.artifacts.some((a) => a.uid === victim.uid)).toBe(false);
  });

  it('upgrades combos, adds/removes cards and rerolls with rising cost', () => {
    let s = toShop('MISC');
    s = { ...s, coins: 100 };
    const up = s.shop!.upgrades[0]!;
    s = buyUpgrade(s, 0);
    expect(s.comboLevels[up.comboId]).toBe(1);
    const deckN = s.deck.length;
    s = buyCard(s, 0);
    expect(s.deck).toHaveLength(deckN + 1);
    const cost = s.shop!.removeCost;
    s = removeCard(s, s.deck[0].uid);
    expect(s.deck).toHaveLength(deckN);
    expect(s.shop!.removeCost).toBe(cost + 1);
    const rc = s.shop!.rerollCost;
    const s2 = rerollShop(s);
    expect(s2.coins).toBe(s.coins - rc);
    expect(s2.shop!.rerollCost).toBe(rc + 1);
    const tiny = { ...s, deck: s.deck.slice(0, MIN_DECK_SIZE) };
    expect(() => removeCard(tiny, tiny.deck[0].uid)).toThrow(GameError);
  });

  it('never offers owned artifacts and gates legendaries behind fans', () => {
    const s = toShop('GATE');
    const owned = grantArtifact(s, 'matrix');
    for (let i = 0; i < 50; i++) {
      const shop = generateShop(owned, new Rng(i));
      expect(shop.artifacts.some((o) => o?.id === 'matrix')).toBe(false);
    }
    const poor = { ...s, fans: 0 };
    for (let i = 0; i < 80; i++) {
      const shop = generateShop(poor, new Rng(i));
      expect(shop.artifacts.some((o) => ['perpetual', 'copycat', 'matrix'].includes(o?.id ?? ''))).toBe(false);
    }
  });
});

describe('artifact hooks tied to game actions', () => {
  it('删稿重发 grows on discard; 标题党 toggles after publishing', () => {
    let s = startStage(createRun('HOOK'));
    s = grantArtifact(s, 'redo');
    s = grantArtifact(s, 'clickbait');
    s = discardCards(s, [s.hand[0]]);
    expect(s.artifacts[0].state.mult).toBe(2);
    s = publishVideo(s, [s.hand[0]]);
    expect(s.artifacts[1].state.cooldown).toBe(1);
  });
  it('神秘算法 picks a tag at stage start', () => {
    let s = toShop('MYST');
    s = grantArtifact(s, 'mystery_algo');
    s = nextStage(s);
    expect(s.artifacts[0].state.tag).toBeGreaterThanOrEqual(0);
    expect(s.artifacts[0].state.tag).toBeLessThan(6);
  });
});

describe('titles', () => {
  it('produces filled, varied titles for every combo', () => {
    const rng = new Rng(42);
    const cards = [card('cat'), card('ai'), card('money')];
    for (const c of COMBOS) {
      const t = generateTitle(c.id, cards, rng);
      expect(t).not.toMatch(/[{}]/);
      expect(t.length).toBeGreaterThan(4);
    }
    const seen = new Set(Array.from({ length: 20 }, () => generateTitle('cute_fun', cards, rng)));
    expect(seen.size).toBeGreaterThan(8);
  });
});

describe('reproducibility', () => {
  it('a whole scripted run replays identically from the same seed', () => {
    const play = () => {
      let s = createRun('REPLAY-7');
      while (s.phase !== 'gameOver') {
        if (s.phase === 'stageIntro') s = startStage(s);
        else if (s.phase === 'playing') {
          if (s.stageState.discardsLeft > 0 && s.stageState.publishesUsed === 1) s = discardCards(s, s.hand.slice(0, 2));
          else s = publishVideo(s, s.hand.slice(0, 5));
        } else if (s.phase === 'result') s = acknowledgeResult(s);
        else if (s.phase === 'stageClear') s = collectReward(s);
        else if (s.phase === 'shop') {
          if (s.shop!.artifacts[0] && s.coins >= s.shop!.artifacts[0].price) s = buyArtifact(s, 0);
          s = nextStage(s);
        }
      }
      return s;
    };
    expect(JSON.stringify(play())).toBe(JSON.stringify(play()));
  });
});
