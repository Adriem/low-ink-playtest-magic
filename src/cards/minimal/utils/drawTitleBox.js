import {
  fillMultilineText,
  getFontSize,
} from '../../../utils/canvasText';
import { calculateManaCostWidth, renderManaCost } from '../../../utils/manaCostRenderer';
import { fitTextInTwoLines } from './fitTextInTwoLines';
import { TITLE_FONT_SIZE, TITLE_WIDTH, TITLE_Y } from '../config';

const TITLE_MARGIN_LEFT = 0;
const MANA_COST_MARGIN_RIGHT = -3;
const TITLE_MANA_COST_GAP = 37

const MANA_SYMBOL_DIAMETER = 28;
const MANA_SYMBOLS_SPACING = 4.5;

export const drawTitleBox = (ctx, {
  cardName,
  cardManaCost,
  maxHeight = 110,
  drawState,
}) => {
  const cardWidth = ctx.canvas.width;
  const titleBoxMarginX = (cardWidth - TITLE_WIDTH) / 2;

  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];

  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOLS_SPACING,
  });

  const titleLinesX = titleBoxMarginX + TITLE_MARGIN_LEFT;
  const titleLinesY = TITLE_Y + 30;
  const titleLine1Width = TITLE_WIDTH - TITLE_MARGIN_LEFT - (manaCostWidth ? (manaCostWidth + MANA_COST_MARGIN_RIGHT + TITLE_MANA_COST_GAP) : TITLE_MARGIN_LEFT);
  const titleLine2Width = TITLE_WIDTH - TITLE_MARGIN_LEFT * 2;

  ctx.font = `bold ${TITLE_FONT_SIZE}px Tahoma`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const titleLines = fitTextInTwoLines(ctx, {
    text: cardName,
    line1MaxWidth: titleLine1Width,
    line2MaxWidth: titleLine2Width,
    maxHeight,
  });

  const currentFont = getFontSize(ctx);
  const compensatedTitleLinesY = Math.max(titleLinesY, titleLinesY - (34 - currentFont)); // Compensate bigger fonts
  fillMultilineText(ctx, titleLines, titleLinesX, compensatedTitleLinesY);

  if (manaSymbols.length > 0) {
    renderManaCost(ctx, {
      manaSymbols,
      x: cardWidth - manaCostWidth - MANA_COST_MARGIN_RIGHT - TITLE_MANA_COST_GAP,
      y: TITLE_Y,
      symbolDiameter: MANA_SYMBOL_DIAMETER,
      symbolSpacing: MANA_SYMBOLS_SPACING,
      drawState,
    });
  }
};
