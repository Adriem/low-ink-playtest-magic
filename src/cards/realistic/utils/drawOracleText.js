import { fillMultilineText, fitFontSizeInXY, getMultilineTextHeight } from '../../../utils/canvasText';
import { InkColors } from '../../../utils/colors';
import { FONT_FAMILY, ORACLE_FONT_SIZE } from '../config';

/**
 * Draw the card's rules text in the given area, shrinking it until it fits.
 * `y` is the baseline of the first line.
 */
export const drawOracleText = (ctx, { cardOracleText, x, y, width, height }) => {
  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    cardOracleText.split('\n'),
    width,
    height,
  ), x, y);
};

/**
 * Draw rules text inside an area, shrinking it until it fits within the area
 * minus its padding, either at the top of the area or centered in it.
 */
export const drawTextInArea = (ctx, { text, x, y, width, height, padding = 0, align = 'center' }) => {
  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = InkColors.TEXT;
  ctx.textAlign = 'start';

  const lines = fitFontSizeInXY(ctx, text.split('\n'), width, height - padding * 2);
  const { fontBoundingBoxAscent: ascent } = ctx.measureText('');
  const textHeight = getMultilineTextHeight(ctx, lines);
  const textTop = align === 'top'
    ? y + padding
    : y + (height - textHeight) / 2;

  fillMultilineText(ctx, lines, x, textTop + ascent);
};
