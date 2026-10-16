import { drawRoundedBox } from '../../common/canvasShapes';
import { fitFontSizeInX, getFontSize } from '../../common/canvasText';
import { PINLINE_THICKNESS, TEXT_FONT_FAMILY } from '../config';
import { MINIMALIST_PALETTE } from '../palette';
import { getPaletteColors, type ColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';

const TYPELINE_BOX_PADDING_X = 15;
const TYPELINE_INNER_LINE_WIDTH = 3;
// Baseline of the text, as a ratio of the type line height
const TYPELINE_BASELINE_RATIO = 0.66;
// Shrunk text moves up by this ratio of the font size reduction, to stay centered
const TYPELINE_SHRINK_BASELINE_RATIO = 0.33;

/**
 * Draw a type line: a capsule in the card's colors with the type in capitals.
 *
 * @param options.flatSide - Side without rounded
 *   corners, for the type lines of subcards that take half the card
 */
export const drawTypeLine = (ctx: CanvasRenderingContext2D, {
  cardType = '',
  cardColorTreatment,
  x,
  y,
  width,
  height,
  fontSize,
  flatSide = null,
}: { cardType?: string, cardColorTreatment: ColorTreatment, x: number, y: number, width: number, height: number, fontSize: number, flatSide?: 'left' | 'right' | null }) => {
  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment, MINIMALIST_PALETTE)),
    flatSide,
  });

  drawRoundedBox(ctx, {
    x: x + PINLINE_THICKNESS,
    y: y + PINLINE_THICKNESS,
    width: width - PINLINE_THICKNESS * 2,
    height: height - PINLINE_THICKNESS * 2 - TYPELINE_INNER_LINE_WIDTH,
    lineWidth: TYPELINE_INNER_LINE_WIDTH,
    strokeStyle: MINIMALIST_PALETTE.PAPER,
    fillStyle: MINIMALIST_PALETTE.PAPER,
    flatSide,
  });

  ctx.font = `bold ${fontSize}px ${TEXT_FONT_FAMILY}`;

  // Type lines on the right half (flat left side) start one pinline further in
  const textX = x + (flatSide === 'left' ? PINLINE_THICKNESS : 0) + TYPELINE_BOX_PADDING_X;
  const textWidth = width - TYPELINE_BOX_PADDING_X * 2;

  ctx.fillStyle = cardColorTreatment === 'colorless' ? MINIMALIST_PALETTE.COLORLESS_TYPELINE_TEXT : MINIMALIST_PALETTE.TEXT;
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textWidth);
  const textY = y + height * TYPELINE_BASELINE_RATIO - (fontSize - getFontSize(ctx)) * TYPELINE_SHRINK_BASELINE_RATIO;
  ctx.fillText(cardType.toUpperCase(), textX, textY);
};
