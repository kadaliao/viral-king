import type { SpriteMap } from '../types';
import { CARD_SPRITES } from './cards';
import { ICON_SPRITES } from './icons';

export { CARD_SPRITES, ICON_SPRITES };

export const ALL_SPRITES: SpriteMap = {
  ...CARD_SPRITES,
  ...ICON_SPRITES,
};
