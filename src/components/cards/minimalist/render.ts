import { drawLoyaltyBox } from '../common/canvasShapes';
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
import { getLoyalty, getPowerAndToughness, type CardFace, type SubCardPosition } from '../../../domain/cards';
import { getCardColorTreatment } from '../../../domain/colorTreatment';
import { MINIMALIST_PALETTE } from './palette';
import type { CardRenderProps, InkLevel } from '../styles';
import { hasBlackBorder } from '../common/canvasStyles';
import { get2dContext } from '../common/canvasRendering';

/**
 * Draw a card in the minimalist style on a canvas.
 *
 * @param canvas - 500x700 canvas
 */
export const renderMinimalistCard = (
  canvas: HTMLCanvasElement,
  { face, subFace, subFacePosition, blackBordered, inkLevel = 'medium' }: CardRenderProps,
) => {
  const cardColorTreatment = getCardColorTreatment(face);
  const cardName = face.name;
  const cardManaCost = face.manaCost;
  const cardTypeLine = face.typeLine;
  const cardOracleText = face.oracleText;
  const powerAndToughness = getPowerAndToughness(face);
  const cardLoyalty = getLoyalty(face);

  const ctx = get2dContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, { blackBordered: hasBlackBorder({ blackBordered, inkLevel }) });
  drawTitleBox(ctx, { cardName, cardManaCost, maxHeight: TITLE_HEIGHT });

  if (subFace && subFacePosition) {
    drawSubCard(ctx, subFace, subFacePosition, inkLevel);
  }

  const oracleLayout =
    subFacePosition === 'left' ? 'right-half' : subFacePosition === 'right' ? 'left-half' : 'full-width';

  if (face.faceLayout === 'saga') {
    drawSagaOracleBox(ctx, {
      cardOracleText,
      cardColorTreatment,
      cardPower: powerAndToughness?.power,
      cardToughness: powerAndToughness?.toughness,
    });
  } else if (cardLoyalty) {
    drawPlaneswalkerOracleBox(ctx, {
      cardOracleText,
      cardColorTreatment,
    });
  } else {
    drawOracleBox(ctx, {
      cardOracleText,
      cardColorTreatment,
      cardPower: powerAndToughness?.power,
      cardToughness: powerAndToughness?.toughness,
      layout: oracleLayout,
    });
  }

  drawTypeBox(ctx, { cardType: cardTypeLine, cardColorTreatment, inkLevel });

  if (powerAndToughness) {
    drawStatsBox(ctx, { cardPower: powerAndToughness.power, cardToughness: powerAndToughness.toughness });
  }

  if (cardLoyalty) {
    drawLoyaltyBox(ctx, {
      cardLoyalty,
      x: LOYALTY_BOX_X,
      y: LOYALTY_BOX_Y,
      scale: LOYALTY_BOX_SCALE,
      fontFamily: DISPLAY_FONT_FAMILY,
      colors: MINIMALIST_PALETTE,
    });
  }
};

const drawSubCard = (
  ctx: CanvasRenderingContext2D,
  subFace: CardFace,
  position: SubCardPosition,
  inkLevel: InkLevel,
) => {
  const subColorTreatment = getCardColorTreatment(subFace);

  drawSubCardTitleBox(ctx, {
    cardName: subFace.name,
    cardManaCost: subFace.manaCost,
    position,
  });
  drawSubCardTypeBox(ctx, {
    cardType: subFace.typeLine,
    cardColorTreatment: subColorTreatment,
    inkLevel,
    position,
  });
  drawSubCardOracleBox(ctx, {
    cardOracleText: subFace.oracleText,
    cardColorTreatment: subColorTreatment,
    position,
  });
};
