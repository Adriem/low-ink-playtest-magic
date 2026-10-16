import { fitFontSizeInXY, getFontSize, getMultilineTextHeight } from '../../common/canvasText';
import { fillMultilineText } from '../../common/oracleTextRenderer';
import { FONT_FAMILY, ORACLE_FONT_SIZE } from '../config';
import { REALISTIC_PALETTE } from '../palette';

/**
 * Draw the card's rules text in the given area, shrinking it until it fits.
 * `y` is the baseline of the first line.
 */
export const drawOracleText = (
  ctx: CanvasRenderingContext2D,
  {
    cardOracleText,
    x,
    y,
    width,
    height,
  }: { cardOracleText: string; x: number; y: number; width: number; height: number },
) => {
  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(ctx, cardOracleText.split('\n'), width, height), x, y);
};

interface TextArea {
  text: string;
  width: number;
  height: number;
  padding?: number;
  fontSize?: number;
}

/**
 * Font size at which rules text fits inside an area minus its padding.
 */
export const getFittingFontSize = (
  ctx: CanvasRenderingContext2D,
  { text, width, height, padding = 0, fontSize = ORACLE_FONT_SIZE }: TextArea,
): number => {
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  fitFontSizeInXY(ctx, text.split('\n'), width, height - padding * 2);
  return getFontSize(ctx);
};

/**
 * Draw rules text inside an area, starting at the given font size and
 * shrinking it until it fits within the area minus its padding, either at the
 * top of the area or centered in it.
 */
export const drawTextInArea = (
  ctx: CanvasRenderingContext2D,
  {
    text,
    x,
    y,
    width,
    height,
    padding = 0,
    align = 'center',
    fontSize = ORACLE_FONT_SIZE,
  }: TextArea & { x: number; y: number; align?: 'top' | 'center' },
) => {
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.fillStyle = REALISTIC_PALETTE.TEXT;
  ctx.textAlign = 'start';

  const lines = fitFontSizeInXY(ctx, text.split('\n'), width, height - padding * 2);
  const { fontBoundingBoxAscent: ascent } = ctx.measureText('');
  const textHeight = getMultilineTextHeight(ctx, lines);
  const textTop = align === 'top' ? y + padding : y + (height - textHeight) / 2;

  fillMultilineText(ctx, lines, x, textTop + ascent);
};
