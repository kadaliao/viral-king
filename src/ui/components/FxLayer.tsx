import { useEffect, useState } from 'react';
import { onPopups, type Popup } from '../../fx/fx';

export function FxLayer() {
  const [list, setList] = useState<Popup[]>([]);
  useEffect(() => onPopups(setList), []);
  return (
    <div className="popup-layer" aria-hidden>
      {list.map((p) => (
        <div
          key={p.id}
          className={`popup popup-${p.kind}`}
          style={{ left: p.x, top: p.y, color: p.color, fontSize: p.size }}
        >
          {p.text}
        </div>
      ))}
    </div>
  );
}
