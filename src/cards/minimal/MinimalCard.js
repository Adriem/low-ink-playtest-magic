import { useEffect, useState } from 'react';
import { drawLoyaltyBox, drawRectangle } from '../../utils/canvasShapes';
import { getColorMappings } from '../../utils/colors';
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
        cardColorIdentity,
        x: 45,
        y: 270,
        height: 410 - 45,
        width: ctx.canvas.width - 45 * 2,
      })
      drawLoyaltyBox(ctx, { cardLoyalty, x: 430, y: 675, scale: 1.20, fontFamily: 'Tahoma' });
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
