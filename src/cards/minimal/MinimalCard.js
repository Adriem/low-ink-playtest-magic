import { useEffect, useState } from 'react';
import { drawLoyaltyBox } from '../../utils/canvasShapes';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
import { drawOracleBox, drawPlaneswalkerOracleBox } from './utils/drawOracleBox';
import { drawOuterFrame } from './utils/drawOuterFrame';
import { drawStatsBox } from './utils/drawStatsBox';
import { drawSubCardOracleBox } from './utils/drawSubCardOracleBox';
import { drawSubCardTitleBox } from './utils/drawSubCardTitleBox';
import { drawSubCardTypeBox } from './utils/drawSubCardTypeBox';
import { drawTitleBox } from './utils/drawTitleBox';
import { drawTypeBox } from './utils/drawTypeBox';

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
