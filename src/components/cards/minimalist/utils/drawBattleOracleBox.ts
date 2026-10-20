import type { MinimalistPalette } from '../palette';
import { drawDefenseBox, drawRectangle } from '../../common/canvasShapes';
import { fillMultilineText, fitOracleLinesIntoBox } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  DISPLAY_FONT_FAMILY,
  ORACLE_EXTENDED_EXTRA,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_Y,
  PINLINE_THICKNESS,
  TEXT_FONT_FAMILY,
} from '../config';
import { getPaletteColors, type CardColorTreatment } from '../../../../domain/colorTreatment';
import { getFillStyle } from '../../common/canvasStyles';
import type { OracleText } from '../../../../domain/oracleText';

/** Space around the text, in the box turned sideways */
const TEXT_PADDING = { x: 14, y: 6 };
/**
 * Where the defense box is, in the box turned sideways: mostly past its bottom
 * (in the right margin of the card), clear of the text
 */
const DEFENSE_POSITION = { fromRight: 45, belowBox: 38 };

/**
 * Draw the oracle box of a battle: where other cards have theirs, under their
 * title and type line, which stay upright so the card reads in hand, but with
 * its text and defense turned counterclockwise, like realistic battles, so
 * they read when the battle is played sideways.
 */
export const drawBattleOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText,
    cardColorTreatment,
    cardDefense,
  }: {
    palette: MinimalistPalette;
    cardOracleText?: OracleText;
    cardColorTreatment: CardColorTreatment;
    cardDefense?: string;
  },
) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const y = ORACLE_Y;
  const width = CONTENT_WIDTH;
  const height = ORACLE_HEIGHT + ORACLE_EXTENDED_EXTRA;

  // The line under the box, as on other cards
  drawRectangle(ctx, {
    x,
    y: y + height,
    width,
    height: PINLINE_THICKNESS,
    fillStyle: getFillStyle(ctx, getPaletteColors(cardColorTreatment.pinlineColors, palette)),
  });

  // The box turned sideways: its top is the left of the card, and its width the box's height
  ctx.save();
  ctx.translate(x, y + height);
  ctx.rotate(-Math.PI / 2);
  const sidewaysWidth = height;
  const sidewaysHeight = width;

  ctx.font = `${ORACLE_FONT_SIZE}px ${TEXT_FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  const paragraphs = fitOracleLinesIntoBox(
    ctx,
    cardOracleText?.lines ?? [],
    sidewaysWidth - TEXT_PADDING.x * 2,
    sidewaysHeight - TEXT_PADDING.y * 2,
  );
  let currentY = TEXT_PADDING.y + ctx.measureText(':').fontBoundingBoxAscent;
  for (const paragraph of paragraphs) {
    fillMultilineText(ctx, paragraph.lines, TEXT_PADDING.x, currentY);
    currentY += paragraph.paragraphHeight;
  }

  if (cardDefense) {
    drawDefenseBox(ctx, {
      cardDefense,
      x: sidewaysWidth - DEFENSE_POSITION.fromRight,
      y: sidewaysHeight + DEFENSE_POSITION.belowBox,
      fontFamily: DISPLAY_FONT_FAMILY,
      colors: palette,
    });
  }

  ctx.restore();
};
