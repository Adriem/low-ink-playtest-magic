import type { Palette } from '../../../../domain/colorTreatment';
import {
  drawLoyaltyBox,
  drawLoyaltyCost,
  getLoyaltyCostNumberOffset,
  LOYALTY_COST_FONT_SIZE,
  LOYALTY_COST_HALF_WIDTH,
} from '../../common/canvasShapes';
import { fillMultilineText, fitOracleLinesIntoBox } from '../../common/oracleTextRenderer';
import {
  CONTENT_WIDTH,
  FONT_FAMILY,
  LOYALTY_BOX_X,
  LOYALTY_BOX_Y,
  ORACLE_FONT_SIZE,
  ORACLE_HEIGHT,
  ORACLE_TEXT_PADDING_X,
  ORACLE_Y,
  PINLINE_THICKNESS,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import type { InkLevel, OracleLayout } from '../../styles';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import { isLoyaltyAbility, type OracleText } from '../../../../domain/oracleText';

/** Width of the pinline on the left of the box, where the loyalty costs go */
const LOYALTY_PINLINE_WIDTH = 27;
/** Width of the pinline at the bottom of the box: twice the others */
const BOTTOM_PINLINE_WIDTH = PINLINE_THICKNESS * 2.5;
/** How far left of the text box's edge the loyalty costs are centered, so they overlap it a little */
const LOYALTY_COST_OFFSET = 10;
/** Space around the colon after a loyalty cost */
const LOYALTY_COLON_GAP = 3;
/** Space above the text */
const TEXT_PADDING_TOP = 6;
/** Space below the text, so it doesn't run under the loyalty box */
const TEXT_PADDING_BOTTOM = 14;
/** How far below the colon's baseline the numbers of loyalty costs go: where minus costs have them */
const MINUS_COST_NUMBER_OFFSET = getLoyaltyCostNumberOffset('−1');
/** How much higher plus costs go than that, as their icon's arrow points up */
const PLUS_COST_RAISE = 2;
/** Least room a loyalty ability takes: as tall as its cost's icon, plus a little space, so icons don't overlap */
const LOYALTY_ABILITY_MIN_HEIGHT = 42;

/**
 * Rounded corners of the box, like the card background's: the colored box is
 * only rounded at the bottom, and the inner box at the top and the bottom.
 * The bottom corners can be elliptical, with a horizontal and a vertical
 * radius.
 */
const BOTTOM_CORNER_RADIUS = { horizontal: 100, vertical: 28 };
const CORNER_RADII = {
  outer: { top: 0, bottom: BOTTOM_CORNER_RADIUS },
  inner: {
    top: 10,
    bottom: {
      horizontal: BOTTOM_CORNER_RADIUS.horizontal - PINLINE_THICKNESS,
      vertical: BOTTOM_CORNER_RADIUS.vertical - BOTTOM_PINLINE_WIDTH,
    },
  },
};

/**
 * Notch cut up into the middle of the bottom of the box, like printed
 * planeswalkers': as wide as this at the bottom and as deep, with a flat top
 * and ends curving up steeply over their width (quarters of an ellipse), and
 * shallower than the bottom pinline so it doesn't reach the text box.
 */
const NOTCH = { width: 240, depth: 7, cornerWidth: 40 };

/**
 * Draw the oracle text box of a planeswalker, with its loyalty box overlapping
 * the bottom of it. Loyalty abilities start with their cost, on the wide
 * pinline on the left of the box and overlapping the text box a little,
 * centered on their paragraph and followed by a colon.
 *
 * @param options.y - Top of the box, which planeswalkers lay out from their art
 * @param options.height - Height of the box
 */
export const drawPlaneswalkerOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText = { lines: [] },
    cardLoyalty,
    cardColorTreatment,
    inkLevel,
    layout,
    y = ORACLE_Y,
    height = ORACLE_HEIGHT,
  }: {
    palette: Palette;
    cardOracleText?: OracleText;
    cardLoyalty: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    layout: OracleLayout;
    y?: number;
    height?: number;
  },
) => {
  const x = layout === 'right-half' ? ctx.canvas.width / 2 : (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = layout === 'full-width' ? CONTENT_WIDTH : CONTENT_WIDTH / 2;

  // The box is drawn everywhere but its notch, which shows what's under it
  ctx.save();
  clipOutNotch(ctx, { x: x + width / 2, y: y + height });
  const inner = drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
    leftPinlineWidth: LOYALTY_PINLINE_WIDTH,
    bottomPinlineWidth: BOTTOM_PINLINE_WIDTH,
    cornerRadii: CORNER_RADII,
  });
  ctx.restore();

  ctx.font = `${ORACLE_FONT_SIZE}px ${FONT_FAMILY}`;
  ctx.fillStyle = palette.TEXT;
  ctx.textAlign = 'start';

  // The colon after the loyalty costs is as big as their numbers
  const colonFont = `${LOYALTY_COST_FONT_SIZE}px ${FONT_FAMILY}`;
  const costX = inner.x - LOYALTY_COST_OFFSET;
  const colonX = costX + LOYALTY_COST_HALF_WIDTH + LOYALTY_COLON_GAP;
  const abilityX = colonX + measureTextInFont(ctx, ':', colonFont) + LOYALTY_COLON_GAP * 2;
  const regularX = inner.x + ORACLE_TEXT_PADDING_X;
  const textRight = inner.x + inner.width - ORACLE_TEXT_PADDING_X;

  // Loyalty abilities, and their modes, go after the loyalty costs
  const paragraphs = fitOracleLinesIntoBox(
    ctx,
    cardOracleText.lines,
    (line) => textRight - (isLoyaltyAbility(line) ? abilityX : regularX),
    inner.height - TEXT_PADDING_TOP - TEXT_PADDING_BOTTOM,
    { minParagraphHeight: (line, isMode) => (isLoyaltyAbility(line) && !isMode ? LOYALTY_ABILITY_MIN_HEIGHT : 0) },
  );

  // The first line's baseline is as far below the padding as the fitted font's ascent
  let currentY = inner.y + TEXT_PADDING_TOP + ctx.measureText(':').fontBoundingBoxAscent;
  for (const paragraph of paragraphs) {
    const { line } = paragraph;
    // Short abilities' text is centered in their room, as their cost is
    const paragraphTextY = currentY + paragraph.textOffset;
    fillMultilineText(ctx, paragraph.lines, isLoyaltyAbility(line) ? abilityX : regularX, paragraphTextY);

    if (isLoyaltyAbility(line) && !paragraph.isMode) {
      const middleY = paragraphTextY + (paragraph.lineHeight * (paragraph.lines.length - 1)) / 2;
      // The loyalty cost and its colon change the font and alignment, which the next paragraphs need
      ctx.save();
      drawLoyaltyCost(ctx, {
        loyaltyCost: line.loyaltyCost,
        x: costX,
        // Every cost's number goes where minus costs have it, a bit below the colon's baseline
        y:
          middleY +
          MINUS_COST_NUMBER_OFFSET -
          getLoyaltyCostNumberOffset(line.loyaltyCost) -
          (line.loyaltyCost.startsWith('+') ? PLUS_COST_RAISE : 0),
        fontFamily: FONT_FAMILY,
        colors: palette,
      });
      ctx.font = colonFont;
      ctx.fillStyle = palette.TEXT;
      ctx.textAlign = 'start';
      ctx.fillText(':', colonX, middleY);
      ctx.restore();
    }

    currentY += paragraph.paragraphHeight;
  }

  drawLoyaltyBox(ctx, {
    cardLoyalty,
    x: LOYALTY_BOX_X,
    y: LOYALTY_BOX_Y,
    fontFamily: FONT_FAMILY,
    colors: palette,
  });
};

/**
 * Clip the drawings on the canvas to everywhere but the notch at the bottom of
 * the box: the canvas and the notch, with the notch left out as it's inside
 * the canvas (the even-odd rule).
 *
 * @param bottomCenter - Middle of the bottom of the box
 */
const clipOutNotch = (ctx: CanvasRenderingContext2D, bottomCenter: { x: number; y: number }) => {
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const right = bottomCenter.x + NOTCH.width / 2;
  const left = bottomCenter.x - NOTCH.width / 2;
  ctx.moveTo(right, bottomCenter.y);
  // Up from the right end, along the flat top, and down to the left end
  ctx.ellipse(right - NOTCH.cornerWidth, bottomCenter.y, NOTCH.cornerWidth, NOTCH.depth, 0, 0, -Math.PI / 2, true);
  ctx.lineTo(left + NOTCH.cornerWidth, bottomCenter.y - NOTCH.depth);
  ctx.ellipse(
    left + NOTCH.cornerWidth,
    bottomCenter.y,
    NOTCH.cornerWidth,
    NOTCH.depth,
    0,
    -Math.PI / 2,
    -Math.PI,
    true,
  );
  ctx.closePath();
  ctx.clip('evenodd');
};

/**
 * Width of a text in a font, leaving the context's font as it was.
 */
const measureTextInFont = (ctx: CanvasRenderingContext2D, text: string, font: string): number => {
  const previousFont = ctx.font;
  ctx.font = font;
  const width = ctx.measureText(text).width;
  ctx.font = previousFont;
  return width;
};
