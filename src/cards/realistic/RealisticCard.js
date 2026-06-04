import { useEffect, useState } from 'react';
import { drawLoyaltyBox } from '../../utils/canvasShapes';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
import { drawArtBox } from './utils/drawArtBox';
import { drawOracleBox } from './utils/drawOracleBox';
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
    cardColorIdentity: subColorIdentity,
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
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
  });
};

const RealisticCard = ({
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
    drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity, drawState });
    drawArtBox(ctx, { cardArtUrl, cardColorIdentity, drawState });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardLoyalty, cardColorIdentity, subCardPosition });

    if (subCard && subCardPosition) {
      drawSubCard(ctx, { subCard, subCardPosition, drawState });
    }

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, x: 439, y: 664 });
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
    cardSet,
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

export default RealisticCard;
