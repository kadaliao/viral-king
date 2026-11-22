import { useEffect, useRef, useState } from 'react';
import { formatNum } from '../../engine/num';

interface Props {
  value: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
  onTick?: () => void;
}

/** Animated number that rolls toward `value` (log-space for huge jumps). */
export function NumberRoll({ value, duration = 350, className, format = formatNum, onTick }: Props) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);
  const shownRef = useRef(value);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    from.current = shownRef.current;
    const a = from.current;
    const b = value;
    if (a === b || duration <= 0) {
      shownRef.current = b;
      setShown(b);
      return;
    }
    const t0 = performance.now();
    const useLog = a > 0 && b > 0 && Math.abs(Math.log10(b) - Math.log10(a)) > 0.5;
    let ticks = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 3);
      const v = useLog ? Math.pow(10, Math.log10(a) + (Math.log10(b) - Math.log10(a)) * e) : a + (b - a) * e;
      const out = t >= 1 ? b : v;
      shownRef.current = out;
      setShown(out);
      if (onTick && ticks++ % 3 === 0) onTick();
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);

  return <span className={className}>{format(Math.round(shown * 100) / 100)}</span>;
}
