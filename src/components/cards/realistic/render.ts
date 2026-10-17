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
import { getColorTreatment } from '../../../domain/colorTreatment';
import type { CardRenderProps } from '../styles';
import { get2dContext } from '../common/canvasRendering';

/**
 * Draw a card in the realistic style on a canvas.
 *
 * @param canvas - 500x700 canvas
 */
export const renderRealisticCard = (
  canvas: HTMLCanvasElement,
  { face, subFace, subFacePosition, blackBordered }: CardRenderProps,
) => {
  const cardColorTreatment = getColorTreatment(face);
  const cardName = face.name;
  const cardManaCost = face.manaCost;
  const cardTypeLine = face.typeLine;
  const cardOracleText = face.oracleText;
  const powerAndToughness = getPowerAndToughness(face);
  const cardLoyalty = getLoyalty(face);

  const { assetUrl: cardArtUrl, crop: cropArt } = face.art;

  const ctx = get2dContext(canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawOuterFrame(ctx, { blackBordered });
  drawTitleBox(ctx, { cardName, cardManaCost, cardColorTreatment });

  if (face.faceLayout === 'saga') {
    if (powerAndToughness) {
      // The lines after the chapters are the creature's abilities, in their own box
      const { introduction, chapters, conclusion } = getSagaParts(cardOracleText);
      const sagaText = { lines: [...introduction, ...chapters] };
      const creatureText = { lines: conclusion };
      drawSagaOracleAndArtBox(ctx, {
        cardOracleText: sagaText,
        cardArtUrl,
        cropArt,
        cardColorTreatment,
        typelineY: SAGA_CREATURE_TYPELINE_Y,
      });
      drawTypeBox(ctx, { cardType: cardTypeLine, cardColorTreatment, y: SAGA_CREATURE_TYPELINE_Y });
      drawSagaCreatureOracleBox(ctx, { cardOracleText: creatureText, cardColorTreatment });
    } else {
      drawSagaOracleAndArtBox(ctx, { cardOracleText, cardArtUrl, cropArt, cardColorTreatment });
      drawTypeBox(ctx, { cardType: cardTypeLine, cardColorTreatment, y: SAGA_TYPELINE_Y });
    }
  } else {
    drawArtBox(ctx, { cardArtUrl, cropArt, cardColorTreatment });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorTreatment });
    const oracleLayout =
      subFacePosition === 'left' ? 'right-half' : subFacePosition === 'right' ? 'left-half' : 'full-width';
    if (cardLoyalty) {
      drawPlaneswalkerOracleBox(ctx, { cardOracleText, cardLoyalty, cardColorTreatment, layout: oracleLayout });
    } else {
      drawOracleBox(ctx, {
        cardOracleText,
        cardPower: powerAndToughness?.power,
        cardToughness: powerAndToughness?.toughness,
        cardColorTreatment,
        layout: oracleLayout,
      });
    }
  }

  if (subFace && subFacePosition) {
    drawSubCard(ctx, subFace, subFacePosition);
  }

  if (powerAndToughness) {
    drawStatsBox(ctx, {
      cardPower: powerAndToughness.power,
      cardToughness: powerAndToughness.toughness,
      cardColorTreatment,
    });
  }
};

const drawSubCard = (ctx: CanvasRenderingContext2D, subFace: CardFace, position: SubCardPosition) => {
  const subColorTreatment = getColorTreatment(subFace);

  drawSubCardTitleBox(ctx, {
    cardName: subFace.name,
    cardManaCost: subFace.manaCost,
    cardColorTreatment: subColorTreatment,
    position,
  });
  drawSubCardTypeBox(ctx, {
    cardType: subFace.typeLine,
    cardColorTreatment: subColorTreatment,
    position,
  });
  drawSubCardOracleBox(ctx, {
    cardOracleText: subFace.oracleText,
    cardColorTreatment: subColorTreatment,
    position,
  });
};
