import { Colors, type ColorIdentity, type Palette, type PaletteColor } from './colors';

// Two-color identities are drawn as a horizontal gradient between both colors
const GRADIENT_COLORS: Partial<Record<ColorIdentity, [PaletteColor, PaletteColor]>> = {
  gruul: ['RED', 'GREEN'],
  izzet: ['BLUE', 'RED'],
  rakdos: ['BLACK', 'RED'],
  orzhov: ['WHITE', 'BLACK'],
  golgari: ['BLACK', 'GREEN'],
  azorius: ['WHITE', 'BLUE'],
  simic: ['GREEN', 'BLUE'],
  selesnya: ['GREEN', 'WHITE'],
  dimir: ['BLUE', 'BLACK'],
  boros: ['RED', 'WHITE'],
};

const SOLID_COLORS: Partial<Record<ColorIdentity, PaletteColor>> = {
  white: 'WHITE',
  blue: 'BLUE',
  black: 'BLACK',
  red: 'RED',
  green: 'GREEN',
  artifact: 'ARTIFACT',
  land: 'LAND',
  colorless: 'COLORLESS',
  multi: 'MULTI',
};

/**
 * Fill style for a color identity: a solid color, or a gradient for two-color
 * identities. Unknown identities are colorless.
 *
 * @param colorIdentity - As returned by `getColorMappings`
 * @param options.palette - e.g. `Colors` or `MinimalistColors`
 */
export const getColorIdentityStyle = (
  ctx: CanvasRenderingContext2D,
  colorIdentity: ColorIdentity | undefined,
  { palette = Colors }: { palette?: Palette } = {},
): string | CanvasGradient => {
  const gradientColors = colorIdentity ? GRADIENT_COLORS[colorIdentity] : undefined;

  if (gradientColors) {
    const [startColor, endColor] = gradientColors;
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(.4, palette[startColor]);
    gradient.addColorStop(.6, palette[endColor]);
    return gradient;
  }

  return palette[(colorIdentity && SOLID_COLORS[colorIdentity]) || 'COLORLESS'];
};
