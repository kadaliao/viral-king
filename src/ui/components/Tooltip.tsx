import { useEffect, useState, type ReactNode } from 'react';

interface TipState {
  content: ReactNode;
  rect: DOMRect;
}

let current: TipState | null = null;
const subs = new Set<(t: TipState | null) => void>();
let hideTimer = 0;

export function showTip(el: Element, content: ReactNode): void {
  window.clearTimeout(hideTimer);
  current = { content, rect: el.getBoundingClientRect() };
  subs.forEach((s) => s(current));
}

export function hideTip(): void {
  window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    current = null;
    subs.forEach((s) => s(null));
  }, 40);
}

/** Props to spread onto an element to give it a hover tooltip. */
export function tipProps(content: () => ReactNode) {
  return {
    onPointerEnter: (e: React.PointerEvent) => showTip(e.currentTarget, content()),
    onPointerLeave: () => hideTip(),
  };
}

export function TooltipLayer() {
  const [tip, setTip] = useState<TipState | null>(current);
  useEffect(() => {
    subs.add(setTip);
    const onScroll = () => {
      current = null;
      setTip(null);
    };
    window.addEventListener('wheel', onScroll, { passive: true });
    return () => {
      subs.delete(setTip);
      window.removeEventListener('wheel', onScroll);
    };
  }, []);
  if (!tip) return null;
  const { rect } = tip;
  const W = 260;
  const vw = window.innerWidth;
  const left = Math.max(8, Math.min(vw - W - 8, rect.left + rect.width / 2 - W / 2));
  const above = rect.top > 200;
  const style: React.CSSProperties = above
    ? { left, bottom: window.innerHeight - rect.top + 10, width: W }
    : { left, top: rect.bottom + 10, width: W };
  return (
    <div className="tooltip panel notch" style={style}>
      {tip.content}
    </div>
  );
}
