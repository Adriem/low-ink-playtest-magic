import { CardFace, isArtifactType, isLandType } from './cards';
import { ColorPair, ColorSymbol, normalizeColors } from './colors';

export type PaletteColor =
  | 'COLORLESS'
  | 'WHITE'
  | 'BLUE'
  | 'BLACK'
  | 'RED'
  | 'GREEN'
  | 'MULTI'
  | 'ARTIFACT'
  | 'LAND'
  | 'TEXT'
  | 'LINE'
  | 'PAPER';
export type Palette = { [key in PaletteColor]: string };

type ColorlessTreatment = 'artifact' | 'land' | 'colorless';
type MonoColorTreatment = 'white' | 'blue' | 'black' | 'red' | 'green';
type ColorPairTreatment =
  | 'white-blue'
  | 'blue-black'
  | 'black-red'
  | 'red-green'
  | 'green-white'
  | 'white-black'
  | 'blue-red'
  | 'black-green'
  | 'red-white'
  | 'green-blue';

export type ColorTreatment = ColorlessTreatment | MonoColorTreatment | ColorPairTreatment | 'multi';

const SINGLE_COLOR_TREATMENTS = {
  W: 'white',
  U: 'blue',
  B: 'black',
  R: 'red',
  G: 'green',
} as const satisfies { [key in ColorSymbol]: MonoColorTreatment };

const COLOR_PAIR_TREATMENTS = {
  WU: 'white-blue',
  UB: 'blue-black',
  BR: 'black-red',
  RG: 'red-green',
  WG: 'green-white',
  WB: 'white-black',
  UR: 'blue-red',
  BG: 'black-green',
  RW: 'red-white',
  UG: 'green-blue',
} as const satisfies { [key in ColorPair]: ColorPairTreatment };

export const getColorTreatment = (cardFace: CardFace): ColorTreatment => {
  const colors = normalizeColors(cardFace.colors);

  if (colors.length === 0) {
    if (isArtifactType(cardFace)) return 'artifact';
    if (isLandType(cardFace)) return 'land';
    return 'colorless';
  }

  if (colors.length === 1) return SINGLE_COLOR_TREATMENTS[colors[0]];
  if (colors.length === 2) return COLOR_PAIR_TREATMENTS[colors.join('') as ColorPair];

  return 'multi';
};

/**
 * Colors of a palette for a color treatment: one color, or both colors of a
 * color pair, in the order of the pair.
 */
export const getPaletteColors = (colorTreatment: ColorTreatment, palette: Palette): [string] | [string, string] => {
  if (isColorPairTreatment(colorTreatment)) {
    const [firstColor, secondColor] = splitColorPairTreatment(colorTreatment);

    return [palette[firstColor.toUpperCase() as PaletteColor], palette[secondColor.toUpperCase() as PaletteColor]];
  }

  return [palette[colorTreatment.toUpperCase() as PaletteColor]];
};

const isColorPairTreatment = (treatment: ColorTreatment): treatment is ColorPairTreatment => {
  return Object.values(COLOR_PAIR_TREATMENTS).includes(treatment as ColorPairTreatment);
};

const splitColorPairTreatment = (treatment: ColorPairTreatment): [MonoColorTreatment, MonoColorTreatment] => {
  return treatment.split('-') as [MonoColorTreatment, MonoColorTreatment];
};
