import type { ReactNode } from 'react';

interface Props {
  title?: ReactNode;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  wide?: boolean;
}

export function Modal({ title, onClose, children, className, wide }: Props) {
  return (
    <div className="modal-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div className={`modal panel notch ${wide ? 'modal-wide' : ''} ${className ?? ''}`} role="dialog">
        {(title || onClose) && (
          <div className="modal-head">
            <div className="modal-title big glow-pink">{title}</div>
            {onClose && (
              <button className="modal-close" onClick={onClose} aria-label="关闭">
                ×
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
