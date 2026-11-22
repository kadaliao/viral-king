import type { SpriteMap } from '../types';
import { CARD_SPRITES } from './cards';
import { ICON_SPRITES } from './icons';
import { ARTIFACT_SPRITES } from './artifacts';
import { BOSS_SPRITES } from './bosses';
import { MISC_SPRITES } from './misc';

export { CARD_SPRITES, ICON_SPRITES, ARTIFACT_SPRITES, BOSS_SPRITES, MISC_SPRITES };

export const ALL_SPRITES: SpriteMap = {
  ...CARD_SPRITES,
  ...ICON_SPRITES,
  ...ARTIFACT_SPRITES,
  ...BOSS_SPRITES,
  ...MISC_SPRITES,
};
