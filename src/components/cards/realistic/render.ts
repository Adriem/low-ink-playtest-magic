import { drawDefenseBox } from '../common/canvasShapes';
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
import { CARD_LAYOUTS, FONT_FAMILY, SAGA_CREATURE_TYPELINE_Y, SAGA_TYPELINE_Y } from './config';
import { drawSagaCreatureOracleBox } from './utils/drawSagaCreatureOracleBox';
import { drawSagaOracleAndArtBox } from './utils/drawSagaOracleAndArtBox';
import {
  getDefense,
  getLoyalty,
  getPowerAndToughness,
  type CardFace,
  type SubCardPosition,
} from '../../../domain/cards';
import { getCardColorTreatment } from '../../../domain/colorTreatment';
import type { ArtFidelity, CardRenderProps, InkLevel } from '../styles';
import { hasBlackBorder, resolvePalette } from '../common/canvasStyles';
import { REALISTIC_PALETTE } from './palette';
import type { CardColorTreatment, Palette } from '../../../domain/colorTreatment';
import { drawWhenLoaded, get2dContext, loadImage } from '../common/canvasRendering';
import { ART_CORNER_RADII, getPlaneswalkerLayout, type PlaneswalkerLayout } from './planeswalkerLayout';

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

  if (face.orientation === 'landscape') {
    drawLandscapeCard(ctx, { face, palette, cardColorTreatment, blackBordered, inkLevel, artFidelity });
    return;
  }

  drawOuterFrame(ctx, {
    palette,
    blackBordered: hasBlackBorder({ blackBordered, inkLevel }),
    inkLevel,
    cardColorTreatment,
  });
  // Planeswalkers have their title higher, whatever their art
  const titleY = cardLoyalty ? getPlaneswalkerLayout().titleY : undefined;
  drawTitleBox(ctx, { palette, cardName, cardManaCost, cardColorTreatment, inkLevel, y: titleY });

  const oracleLayout =
    subFacePosition === 'left' ? 'right-half' : subFacePosition === 'right' ? 'left-half' : 'full-width';

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
  } else if (cardLoyalty) {
    // Planeswalkers lay out their boxes from their art, once it loads
    const drawBoxes = (layout: PlaneswalkerLayout) => {
      drawArtBox(ctx, {
        palette,
        cardArtUrl,
        cropArt,
        artFidelity,
        cardColorTreatment,
        y: layout.artY,
        width: layout.artWidth,
        height: layout.artHeight,
        cornerRadii: ART_CORNER_RADII,
      });
      drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel, y: layout.typelineY });
      drawPlaneswalkerOracleBox(ctx, {
        palette,
        cardOracleText,
        cardLoyalty,
        cardColorTreatment,
        inkLevel,
        layout: oracleLayout,
        y: layout.oracleY,
        height: layout.oracleHeight,
      });
    };
    if (cardArtUrl) {
      // Art that doesn't load leaves the boxes where other cards have them
      const art = loadImage(cardArtUrl).catch(() => null);
      void drawWhenLoaded(ctx, art, (loadedArt) => drawBoxes(getPlaneswalkerLayout(loadedArt)));
    } else {
      drawBoxes(getPlaneswalkerLayout());
    }
  } else {
    drawArtBox(ctx, { palette, cardArtUrl, cropArt, artFidelity, cardColorTreatment });
    drawTypeBox(ctx, { palette, cardType: cardTypeLine, cardColorTreatment, inkLevel });
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

/**
 * Draw a landscape card (e.g. a battle, or the first half of an aftermath
 * card), laid out sideways and turned counterclockwise into the canvas.
 */
const drawLandscapeCard = (
  ctx: CanvasRenderingContext2D,
  {
    face,
    palette,
    cardColorTreatment,
    blackBordered,
    inkLevel,
    artFidelity,
  }: {
    face: CardFace;
    palette: Palette;
    cardColorTreatment: CardColorTreatment;
    blackBordered?: boolean;
    inkLevel: InkLevel;
    artFidelity: ArtFidelity;
  },
) => {
  const orientation = 'landscape';
  const layout = CARD_LAYOUTS[orientation];
  const cardDefense = getDefense(face);

  ctx.save();
  ctx.translate(0, ctx.canvas.height);
  ctx.rotate(-Math.PI / 2);

  drawOuterFrame(ctx, {
    palette,
    blackBordered: hasBlackBorder({ blackBordered, inkLevel }),
    inkLevel,
    cardColorTreatment,
    orientation,
  });
  drawTitleBox(ctx, {
    palette,
    cardName: face.name,
    cardManaCost: face.manaCost,
    cardColorTreatment,
    inkLevel,
    orientation,
  });
  drawArtBox(ctx, {
    palette,
    cardArtUrl: face.art.assetUrl,
    cropArt: face.art.crop,
    artFidelity,
    cardColorTreatment,
    orientation,
  });
  drawTypeBox(ctx, { palette, cardType: face.typeLine, cardColorTreatment, inkLevel, orientation });
  drawOracleBox(ctx, {
    palette,
    cardOracleText: face.oracleText,
    cardColorTreatment,
    inkLevel,
    layout: 'full-width',
    orientation,
  });
  if (cardDefense) {
    drawDefenseBox(ctx, {
      cardDefense,
      x: layout.defenseX,
      y: layout.defenseY,
      fontFamily: FONT_FAMILY,
      colors: palette,
    });
  }

  ctx.restore();
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
