import { BALANCE, FAN_LEVELS, fanLevel } from '../../data/balance';
import { formatNum } from '../../engine/num';
import type { RunState } from '../../engine/types';
import { store } from '../../state/store';
import { Sprite } from '../components/Sprite';
import { tipProps } from '../components/Tooltip';

export function TopBar({ run, onHelp }: { run: RunState; onHelp: () => void }) {
  const ss = run.stageState;
  const pct = Math.min(100, (ss.total / Math.max(1, ss.kpi)) * 100);
  const lv = fanLevel(run.fans);
  const next = FAN_LEVELS[lv + 1];
  return (
    <header className="topbar">
      <div className="tb-logo" onClick={() => store.openSettings(true)} title="菜单">
        <Sprite id="mascot" scale={1} />
        <span className="glow-pink">流量之王</span>
      </div>
      <div className="tb-stage">
        <span className="tb-stage-n">
          第 <b className="t-yellow">{run.stage + 1}</b>/{BALANCE.stages} 关
        </span>
        {ss.bossId && <span className="boss-chip">BOSS</span>}
      </div>
      <div className="tb-kpi" data-tut="kpi">
        <div className="tb-kpi-label">
          <span>
            本关播放 <b className="t-score">{formatNum(ss.total)}</b>
          </span>
          <span className="t-muted">KPI {formatNum(ss.kpi)}</span>
        </div>
        <div className="progress">
          <div className={`progress-fill ${pct >= 100 ? 'done' : ''}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="tb-res">
        <span className="res coin" data-fx="coins" {...tipProps(() => <div className="tip">金币：在商店购买神器、课程和内容卡。每 5 金币每关 +1 利息（上限 5）。</div>)}>
          <Sprite id="coin" scale={2} />
          <b className="t-yellow">{run.coins}</b>
        </span>
        <span
          className="res fans"
          data-fx="fans"
          {...tipProps(() => (
            <div className="tip">
              <div className="tip-title t-pink">粉丝 {formatNum(run.fans)}</div>
              <div>等级：Lv{lv} {FAN_LEVELS[lv].name}</div>
              {next && <div className="t-muted">下一级 {next.name}：{formatNum(next.min)}</div>}
              <div>初始曝光：基础 +{formatNum(Math.floor(Math.sqrt(run.fans)))}</div>
              <div>每关商单收入：${lv}</div>
            </div>
          ))}
        >
          <Sprite id="fans" scale={2} />
          <b className="t-pink">{formatNum(run.fans)}</b>
          <small className="t-muted">{FAN_LEVELS[lv].name}</small>
        </span>
      </div>
      <div className="tb-btns">
        <button className="icon-btn" onClick={onHelp} aria-label="说明">
          <Sprite id="info" scale={2} />
        </button>
        <button className="icon-btn" onClick={() => store.openSettings(true)} aria-label="设置">
          <Sprite id="gear" scale={2} />
        </button>
      </div>
    </header>
  );
}
