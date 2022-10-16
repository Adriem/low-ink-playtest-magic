import { useCallback, useEffect, useRef, useState } from 'react';
import { drawLoyaltyBox, drawRectangle, drawRoundedBox } from '../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY, wrapText } from '../../utils/canvasText';
import { getColorMappings } from '../../utils/colors';
import { getSymbolImage } from '../../utils/symbols';

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

const drawTitleBox = (ctx, {
  cardName,
  cardManaCost,
}) => {
  const [...manaSymbols] = cardManaCost.match(/({.*?})/g) || [];

  const manaSymbolWidth = 28;
  const manaSymbolMargin = 2.5;
  const manaSymbolOffsetX = 37;

  const titleOriginX = 40;
  const titleEndX = ctx.canvas.width
    - manaSymbols.length * manaSymbolWidth
    - (Math.max(manaSymbols.length - 1, 0)) * manaSymbolMargin
    - (manaSymbols.length ? manaSymbolOffsetX + 10 : titleOriginX);

  ctx.font = "bold 34px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - titleOriginX)
  ctx.fillText(cardName, 40, 65);

  manaSymbols.forEach(async (symbol, i) => {
    const yOffset = 2;
    const shadowYOffset = 2;
    const radius = manaSymbolWidth / 2;
    const xEnd = ctx.canvas.width - manaSymbolOffsetX;

    const originX = xEnd - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
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

const drawTypeBox = (ctx, { cardType, cardColorIdentity, }) => {
  const typeOriginX = 45;
  const typeEndX = ctx.canvas.width - 45;

  drawRoundedBox(ctx, {
    x: 29,
    y: 155,
    width: ctx.canvas.width - 29 * 2,
    height: 50,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  drawRoundedBox(ctx, {
    x: 33,
    y: 160,
    width: ctx.canvas.width - 33 * 2,
    height: 38,
    lineWidth: 3,
    strokeStyle: 'white',
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  ctx.font = "bold 22px Tahoma";
  ctx.fillStyle = 'white';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType.toUpperCase(), typeEndX - typeOriginX)
  ctx.fillText(cardType.toUpperCase(), 45, 189);
};

const drawOracleBox = (ctx, {
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
}) => {
  ctx.font = "25px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    cardOracleText.split('\n'),
    ctx.canvas.width - 45 * 2,
    ((cardPower != null && cardToughness != null) || cardLoyalty != null ? 625 : 640) - 45,
  ), 45, 270);
};

const drawStatsBox = (ctx, { cardPower, cardToughness }) => {
  ctx.font = "40px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, 389 + 40, 654);
};

// const drawLoyaltyBox = (ctx, { cardLoyalty, cardColorIdentity }) => {
//   ctx.fillStyle = 'black';
//   ctx.beginPath();
//   ctx.moveTo(439, 664);
//   ctx.arc(378, 645, 29, 0.075 * Math.PI, 1.765 * Math.PI, true);
//   ctx.arc(439, 612, 11, 0.90 * Math.PI, 0.1 * Math.PI, true);
//   ctx.arc(499, 645, 29, 1.225 * Math.PI, 0.925 * Math.PI, true);
//   ctx.closePath();
//   ctx.fill();
//
//   ctx.fillStyle = 'white';
//   ctx.beginPath();
//   ctx.moveTo(439, 659);
//   ctx.arc(379, 645, 32, 0.045 * Math.PI, 1.82 * Math.PI, true);
//   ctx.arc(439, 613, 15, 0.825 * Math.PI, 0.175 * Math.PI, true);
//   ctx.arc(498, 645, 32, 1.18 * Math.PI, 0.955 * Math.PI, true);
//   ctx.closePath();
//   ctx.fill();
//
//   ctx.font = "bold 27px Tahoma";
//   ctx.fillStyle = 'black';
//   ctx.textAlign = 'center';
//   ctx.fillText(cardLoyalty, 439, 652);
// };

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
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;
  const CARD_PADDING = 2;
  const BORDER_STROKE = 4;
  const OUTER_BORDER_WIDTH = 20;

  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (canvas == null) return;

    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardLoyalty, cardColorIdentity })

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, cardColorIdentity, x: 430, y: 675, scale: 1.20, fontFamily: 'Tahoma' });
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
    cardSet = 'PXY',
    devoid,
    blackBordered,
  ]);

  return (
    <canvas
      className="card"
      ref={(canvas) => setCanvas(canvas)}
      height={HEIGHT}
      width={WIDTH}
      style={{ background: 'white' }}
    />
  )
};

export default CanvasCard;
