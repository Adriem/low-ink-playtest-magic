import { drawRectangle, drawRoundedBox, type Box } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { InkColors, type ColorIdentity } from '../../../utils/colors';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS } from '../config';

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
  cardColorIdentity,
  shape,
  flatSide = null,
  innerHeightAdjustment = 0,
}: { x: number, y: number, width: number, height: number, cardColorIdentity?: ColorIdentity, shape: 'capsule' | 'rectangle', flatSide?: 'left' | 'right' | null, innerHeightAdjustment?: number }): Box => {
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
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    flatSide,
  });
  drawShape(ctx, {
    ...inner,
    lineWidth: shape === 'capsule' ? CAPSULE_INNER_STROKE : PINLINE_THICKNESS,
    strokeStyle: InkColors.LINE,
    fillStyle: InkColors.PAPER,
    flatSide,
  });

  return inner;
};
