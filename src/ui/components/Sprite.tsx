import { memo } from 'react';
import { ALL_SPRITES } from '../../art/sprites';
import { spriteUrl } from '../../art/render';

interface Props {
  id: string;
  scale?: number;
  className?: string;
  tint?: string;
  title?: string;
}

/** Pixel sprite rendered as a crisp, nearest-neighbour scaled image. */
export const Sprite = memo(function Sprite({ id, scale = 3, className, tint, title }: Props) {
  const s = ALL_SPRITES[id];
  if (!s) {
    return <span className={`sprite sprite-missing ${className ?? ''}`} style={{ width: 16 * scale, height: 16 * scale }} />;
  }
  return (
    <img
      className={`sprite ${className ?? ''}`}
      src={spriteUrl(id, s, tint)}
      width={s.w * scale}
      height={s.h * scale}
      alt={title ?? ''}
      title={title}
      draggable={false}
    />
  );
});
