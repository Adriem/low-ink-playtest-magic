import { drawLoyaltyBox } from '../../utils/canvasShapes';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
import { drawOracleBox } from './utils/drawOracleBox';
import { drawPlaneswalkerOracleBox } from './utils/drawPlaneswalkerOracleBox';
import { drawSagaOracleBox } from './utils/drawSagaOracleBox';
import { drawOuterFrame } from './utils/drawOuterFrame';
import { drawStatsBox } from './utils/drawStatsBox';
import { drawSubCardOracleBox } from './utils/drawSubCardOracleBox';
import { drawSubCardTitleBox } from './utils/drawSubCardTitleBox';
import { drawSubCardTypeBox } from './utils/drawSubCardTypeBox';
import { drawTitleBox } from './utils/drawTitleBox';
import { drawTypeBox } from './utils/drawTypeBox';
import { DISPLAY_FONT_FAMILY, LOYALTY_BOX_SCALE, LOYALTY_BOX_X, LOYALTY_BOX_Y, TITLE_HEIGHT } from './config';
import type { ScryfallCardFace } from '../../types/cards';
import type { CardProps, SubCardPosition } from '../styles';
import { get2dContext } from '../../utils/canvasRendering';

const drawSubCard = (ctx: CanvasRenderingContext2D, { subCard, subCardPosition }: { subCard: ScryfallCardFace, subCardPosition: SubCardPosition }) => {
  const subColors = subCard.colors ?? colorsFromManaCost(subCard.mana_cost);
  const subColorIdentity = getColorMappings(subColors, subCard.type_line);

  drawSubCardTitleBox(ctx, {
    cardName: subCard.name,
    cardManaCost: subCard.mana_cost,
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
 * Draw a card in the minimalist style on a canvas.
 *
 * @param canvas - 500x700 canvas
 */
export const renderMinimalistCard = (canvas: HTMLCanvasElement, {
  cardName,
  cardManaCost,
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
  drawTitleBox(ctx, { cardName, cardManaCost, maxHeight: TITLE_HEIGHT });

  if (subCard && subCardPosition) {
    drawSubCard(ctx, { subCard, subCardPosition });
  }

  const oracleLayout = subCardPosition === 'left' ? 'right-half' : subCardPosition === 'right' ? 'left-half' : 'full-width';
  const isSaga = /\bSaga\b/i.test(cardTypeLine ?? '');

  if (isSaga) {
    drawSagaOracleBox(ctx, {
      cardOracleText,
      cardColorIdentity,
      cardPower,
      cardToughness,
    });
  } else if (cardLoyalty) {
    drawPlaneswalkerOracleBox(ctx, {
      cardOracleText,
      cardColorIdentity,
    });
  } else {
    drawOracleBox(ctx, {
      cardOracleText,
      cardColorIdentity,
      cardPower,
      cardToughness,
      layout: oracleLayout,
    });
  }

  drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });

  if (cardPower && cardToughness) {
    drawStatsBox(ctx, { cardPower, cardToughness });
  }

  if (cardLoyalty) {
    drawLoyaltyBox(ctx, {
      cardLoyalty,
      x: LOYALTY_BOX_X,
      y: LOYALTY_BOX_Y,
      scale: LOYALTY_BOX_SCALE,
      fontFamily: DISPLAY_FONT_FAMILY,
    });
  }
};
