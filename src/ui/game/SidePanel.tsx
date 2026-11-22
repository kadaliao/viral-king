import { BOSS_MAP } from '../../data/bosses';
import { TAG_DEFS } from '../../data/tags';
import { preferredTag } from '../../engine/game';
import { formatNum } from '../../engine/num';
import { TAGS, type RunState } from '../../engine/types';
import { Sprite } from '../components/Sprite';

function Pips({ n, max, cls }: { n: number; max: number; cls: string }) {
  return (
    <span className="pips">
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`pip ${cls} ${i < n ? 'on' : ''}`} />
      ))}
    </span>
  );
}

export function SidePanel({ run, onDeck, onCombos }: { run: RunState; onDeck: () => void; onCombos: () => void }) {
  const ss = run.stageState;
  const boss = ss.bossId ? BOSS_MAP[ss.bossId] : null;
  const pref = preferredTag(run);
  const need = Math.max(0, ss.kpi - ss.total);
  return (
    <aside className="side">
      <div className="panel notch side-kpi">
        <div className="side-label">本关 KPI</div>
        <div className="huge t-score glow-yellow">{formatNum(ss.kpi)}</div>
        <div className="side-need">
          {need > 0 ? (
            <>
              还差 <b className="t-pink">{formatNum(need)}</b>
            </>
          ) : (
            <b className="t-green">KPI 已达成！</b>
          )}
        </div>
      </div>
      <div className="panel notch side-counts" data-tut="counts">
        <div className="count-row">
          <span>
            <Sprite id="publish" scale={2} /> 发布
          </span>
          <Pips n={ss.publishesLeft} max={4} cls="pip-pub" />
          <b className="t-cyan">{ss.publishesLeft}</b>
        </div>
        <div className="count-row">
          <span>
            <Sprite id="discard" scale={2} /> 换牌
          </span>
          <Pips n={ss.discardsLeft} max={2} cls="pip-dis" />
          <b className="t-pink">{ss.discardsLeft}</b>
        </div>
      </div>
      {boss && (
        <div className="panel notch side-boss" data-fx="boss">
          <div className="side-boss-head">
            <Sprite id={boss.art} scale={2} />
            <div>
              <div className="side-label t-red">BOSS</div>
              <div className="big t-red">{boss.name}</div>
            </div>
          </div>
          <div className="side-boss-rule">{boss.rule}</div>
          {ss.bossId === 'fatigue' && (
            <div className="fatigue">
              {TAGS.map((t) => (
                <span key={t} className={ss.fatigue[t] ? 'on' : ''} style={{ color: TAG_DEFS[t].color }}>
                  {TAG_DEFS[t].name}·{ss.fatigue[t]}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="panel notch side-fans">
        <div className="side-label">粉丝偏好</div>
        {pref ? (
          <div>
            <Sprite id={TAG_DEFS[pref].icon} scale={2} />{' '}
            <b style={{ color: TAG_DEFS[pref].color }}>{TAG_DEFS[pref].name}</b>
            <small className="t-muted"> 博主</small>
          </div>
        ) : (
          <div className="t-muted">还没有形成人设</div>
        )}
      </div>
      <div className="side-btns">
        <button className="pile" onClick={onDeck} data-tut="deck">
          <Sprite id="deck" scale={2} />
          <span>
            牌库 <b>{run.drawPile.length}</b>/{run.deck.length}
          </span>
        </button>
        <button className="pile" onClick={onCombos}>
          <Sprite id="star" scale={2} />
          <span>组合表</span>
        </button>
      </div>
    </aside>
  );
}
