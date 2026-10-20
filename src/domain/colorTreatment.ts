import { CardFace, isArtifactType, isLandType } from './cards';
import { ColorPair, ColorSymbol, isColorSymbol, normalizeColors } from './colors';
import { getSymbolValue, splitSymbols } from './symbols';

export type PaletteColor =
  'COLORLESS' | 'WHITE' | 'BLUE' | 'BLACK' | 'RED' | 'GREEN' | 'GOLD' | 'ARTIFACT' | 'LAND' | 'TEXT' | 'LINE' | 'PAPER';
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

export type ColorTreatment = ColorlessTreatment | MonoColorTreatment | ColorPairTreatment | 'gold';

/**
 * Colors of a card: of its pinlines (e.g. borders and the rims of its boxes)
 * and of its background (e.g. the insides of its boxes). Two-color cards are
 * gold, with pinlines in both colors, unless they're hybrid (every colored
 * mana symbol of their cost is a hybrid of both colors), which are in both
 * colors throughout.
 */
export interface CardColorTreatment {
  pinlineColors: ColorTreatment;
  backgroundColors: ColorTreatment;
}

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

/**
 * Colors of a card face's pinlines and background.
 */
export const getCardColorTreatment = (cardFace: CardFace): CardColorTreatment => {
  const treatment = getColorTreatment(cardFace);
  const isGoldPair = isColorPairTreatment(treatment) && !isHybrid(cardFace);

  return { pinlineColors: treatment, backgroundColors: isGoldPair ? 'gold' : treatment };
};

/**
 * Colors of a card face: its color, its pair of colors, or gold for more than
 * two. Colorless faces are artifacts, lands or colorless.
 */
export const getColorTreatment = (cardFace: CardFace): ColorTreatment => {
  const colors = normalizeColors(cardFace.colors);

  if (colors.length === 0) {
    if (isArtifactType(cardFace)) return 'artifact';
    if (isLandType(cardFace)) return 'land';
    return 'colorless';
  }

  if (colors.length === 1) return SINGLE_COLOR_TREATMENTS[colors[0]];
  if (colors.length === 2) return COLOR_PAIR_TREATMENTS[colors.join('') as ColorPair];

  return 'gold';
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

/**
 * Whether a face is hybrid: its cost has colored mana symbols, and every one
 * of them is a hybrid of both its colors (e.g. `{1}{W/G}{W/G}`).
 */
const isHybrid = (cardFace: CardFace): boolean => {
  const colors = normalizeColors(cardFace.colors);
  const symbolColors = splitSymbols(cardFace.manaCost ?? '')
    .map((symbol) => getSymbolValue(symbol).split('/').filter(isColorSymbol))
    .filter((symbolColors) => symbolColors.length > 0);

  return (
    symbolColors.length > 0 &&
    symbolColors.every(
      (symbolColors) => symbolColors.length === 2 && colors.every((color) => symbolColors.includes(color)),
    )
  );
};

const isColorPairTreatment = (treatment: ColorTreatment): treatment is ColorPairTreatment => {
  return Object.values(COLOR_PAIR_TREATMENTS).includes(treatment as ColorPairTreatment);
};

const splitColorPairTreatment = (treatment: ColorPairTreatment): [MonoColorTreatment, MonoColorTreatment] => {
  return treatment.split('-') as [MonoColorTreatment, MonoColorTreatment];
};
