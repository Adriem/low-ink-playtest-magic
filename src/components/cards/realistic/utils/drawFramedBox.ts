import { drawRectangle, drawRoundedBox, type Box } from '../../common/canvasShapes';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS } from '../config';
import { REALISTIC_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';

/**
 * Draw a box in the card's colors with a white inner box and a pinline, the
 * frame shared by all the boxes of the realistic style.
 *
 * @param options.shape - Capsules (title, type and
 *   stats boxes) have rounded ends and a thin inner stroke; rectangles (art
 *   and oracle boxes) have a pinline-thick inner stroke
 * @param options.flatSide - Side with no colored
 *   border, for subcard boxes that take half the card
 * @param options.innerHeightAdjustment - Fine-tunes the inner box
 *   height
 * @returns The inner box
 */
export const drawFramedBox = (ctx: CanvasRenderingContext2D, {
  x,
  y,
  width,
  height,
  cardColorTreatment,
  shape,
  flatSide = null,
  innerHeightAdjustment = 0,
}: { x: number, y: number, width: number, height: number, cardColorTreatment: ColorTreatment, shape: 'capsule' | 'rectangle', flatSide?: 'left' | 'right' | null, innerHeightAdjustment?: number }): Box => {
  const drawShape = shape === 'capsule' ? drawRoundedBox : drawRectangle;

  const innerLeftPad = flatSide === 'left' ? 0 : PINLINE_THICKNESS;
  const innerRightPad = flatSide === 'right' ? 0 : PINLINE_THICKNESS;
  const inner = {
    x: x + innerLeftPad,
    y: y + PINLINE_THICKNESS,
    width: width - innerLeftPad - innerRightPad,
    height: height - PINLINE_THICKNESS * 2 + innerHeightAdjustment,
  };

  drawShape(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment, REALISTIC_PALETTE)),
    flatSide,
  });
  drawShape(ctx, {
    ...inner,
    lineWidth: shape === 'capsule' ? CAPSULE_INNER_STROKE : PINLINE_THICKNESS,
    strokeStyle: REALISTIC_PALETTE.LINE,
    fillStyle: REALISTIC_PALETTE.PAPER,
    flatSide,
  });

  return inner;
};
