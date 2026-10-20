import type { CardRenderProps, CustomPalette, InkLevel } from '../styles';
import { get2dContext } from './canvasRendering';
import type { CanvasPaint } from './canvasShapes';

/** Opacity of the ink fills of the boxes (e.g. title and type), by ink level */
const INK_FILL_OPACITY = { medium: 0.5, high: 0.35 };
/** Opacity of the light ink fill of the text boxes (e.g. oracle and stats), from the high ink level */
const LIGHT_INK_FILL_OPACITY = 0.15;

/** A color like `#d30e0e` */
const HEX_COLOR_REGEX = /^#[0-9a-f]{6}$/i;

/** Space between the centers of the dots of the medium ink level, and their radius */
const DOT_SPACING = 4;
const DOT_RADIUS = 1;

/**
 * Scale canvases are shown at, when drawn smaller or bigger elsewhere (e.g.
 * the faces of split cards), so their dot patterns look the same on any card.
 */
const displayScales = new WeakMap<HTMLCanvasElement, number>();

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
 * gradient between them) on `medium`, and the colors from `high`. Light fills
 * are only from `high`, as the colors at a lower opacity.
 */
export const getInkFill = (
  ctx: CanvasRenderingContext2D,
  colors: readonly [string] | readonly [string, string],
  inkLevel: InkLevel,
  strength: InkFillStrength = 'regular',
): InkFill | null => {
  if (inkLevel === 'low') return null;
  // Splurge only adds a black border to the high ink level
  const isHigh = inkLevel === 'high' || inkLevel === 'splurge';
  if (strength === 'light') {
    return isHigh ? { style: getFillStyle(ctx, colors), opacity: LIGHT_INK_FILL_OPACITY } : null;
  }
  if (isHigh) return { style: getFillStyle(ctx, colors), opacity: INK_FILL_OPACITY.high };

  const dots = ctx.createPattern(getColoredDots(ctx, colors), 'no-repeat');
  return dots && { style: dots, opacity: INK_FILL_OPACITY.medium };
};

/**
 * Whether a card has a black border: when asked, or on the splurge ink level.
 */
export const hasBlackBorder = ({
  blackBordered = false,
  inkLevel,
}: Pick<CardRenderProps, 'blackBordered' | 'inkLevel'>): boolean => {
  return blackBordered || inkLevel === 'splurge';
};

/**
 * Set the scale a canvas is shown at, when it's drawn smaller or bigger
 * elsewhere (e.g. the faces of split cards, drawn into half a card), so the
 * dot patterns drawn on it look the same as on any card.
 */
export const setDisplayScale = (canvas: HTMLCanvasElement, scale: number) => {
  displayScales.set(canvas, scale);
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
  const dotPattern = dotsCtx.createPattern(getDotTile(), 'repeat');
  // The dots are as big as the canvas is shown smaller, so they look the same
  const displayScale = displayScales.get(ctx.canvas) ?? 1;
  if (displayScale !== 1) dotPattern?.setTransform(new DOMMatrix().scale(1 / displayScale));
  dotsCtx.fillStyle = dotPattern ?? 'transparent';
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

/**
 * A palette with the custom colors that replace its defaults: those of its
 * colors that are valid hex colors (e.g. `#d30e0e`).
 */
export const resolvePalette = <P extends object>(defaults: P, customPalette: CustomPalette = {}): P => {
  const palette = { ...defaults };
  for (const name of Object.keys(defaults) as (keyof P & string)[]) {
    const color = customPalette[name];
    if (color != null && HEX_COLOR_REGEX.test(color)) palette[name] = color as P[keyof P & string];
  }
  return palette;
};
