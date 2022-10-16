import {
  fillMultilineText,
  fitFontSizeInX, getFontSize,
  getLineHeight,
  reduceTextSize,
} from '../../../utils/canvasText';
import { getSymbolImage } from '../../../utils/symbols';

const TITLE_ORIGIN_X = 40;
const TITLE_ORIGIN_Y = 65;
const MANA_COST_MARGIN_LEFT = 30;
const MANA_SYMBOL_WIDTH = 28;
const MANA_SYMBOL_MARGIN = 2.5;
const MANA_SYMBOL_OFFSET_X = 37;

const calculateManaCostWidth = (ctx, { manaSymbols }) => {
  const manaSymbolsWidth = manaSymbols.length * MANA_SYMBOL_WIDTH;
  const manaSymbolsSpacingWidth = (Math.max(manaSymbols.length - 1, 0)) * MANA_SYMBOL_MARGIN;

  return manaSymbolsWidth + manaSymbolsSpacingWidth + manaSymbolsSpacingWidth;
}

const wrapCardName = (ctx, {
  cardName,
  manaSymbols,
}) => {
  const nameMarginLeft = TITLE_ORIGIN_X;
  const nameMarginRight = manaSymbols.length
    ? MANA_SYMBOL_OFFSET_X + MANA_COST_MARGIN_LEFT
    : TITLE_ORIGIN_X;

  const line1MaxWidth = ctx.canvas.width
    - nameMarginLeft
    - nameMarginRight
    - calculateManaCostWidth(ctx, { manaSymbols })

  let line1 = ''
  let line2 = ''
  const pendingWords = cardName.split(/\s+/);

  while (pendingWords.length) {
    const currentWord = pendingWords.shift();
    const newLine1 = line1 ? `${line1} ${currentWord}` : currentWord

    if (ctx.measureText(newLine1).width <= line1MaxWidth) {
      line1 = newLine1
    } else {
      line2 = [currentWord, ...pendingWords.splice(0, pendingWords.length)].join(' ')
    }
  }

  return [line1, line2];
}

const fitNameInTwoLines = (ctx, {
  cardName,
  manaSymbols,
  maxHeight,
}) => {
  const line2MaxWidth = ctx.canvas.width - TITLE_ORIGIN_X * 2;

  let line1 = '';
  let line2 = '';
  let textFitsVertically = false;
  let textFitsHorizontally = false;

  do {
    ;[line1, line2] = wrapCardName(ctx, { cardName, manaSymbols });

    const line1Metrics = ctx.measureText(line1);
    const line2Metrics = ctx.measureText(line2);

    textFitsVertically = getLineHeight(line1Metrics) + (line2.length && getLineHeight(line2Metrics)) <= maxHeight;
    textFitsHorizontally = line2Metrics.width <= line2MaxWidth;

    if (!textFitsVertically || !textFitsHorizontally) reduceTextSize(ctx);
  } while (!textFitsVertically || !textFitsHorizontally);

  return [line1, line2];
}

export const drawTitleBox = (ctx, {
  cardName,
  cardManaCost,
  maxHeight = 110,
}) => {
  const [...manaSymbols] = cardManaCost.match(/({.*?})/g) || [];

  // ctx.font = "bold 34px Tahoma";
  ctx.font = "bold 70px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const titleLines = fitNameInTwoLines(ctx, {
    cardName,
    manaSymbols,
    maxHeight,
  });

  const currentFont = getFontSize(ctx);
  console.log(cardName, currentFont)
  const titleYOffset = Math.max(TITLE_ORIGIN_Y, TITLE_ORIGIN_Y - (34 - currentFont)); // Compensate bigger fonts
  fillMultilineText(ctx, titleLines, 40, titleYOffset);

  manaSymbols.forEach(async (symbol, i) => {
    const yOffset = 2;
    const shadowYOffset = 2;
    const radius = MANA_SYMBOL_WIDTH / 2;
    const xEnd = ctx.canvas.width - MANA_SYMBOL_OFFSET_X;

    const originX = xEnd - radius - (MANA_SYMBOL_WIDTH + MANA_SYMBOL_MARGIN) * (manaSymbols.length - i - 1);
    const originY = 65 + yOffset - radius;

    // Shadow
    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + shadowYOffset, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Symbol placeholder
    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.drawImage(
      await getSymbolImage(symbol),
      originX - radius,
      originY - radius,
      2 * radius,
      2 * radius,
    );

  });
};
