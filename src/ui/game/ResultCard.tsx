import { useEffect } from 'react';
import { COMBO_MAP } from '../../data/combos';
import { formatMult, formatNum } from '../../engine/num';
import type { Card, RunState, ScoreStep } from '../../engine/types';
import { Button } from '../components/Button';
import { NumberRoll } from '../components/NumberRoll';
import { Sprite } from '../components/Sprite';

const HANDLES = ['不想上班的猫', '赛博打工人', '暴富练习生', '流量小透明', '深夜剪辑师', '今天也要火', '野生博主', '算法观察员'];

export function playerHandle(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return '@' + HANDLES[h % HANDLES.length];
}

interface Summary {
  label: string;
  kind: ScoreStep['kind'];
  total: number;
  count: number;
}

/** Aggregate scoring steps by label for the "触发效果" list. */
export function summarize(steps: ScoreStep[]): Summary[] {
  const map = new Map<string, Summary>();
  for (const s of steps) {
    if (s.kind === 'combo' || s.kind === 'info') continue;
    const key = `${s.label}|${s.kind}`;
    const cur = map.get(key);
    if (cur) {
      cur.count++;
      cur.total = s.kind === 'xmult' || s.kind === 'xbase' || s.kind === 'debuff' ? cur.total * s.amount : cur.total + s.amount;
    } else map.set(key, { label: s.label, kind: s.kind, total: s.amount, count: 1 });
  }
  const order: Record<string, number> = { xmult: 0, debuff: 1, retrigger: 2, mult: 3, xbase: 4, base: 5, coins: 6 };
  return [...map.values()].sort((a, b) => (order[a.kind] ?? 9) - (order[b.kind] ?? 9)).slice(0, 14);
}

function fmtSummary(s: Summary): string {
  switch (s.kind) {
    case 'xmult':
    case 'debuff':
      return `×${formatMult(s.total)}`;
    case 'xbase':
      return `基础×${formatMult(s.total)}`;
    case 'mult':
      return `+${formatNum(s.total)} 倍`;
    case 'base':
      return `+${formatNum(s.total)}`;
    case 'coins':
      return `${s.total > 0 ? '+' : ''}${s.total} 金币`;
    case 'retrigger':
      return `${s.count} 次`;
    default:
      return '';
  }
}

export function ResultCard({ run, cards, onContinue }: { run: RunState; cards: Card[]; onContinue: () => void }) {
  const lv = run.lastVideo!;
  const { record, result } = lv;
  const ss = run.stageState;
  const cleared = ss.total >= ss.kpi;
  const lost = !cleared && ss.publishesLeft <= 0;
  const pct = Math.min(100, (ss.total / ss.kpi) * 100);
  const sums = summarize(result.steps);
  const combo = COMBO_MAP[record.comboId];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onContinue();
      }
    };
    const t = window.setTimeout(() => window.addEventListener('keydown', onKey), 300);
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-backdrop result-backdrop">
      <div className={`result-card notch tier-${lv.milestone}`}>
        <div className="phone-status">
          <span>23:59</span>
          <span className="t-pink">▶ 短视频</span>
          <span>▮▮▮ 100%</span>
        </div>
        <div className="result-main">
          <div className="result-video">
            <div className="thumb">
              <div className="thumb-art">
                {cards.slice(0, 5).map((c) => (
                  <Sprite key={c.uid} id={c.art} scale={2} />
                ))}
              </div>
              <div className="thumb-play">
                <Sprite id="publish" scale={3} />
              </div>
              <div className="thumb-bar">
                <div />
              </div>
            </div>
            <div className="side-actions">
              <div>
                <Sprite id="like" scale={2} />
                <span>{formatNum(record.stats.likes)}</span>
              </div>
              <div>
                <Sprite id="comment" scale={2} />
                <span>{formatNum(record.stats.comments)}</span>
              </div>
              <div>
                <Sprite id="share" scale={2} />
                <span>{formatNum(record.stats.shares)}</span>
              </div>
            </div>
          </div>
          <div className="result-info">
            <div className="result-handle t-cyan">{playerHandle(run.seed)}</div>
            <div className="result-title big">《{record.title}》</div>
            <div className="result-tags">
              <span className="chip chip-combo">#{combo?.name ?? record.comboId}</span>
              <span className="chip">
                <span className="t-base">{formatNum(result.base)}</span> × <span className="t-mult">{formatMult(result.mult)}</span>
              </span>
            </div>
            <div className="result-views">
              <Sprite id="views" scale={2} />
              <NumberRoll value={record.stats.views} duration={700} className="huge t-score glow-yellow" />
              <span className="t-muted">次播放</span>
            </div>
            <div className="result-stats">
              <span>
                <Sprite id="fans" scale={1} /> 新增粉丝 <b className="t-pink">+{formatNum(record.stats.fansGained)}</b>
              </span>
              {result.coins !== 0 && (
                <span>
                  <Sprite id="coin" scale={1} /> 金币 <b className="t-yellow">{result.coins > 0 ? '+' : ''}{result.coins}</b>
                </span>
              )}
              {result.retriggerCount > 0 && <span>重复触发 <b className="t-green">{result.retriggerCount}</b> 次</span>}
              {result.xmultCount > 0 && <span>乘法 <b className="t-yellow">{result.xmultCount}</b> 次</span>}
            </div>
          </div>
        </div>
        {sums.length > 0 && (
          <div className="result-effects">
            <div className="side-label">触发效果</div>
            <div className="effects-grid">
              {sums.map((s) => (
                <div key={s.label + s.kind} className={`eff eff-${s.kind}`}>
                  <span>{s.label}{s.count > 1 && s.kind !== 'retrigger' ? ` ×${s.count}` : ''}</span>
                  <b>{fmtSummary(s)}</b>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="result-stage">
          <div className="tb-kpi-label">
            <span>
              本关累计 <b className="t-score">{formatNum(ss.total)}</b> / {formatNum(ss.kpi)}
            </span>
            <span className={cleared ? 't-green' : lost ? 't-red' : 't-muted'}>
              {cleared ? 'KPI 达成！' : lost ? '发布次数用完了…' : `剩余发布 ${ss.publishesLeft} 次`}
            </span>
          </div>
          <div className="progress">
            <div className={`progress-fill ${cleared ? 'done' : ''}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="modal-actions">
          <Button variant={cleared ? 'green' : lost ? 'red' : 'pink'} size="lg" onClick={onContinue}>
            {cleared ? '通关！查看结算' : lost ? '查看结局' : '继续创作'}
          </Button>
        </div>
      </div>
    </div>
  );
}
