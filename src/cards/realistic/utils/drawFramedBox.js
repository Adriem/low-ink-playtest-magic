import { drawRectangle, drawRoundedBox } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { InkColors } from '../../../utils/colors';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS } from '../config';

/**
 * Draw a box in the card's colors with a white inner box and a pinline, the
 * frame shared by all the boxes of the realistic style.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} options
 * @param {number} options.x
 * @param {number} options.y
 * @param {number} options.width
 * @param {number} options.height
 * @param {string} options.cardColorIdentity
 * @param {'capsule'|'rectangle'} options.shape - Capsules (title, type and
 *   stats boxes) have rounded ends and a thin inner stroke; rectangles (art
 *   and oracle boxes) have a pinline-thick inner stroke
 * @param {'left'|'right'|null} [options.flatSide] - Side with no colored
 *   border, for subcard boxes that take half the card
 * @param {number} [options.innerHeightAdjustment] - Fine-tunes the inner box
 *   height
 * @returns {{ x: number, y: number, width: number, height: number }} The inner box
 */
export const drawFramedBox = (ctx, {
  x,
  y,
  width,
  height,
  cardColorIdentity,
  shape,
  flatSide = null,
  innerHeightAdjustment = 0,
}) => {
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
