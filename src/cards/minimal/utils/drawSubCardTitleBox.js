import { fillMultilineText, getFontSize } from '../../../utils/canvasText';
import { calculateManaCostWidth, renderManaCost } from '../../../utils/manaCostRenderer';
import { fitTextInTwoLines } from './fitTextInTwoLines';
import { SUBCARD_TITLE_FONT_SIZE, SUBCARD_TITLE_HEIGHT, SUBCARD_TITLE_Y, TITLE_WIDTH } from '../config';

const TITLE_BOX_MARGIN_FROM_CENTER = 10;
const TITLE_MANA_COST_GAP = 3;

const MANA_SYMBOL_DIAMETER = 22;
const MANA_SYMBOLS_SPACING = 4;

export const drawSubCardTitleBox = (ctx, {
  cardName,
  cardManaCost,
  position,
  maxHeight = SUBCARD_TITLE_HEIGHT,
}) => {
  const cardWidth = ctx.canvas.width;
  const subCardWidth = cardWidth / 2;
  const subTitleWidth = TITLE_WIDTH / 2;

  const titleBoxMarginX = (cardWidth - TITLE_WIDTH) / 2;

  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];

  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOLS_SPACING,
  });

  const titleLinesX = position === "left"
    ? titleBoxMarginX
    : cardWidth / 2 + TITLE_BOX_MARGIN_FROM_CENTER;
  const titleLinesY = SUBCARD_TITLE_Y + 30;
  const titleLine1Width = subTitleWidth - TITLE_BOX_MARGIN_FROM_CENTER - (manaCostWidth ? (manaCostWidth + TITLE_MANA_COST_GAP) : 0);
  const titleLine2Width = subTitleWidth - TITLE_BOX_MARGIN_FROM_CENTER * 2;

  ctx.font = `bold ${SUBCARD_TITLE_FONT_SIZE}px Tahoma`;
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
      x: position === "left"
        ? subCardWidth - manaCostWidth - TITLE_BOX_MARGIN_FROM_CENTER - TITLE_MANA_COST_GAP
        : cardWidth - manaCostWidth - titleBoxMarginX - TITLE_MANA_COST_GAP,
      y: SUBCARD_TITLE_Y,
      symbolDiameter: MANA_SYMBOL_DIAMETER,
      symbolSpacing: MANA_SYMBOLS_SPACING,
    });
  }
};
