import { useState } from 'react';
import { sound } from '../../audio/sfx';
import { ARTIFACT_MAP } from '../../data/artifacts';
import { BALANCE, fanLevel } from '../../data/balance';
import { BOSS_MAP } from '../../data/bosses';
import { COMBO_MAP, comboValues } from '../../data/combos';
import {
  bossForStage, buyArtifact, buyCard, buyUpgrade, legendaryUnlocked, nextStage, removeCard, rerollShop, sellPrice, stageKpi,
} from '../../engine/game';
import { formatNum } from '../../engine/num';
import type { RunState } from '../../engine/types';
import { fx, fxEl } from '../../fx/fx';
import { store } from '../../state/store';
import { ArtifactCard } from '../components/ArtifactCard';
import { Button } from '../components/Button';
import { ContentCard } from '../components/ContentCard';
import { Modal } from '../components/Modal';
import { Sprite } from '../components/Sprite';
import { hideTip } from '../components/Tooltip';
import { ArtifactBar } from './ArtifactBar';
import { DeckModal } from './DeckModal';

function celebrate(el: Element | null) {
  sound.play('buy');
  fx.burstAt(el, { count: 30, colors: ['#ffe14d', '#39ff88', '#ffffff'] });
  hideTip();
}

export function Shop({ run }: { run: RunState }) {
  const shop = run.shop!;
  const [replaceSlot, setReplaceSlot] = useState<number | null>(null);
  const [removing, setRemoving] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const next = run.stage + 1;
  const nextBoss = bossForStage(run, next);
  const full = run.artifacts.length >= run.maxArtifacts;

  const buyArt = (i: number) => {
    const offer = shop.artifacts[i];
    if (!offer) return;
    if (full) {
      setReplaceSlot(i);
      return;
    }
    const el = fxEl(`shop-art-${i}`);
    if (store.act((s) => buyArtifact(s, i))) celebrate(el);
  };

  return (
    <div className="shop screen-fade">
      <div className="shop-head">
        <div>
          <div className="huge glow-pink">流量商城</div>
          <div className="t-muted">第 {run.stage + 1} 关已完成 · 买买买，然后去冲下一个 KPI</div>
        </div>
        <div className="shop-wallet">
          <span className="res coin" data-fx="coins">
            <Sprite id="coin" scale={3} />
            <b className="huge t-yellow">{run.coins}</b>
          </span>
          <span className="res fans">
            <Sprite id="fans" scale={2} />
            <b className="t-pink">{formatNum(run.fans)}</b>
          </span>
          <Button variant="green" onClick={() => store.act(nextStage)}>
            下一关 ▶
          </Button>
        </div>
      </div>

      <ArtifactBar run={run} />

      <div className="shop-grid">
        <section className="shelf panel notch shelf-arts">
          <div className="shelf-head">
            <span className="big t-pink">流量神器</span>
            <span className="t-muted">
              {legendaryUnlocked(run.fans) ? '传说神器已解锁' : '粉丝达到「腰部达人」解锁传说神器'}
            </span>
          </div>
          <div className="shelf-items">
            {shop.artifacts.map((o, i) =>
              o ? (
                <div key={i} className="shop-item" data-fx={`shop-art-${i}`}>
                  <ArtifactCard id={o.id} price={o.price} />
                  <div className="shop-desc">{ARTIFACT_MAP[o.id].desc}</div>
                  <Button size="sm" variant={run.coins >= o.price ? 'green' : 'ghost'} silent onClick={() => buyArt(i)}>
                    {full ? '替换' : '购买'} ${o.price}
                  </Button>
                </div>
              ) : (
                <div key={i} className="shop-item sold notch">已售罄</div>
              ),
            )}
          </div>
        </section>

        <section className="shelf panel notch shelf-up">
          <div className="shelf-head">
            <span className="big t-cyan">运营课程</span>
            <span className="t-muted">永久升级一种视频类型</span>
          </div>
          <div className="shelf-items col">
            {shop.upgrades.map((o, i) => {
              if (!o) return <div key={i} className="shop-item sold notch">已学完</div>;
              const c = COMBO_MAP[o.comboId];
              const lv = run.comboLevels[o.comboId] ?? 0;
              const now = comboValues(o.comboId, lv);
              const after = comboValues(o.comboId, lv + 1);
              return (
                <div key={i} className="course notch" data-fx={`shop-up-${i}`}>
                  <div className="course-head">
                    <Sprite id="star" scale={2} />
                    <b>{c.name}</b>
                    <span className="lv-badge">Lv.{lv + 1}→{lv + 2}</span>
                  </div>
                  <div className="t-muted">{c.req}</div>
                  <div>
                    <span className="t-base">基础 {now.base}→{after.base}</span> ·{' '}
                    <span className="t-mult">倍率 {now.mult}→{after.mult}</span>
                  </div>
                  <Button
                    size="sm"
                    variant={run.coins >= o.price ? 'cyan' : 'ghost'}
                    silent
                    onClick={() => {
                      if (store.act((s) => buyUpgrade(s, i))) celebrate(fxEl(`shop-up-${i}`));
                    }}
                  >
                    学习 ${o.price}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>

        <section className="shelf panel notch shelf-cards">
          <div className="shelf-head">
            <span className="big t-yellow">精品内容</span>
            <span className="t-muted">加入卡组（偏向你神器喜欢的标签）</span>
          </div>
          <div className="shelf-items">
            {shop.cards.map((o, i) =>
              o ? (
                <div key={i} className="shop-item" data-fx={`shop-card-${i}`}>
                  <ContentCard card={o.card} fxKey={false} />
                  <Button
                    size="sm"
                    variant={run.coins >= o.price ? 'yellow' : 'ghost'}
                    silent
                    onClick={() => {
                      if (store.act((s) => buyCard(s, i))) celebrate(fxEl(`shop-card-${i}`));
                    }}
                  >
                    购买 ${o.price}
                  </Button>
                </div>
              ) : (
                <div key={i} className="shop-item sold notch">已售罄</div>
              ),
            )}
          </div>
        </section>

        <section className="shelf panel notch shelf-service">
          <div className="shelf-head">
            <span className="big t-green">服务</span>
          </div>
          <div className="service-list">
            <Button
              variant="pink"
              onClick={() => {
                if (store.act(rerollShop)) {
                  sound.play('reroll');
                  fx.burstAt(fxEl('reroll'), { count: 20 });
                }
              }}
              silent
              data-fx="reroll"
            >
              <Sprite id="discard" scale={2} /> 刷新货架 ${shop.rerollCost}
            </Button>
            <Button variant="ghost" onClick={() => setRemoving(true)}>
              <Sprite id="x_mult" scale={2} /> 删除卡牌 ${shop.removeCost}
            </Button>
            <Button variant="ghost" onClick={() => setDeckOpen(true)}>
              <Sprite id="deck" scale={2} /> 查看卡组 ({run.deck.length})
            </Button>
          </div>
          <div className="next-stage notch">
            <div className="side-label">下一关 · 第 {next + 1}/{BALANCE.stages} 关</div>
            <div>
              KPI <b className="big t-score">{formatNum(stageKpi(next, nextBoss))}</b>
            </div>
            {nextBoss ? (
              <div className="next-boss">
                <Sprite id={BOSS_MAP[nextBoss].art} scale={2} />
                <div>
                  <b className="t-red">BOSS：{BOSS_MAP[nextBoss].name}</b>
                  <div className="t-muted">{BOSS_MAP[nextBoss].rule}</div>
                </div>
              </div>
            ) : (
              <div className="t-muted">普通关卡 · 粉丝等级 Lv{fanLevel(run.fans)}</div>
            )}
            <Button variant="green" size="lg" onClick={() => store.act(nextStage)}>
              下一关 ▶
            </Button>
          </div>
        </section>
      </div>

      {replaceSlot !== null && shop.artifacts[replaceSlot] && (
        <Modal title="神器栏已满" onClose={() => setReplaceSlot(null)} wide>
          <p>
            选择一个要卖掉的神器，用来换「<b className="t-pink">{ARTIFACT_MAP[shop.artifacts[replaceSlot]!.id].name}</b>」（${shop.artifacts[replaceSlot]!.price}）。被替换的神器按半价回收。
          </p>
          <ArtifactBar
            run={run}
            pickLabel="替换它"
            onPick={(uid) => {
              const victim = run.artifacts.find((a) => a.uid === uid)!;
              const slot = replaceSlot;
              if (store.act((s) => buyArtifact(s, slot, uid))) {
                celebrate(fxEl(`shop-art-${slot}`));
                store.toast(`卖出 ${ARTIFACT_MAP[victim.id].name}（+$${sellPrice(victim.id)}）`, 'info');
                setReplaceSlot(null);
              }
            }}
          />
        </Modal>
      )}
      {removing && (
        <DeckModal
          run={run}
          title={`删除一张卡牌 · $${shop.removeCost}`}
          onClose={() => setRemoving(false)}
          onPick={(uid) => {
            if (store.act((s) => removeCard(s, uid))) {
              sound.play('discard');
              setRemoving(false);
            }
          }}
        />
      )}
      {deckOpen && <DeckModal run={run} onClose={() => setDeckOpen(false)} />}
    </div>
  );
}
