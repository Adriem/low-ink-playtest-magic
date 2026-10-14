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
import { splitSagaCreatureText } from '../../utils/sagaParser';
import { SAGA_CREATURE_TYPELINE_Y, SAGA_TYPELINE_Y } from './config';
import { drawSagaCreatureOracleBox } from './utils/drawSagaCreatureOracleBox';
import { drawSagaOracleAndArtBox } from './utils/drawSagaOracleAndArtBox';
import type { ScryfallCardFace } from '../../types/cards';
import type { CardProps, SubCardPosition } from '../styles';
import { get2dContext } from '../../utils/canvasRendering';

const drawSubCard = (ctx: CanvasRenderingContext2D, { subCard, subCardPosition }: { subCard: ScryfallCardFace, subCardPosition: SubCardPosition }) => {
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
 * @param canvas - 500x700 canvas
 */
export const renderRealisticCard = (canvas: HTMLCanvasElement, {
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
}: CardProps) => {
  const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

  const ctx = get2dContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, { blackBordered });
  drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity });

  const isSaga = /\bSaga\b/i.test(cardTypeLine ?? '');
  if (isSaga) {
    const isCreature = cardPower != null && cardToughness != null;

    if (isCreature) {
      const { sagaText, creatureText } = splitSagaCreatureText(cardOracleText);
      drawSagaOracleAndArtBox(ctx, { cardOracleText: sagaText, cardArtUrl, cropArt, cardColorIdentity, typelineY: SAGA_CREATURE_TYPELINE_Y });
      drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity, y: SAGA_CREATURE_TYPELINE_Y });
      drawSagaCreatureOracleBox(ctx, { cardOracleText: creatureText, cardColorIdentity });
    } else {
      drawSagaOracleAndArtBox(ctx, { cardOracleText, cardArtUrl, cropArt, cardColorIdentity });
      drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity, y: SAGA_TYPELINE_Y });
    }
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
