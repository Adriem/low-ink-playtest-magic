import { splitSymbols } from '../../../../domain/symbols';
import { calculateManaCostWidth, renderManaCost } from '../../common/manaCostRenderer';
import { drawTitleText } from './drawTitleText';
import { SUBCARD_TITLE_FONT_SIZE, SUBCARD_TITLE_HEIGHT, SUBCARD_TITLE_Y, TITLE_WIDTH } from '../config';
import type { SubCardPosition } from '../../../../domain/cards';

const TITLE_BOX_MARGIN_FROM_CENTER = 10;
const TITLE_MANA_COST_GAP = 3;

const MANA_SYMBOL_DIAMETER = 22;
const MANA_SYMBOLS_SPACING = 4;

export const drawSubCardTitleBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardName,
    cardManaCost,
    position,
    maxHeight = SUBCARD_TITLE_HEIGHT,
  }: { cardName: string; cardManaCost?: string; position: SubCardPosition; maxHeight?: number },
) => {
  const cardWidth = ctx.canvas.width;
  const subCardWidth = cardWidth / 2;
  const subTitleWidth = TITLE_WIDTH / 2;

  const titleBoxMarginX = (cardWidth - TITLE_WIDTH) / 2;

  const manaSymbols = splitSymbols(cardManaCost ?? '');

  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOLS_SPACING,
  });

  const titleLinesX = position === 'left' ? titleBoxMarginX : cardWidth / 2 + TITLE_BOX_MARGIN_FROM_CENTER;
  const titleLinesY = SUBCARD_TITLE_Y + 30;
  const titleLine1Width =
    subTitleWidth - TITLE_BOX_MARGIN_FROM_CENTER - (manaCostWidth ? manaCostWidth + TITLE_MANA_COST_GAP : 0);
  const titleLine2Width = subTitleWidth - TITLE_BOX_MARGIN_FROM_CENTER * 2;

  drawTitleText(ctx, {
    text: cardName,
    x: titleLinesX,
    y: titleLinesY,
    fontSize: SUBCARD_TITLE_FONT_SIZE,
    line1MaxWidth: titleLine1Width,
    line2MaxWidth: titleLine2Width,
    maxHeight,
  });

  if (manaSymbols.length > 0) {
    renderManaCost(ctx, {
      manaSymbols,
      x:
        position === 'left'
          ? subCardWidth - manaCostWidth - TITLE_BOX_MARGIN_FROM_CENTER - TITLE_MANA_COST_GAP
          : cardWidth - manaCostWidth - titleBoxMarginX - TITLE_MANA_COST_GAP,
      y: SUBCARD_TITLE_Y,
      symbolDiameter: MANA_SYMBOL_DIAMETER,
      symbolSpacing: MANA_SYMBOLS_SPACING,
    });
  }
};
