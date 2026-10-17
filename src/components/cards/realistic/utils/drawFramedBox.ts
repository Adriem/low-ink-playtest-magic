import { drawRectangle, drawRoundedBox, type Box } from '../../common/canvasShapes';
import { CAPSULE_INNER_STROKE, PINLINE_THICKNESS } from '../config';
import { REALISTIC_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { drawInkFill, getFillStyle, getInkFill, type InkFillStrength } from '../../common/canvasStyles';
import type { InkLevel } from '../../styles';

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
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape,
    flatSide = null,
    innerHeightAdjustment = 0,
    inkLevel = 'low',
    inkFillStrength = 'regular',
  }: {
    x: number;
    y: number;
    width: number;
    height: number;
    cardColorTreatment: ColorTreatment;
    shape: 'capsule' | 'rectangle';
    flatSide?: 'left' | 'right' | null;
    innerHeightAdjustment?: number;
    inkLevel?: InkLevel;
    inkFillStrength?: InkFillStrength;
  },
): Box => {
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
  const innerLine = {
    ...inner,
    lineWidth: shape === 'capsule' ? CAPSULE_INNER_STROKE : PINLINE_THICKNESS,
    strokeStyle: REALISTIC_PALETTE.LINE,
    flatSide,
  };
  drawShape(ctx, { ...innerLine, fillStyle: REALISTIC_PALETTE.PAPER });

  const inkFill = getInkFill(ctx, getPaletteColors(cardColorTreatment, REALISTIC_PALETTE), inkLevel, inkFillStrength);
  if (inkFill) {
    drawInkFill(ctx, inkFill, () => drawShape(ctx, { ...inner, lineWidth: 0, fillStyle: inkFill.style, flatSide }));
    // The inner line goes over the fill, so it stays as dark
    drawShape(ctx, { ...innerLine, fillStyle: null });
  }

  return inner;
};
