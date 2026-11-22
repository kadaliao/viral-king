import { useEffect, useMemo, useRef, useState } from 'react';
import { sound } from '../../audio/sfx';
import { BALANCE } from '../../data/balance';
import { COMBO_MAP } from '../../data/combos';
import {
  acknowledgeResult, cardsOf, discardCards, handCards, previewVideo, publishVideo, runView, sortHand,
} from '../../engine/game';
import { formatNum } from '../../engine/num';
import { matchingCombos, splitThrottled } from '../../engine/scoring';
import type { RunState } from '../../engine/types';
import { fx, fxEl } from '../../fx/fx';
import { store, useApp } from '../../state/store';
import { Button } from '../components/Button';
import { ContentCard } from '../components/ContentCard';
import { Modal } from '../components/Modal';
import { TooltipLayer, hideTip } from '../components/Tooltip';
import { ArtifactBar } from '../game/ArtifactBar';
import { DeckModal } from '../game/DeckModal';
import { ResultCard } from '../game/ResultCard';
import { ScoringStage } from '../game/ScoringStage';
import { Shop } from '../game/Shop';
import { SidePanel } from '../game/SidePanel';
import { GameOver, StageClear, StageIntro } from '../game/StageScreens';
import { Tutorial } from '../game/Tutorial';
import { TopBar } from '../game/TopBar';
import { VideoFrame } from '../game/VideoFrame';
import { ComboTable, HelpContent } from './HelpScreen';

export function GameScreen() {
  const run = useApp((s) => s.run);
  useEffect(() => {
    if (!run) store.setScreen('menu');
  }, [run]);
  if (!run) return null;
  return (
    <>
      {run.phase === 'shop' ? (
        <Shop run={run} />
      ) : run.phase === 'stageClear' ? (
        <StageClear run={run} />
      ) : run.phase === 'gameOver' ? (
        <GameOver run={run} />
      ) : (
        <Board run={run} />
      )}
      <TooltipLayer />
    </>
  );
}

function Board({ run }: { run: RunState }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [animating, setAnimating] = useState(false);
  const [deckOpen, setDeckOpen] = useState(false);
  const [combosOpen, setCombosOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const tutorialDone = useApp((s) => s.tutorialDone);
  const settingsOpen = useApp((s) => s.settingsOpen);

  // deal animation: new cards in hand get a stagger index
  const prevHand = useRef<Set<string>>(new Set());
  const dealMap = useMemo(() => {
    const m = new Map<string, number>();
    let k = 0;
    for (const u of run.hand) if (!prevHand.current.has(u)) m.set(u, k++);
    return m;
  }, [run.hand]);
  useEffect(() => {
    if (dealMap.size && run.phase === 'playing') {
      for (let i = 0; i < Math.min(dealMap.size, 8); i++) window.setTimeout(() => sound.play('deal'), i * 60);
    }
    prevHand.current = new Set(run.hand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.hand]);

  // keep selection valid
  useEffect(() => {
    setSelected((sel) => sel.filter((u) => run.hand.includes(u)));
  }, [run.hand]);

  const hand = handCards(run);
  const view = runView(run);
  const playing = run.phase === 'playing';
  const preview = useMemo(() => (playing ? previewVideo(run, selected) : null), [run, selected, playing]);
  const selCards = cardsOf(run, selected);
  const throttledSel = new Set(splitThrottled(selCards, view).throttled.map((c) => c.uid));

  const toggle = (uid: string) => {
    if (!playing) return;
    setSelected((sel) => {
      if (sel.includes(uid)) {
        sound.play('deselect');
        return sel.filter((u) => u !== uid);
      }
      if (sel.length >= BALANCE.maxPlay) {
        sound.play('error');
        store.toast(`一条视频最多 ${BALANCE.maxPlay} 张卡`, 'error');
        return sel;
      }
      sound.play('select', sel.length * 2);
      return [...sel, uid];
    });
  };

  const publish = () => {
    if (!playing || selected.length === 0) return;
    hideTip();
    const uids = selected;
    if (store.act((s) => publishVideo(s, uids))) {
      setSelected([]);
      setAnimating(true);
    }
  };

  const discard = () => {
    if (!playing || selected.length === 0) return;
    const els = selected.map((u) => fxEl(`card-${u}`));
    if (store.act((s) => discardCards(s, selected))) {
      sound.play('discard');
      els.forEach((el) => fx.burstAt(el, { count: 8, colors: ['#a397d6', '#ff3ea5'], speed: 4 }));
      setSelected([]);
    }
  };

  const ack = () => {
    store.act(acknowledgeResult);
  };

  // keyboard shortcuts
  useEffect(() => {
    if (!playing || settingsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      const n = Number(e.key);
      if (n >= 1 && n <= 8 && run.hand[n - 1]) toggle(run.hand[n - 1]);
      else if (e.key === 'Enter') publish();
      else if (e.key === 'd' || e.key === 'D') discard();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const lastCards = run.lastVideo ? cardsOf(run, run.lastVideo.playedUids) : [];
  const showScoring = run.phase === 'result' && animating && run.lastVideo;
  const showResult = run.phase === 'result' && !animating && run.lastVideo;

  // while the video is being scored, HUD shows the values from before publishing
  const hud: RunState =
    showScoring && run.lastVideo
      ? {
          ...run,
          coins: Math.max(0, run.coins - run.lastVideo.result.coins),
          fans: Math.max(0, run.fans - run.lastVideo.record.stats.fansGained),
          stageState: {
            ...run.stageState,
            total: Math.max(0, run.stageState.total - run.lastVideo.record.stats.views),
            publishesLeft: run.stageState.publishesLeft + 1,
          },
        }
      : run;

  const combo = preview ? COMBO_MAP[preview.comboId] : null;
  const matches = playing && selCards.length ? matchingCombos(selCards.filter((c) => !throttledSel.has(c.uid)), view) : [];
  const after = preview ? run.stageState.total + preview.score : 0;
  const lv = combo ? run.comboLevels[combo.id] ?? 0 : 0;
  const comboStep = preview?.steps[0];

  return (
    <div className="game screen-fade">
      <TopBar run={hud} onHelp={() => setHelpOpen(true)} />
      <div className="game-main">
        <SidePanel run={hud} onDeck={() => setDeckOpen(true)} onCombos={() => setCombosOpen(true)} />
        <div className="game-center">
          <ArtifactBar run={run} locked={!playing} />
          <div className="stage-area">
            {showScoring ? (
              <ScoringStage
                key={run.history.videosPublished}
                last={run.lastVideo!}
                cards={lastCards}
                onDone={() => setAnimating(false)}
              />
            ) : (
              <VideoFrame
                mode="preview"
                title={
                  combo ? (
                    <span className="t-muted">{combo.desc}</span>
                  ) : (
                    <span className="t-muted">选好内容卡，平台会自动识别视频类型</span>
                  )
                }
                comboName={combo ? `${combo.name}${lv ? ` Lv.${lv + 1}` : ''}` : null}
                comboSub={
                  matches.length > 1 ? (
                    <span className="match-chips">
                      {matches
                        .filter((m) => m.id !== 'vlog')
                        .slice(-5)
                        .map((m) => (
                          <span key={m.id} className={`chip ${m.id === combo?.id ? 'chip-on' : ''}`}>
                            {m.name}
                          </span>
                        ))}
                    </span>
                  ) : undefined
                }
                base={comboStep ? comboStep.base : 0}
                mult={comboStep ? comboStep.mult : 0}
                score={preview?.score ?? 0}
                scoreLabel="预计播放量"
                cards={selCards}
                throttled={throttledSel}
                onCardClick={toggle}
                footer={
                  preview ? (
                    <span>
                      发布后本关累计{' '}
                      <b className={after >= run.stageState.kpi ? 't-green' : 't-score'}>{formatNum(after)}</b> /{' '}
                      {formatNum(run.stageState.kpi)}
                      {after >= run.stageState.kpi && <b className="t-green"> · 可以通关！</b>}
                      {preview.coins !== 0 && <span className="t-yellow"> · 金币 {preview.coins > 0 ? '+' : ''}{preview.coins}</span>}
                    </span>
                  ) : (
                    <span className="t-muted">提示：点击顺序 = 出场顺序；神器栏可点击调整顺序或出售</span>
                  )
                }
              />
            )}
          </div>
          <div className="hand-area" data-tut="hand">
            <div className="hand">
              {hand.map((c, i) => (
                <ContentCard
                  key={c.uid}
                  card={c}
                  selected={selected.includes(c.uid)}
                  order={selected.includes(c.uid) ? selected.indexOf(c.uid) + 1 : undefined}
                  onClick={() => toggle(c.uid)}
                  dealIndex={dealMap.get(c.uid)}
                  className={`hand-${i}`}
                />
              ))}
              {hand.length === 0 && <div className="t-muted hand-empty">等待发牌…</div>}
            </div>
            <div className="actions">
              <div className="sort-btns">
                <button className="mini-btn" onClick={() => store.act((s) => sortHand(s, 'tag'))} disabled={!playing}>
                  按标签
                </button>
                <button className="mini-btn" onClick={() => store.act((s) => sortHand(s, 'base'))} disabled={!playing}>
                  按流量
                </button>
                {selected.length > 0 && (
                  <button className="mini-btn" onClick={() => setSelected([])}>
                    清空
                  </button>
                )}
              </div>
              <Button
                variant="cyan"
                onClick={discard}
                disabled={!playing || selected.length === 0 || run.stageState.discardsLeft <= 0}
                data-tut="discard"
              >
                换牌 ({run.stageState.discardsLeft})
              </Button>
              <Button
                variant="pink"
                size="lg"
                className="publish-btn"
                onClick={publish}
                disabled={!playing || selected.length === 0}
                silent
                data-tut="publish"
              >
                发布视频 ▶
              </Button>
            </div>
          </div>
        </div>
      </div>

      {run.phase === 'stageIntro' && <StageIntro run={run} />}
      {showResult && <ResultCard run={run} cards={lastCards} onContinue={ack} />}
      {deckOpen && <DeckModal run={run} onClose={() => setDeckOpen(false)} />}
      {combosOpen && (
        <Modal title="视频类型（组合表）" onClose={() => setCombosOpen(false)} wide>
          <ComboTable levels={run.comboLevels} />
        </Modal>
      )}
      {helpOpen && (
        <Modal title="游戏说明" onClose={() => setHelpOpen(false)} wide>
          <HelpContent />
        </Modal>
      )}
      {!tutorialDone && playing && run.stage === 0 && run.stageState.publishesUsed === 0 && <Tutorial />}
    </div>
  );
}
