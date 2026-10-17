import type { InkLevel } from '../styles';
import { get2dContext } from './canvasRendering';
import type { CanvasPaint } from './canvasShapes';

/** Opacity of the ink fills of the boxes (e.g. title and type), by ink level */
const INK_FILL_OPACITY = { medium: 0.5, splurge: 0.35 };
/** Opacity of the light ink fill of the text boxes (e.g. oracle and stats), only on splurge */
const LIGHT_INK_FILL_OPACITY = 0.15;

/** Space between the centers of the dots of the medium ink level, and their radius */
const DOT_SPACING = 4;
const DOT_RADIUS = 1;

/** How strongly a box is filled: regular for the title and type boxes, light for the text boxes */
export type InkFillStrength = 'regular' | 'light';

/** Fill of a box at an ink level, and the opacity to draw it at over the box's background */
export interface InkFill {
  style: CanvasPaint;
  opacity: number;
}

/**
 * Fill style for a single color, or for two colors a horizontal gradient
 * across the canvas from the first one to the second.
 */
export const getFillStyle = (
  ctx: CanvasRenderingContext2D,
  colors: readonly [string] | readonly [string, string],
): string | CanvasGradient => {
  if (colors.length === 1) return colors[0];

  const [startColor, endColor] = colors;
  const gradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
  gradient.addColorStop(0.4, startColor);
  gradient.addColorStop(0.6, endColor);
  return gradient;
};

/**
 * Fill for a box at an ink level, to draw over the box's background. Regular
 * fills are nothing on `low`, a pattern of dots in the colors (or the
 * gradient between them) on `medium`, and the colors on `splurge`. Light fills
 * are only on `splurge`, as the colors at a lower opacity.
 */
export const getInkFill = (
  ctx: CanvasRenderingContext2D,
  colors: readonly [string] | readonly [string, string],
  inkLevel: InkLevel,
  strength: InkFillStrength = 'regular',
): InkFill | null => {
  if (inkLevel === 'low') return null;
  if (strength === 'light') {
    return inkLevel === 'splurge' ? { style: getFillStyle(ctx, colors), opacity: LIGHT_INK_FILL_OPACITY } : null;
  }
  if (inkLevel === 'splurge') return { style: getFillStyle(ctx, colors), opacity: INK_FILL_OPACITY.splurge };

  const dots = ctx.createPattern(getColoredDots(ctx, colors), 'no-repeat');
  return dots && { style: dots, opacity: INK_FILL_OPACITY.medium };
};

/**
 * A canvas as big as the context's, covered with dots in the colors, so a
 * pattern made from it lines up with the gradient of the colors.
 */
const getColoredDots = (ctx: CanvasRenderingContext2D, colors: readonly [string] | readonly [string, string]) => {
  const { width, height } = ctx.canvas;
  const dots = document.createElement('canvas');
  dots.width = width;
  dots.height = height;

  const dotsCtx = get2dContext(dots);
  dotsCtx.fillStyle = getFillStyle(dotsCtx, colors);
  dotsCtx.fillRect(0, 0, width, height);
  // Keep the colors only where there are dots
  dotsCtx.globalCompositeOperation = 'destination-in';
  dotsCtx.fillStyle = dotsCtx.createPattern(getDotTile(), 'repeat') ?? 'transparent';
  dotsCtx.fillRect(0, 0, width, height);

  return dots;
};

/**
 * A tile of the dot pattern, with the dots of every other row shifted half a
 * step, like a halftone.
 */
const getDotTile = () => {
  const tile = document.createElement('canvas');
  tile.width = DOT_SPACING;
  tile.height = DOT_SPACING * 2;

  const tileCtx = get2dContext(tile);
  tileCtx.fillStyle = 'black';
  for (const [x, y] of [
    [DOT_SPACING / 2, DOT_SPACING / 2],
    [0, DOT_SPACING * 1.5],
    [DOT_SPACING, DOT_SPACING * 1.5],
  ]) {
    tileCtx.beginPath();
    tileCtx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI);
    tileCtx.fill();
  }

  return tile;
};

/**
 * Draw an ink level fill, at its opacity.
 */
export const drawInkFill = (ctx: CanvasRenderingContext2D, { opacity }: InkFill, draw: () => void) => {
  ctx.save();
  ctx.globalAlpha = opacity;
  draw();
  ctx.restore();
};
