import { useEffect, useState } from 'react';
import { drawLoyaltyBox, drawRectangle } from '../../utils/canvasShapes';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY } from '../../utils/canvasText';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
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

const SUB_TITLE_TEXT_Y = 290;
const SUB_TITLE_HEIGHT = 55;
const SUB_TYPE_Y = SUB_TITLE_TEXT_Y + 30;
const SUB_TYPE_HEIGHT = 38;
const SUB_ORACLE_TEXT_Y = SUB_TYPE_Y + SUB_TYPE_HEIGHT + 18;
const SUB_ORACLE_TEXT_BOTTOM = 590;

const drawSubCardTitleText = (ctx, { cardName, cardManaCost, x, right }) => {
  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];
  const manaSymbolWidth = 22;
  const manaSymbolMargin = 2;

  const manaTotalWidth = manaSymbols.length * manaSymbolWidth
    + Math.max(manaSymbols.length - 1, 0) * manaSymbolMargin;

  const nameOriginX = x;
  const nameMaxWidth = (right - manaTotalWidth - 6) - nameOriginX;

  ctx.font = "bold 32px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, nameMaxWidth);
  ctx.fillText(cardName, nameOriginX, SUB_TITLE_TEXT_Y);

  manaSymbols.forEach(async (symbol, i) => {
    const radius = manaSymbolWidth / 2;
    const originX = right - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
    const originY = SUB_TITLE_TEXT_Y - 12;

    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + 2, radius, 0, 2 * Math.PI);
    ctx.fill();

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

const drawSubCard = (ctx, { subCard, subCardPosition }) => {
  const flatSide = subCardPosition === 'left' ? 'right' : 'left';
  const subColors = subCard.colors ?? colorsFromManaCost(subCard.mana_cost);
  const subColorIdentity = getColorMappings(subColors, subCard.type_line);

  const half = ctx.canvas.width / 2;
  const boxX = subCardPosition === 'left' ? 29 : half;
  const boxWidth = half - 29;
  const titleX = subCardPosition === 'left' ? 30 : half + 8;
  const titleRight = subCardPosition === 'left' ? half - 8 : ctx.canvas.width - 30;

  drawSubCardTitleText(ctx, {
    cardName: subCard.name,
    cardManaCost: subCard.mana_cost,
    x: titleX,
    right: titleRight,
  });

  drawTypeBox(ctx, {
    cardType: subCard.type_line,
    cardColorIdentity: subColorIdentity,
    x: boxX,
    width: boxWidth,
    y: SUB_TYPE_Y,
    height: SUB_TYPE_HEIGHT,
    flatSide,
  });

  const textX = subCardPosition === 'left' ? 30 : half + 8;
  const textRight = subCardPosition === 'left' ? half - 8 : ctx.canvas.width - 30;

  ctx.font = "22px Verdana";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (subCard.oracle_text ?? '').split('\n'),
    textRight - textX,
    SUB_ORACLE_TEXT_BOTTOM - SUB_ORACLE_TEXT_Y,
  ), textX, SUB_ORACLE_TEXT_Y);
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

    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, maxHeight: 110 });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });

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

    if (subCard && subCardPosition) {
      drawSubCard(ctx, { subCard, subCardPosition });
    }

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, x: 430, y: 675, scale: 1.20, fontFamily: 'Tahoma' });
    }
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
