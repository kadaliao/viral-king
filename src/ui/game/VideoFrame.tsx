import type { ReactNode } from 'react';
import { formatMult, formatNum } from '../../engine/num';
import type { Card } from '../../engine/types';
import { ContentCard } from '../components/ContentCard';
import { NumberRoll } from '../components/NumberRoll';
import { Sprite } from '../components/Sprite';

export interface Danmaku {
  id: number;
  text: string;
  lane: number;
  color: string;
  big?: boolean;
}

interface Props {
  mode: 'preview' | 'scoring';
  title: ReactNode;
  comboName: string | null;
  comboSub?: ReactNode;
  base: number;
  mult: number;
  score: number;
  scoreLabel: string;
  cards: Card[];
  throttled: Set<string>;
  banner?: { text: string; tier: number; key: number } | null;
  danmaku?: Danmaku[];
  comboCount?: number;
  slam?: boolean;
  tier?: number;
  rollMs?: number;
  footer?: ReactNode;
  onCardClick?: (uid: string) => void;
}

export function VideoFrame(p: Props) {
  return (
    <div className={`vframe notch mode-${p.mode} tier-${p.tier ?? 0}`} data-tut="preview">
      <div className="vframe-top">
        <span className={`rec-dot ${p.mode === 'scoring' ? 'live' : ''}`} />
        <span className="vframe-status">{p.mode === 'scoring' ? '发布中 · 算法推荐中' : '草稿箱 · 视频预览'}</span>
        <span className="vframe-combo" data-fx="combo">
          {p.comboName ?? '—'}
        </span>
      </div>
      <div className="vframe-title">{p.title}</div>
      {p.comboSub && <div className="vframe-sub">{p.comboSub}</div>}
      <div className="vframe-screen">
        {p.danmaku && (
          <div className="danmaku-layer" aria-hidden>
            {p.danmaku.map((d) => (
              <span
                key={d.id}
                className={`danmaku ${d.big ? 'big' : ''}`}
                style={{ top: `${6 + d.lane * 14}%`, color: d.color }}
              >
                {d.text}
              </span>
            ))}
          </div>
        )}
        <div className="vframe-cards">
          {p.cards.length === 0 ? (
            <div className="vframe-empty">
              <Sprite id="publish" scale={3} />
              <span>从下方手牌中选择 1–5 张内容卡</span>
            </div>
          ) : (
            p.cards.map((c, i) => (
              <ContentCard
                key={c.uid}
                card={c}
                small
                order={i + 1}
                throttled={p.throttled.has(c.uid)}
                fxKey={p.mode === 'scoring'}
                onClick={p.onCardClick ? () => p.onCardClick!(c.uid) : undefined}
              />
            ))
          )}
        </div>
        {p.banner && (
          <div key={p.banner.key} className={`ms-banner ms-tier-${p.banner.tier}`}>
            <Sprite id={`milestone_${Math.min(5, p.banner.tier)}`} scale={3} />
            {p.banner.text}
          </div>
        )}
        {!!p.comboCount && p.comboCount > 2 && (
          <div key={p.comboCount} className="combo-counter" style={{ fontSize: Math.min(36, 12 + p.comboCount) }}>
            连击 ×{p.comboCount}
          </div>
        )}
      </div>
      <div className="calc">
      <div className="formula">
        <div className="f-box f-base notch" data-fx="f-base">
          <small>基础流量</small>
          <NumberRoll value={p.base} duration={p.rollMs ?? 200} className="f-num" />
        </div>
        <div className="f-op">×</div>
        <div className="f-box f-mult notch" data-fx="f-mult">
          <small>倍率</small>
          <NumberRoll value={p.mult} duration={p.rollMs ?? 200} className="f-num" format={formatMult} />
        </div>
      </div>
      <div className="f-eq">=</div>
      <div className={`f-score ${p.slam ? 'slam' : ''}`} data-fx="f-score">
        <small>{p.scoreLabel}</small>
        <NumberRoll value={p.score} duration={p.rollMs ? p.rollMs * 1.5 : 300} className="f-score-num" format={formatNum} />
      </div>
      </div>
      {p.footer && <div className="vframe-foot">{p.footer}</div>}
    </div>
  );
}
