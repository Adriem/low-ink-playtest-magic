import { fillMultilineText, fitFontSizeInXY } from '../../../utils/canvasText';
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
