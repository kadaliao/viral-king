import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { sound } from '../../audio/sfx';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'pink' | 'green' | 'yellow' | 'cyan' | 'ghost' | 'red';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  silent?: boolean;
}

export function Button({ variant = 'pink', size = 'md', className, children, onClick, onMouseEnter, silent, ...rest }: Props) {
  return (
    <button
      type="button"
      className={`btn btn-${variant} btn-${size} ${className ?? ''}`}
      onMouseEnter={(e) => {
        if (!rest.disabled) sound.play('hover');
        onMouseEnter?.(e);
      }}
      onClick={(e) => {
        if (!silent) sound.play('click');
        onClick?.(e);
      }}
      {...rest}
    >
      <span className="btn-inner">{children}</span>
    </button>
  );
}
