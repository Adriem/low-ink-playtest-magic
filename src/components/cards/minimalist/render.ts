import { drawBattleOracleBox } from './utils/drawBattleOracleBox';
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
import {
  getDefense,
  getLoyalty,
  getPowerAndToughness,
  type CardFace,
  type SubCardPosition,
} from '../../../domain/cards';
import { getCardColorTreatment } from '../../../domain/colorTreatment';
import type { CardRenderProps, InkLevel } from '../styles';
import { hasBlackBorder, resolvePalette } from '../common/canvasStyles';
import { MINIMALIST_PALETTE, type MinimalistPalette } from './palette';
import { get2dContext } from '../common/canvasRendering';

/**
 * Draw a card in the minimalist style on a canvas.
 *
 * @param canvas - 500x700 canvas
 */
export const renderMinimalistCard = (
  canvas: HTMLCanvasElement,
  { face, subFace, subFacePosition, blackBordered, inkLevel = 'medium', customPalette }: CardRenderProps,
) => {
  const palette = resolvePalette(MINIMALIST_PALETTE, customPalette);
  const cardColorTreatment = getCardColorTreatment(face);
  const cardName = face.name;
  const cardManaCost = face.manaCost;
  const cardTypeLine = face.typeLine;
  const cardOracleText = face.oracleText;
  const powerAndToughness = getPowerAndToughness(face);
  const cardLoyalty = getLoyalty(face);

  const ctx = get2dContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, { palette, blackBordered: hasBlackBorder({ blackBordered, inkLevel }) });
  drawTitleBox(ctx, { palette, cardName, cardManaCost, maxHeight: TITLE_HEIGHT });

  if (subFace && subFacePosition) {
    drawSubCard(ctx, subFace, subFacePosition, inkLevel, palette);
  }

  const oracleLayout =
    subFacePosition === 'left' ? 'right-half' : subFacePosition === 'right' ? 'left-half' : 'full-width';

  if (face.faceLayout === 'saga') {
    drawSagaOracleBox(ctx, {
      palette,
      cardOracleText,
      cardColorTreatment,
      cardPower: powerAndToughness?.power,
      cardToughness: powerAndToughness?.toughness,
    });
  } else if (cardLoyalty) {
    drawPlaneswalkerOracleBox(ctx, { palette, cardOracleText, cardColorTreatment });
  } else if (face.faceLayout === 'battle') {
    drawBattleOracleBox(ctx, { palette, cardOracleText, cardColorTreatment, cardDefense: getDefense(face) });
  } else {
    drawOracleBox(ctx, {
      palette,
      cardOracleText,
      cardColorTreatment,
      cardPower: powerAndToughness?.power,
      cardToughness: powerAndToughness?.toughness,
      layout: oracleLayout,
    });
  }

  drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel });

  if (powerAndToughness) {
    drawStatsBox(ctx, { palette, cardPower: powerAndToughness.power, cardToughness: powerAndToughness.toughness });
  }

  if (cardLoyalty) {
    drawLoyaltyBox(ctx, {
      cardLoyalty,
      x: LOYALTY_BOX_X,
      y: LOYALTY_BOX_Y,
      scale: LOYALTY_BOX_SCALE,
      fontFamily: DISPLAY_FONT_FAMILY,
      colors: palette,
    });
  }
};

const drawSubCard = (
  ctx: CanvasRenderingContext2D,
  subFace: CardFace,
  position: SubCardPosition,
  inkLevel: InkLevel,
  palette: MinimalistPalette,
) => {
  const subColorTreatment = getCardColorTreatment(subFace);

  drawSubCardTitleBox(ctx, { palette, cardName: subFace.name, cardManaCost: subFace.manaCost, position });
  drawSubCardTypeBox(ctx, {
    palette,
    cardType: subFace.typeLine,
    cardColorTreatment: subColorTreatment,
    inkLevel,
    position,
  });
  drawSubCardOracleBox(ctx, {
    palette,
    cardOracleText: subFace.oracleText,
    cardColorTreatment: subColorTreatment,
    position,
  });
};
