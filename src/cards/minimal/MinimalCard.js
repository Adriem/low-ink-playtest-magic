import { useEffect, useState } from 'react';
import { drawLoyaltyBox, drawRectangle, drawRoundedBox } from '../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY, reduceTextSize } from '../../utils/canvasText';
import { colorsFromManaCost, getColorMappings, MinimalistColors } from '../../utils/colors';
import { getSymbolImage } from '../../utils/symbols';
import { drawOracleBox, drawPlaneswalkerOracleBox } from './utils/drawOracleBox';
import { drawTitleBox } from './utils/drawTitleBox';
import { drawTypeBox } from './utils/drawTypeBox';

const drawOuterFrame = (ctx, { blackBordered }) => {
  const OUTER_BORDER_RADIUS = 0;
  const OUTER_BORDER_STROKE = 8;

  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: 'black',
    fillStyle: blackBordered ? 'black' : 'white',
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });
};

const drawStatsBox = (ctx, { cardPower, cardToughness }) => {
  ctx.font = "40px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, 389 + 40, 654);
};

const MAIN_TYPE_BOX_BOTTOM = 220;
const DIVIDER_THICKNESS = 5;
const DIVIDER_TEXT_PADDING = 8;
const DIVIDER_CENTER_OFFSET = DIVIDER_THICKNESS / 2 + DIVIDER_TEXT_PADDING;
const TEXT_LEFT_X = 45;
const TEXT_RIGHT_X = 455;
const SUB_TITLE_PADDING = 6;
const SUB_TITLE_BOTTOM_PADDING = 20;
const SUB_ORACLE_TOP_PADDING = 26;
const SUB_TITLE_TEXT_Y = MAIN_TYPE_BOX_BOTTOM + 28 + SUB_TITLE_PADDING;
const SUB_TITLE_LINE_HEIGHT = 34;
const SUB_TYPE_Y = SUB_TITLE_TEXT_Y + SUB_TITLE_LINE_HEIGHT + SUB_TITLE_BOTTOM_PADDING;
const SUB_TYPE_HEIGHT = 38;
const SUB_ORACLE_TEXT_Y = SUB_TYPE_Y + SUB_TYPE_HEIGHT + SUB_ORACLE_TOP_PADDING;
const SUB_ORACLE_TEXT_BOTTOM = 590;

const wrapSubCardTitleInTwoLines = (ctx, { cardName, line1MaxWidth, line2MaxWidth }) => {
  let line1 = '';
  let line2 = '';

  while (true) {
    line1 = '';
    line2 = '';
    const pendingWords = cardName.split(/\s+/);

    while (pendingWords.length) {
      const word = pendingWords.shift();
      const candidate = line1 ? `${line1} ${word}` : word;
      if (ctx.measureText(candidate).width <= line1MaxWidth) {
        line1 = candidate;
      } else {
        line2 = [word, ...pendingWords.splice(0, pendingWords.length)].join(' ');
      }
    }

    if (ctx.measureText(line2).width <= line2MaxWidth) break;
    reduceTextSize(ctx);
  }

  return line2 ? [line1, line2] : [line1];
};

const drawSubCardTitleBox = (ctx, {
  cardName,
  cardManaCost,
  position,
  drawState,
}) => {
  const half = ctx.canvas.width / 2;
  const x = (position === 'left' ? TEXT_LEFT_X : half + DIVIDER_CENTER_OFFSET) + SUB_TITLE_PADDING;
  const right = (position === 'left' ? half - DIVIDER_CENTER_OFFSET : TEXT_RIGHT_X) - SUB_TITLE_PADDING;

  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];
  const manaSymbolWidth = 22;
  const manaSymbolMargin = 2;

  const manaTotalWidth = manaSymbols.length * manaSymbolWidth
    + Math.max(manaSymbols.length - 1, 0) * manaSymbolMargin;

  const line1MaxWidth = (right - manaTotalWidth - 6) - x;
  const line2MaxWidth = right - x;

  ctx.font = "bold 32px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  const titleLines = wrapSubCardTitleInTwoLines(ctx, { cardName, line1MaxWidth, line2MaxWidth });
  fillMultilineText(ctx, titleLines, x, SUB_TITLE_TEXT_Y);

  manaSymbols.forEach(async (symbol, i) => {
    const radius = manaSymbolWidth / 2;
    const originX = right - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
    const originY = SUB_TITLE_TEXT_Y - 12;

    if (drawState?.cancelled) return;

    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + 2, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.fill();

    const symbolImage = await getSymbolImage(symbol);
    if (drawState?.cancelled) return;
    ctx.drawImage(
      symbolImage,
      originX - radius,
      originY - radius,
      2 * radius,
      2 * radius,
    );
  });
};

const drawSubCardTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
  position,
}) => {
  const half = ctx.canvas.width / 2;
  const x = position === 'left' ? 29 : half;
  const width = half - 29;
  const right = x + width;
  const flatSide = position === 'left' ? 'right' : 'left';

  const y = SUB_TYPE_Y;
  const height = SUB_TYPE_HEIGHT;

  const innerLeftPad = flatSide === 'left' ? 0 : 4;
  const innerRightPad = flatSide === 'right' ? 0 : 4;
  const innerX = x + innerLeftPad;
  const innerRight = right - innerRightPad;
  const textX = flatSide === 'left' ? x + 8 : x + 16;
  const textRight = flatSide === 'right' ? right - 8 : right - 16;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity, { palettte: MinimalistColors }),
    flatSide,
  });
  drawRoundedBox(ctx, {
    x: innerX,
    y: y + 5,
    width: innerRight - innerX,
    height: height - 12,
    lineWidth: 3,
    strokeStyle: 'white',
    fillStyle: 'white',
    flatSide,
  });

  ctx.font = "bold 18px Verdana";

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textRight - textX);
  ctx.fillText(cardType.toUpperCase(), textX + 1, y + 27);

  // Actual text
  ctx.fillStyle = cardColorIdentity === 'colorless' ? 'gray' : 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), textRight - textX);
  ctx.fillText(cardType.toUpperCase(), textX, y + 26);
};

const drawSubCardOracleBox = (ctx, {
  cardOracleText,
  position,
}) => {
  const half = ctx.canvas.width / 2;
  const textX = position === 'left' ? TEXT_LEFT_X : half + DIVIDER_CENTER_OFFSET;
  const textRight = position === 'left' ? half - DIVIDER_CENTER_OFFSET : TEXT_RIGHT_X;

  ctx.font = "22px Verdana";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textRight - textX,
    SUB_ORACLE_TEXT_BOTTOM - SUB_ORACLE_TEXT_Y,
  ), textX, SUB_ORACLE_TEXT_Y);
};

const drawSubCard = (ctx, { subCard, subCardPosition, drawState }) => {
  const subColors = subCard.colors ?? colorsFromManaCost(subCard.mana_cost);
  const subColorIdentity = getColorMappings(subColors, subCard.type_line);

  drawSubCardTitleBox(ctx, {
    cardName: subCard.name,
    cardManaCost: subCard.mana_cost,
    position: subCardPosition,
    drawState,
  });
  drawSubCardTypeBox(ctx, {
    cardType: subCard.type_line,
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
  });
  drawSubCardOracleBox(ctx, {
    cardOracleText: subCard.oracle_text,
    position: subCardPosition,
  });
};

const CanvasCard = ({
  cardName,
  cardManaCost,
  cardArtUrl,
  cardColors,
  cardTypeLine,
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  cardSet = 'PXY',
  devoid,
  blackBordered,
  subCardPosition,
  subCard,
  canvasClassName = 'card',
  canvasRef,
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;

  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (canvas == null) return;

    const drawState = { cancelled: false };
    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, maxHeight: 110, drawState });

    if (subCard && subCardPosition) {
      drawSubCard(ctx, { subCard, subCardPosition, drawState });
    }

    if (cardPower && cardToughness) {
      drawOracleBox(ctx, {
        cardOracleText,
        cardColorIdentity,
        x: 45,
        y: 270,
        height: 370 - 45,
        width: ctx.canvas.width - 45 * 2,
        subCardPosition,
      });
    } else if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, {
        cardOracleText,
        cardColorIdentity,
        x: 45,
        y: 270,
        height: 410 - 45,
        width: ctx.canvas.width - 45 * 2,
        subCardPosition,
      });
    } else {
      drawOracleBox(ctx, {
        cardOracleText,
        cardColorIdentity,
        x: 45,
        y: 270,
        height: 410 - 45,
        width: ctx.canvas.width - 45 * 2,
        subCardPosition,
      });
    }

    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, x: 430, y: 675, scale: 1.20, fontFamily: 'Tahoma' });
    }

    return () => {
      drawState.cancelled = true;
    };
  }, [
    canvas,
    cardName,
    cardManaCost,
    cardArtUrl,
    cardColors,
    cardTypeLine,
    cardOracleText,
    cardPower,
    cardToughness,
    cardLoyalty,
    devoid,
    blackBordered,
    subCardPosition,
    subCard,
  ]);

  return (
    <canvas
      className={canvasClassName}
      ref={(canvas) => {
        setCanvas(canvas);
        if (canvasRef) canvasRef.current = canvas;
      }}
      height={HEIGHT}
      width={WIDTH}
      style={{ background: 'white' }}
    />
  );
};

export default CanvasCard;
