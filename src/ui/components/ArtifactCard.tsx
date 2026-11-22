import { memo } from 'react';
import { ARTIFACT_MAP, RARITY_INFO } from '../../data/artifacts';
import type { RunView } from '../../engine/context';
import type { ArtifactInstance } from '../../engine/types';
import { Sprite } from './Sprite';
import { tipProps } from './Tooltip';

interface Props {
  id: string;
  inst?: ArtifactInstance;
  view?: RunView;
  disabled?: boolean;
  selected?: boolean;
  onClick?: () => void;
  price?: number;
  className?: string;
  small?: boolean;
}

export function ArtifactTip({ id, inst, view, disabled }: { id: string; inst?: ArtifactInstance; view?: RunView; disabled?: boolean }) {
  const def = ARTIFACT_MAP[id];
  if (!def) return null;
  const r = RARITY_INFO[def.rarity];
  const status = inst && view && def.status ? def.status(inst, view) : null;
  return (
    <div className="tip">
      <div className="tip-title" style={{ color: r.color }}>
        {def.name}
      </div>
      <div className="tip-sub" style={{ color: r.color }}>
        {r.name}神器 · 售价 ${def.price}
      </div>
      <div className="tip-desc">{def.desc}</div>
      {status && <div className="t-green">{status}</div>}
      {disabled && <div className="t-red">系统维护中：本关失效</div>}
      <div className="tip-flavor">“{def.flavor}”</div>
    </div>
  );
}

export const ArtifactCard = memo(function ArtifactCard({ id, inst, view, disabled, selected, onClick, price, className, small }: Props) {
  const def = ARTIFACT_MAP[id];
  if (!def) return null;
  const r = RARITY_INFO[def.rarity];
  const status = inst && view && def.status ? def.status(inst, view) : null;
  const inactive = !!(def.minFans && view && view.fans < def.minFans);
  return (
    <div
      className={`acard rarity-${def.rarity} ${disabled ? 'is-disabled' : ''} ${inactive ? 'is-inactive' : ''} ${
        selected ? 'is-selected' : ''
      } ${small ? 'acard-sm' : ''} ${className ?? ''}`}
      style={{ '--rar-c': r.color } as React.CSSProperties}
      data-fx={inst ? `art-${inst.uid}` : undefined}
      onClick={onClick}
      {...tipProps(() => <ArtifactTip id={id} inst={inst} view={view} disabled={disabled} />)}
    >
      <div className="acard-body notch">
        <div className="acard-art">
          <Sprite id={def.art} scale={small ? 2 : 3} />
        </div>
        <div className="acard-name">{def.name}</div>
        {status && !small && <div className="acard-status">{status.replace(/^.*?：/, '')}</div>}
      </div>
      {price !== undefined && <div className="acard-price">${price}</div>}
      {disabled && <div className="acard-stamp">维护中</div>}
    </div>
  );
});
