import { useEffect, useState } from 'react';
import { drawLoyaltyBox, drawRectangle, drawRoundedBox } from '../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../utils/canvasStyles';
import { fitFontSizeInX } from '../../utils/canvasText';
import { getColorMappings } from '../../utils/colors';
import { drawOracleBox, drawPlaneswalkerOracleBox } from './utils/drawOracleBox';
import { drawTitleBox } from './utils/drawTitleBox';

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

const drawTypeBox = (ctx, { cardType, cardColorIdentity, }) => {
  const typeOriginX = 45;
  const typeEndX = ctx.canvas.width - 45;

  drawRoundedBox(ctx, {
    x: 29,
    y: 170,
    width: ctx.canvas.width - 29 * 2,
    height: 50,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });

  drawRoundedBox(ctx, {
    x: 33,
    y: 175,
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
  ctx.fillText(cardType.toUpperCase(), 45, 203);
};

const drawStatsBox = (ctx, { cardPower, cardToughness }) => {
  ctx.font = "40px Tahoma";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, 389 + 40, 654);
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
        x: 45,
        y: 270,
        height: 410 - 45,
        width: ctx.canvas.width - 45 * 2,
      })
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    } else if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, {
        cardOracleText,
        x: 45,
        y: 270,
        height: 410 - 45,
        width: ctx.canvas.width - 45 * 2,
      })
      drawLoyaltyBox(ctx, { cardLoyalty, cardColorIdentity, x: 430, y: 675, scale: 1.20, fontFamily: 'Tahoma' });
    } else {
      drawOracleBox(ctx, {
        cardOracleText,
        x: 45,
        y: 270,
        height: 460 - 45,
        width: ctx.canvas.width - 45 * 2,
      })
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
