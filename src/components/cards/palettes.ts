import { MINIMALIST_PALETTE } from './minimalist/palette';
import { REALISTIC_PALETTE } from './realistic/palette';
import type { CardStyle } from './styles';
import type { Palette } from '../../domain/colorTreatment';

/**
 * Default palette of each card style, without importing their renderers.
 */
export const DEFAULT_PALETTES: Record<CardStyle, Palette> = {
  realistic: REALISTIC_PALETTE,
  minimalist: MINIMALIST_PALETTE,
};
