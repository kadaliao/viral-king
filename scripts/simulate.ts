/**
 * Balance simulator: plays many seeded runs with a greedy bot and prints
 * win rate, where runs die, and score magnitudes per stage.
 *   npm run sim            (default 300 runs)
 *   npm run sim -- 1000 noshop
 */
import { ARTIFACT_MAP } from '../src/data/artifacts';
import { BALANCE } from '../src/data/balance';
import { formatNum } from '../src/engine/num';
import {
  acknowledgeResult, buyArtifact, buyCard, buyUpgrade, collectReward, discardCards, nextStage,
  previewVideo, publishVideo, removeCard, startStage, createRun, sellPrice, synergyTags, MIN_DECK_SIZE,
} from '../src/engine/game';
import type { RunState } from '../src/engine/types';

const N = Number(process.argv[2] ?? 300);
const MODE = process.argv[3] ?? 'normal';

function subsets(arr: string[], maxK: number): string[][] {
  const out: string[][] = [];
  const rec = (start: number, cur: string[]) => {
    if (cur.length) out.push(cur.slice());
    if (cur.length === maxK) return;
    for (let i = start; i < arr.length; i++) {
      cur.push(arr[i]);
      rec(i + 1, cur);
      cur.pop();
    }
  };
  rec(0, []);
  return out;
}

function bestPlay(s: RunState): { uids: string[]; score: number } {
  let best = { uids: [s.hand[0]], score: -1 };
  for (const sub of subsets(s.hand, BALANCE.maxPlay)) {
    const r = previewVideo(s, sub)!;
    if (r.score > best.score) best = { uids: sub, score: r.score };
  }
  return best;
}

function playStage(s: RunState, stats: StageStats[]): RunState {
  s = startStage(s);
  while (s.phase === 'playing') {
    const ss = s.stageState;
    const need = ss.kpi - ss.total;
    const best = bestPlay(s);
    if (ss.discardsLeft > 0 && best.score * ss.publishesLeft < need) {
      const keep = new Set(best.uids);
      const toss = s.hand.filter((u) => !keep.has(u)).slice(0, BALANCE.maxDiscard);
      if (toss.length) {
        s = discardCards(s, toss);
        continue;
      }
    }
    s = publishVideo(s, best.uids);
    const st = (stats[s.stage] ??= { plays: 0, sum: 0, max: 0, fails: 0, reached: 0 });
    st.plays++;
    st.sum += s.lastVideo!.record.stats.views;
    (st.all ??= []).push(s.lastVideo!.record.stats.views);
    st.max = Math.max(st.max, s.lastVideo!.record.stats.views);
    s = acknowledgeResult(s);
  }
  return s;
}

function shopBot(s: RunState): RunState {
  if (MODE === 'noshop') return s;
  const shop = s.shop!;
  // artifacts: buy best rarity affordable
  const order = shop.artifacts
    .map((o, i) => ({ o, i }))
    .filter((x) => x.o)
    .sort((a, b) => b.o!.price - a.o!.price);
  for (const { o, i } of order) {
    if (!o) continue;
    if (s.artifacts.length < s.maxArtifacts && s.coins >= o.price) s = buyArtifact(s, i);
    else if (s.artifacts.length >= s.maxArtifacts) {
      const cheapest = [...s.artifacts].sort((a, b) => ARTIFACT_MAP[a.id].price - ARTIFACT_MAP[b.id].price)[0];
      if (ARTIFACT_MAP[cheapest.id].price < o.price && s.coins + sellPrice(cheapest.id) >= o.price) {
        s = buyArtifact(s, i, cheapest.uid);
      }
    }
  }
  if (MODE === 'nodeck') return upgrades(s);
  // deck building: buy cards with synergy tags, remove off-synergy low cards
  const syn = synergyTags(s);
  if (syn.length) {
    s.shop!.cards.forEach((c, i) => {
      if (c && syn.includes(c.card.tag) && s.coins >= c.price + 1) s = buyCard(s, i);
    });
    let guard = 0;
    while (guard++ < 3 && s.coins >= s.shop!.removeCost + 2 && s.deck.length > MIN_DECK_SIZE) {
      const victim = [...s.deck].filter((c) => !syn.includes(c.tag) && !c.edition).sort((a, b) => a.base - b.base)[0];
      if (!victim) break;
      s = removeCard(s, victim.uid);
    }
  }
  return upgrades(s);
}

function upgrades(s: RunState): RunState {
  // upgrades: buy for the most used combo if present
  s.shop!.upgrades.forEach((u, i) => {
    if (u && s.coins >= u.price + 2 && (s.history.comboCounts[u.comboId] ?? 0) > 0) s = buyUpgrade(s, i);
  });
  return s;
}

interface StageStats { plays: number; sum: number; max: number; fails: number; reached: number; all?: number[] }

const stats: StageStats[] = [];
const q = (a: number[], p: number) => { const b = [...a].sort((x, y) => x - y); return formatNum(b[Math.floor(b.length * p)] ?? 0); };
let wins = 0;
const deaths: number[] = new Array(BALANCE.stages).fill(0);
let bestEver = 0;
const fanEnd: number[] = [];
const artifactWins: Record<string, number> = {};
const bossDeaths: Record<string, number> = {};
const bossSeen: Record<string, number> = {};

for (let n = 0; n < N; n++) {
  let s = createRun(`SIM-${n}`);
  while (s.phase !== 'gameOver') {
    (stats[s.stage] ??= { plays: 0, sum: 0, max: 0, fails: 0, reached: 0 }).reached++;
    s = playStage(s, stats);
    if (s.phase === 'gameOver') break;
    s = collectReward(s);
    if (s.phase === 'gameOver') break;
    s = shopBot(s);
    s = nextStage(s);
  }
  if (s.outcome === 'win') {
    wins++;
    s.artifacts.forEach((a) => (artifactWins[a.id] = (artifactWins[a.id] ?? 0) + 1));
  } else { deaths[s.stage]++; const b = s.stageState.bossId ?? 'none'; bossDeaths[b] = (bossDeaths[b] ?? 0) + 1; }
  for (const b of s.bossOrder.slice(0, s.stage >= 8 ? 3 : s.stage >= 5 ? 2 : s.stage >= 2 ? 1 : 0)) bossSeen[b] = (bossSeen[b] ?? 0) + 1;
  bestEver = Math.max(bestEver, s.history.best?.stats.views ?? 0);
  fanEnd.push(s.fans);
}

console.log(`mode=${MODE} runs=${N} win=${((wins / N) * 100).toFixed(1)}%  best video ever=${formatNum(bestEver)}`);
console.log('stage | KPI      | reached | died |  p25 video | med video | max video');
stats.forEach((st, i) => {
  console.log(
    `${String(i + 1).padStart(5)} | ${formatNum(BALANCE.kpi[i]).padEnd(8)} | ${String(st.reached).padStart(7)} | ${String(deaths[i]).padStart(4)} | ${q(st.all!, 0.25).padStart(10)} | ${q(st.all!, 0.5).padStart(9)} | ${formatNum(st.max)}`,
  );
});
fanEnd.sort((a, b) => a - b);
console.log(`fans at end: median=${formatNum(fanEnd[Math.floor(N / 2)])} p90=${formatNum(fanEnd[Math.floor(N * 0.9)])}`);
console.log('artifacts in winning builds:', Object.entries(artifactWins).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k}:${v}`).join(' '));

console.log('boss deaths/seen:', Object.keys(bossSeen).map((b) => `${b}:${bossDeaths[b] ?? 0}/${bossSeen[b]}`).join(' '), 'non-boss deaths:', bossDeaths.none ?? 0);
