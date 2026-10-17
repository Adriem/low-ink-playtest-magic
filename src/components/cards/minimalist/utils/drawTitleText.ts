import { getFontSize } from '../../common/canvasText';
import { fillMultilineText } from '../../common/oracleTextRenderer';
import { fitTextInTwoLines } from './fitTextInTwoLines';
import { DISPLAY_FONT_FAMILY } from '../config';
import { MINIMALIST_PALETTE } from '../palette';

// Titles are positioned for this font size; titles with a bigger font are
// moved down by the difference so they don't overflow the top of the card
const TITLE_REFERENCE_FONT_SIZE = 34;

/**
 * Draw a card title in up to two lines, shrinking the font until it fits. The
 * first line is usually shorter, to leave room for the mana cost.
 */
export const drawTitleText = (
  ctx: CanvasRenderingContext2D,
  {
    text,
    x,
    y,
    fontSize,
    line1MaxWidth,
    line2MaxWidth,
    maxHeight,
  }: {
    text: string;
    x: number;
    y: number;
    fontSize: number;
    line1MaxWidth: number;
    line2MaxWidth: number;
    maxHeight: number;
  },
) => {
  ctx.font = `bold ${fontSize}px ${DISPLAY_FONT_FAMILY}`;
  ctx.fillStyle = MINIMALIST_PALETTE.TEXT;
  ctx.textAlign = 'start';

  const titleLines = fitTextInTwoLines(ctx, { text, line1MaxWidth, line2MaxWidth, maxHeight });

  const currentFontSize = getFontSize(ctx);
  const compensatedY = Math.max(y, y - (TITLE_REFERENCE_FONT_SIZE - currentFontSize));
  fillMultilineText(
    ctx,
    titleLines.map((text) => [{ text, format: 'regular' as const }]),
    x,
    compensatedY,
  );
};
