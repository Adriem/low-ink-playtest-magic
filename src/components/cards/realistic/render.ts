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
import { getSagaParts } from '../../../domain/oracleText';
import { SAGA_CREATURE_TYPELINE_Y, SAGA_TYPELINE_Y } from './config';
import { drawSagaCreatureOracleBox } from './utils/drawSagaCreatureOracleBox';
import { drawSagaOracleAndArtBox } from './utils/drawSagaOracleAndArtBox';
import { getLoyalty, getPowerAndToughness, type CardFace, type SubCardPosition } from '../../../domain/cards';
import { getCardColorTreatment } from '../../../domain/colorTreatment';
import type { CardRenderProps, InkLevel } from '../styles';
import { hasBlackBorder, resolvePalette } from '../common/canvasStyles';
import { REALISTIC_PALETTE } from './palette';
import type { Palette } from '../../../domain/colorTreatment';
import { get2dContext } from '../common/canvasRendering';

/**
 * Draw a card in the realistic style on a canvas.
 *
 * @param canvas - 500x700 canvas
 */
export const renderRealisticCard = (
  canvas: HTMLCanvasElement,
  {
    face,
    subFace,
    subFacePosition,
    blackBordered,
    inkLevel = 'medium',
    artFidelity = 'posterized',
    customPalette,
  }: CardRenderProps,
) => {
  const palette = resolvePalette(REALISTIC_PALETTE, customPalette);
  const cardColorTreatment = getCardColorTreatment(face);
  const cardName = face.name;
  const cardManaCost = face.manaCost;
  const cardTypeLine = face.typeLine;
  const cardOracleText = face.oracleText;
  const powerAndToughness = getPowerAndToughness(face);
  const cardLoyalty = getLoyalty(face);

  const { assetUrl: cardArtUrl, crop: cropArt } = face.art;

  const ctx = get2dContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, {
    palette,
    blackBordered: hasBlackBorder({ blackBordered, inkLevel }),
    inkLevel,
    cardColorTreatment,
  });
  drawTitleBox(ctx, { palette, cardName, cardManaCost, cardColorTreatment, inkLevel });

  if (face.faceLayout === 'saga') {
    if (powerAndToughness) {
      // The lines after the chapters are the creature's abilities, in their own box
      const { sagaAbilities, chapters, creatureAbilities } = getSagaParts(cardOracleText);
      const sagaText = { lines: [...sagaAbilities, ...chapters] };
      const creatureText = { lines: creatureAbilities };
      drawSagaOracleAndArtBox(ctx, {
        palette,
        cardOracleText: sagaText,
        cardArtUrl,
        cropArt,
        artFidelity,
        cardColorTreatment,
        typelineY: SAGA_CREATURE_TYPELINE_Y,
      });
      drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel, y: SAGA_CREATURE_TYPELINE_Y });
      drawSagaCreatureOracleBox(ctx, { palette, cardOracleText: creatureText, cardColorTreatment, inkLevel });
    } else {
      drawSagaOracleAndArtBox(ctx, { palette, cardOracleText, cardArtUrl, cropArt, artFidelity, cardColorTreatment });
      drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel, y: SAGA_TYPELINE_Y });
    }
  } else {
    drawArtBox(ctx, { palette, cardArtUrl, cropArt, artFidelity, cardColorTreatment });
    drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel });
    const oracleLayout =
      subFacePosition === 'left' ? 'right-half' : subFacePosition === 'right' ? 'left-half' : 'full-width';
    if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, {
        palette,
        cardOracleText,
        cardLoyalty,
        cardColorTreatment,
        inkLevel,
        layout: oracleLayout,
      });
    } else {
      drawOracleBox(ctx, {
        palette,
        cardOracleText,
        cardPower: powerAndToughness?.power,
        cardToughness: powerAndToughness?.toughness,
        cardColorTreatment,
        inkLevel,
        layout: oracleLayout,
      });
    }
  }

  if (subFace && subFacePosition) {
    drawSubCard(ctx, subFace, subFacePosition, inkLevel, palette);
  }

  if (powerAndToughness) {
    drawStatsBox(ctx, {
      palette,
      cardPower: powerAndToughness.power,
      cardToughness: powerAndToughness.toughness,
      cardColorTreatment,
      inkLevel,
    });
  }
};

const drawSubCard = (
  ctx: CanvasRenderingContext2D,
  subFace: CardFace,
  position: SubCardPosition,
  inkLevel: InkLevel,
  palette: Palette,
) => {
  const subColorTreatment = getCardColorTreatment(subFace);

  drawSubCardTitleBox(ctx, {
    palette,
    cardName: subFace.name,
    cardManaCost: subFace.manaCost,
    cardColorTreatment: subColorTreatment,
    inkLevel,
    position,
  });
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
    inkLevel,
    position,
  });
};
