import type { Orientation } from '../../../../domain/cards';
import type { Palette } from '../../../../domain/colorTreatment';
import {
  drawRectangle,
  drawRoundedBox,
  traceRectangle,
  type Box,
  type CanvasPaint,
  type CornerRadius,
} from '../../common/canvasShapes';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS, CARD_LAYOUTS } from '../config';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import { drawInkFill, getFillStyle, getInkFill, type InkFill, type InkFillStrength } from '../../common/canvasStyles';
import type { InkLevel } from '../../styles';

/** Radii of a rectangle's top and bottom corners, circular or elliptical */
export interface CornerRadii {
  top: CornerRadius;
  bottom: CornerRadius;
}

/**
 * Draw a box in the card's colors with a white inner box and a pinline, the
 * frame shared by all the boxes of the realistic style.
 *
 * @param options.shape - Capsules (title, type and
 *   stats boxes) have rounded ends and a thin inner stroke; rectangles (art
 *   and oracle boxes) have a pinline-thick inner stroke
 * @param options.flatSide - Side with no colored
 *   border, for subcard boxes that take half the card
 * @param options.leftPinlineWidth - Width of the colored border on the left,
 *   wider than the others e.g. for the loyalty costs of planeswalkers
 * @param options.bottomPinlineWidth - Width of the colored border at the bottom,
 *   thicker than the others e.g. for planeswalkers' oracle boxes
 * @param options.cornerRadii - Radii of the corners of rectangles: of the
 *   colored box, and of the inner box, at the top and the bottom. With
 *   regular pinlines all around, the pinline is also drawn around the inner
 *   box, so it's at least as wide as the other boxes' everywhere
 * @param options.innerHeightAdjustment - Fine-tunes the inner box
 *   height
 * @param options.inkLevel - Fills the inner box with the card's colors above
 *   the low ink level
 * @param options.inkFillStrength - How strongly the ink level fills the inner
 *   box: regular for the title and type boxes, light for the text boxes (oracle
 *   and stats)
 * @returns The inner box
 */
export const drawFramedBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape,
    flatSide = null,
    leftPinlineWidth = PINLINE_THICKNESS,
    bottomPinlineWidth = PINLINE_THICKNESS,
    cornerRadii,
    innerHeightAdjustment = 0,
    inkLevel = 'low',
    inkFillStrength = 'regular',
    orientation = 'portrait',
  }: {
    palette: Palette;
    x: number;
    y: number;
    width: number;
    height: number;
    cardColorTreatment: CardColorTreatment;
    shape: 'capsule' | 'rectangle';
    flatSide?: 'left' | 'right' | null;
    leftPinlineWidth?: number;
    bottomPinlineWidth?: number;
    cornerRadii?: { outer: CornerRadii; inner: CornerRadii };
    innerHeightAdjustment?: number;
    inkLevel?: InkLevel;
    inkFillStrength?: InkFillStrength;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
  },
): Box => {
  const drawShape = shape === 'capsule' ? drawRoundedBox : drawRectangle;

  const innerLeftPad = flatSide === 'left' ? 0 : leftPinlineWidth;
  const innerRightPad = flatSide === 'right' ? 0 : PINLINE_THICKNESS;
  const inner = {
    x: x + innerLeftPad,
    y: y + PINLINE_THICKNESS,
    width: width - innerLeftPad - innerRightPad,
    height: height - PINLINE_THICKNESS - bottomPinlineWidth + innerHeightAdjustment,
  };

  // Gradients and dot patterns span the whole card, whichever way it's drawn
  const cardSize = CARD_LAYOUTS[orientation];
  const pinlineStyle = getFillStyle(ctx, getPaletteColors(cardColorTreatment.pinlineColors, palette), cardSize.width);
  const inkFill = getInkFill(
    ctx,
    getPaletteColors(cardColorTreatment.backgroundColors, palette),
    inkLevel,
    inkFillStrength,
    cardSize,
  );

  const hasRegularPinlines = leftPinlineWidth === PINLINE_THICKNESS && bottomPinlineWidth === PINLINE_THICKNESS;
  if (shape === 'rectangle' && cornerRadii && hasRegularPinlines) {
    drawRoundedFramedBox(ctx, {
      outer: { x, y, width, height },
      outerRadii: cornerRadii.outer,
      inner,
      innerRadii: cornerRadii.inner,
      pinlineStyle,
      inkFill,
      palette,
    });
    return inner;
  }

  drawShape(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: pinlineStyle,
    flatSide,
    ...toBorderRadii(cornerRadii?.outer),
  });
  const innerLine = {
    ...inner,
    lineWidth: shape === 'capsule' ? CAPSULE_INNER_STROKE : PINLINE_THICKNESS,
    strokeStyle: palette.LINE,
    flatSide,
    ...toBorderRadii(cornerRadii?.inner),
  };
  drawShape(ctx, { ...innerLine, fillStyle: palette.PAPER });

  if (inkFill) {
    // Filled where the inner box is white, so the fill doesn't cover the inner line
    drawInkFill(ctx, inkFill, () => drawShape(ctx, { ...innerLine, strokeStyle: null, fillStyle: inkFill.style }));
  }
  return inner;
};

/**
 * The corner radii of a rectangle, as the options of the shapes that draw it.
 */
const toBorderRadii = (radii?: CornerRadii) => {
  return radii ? { borderRadiusTop: radii.top, borderRadiusBottom: radii.bottom } : {};
};

/**
 * Draw a framed box with rounded corners and regular pinlines. Curves shrunk
 * or grown by a width aren't parallel to the original ones when they're
 * elliptical, so besides its outer shape, its pinline is a stroke around its
 * inner box, and its inner line one inside it, which are at least as wide as
 * the other boxes' everywhere.
 */
const drawRoundedFramedBox = (
  ctx: CanvasRenderingContext2D,
  {
    outer,
    outerRadii,
    inner,
    innerRadii,
    pinlineStyle,
    inkFill,
    palette,
  }: {
    outer: Box;
    outerRadii: CornerRadii;
    inner: Box;
    innerRadii: CornerRadii;
    pinlineStyle: CanvasPaint;
    inkFill: InkFill | null;
    palette: Palette;
  },
) => {
  traceRectangle(ctx, outer, outerRadii);
  ctx.fillStyle = pinlineStyle;
  ctx.fill();

  traceRectangle(ctx, inner, innerRadii);
  ctx.fillStyle = pinlineStyle;
  ctx.strokeStyle = pinlineStyle;
  ctx.lineWidth = PINLINE_THICKNESS * 2;
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = palette.PAPER;
  ctx.fill();
  if (inkFill) {
    drawInkFill(ctx, inkFill, () => {
      traceRectangle(ctx, inner, innerRadii);
      ctx.fillStyle = inkFill.style;
      ctx.fill();
    });
  }

  drawInnerLine(ctx, inner, innerRadii, palette.LINE);
};

/**
 * Draw the line just inside the outline of a box with rounded corners, as
 * wide as the inner lines of square boxes (half the pinline).
 */
export const drawInnerLine = (ctx: CanvasRenderingContext2D, box: Box, radii: CornerRadii, color: string) => {
  ctx.save();
  traceRectangle(ctx, box, radii);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = PINLINE_THICKNESS;
  ctx.stroke();
  ctx.restore();
};
