import type { Palette } from '../../../domain/colorTreatment';

// A palette, plus colors of its own like the colorless type line text
export const MINIMALIST_PALETTE = {
  TEXT: 'black',
  LINE: 'black',
  PAPER: 'white',

  // Color treatments
  COLORLESS: 'rgb(210, 210, 210)',
  WHITE: 'rgb(192, 175, 148)',
  BLUE: 'rgb(41, 133, 225)',
  BLACK: 'rgb(105, 92, 114)',
  RED: 'rgb(211, 14, 14)',
  GREEN: 'rgb(6, 147, 45)',
  GOLD: 'rgb(239, 164, 0)',
  ARTIFACT: 'rgb(160, 173, 185)',
  LAND: 'rgb(143, 120, 90)',

  // Text of the type line of colorless cards, on their light gray box
  COLORLESS_TYPELINE_TEXT: 'gray',
} as const satisfies Palette & Record<string, string>;
