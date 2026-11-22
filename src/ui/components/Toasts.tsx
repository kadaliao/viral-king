import { useApp } from '../../state/store';

export function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div className="toasts">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.kind} notch`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}
