import { useEffect, useRef, useState } from 'react';
import { beginRender, finishRender } from '../../utils/canvasRendering';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
import { drawArtBox } from './utils/drawArtBox';
import { drawOracleBox } from './utils/drawOracleBox';
import { drawOuterFrame } from './utils/drawOuterFrame';
import { drawPlaneswalkerOracleBox } from './utils/drawPlaneswalkerOracleBox';
import { drawStatsBox } from './utils/drawStatsBox';
import { drawSubCardOracleBox } from './utils/drawSubCardOracleBox';
import { drawSubCardTitleBox } from './utils/drawSubCardTitleBox';
import { drawSubCardTypeBox } from './utils/drawSubCardTypeBox';
import { drawTitleBox } from './utils/drawTitleBox';
import { drawTypeBox } from './utils/drawTypeBox';

const drawSubCard = (ctx, { subCard, subCardPosition }) => {
  const subColors = subCard.colors ?? colorsFromManaCost(subCard.mana_cost);
  const subColorIdentity = getColorMappings(subColors, subCard.type_line);

  drawSubCardTitleBox(ctx, {
    cardName: subCard.name,
    cardManaCost: subCard.mana_cost,
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
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
  onRendered,
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;

  const [canvas, setCanvas] = useState(null);
  // Read through a ref so a new callback doesn't redraw the card
  const onRenderedRef = useRef(onRendered);
  onRenderedRef.current = onRendered;

  useEffect(() => {
    if (canvas == null) return;

    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    beginRender(canvas);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity });
    drawArtBox(ctx, { cardArtUrl, cardColorIdentity });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    const oracleLayout = subCardPosition === 'left' ? 'right-half' : subCardPosition === 'right' ? 'left-half' : 'full-width';
    if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, { cardOracleText, cardLoyalty, cardColorIdentity, layout: oracleLayout });
    } else {
      drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardColorIdentity, layout: oracleLayout });
    }

    if (subCard && subCardPosition) {
      drawSubCard(ctx, { subCard, subCardPosition });
    }

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    let isCancelled = false;
    finishRender(canvas).then((isCurrentRender) => {
      if (isCurrentRender && !isCancelled) onRenderedRef.current?.(canvas);
    });

    return () => {
      isCancelled = true;
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
