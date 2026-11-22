import { memo } from 'react';
import { CARD_TRAIT_TEXT } from '../../data/cards';
import { EDITION_DEFS, TAG_DEFS } from '../../data/tags';
import type { Card } from '../../engine/types';
import { Sprite } from './Sprite';
import { tipProps } from './Tooltip';

interface Props {
  card: Card;
  selected?: boolean;
  order?: number;
  throttled?: boolean;
  onClick?: () => void;
  dealIndex?: number;
  small?: boolean;
  className?: string;
  fxKey?: boolean;
}

export function CardTip({ card }: { card: Card }) {
  const tag = TAG_DEFS[card.tag];
  return (
    <div className="tip">
      <div className="tip-title" style={{ color: tag.color }}>
        {card.name}
      </div>
      <div className="tip-sub">
        {tag.name} · {tag.role}
      </div>
      <div>
        计分：<span className="t-base">+{card.base} 基础流量</span>
        {card.mult > 0 && <span className="t-mult"> · 倍率 +{card.mult}</span>}
      </div>
      {card.trait && <div className="t-yellow">{CARD_TRAIT_TEXT[card.trait]}</div>}
      {card.edition && (
        <div style={{ color: EDITION_DEFS[card.edition].color }}>
          【{EDITION_DEFS[card.edition].name}】{EDITION_DEFS[card.edition].desc}
        </div>
      )}
    </div>
  );
}

export const ContentCard = memo(function ContentCard({
  card, selected, order, throttled, onClick, dealIndex, small, className, fxKey = true,
}: Props) {
  const tag = TAG_DEFS[card.tag];
  const style = {
    '--tag-c': tag.color,
    '--tag-d': tag.dark,
    animationDelay: dealIndex !== undefined ? `${dealIndex * 60}ms` : undefined,
  } as React.CSSProperties;
  return (
    <div
      className={`ccard ${selected ? 'is-selected' : ''} ${throttled ? 'is-throttled' : ''} ${
        card.edition ? `ed-${card.edition}` : ''
      } ${dealIndex !== undefined ? 'is-dealing' : ''} ${small ? 'ccard-sm' : ''} ${className ?? ''}`}
      style={style}
      data-fx={fxKey ? `card-${card.uid}` : undefined}
      onClick={onClick}
      {...tipProps(() => <CardTip card={card} />)}
    >
      <div className="ccard-body notch">
        <div className="ccard-head">
          <Sprite id={tag.icon} scale={small ? 1 : 2} />
          <span className="ccard-name">{card.name}</span>
        </div>
        <div className="ccard-art">
          <Sprite id={card.art} scale={small ? 2 : 3} />
          {card.trait === 'firstPost' && <span className="ccard-trait">时效</span>}
        </div>
        <div className="ccard-foot">
          <span className="ccard-base">+{card.base}</span>
          {card.mult > 0 && <span className="ccard-mult">+{card.mult}倍</span>}
        </div>
        {card.edition && (
          <div className="ccard-edition" style={{ background: EDITION_DEFS[card.edition].color }}>
            {EDITION_DEFS[card.edition].name}
          </div>
        )}
      </div>
      {order !== undefined && <div className="ccard-order">{order}</div>}
      {throttled && <div className="ccard-stamp">限流</div>}
    </div>
  );
});
