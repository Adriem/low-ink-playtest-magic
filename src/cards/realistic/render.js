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
import { SAGA_TYPELINE_Y } from './config';
import { drawSagaOracleAndArtBox } from './utils/drawSagaOracleAndArtBox';

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

/**
 * Draw a card in the realistic style on a canvas.
 *
 * @param {HTMLCanvasElement} canvas - 500x700 canvas
 * @param {import('../styles').CardProps} card
 */
export const renderRealisticCard = (canvas, {
  cardName,
  cardManaCost,
  cardArtUrl,
  cropArt,
  cardColors,
  cardTypeLine,
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  blackBordered,
  subCardPosition,
  subCard,
}) => {
  const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, { blackBordered });
  drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity });

  const isSaga = /\bSaga\b/i.test(cardTypeLine ?? '');
  if (isSaga) {
    drawSagaOracleAndArtBox(ctx, { cardOracleText, cardArtUrl, cropArt, cardColorIdentity });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity, y: SAGA_TYPELINE_Y });
  } else {
    drawArtBox(ctx, { cardArtUrl, cropArt, cardColorIdentity });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    const oracleLayout = subCardPosition === 'left' ? 'right-half' : subCardPosition === 'right' ? 'left-half' : 'full-width';
    if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, { cardOracleText, cardLoyalty, cardColorIdentity, layout: oracleLayout });
    } else {
      drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardColorIdentity, layout: oracleLayout });
    }
  }

  if (subCard && subCardPosition) {
    drawSubCard(ctx, { subCard, subCardPosition });
  }

  if (cardPower && cardToughness) {
    drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
  }
};
