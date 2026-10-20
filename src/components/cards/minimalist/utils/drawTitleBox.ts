import type { MinimalistPalette } from '../palette';
import { splitSymbols } from '../../../../domain/symbols';
import { calculateManaCostWidth, renderManaCost } from '../../common/manaCostRenderer';
import { drawTitleText } from './drawTitleText';
import { TITLE_FONT_SIZE, TITLE_HEIGHT, TITLE_WIDTH, TITLE_Y } from '../config';

const TITLE_MARGIN_LEFT = 0;
const MANA_COST_MARGIN_RIGHT = -3;
const TITLE_MANA_COST_GAP = 37;

const MANA_SYMBOL_DIAMETER = 28;
const MANA_SYMBOLS_SPACING = 4.5;

export const drawTitleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardName,
    cardManaCost,
    maxHeight = TITLE_HEIGHT,
  }: { palette: MinimalistPalette; cardName: string; cardManaCost?: string; maxHeight?: number },
) => {
  const cardWidth = ctx.canvas.width;
  const titleBoxMarginX = (cardWidth - TITLE_WIDTH) / 2;

  const manaSymbols = splitSymbols(cardManaCost ?? '');

  const manaCostWidth = calculateManaCostWidth({
    manaSymbols,
    symbolDiameter: MANA_SYMBOL_DIAMETER,
    symbolSpacing: MANA_SYMBOLS_SPACING,
  });

  const titleLinesX = titleBoxMarginX + TITLE_MARGIN_LEFT;
  const titleLinesY = TITLE_Y + 30;
  const titleLine1Width =
    TITLE_WIDTH -
    TITLE_MARGIN_LEFT -
    (manaCostWidth ? manaCostWidth + MANA_COST_MARGIN_RIGHT + TITLE_MANA_COST_GAP : TITLE_MARGIN_LEFT);
  const titleLine2Width = TITLE_WIDTH - TITLE_MARGIN_LEFT * 2;

  drawTitleText(ctx, {
    palette,
    text: cardName,
    x: titleLinesX,
    y: titleLinesY,
    fontSize: TITLE_FONT_SIZE,
    line1MaxWidth: titleLine1Width,
    line2MaxWidth: titleLine2Width,
    maxHeight,
  });

  if (manaSymbols.length > 0) {
    renderManaCost(ctx, {
      manaSymbols,
      x: cardWidth - manaCostWidth - MANA_COST_MARGIN_RIGHT - TITLE_MANA_COST_GAP,
      y: TITLE_Y,
      symbolDiameter: MANA_SYMBOL_DIAMETER,
      symbolSpacing: MANA_SYMBOLS_SPACING,
    });
  }
};
