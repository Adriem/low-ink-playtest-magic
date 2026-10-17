import type { InkLevel } from '../styles';
import { get2dContext } from './canvasRendering';
import type { CanvasPaint } from './canvasShapes';

/** Opacity of the fills of the medium and splurge ink levels */
const INK_FILL_OPACITY = 0.5;

/** Space between the centers of the dots of the medium ink level, and their radius */
const DOT_SPACING = 4;
const DOT_RADIUS = 1;

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
 * Fill style for a box at an ink level: nothing on `low`, a pattern of dots in
 * the colors (or the gradient between them) on `medium`, and the colors on
 * `splurge`. Meant to be drawn at half opacity over the box's background.
 */
export const getInkFillStyle = (
  ctx: CanvasRenderingContext2D,
  colors: readonly [string] | readonly [string, string],
  inkLevel: InkLevel,
): CanvasPaint | null => {
  if (inkLevel === 'low') return null;
  if (inkLevel === 'splurge') return getFillStyle(ctx, colors);

  return ctx.createPattern(getColoredDots(ctx, colors), 'no-repeat');
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
export const drawInkFill = (ctx: CanvasRenderingContext2D, draw: () => void) => {
  ctx.save();
  ctx.globalAlpha = INK_FILL_OPACITY;
  draw();
  ctx.restore();
};
