import { useEffect, useState } from 'react';
import { sound } from '../../audio/sfx';
import { moveArtifact, runView, sellArtifact, sellPrice } from '../../engine/game';
import { disabledArtifactIndices } from '../../engine/scoring';
import type { RunState } from '../../engine/types';
import { fx, fxEl } from '../../fx/fx';
import { store } from '../../state/store';
import { ArtifactCard } from '../components/ArtifactCard';
import { hideTip } from '../components/Tooltip';

interface Props {
  run: RunState;
  locked?: boolean;
  /** replace mode: clicking an artifact picks it */
  onPick?: (uid: string) => void;
  pickLabel?: string;
}

export function ArtifactBar({ run, locked, onPick, pickLabel }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const view = runView(run);
  const disabled = disabledArtifactIndices(run.artifacts.length, view);
  useEffect(() => {
    if (locked) setOpen(null);
  }, [locked]);
  const slots = Array.from({ length: run.maxArtifacts }, (_, i) => run.artifacts[i] ?? null);
  return (
    <div className={`artbar ${onPick ? 'pick-mode' : ''}`} data-tut="artifacts">
      <div className="artbar-label">
        流量神器 <b>{run.artifacts.length}</b>/{run.maxArtifacts}
        <small className="t-muted"> 从左到右结算</small>
      </div>
      <div className="artbar-slots">
        {slots.map((a, i) =>
          a ? (
            <div key={a.uid} className="art-slot">
              <ArtifactCard
                id={a.id}
                inst={a}
                view={view}
                disabled={disabled.has(i)}
                selected={open === a.uid}
                onClick={() => {
                  if (onPick) return onPick(a.uid);
                  if (locked) return;
                  sound.play('click');
                  setOpen(open === a.uid ? null : a.uid);
                }}
              />
              {open === a.uid && !locked && !onPick && (
                <div className="art-menu notch">
                  <button
                    disabled={i === 0}
                    onClick={() => store.act((s) => moveArtifact(s, a.uid, -1))}
                    aria-label="左移"
                  >
                    ◀
                  </button>
                  <button
                    className="sell"
                    onClick={() => {
                      const el = fxEl(`art-${a.uid}`);
                      if (store.act((s) => sellArtifact(s, a.uid))) {
                        sound.play('sell');
                        fx.burstAt(el, { colors: ['#ffe14d', '#ffb020'], count: 20 });
                        hideTip();
                        setOpen(null);
                      }
                    }}
                  >
                    出售 ${sellPrice(a.id)}
                  </button>
                  <button
                    disabled={i === run.artifacts.length - 1}
                    onClick={() => store.act((s) => moveArtifact(s, a.uid, 1))}
                    aria-label="右移"
                  >
                    ▶
                  </button>
                </div>
              )}
              {onPick && <div className="pick-hint">{pickLabel ?? '替换'}</div>}
            </div>
          ) : (
            <div key={`empty-${i}`} className="art-slot art-empty notch">
              <span>空位</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
