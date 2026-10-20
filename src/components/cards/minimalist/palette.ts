import type { Palette } from '../../../domain/colorTreatment';

/** A palette, plus colors of its own like the colorless type line text */
export interface MinimalistPalette extends Palette {
  COLORLESS_TYPELINE_TEXT: string;
}

export const MINIMALIST_PALETTE: MinimalistPalette = {
  TEXT: '#000000',
  LINE: '#000000',
  PAPER: '#ffffff',

  // Color treatments
  COLORLESS: '#d2d2d2',
  WHITE: '#c0af94',
  BLUE: '#2985e1',
  BLACK: '#695c72',
  RED: '#d30e0e',
  GREEN: '#06932d',
  GOLD: '#efa400',
  ARTIFACT: '#a0adb9',
  LAND: '#8f785a',

  // Text of the type line of colorless cards, on their light gray box
  COLORLESS_TYPELINE_TEXT: '#808080',
};
