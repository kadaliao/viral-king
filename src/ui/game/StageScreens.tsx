import { useEffect } from 'react';
import { sound } from '../../audio/sfx';
import { ARTIFACT_MAP } from '../../data/artifacts';
import { BALANCE, FAN_LEVELS, fanLevel } from '../../data/balance';
import { BOSS_MAP } from '../../data/bosses';
import { COMBO_MAP } from '../../data/combos';
import { TAG_DEFS } from '../../data/tags';
import { collectReward, startStage } from '../../engine/game';
import { formatNum } from '../../engine/num';
import { TAGS, type RunState } from '../../engine/types';
import { fx } from '../../fx/fx';
import { store } from '../../state/store';
import { ArtifactCard } from '../components/ArtifactCard';
import { Button } from '../components/Button';
import { NumberRoll } from '../components/NumberRoll';
import { Sprite } from '../components/Sprite';

export function StageIntro({ run }: { run: RunState }) {
  const ss = run.stageState;
  const boss = ss.bossId ? BOSS_MAP[ss.bossId] : null;
  const mystery = run.artifacts.filter((a) => a.id === 'mystery_algo');
  useEffect(() => {
    sound.play(boss ? 'boss' : 'whoosh');
    if (boss) fx.shake(6, 500);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') go();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const go = () => {
    if (store.act(startStage)) sound.play('deal');
  };
  return (
    <div className="modal-backdrop intro-backdrop">
      <div className={`intro panel notch ${boss ? 'intro-boss' : ''}`}>
        <div className="intro-stage">
          STAGE {run.stage + 1}/{BALANCE.stages}
        </div>
        {boss ? (
          <>
            <div className="intro-warning">⚠ BOSS 来袭 ⚠</div>
            <div className="intro-boss-art">
              <Sprite id={boss.art} scale={6} />
            </div>
            <div className="huge t-red glow-pink">{boss.name}</div>
            <div className="intro-rule">{boss.rule}</div>
            <div className="intro-tip t-green">应对思路：{boss.tip}</div>
          </>
        ) : (
          <div className="huge glow-cyan">第 {run.stage + 1} 关</div>
        )}
        <div className="intro-kpi">
          <span className="t-muted">播放量 KPI</span>
          <span className="mega t-score glow-yellow">{formatNum(ss.kpi)}</span>
        </div>
        <div className="intro-meta t-muted">
          {BALANCE.publishesPerStage} 次发布 · {BALANCE.discardsPerStage} 次换牌 · 牌库 {run.deck.length} 张
        </div>
        {mystery.map((m) => (
          <div key={m.uid} className="intro-mystery">
            神秘算法 · 本关幸运标签：
            <b style={{ color: TAG_DEFS[TAGS[m.state.tag ?? 0]].color }}>{TAG_DEFS[TAGS[m.state.tag ?? 0]].name}</b>
          </div>
        ))}
        <Button variant={boss ? 'red' : 'green'} size="lg" onClick={go}>
          开始创作
        </Button>
      </div>
    </div>
  );
}

export function StageClear({ run }: { run: RunState }) {
  const ss = run.stageState;
  const r = run.reward!;
  const fansGained = ss.videos.reduce((s, v) => s + v.stats.fansGained, 0);
  const best = [...ss.videos].sort((a, b) => b.stats.views - a.stats.views)[0];
  const isLast = run.stage >= BALANCE.stages - 1;
  useEffect(() => {
    fx.confetti(140);
    sound.play('stageClear');
  }, []);
  const rows: [string, number][] = [
    [`通关奖励（第 ${run.stage + 1} 关）`, r.base],
    [`剩余发布 ×${ss.publishesLeft}`, r.publishesBonus],
    [`利息（每 ${BALANCE.interestPer} 金币 +1，上限 ${BALANCE.interestMax}）`, r.interest],
    [`商单收入（${FAN_LEVELS[fanLevel(run.fans)].name}）`, r.sponsor],
  ];
  return (
    <div className="stage-clear screen-fade">
      <div className="panel notch clear-panel">
        <div className="clear-head">
          <div className="huge glow-green t-green">KPI 达成！</div>
          <div className="t-muted">
            第 {run.stage + 1} 关{ss.bossId ? ` · 击败 Boss「${BOSS_MAP[ss.bossId].name}」` : ''}
          </div>
        </div>
        <div className="clear-grid">
          <div className="clear-col">
            <div className="side-label">本关成绩</div>
            <div className="clear-total">
              <NumberRoll value={ss.total} duration={900} className="huge t-score glow-yellow" />
              <span className="t-muted"> / {formatNum(ss.kpi)}</span>
            </div>
            <div className="clear-videos">
              {ss.videos.map((v, i) => (
                <div key={i} className={`clear-video ${v === best ? 'best' : ''}`}>
                  <span className="cv-title">《{v.title}》</span>
                  <span className="t-muted">{COMBO_MAP[v.comboId]?.name}</span>
                  <b className="t-score">{formatNum(v.stats.views)}</b>
                </div>
              ))}
            </div>
            <div className="clear-fans">
              <Sprite id="fans" scale={2} /> 粉丝增长 <b className="t-pink">+{formatNum(fansGained)}</b>
              <span className="t-muted"> → 共 {formatNum(run.fans)}（{FAN_LEVELS[fanLevel(run.fans)].name}）</span>
            </div>
          </div>
          <div className="clear-col">
            <div className="side-label">奖励金币</div>
            {rows.map(([label, v], i) => (
              <div key={label} className="reward-row" style={{ animationDelay: `${200 + i * 180}ms` }}>
                <span>{label}</span>
                <b className={v > 0 ? 't-yellow' : 't-muted'}>+${v}</b>
              </div>
            ))}
            <div className="reward-row total" style={{ animationDelay: '950ms' }}>
              <span>合计</span>
              <b className="big t-yellow glow-yellow">+${r.total}</b>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <Button
            variant="green"
            size="lg"
            onClick={() => {
              if (store.act(collectReward)) sound.play('coin');
            }}
          >
            {isLast ? '领取奖励，登顶！' : '领取奖励，进入商店'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function GameOver({ run }: { run: RunState }) {
  const win = run.outcome === 'win';
  const h = run.history;
  const topCombos = Object.entries(h.comboCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  useEffect(() => {
    sound.play(win ? 'win' : 'lose');
    if (win) {
      fx.confetti(300);
      const t = window.setInterval(() => fx.confetti(80), 1400);
      return () => clearInterval(t);
    }
  }, [win]);
  return (
    <div className="gameover screen-fade">
      <div className={`panel notch go-panel ${win ? 'win' : 'lose'}`}>
        <div className="go-head">
          <Sprite id={win ? 'trophy' : 'skull'} scale={5} />
          <div>
            <div className="mega glow-yellow t-score">{win ? '流量之王！' : '账号凉了…'}</div>
            <div className="t-muted">
              {win
                ? '九关全部达成，你成为了全网最强的流量密码。'
                : `倒在了第 ${run.stage + 1} 关${run.stageState.bossId ? `（${BOSS_MAP[run.stageState.bossId].name}）` : ''}，差 ${formatNum(
                    Math.max(0, run.stageState.kpi - run.stageState.total),
                  )} 播放。`}
            </div>
          </div>
        </div>
        <div className="go-stats">
          <div className="go-stat">
            <small>总播放量</small>
            <b className="big t-score">{formatNum(h.totalViews)}</b>
          </div>
          <div className="go-stat">
            <small>最终粉丝</small>
            <b className="big t-pink">{formatNum(run.fans)}</b>
          </div>
          <div className="go-stat">
            <small>发布视频</small>
            <b className="big t-cyan">{h.videosPublished}</b>
          </div>
          <div className="go-stat">
            <small>通过关卡</small>
            <b className="big t-green">{h.stagesCleared}/{BALANCE.stages}</b>
          </div>
        </div>
        {h.best && (
          <div className="go-best">
            <div className="side-label">最高单条视频</div>
            <div className="big">《{h.best.title}》</div>
            <div>
              <b className="huge t-score glow-yellow">{formatNum(h.best.stats.views)}</b> 播放 ·{' '}
              {COMBO_MAP[h.best.comboId]?.name} · 第 {h.best.stage + 1} 关
            </div>
          </div>
        )}
        <div className="go-build">
          <div className="side-label">使用的构筑</div>
          <div className="go-arts">
            {run.artifacts.length ? (
              run.artifacts.map((a) => <ArtifactCard key={a.uid} id={a.id} small />)
            ) : (
              <span className="t-muted">一个神器都没买，硬核！</span>
            )}
          </div>
          <div className="t-muted">
            常用视频类型：{topCombos.map(([id, n]) => `${COMBO_MAP[id]?.name}×${n}`).join('、') || '—'} · 卡组 {run.deck.length} 张 ·
            种子 <span className="t-cyan">{run.seed}</span>
          </div>
          {run.artifacts.length > 0 && (
            <div className="t-muted">流派：{run.artifacts.map((a) => ARTIFACT_MAP[a.id].name).join(' + ')}</div>
          )}
        </div>
        <div className="modal-actions">
          <Button variant="ghost" onClick={() => store.abandonRun()}>
            主菜单
          </Button>
          <Button variant="cyan" onClick={() => store.newRun(run.seed)} title="用同一个种子再挑战">
            同种子重来
          </Button>
          <Button variant="pink" size="lg" onClick={() => store.newRun()}>
            再来一局
          </Button>
        </div>
      </div>
    </div>
  );
}

