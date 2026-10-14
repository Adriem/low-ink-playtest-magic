import { Colors } from './colors';

// Two-color identities are drawn as a horizontal gradient between both colors
const GRADIENT_COLORS = {
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

const SOLID_COLORS = {
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
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} colorIdentity - As returned by `getColorMappings`
 * @param {object} [options]
 * @param {object} [options.palette] - e.g. `Colors` or `MinimalistColors`
 * @returns {string|CanvasGradient}
 */
export const getColorIdentityStyle = (ctx, colorIdentity, { palette = Colors } = {}) => {
  const gradientColors = GRADIENT_COLORS[colorIdentity];

  if (gradientColors) {
    const [startColor, endColor] = gradientColors;
    const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
    gradient.addColorStop(.4, palette[startColor]);
    gradient.addColorStop(.6, palette[endColor]);
    return gradient;
  }

  return palette[SOLID_COLORS[colorIdentity] ?? 'COLORLESS'];
};
