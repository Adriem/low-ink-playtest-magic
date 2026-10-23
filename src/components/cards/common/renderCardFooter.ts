import i18n from '../../../i18n';

/** Font size below which lines are condensed to fit instead, so they stay readable */
const MIN_FONT_SIZE = 9;
/** Space between the baselines of the footer's lines, relative to its font size */
const LINE_HEIGHT_RATIO = 1.15;
/** Smallest space between the footer's left and right columns, relative to its font size */
const COLUMN_GAP_RATIO = 1;
/** Space between the parts of a sideways footer, relative to its font size */
const SIDEWAYS_PARTS_GAP_RATIO = 1.07;

interface CardFooterProps {
  /** Credited only where the card's art is drawn */
  artist?: string;
  /** Baseline of the bottom line */
  y: number;
  /** Font size when the footer fits, which shrinks when it doesn't */
  maxFontSize: number;
  fontFamily: string;
  color: string;
}

/**
 * Draw the footer of a card in two columns of small print, in bold so it
 * prints legibly: on the left, the artist who illustrated it, with "NOT FOR
 * SALE" above; on the right, Wizards of the Coast's copyright, level with the
 * artist. Without an artist, "NOT FOR SALE" takes its place.
 *
 * @param x - Where the footer starts
 * @param width - How wide the footer is: its right column ends there
 * @param copyrightFirst - With the copyright on the left, and the rest on the right
 */
export const renderRegularCardFooter = (
  ctx: CanvasRenderingContext2D,
  {
    artist,
    x,
    width,
    y,
    maxFontSize,
    fontFamily,
    color,
    copyrightFirst = false,
  }: CardFooterProps & { x: number; width: number; copyrightFirst?: boolean },
) => {
  const notForSale = i18n.t('card_footer.not_for_sale');
  const copyright = i18n.t('card_footer.copyright');
  const credits = artist ? i18n.t('card_footer.illustrator', { artist }) : notForSale;
  const [leftText, rightText] = copyrightFirst ? [copyright, credits] : [credits, copyright];
  const right = x + width;
  const measureBottomLine = () => {
    return [ctx.measureText(leftText).width, ctx.measureText(rightText).width];
  };

  ctx.save();
  setFont(ctx, maxFontSize, fontFamily);
  const [leftWidth, rightWidth] = measureBottomLine();
  const fontSize = fitFontSize(maxFontSize, width, leftWidth + rightWidth + maxFontSize * COLUMN_GAP_RATIO);
  setFont(ctx, fontSize, fontFamily);
  // Still too long at the smallest size, both columns are condensed alike
  const [fittedLeftWidth, fittedRightWidth] = measureBottomLine();
  const condensed = Math.min(1, (width - fontSize * COLUMN_GAP_RATIO) / (fittedLeftWidth + fittedRightWidth));
  ctx.fillStyle = color;
  ctx.textBaseline = 'alphabetic';

  ctx.textAlign = 'left';
  ctx.fillText(leftText, x, y, fittedLeftWidth * condensed);
  ctx.textAlign = 'right';
  ctx.fillText(rightText, right, y, fittedRightWidth * condensed);
  // "NOT FOR SALE" goes above the artist, aligned like it
  if (artist) {
    ctx.textAlign = copyrightFirst ? 'right' : 'left';
    ctx.fillText(notForSale, copyrightFirst ? right : x, y - fontSize * LINE_HEIGHT_RATIO);
  }
  ctx.restore();
};

/**
 * Draw the footer of a card read sideways (turned clockwise, e.g. battles), as
 * one centered line of small print, in bold: the artist who illustrated it,
 * "[NOT FOR SALE]", and Wizards of the Coast's copyright, spaced apart. It's
 * turned with the card, so its coordinates are those of the turned card.
 *
 * @param x - Middle of the line
 * @param width - How wide the line can be
 */
export const renderSidewaysCardFooter = (
  ctx: CanvasRenderingContext2D,
  { artist, x, y, width: maxWidth, maxFontSize, fontFamily, color }: CardFooterProps & { x: number; width: number },
) => {
  const parts = [
    artist && i18n.t('card_footer.illustrator', { artist }),
    `[${i18n.t('card_footer.not_for_sale')}]`,
    i18n.t('card_footer.copyright'),
  ].filter((part): part is string => Boolean(part));
  const measureLine = (fontSize: number) => {
    setFont(ctx, fontSize, fontFamily);
    const gap = fontSize * SIDEWAYS_PARTS_GAP_RATIO;
    const widths = parts.map((part) => ctx.measureText(part).width);
    return { gap, widths, width: widths.reduce((sum, width) => sum + width, 0) + gap * (parts.length - 1) };
  };

  ctx.save();
  const { gap, widths, width } = measureLine(fitFontSize(maxFontSize, maxWidth, measureLine(maxFontSize).width));
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // Turned counterclockwise on the canvas, so it reads with the card turned clockwise
  ctx.translate(0, ctx.canvas.height);
  ctx.rotate(-Math.PI / 2);
  ctx.translate(x, y);
  // Still too long at the smallest size, the line is condensed to fit
  ctx.scale(Math.min(1, maxWidth / width), 1);
  let partX = -width / 2;
  parts.forEach((part, index) => {
    ctx.fillText(part, partX, 0);
    partX += widths[index] + gap;
  });
  ctx.restore();
};

/**
 * Draw one notice of a card's footer on its own, e.g. on a half of a unified
 * card that shares the footer with the other half: Wizards of the Coast's
 * copyright, or "NOT FOR SALE".
 *
 * @param x - Where the notice starts
 * @param width - How wide the notice can be
 */
export const renderCardFooterNotice = (
  ctx: CanvasRenderingContext2D,
  {
    notice,
    x,
    y,
    width,
    maxFontSize,
    fontFamily,
    color,
  }: Omit<CardFooterProps, 'artist'> & { notice: 'copyright' | 'not-for-sale'; x: number; width: number },
) => {
  const text = i18n.t(notice === 'copyright' ? 'card_footer.copyright' : 'card_footer.not_for_sale');

  ctx.save();
  setFont(ctx, maxFontSize, fontFamily);
  setFont(ctx, fitFontSize(maxFontSize, width, ctx.measureText(text).width), fontFamily);
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, x, y, width);
  ctx.restore();
};

const setFont = (ctx: CanvasRenderingContext2D, fontSize: number, fontFamily: string) => {
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
};

/**
 * The font size text fits its room with: text width grows with the font size,
 * so the font shrinks as much as the text overflows, down to the smallest
 * readable size (below which it's condensed to fit instead).
 */
const fitFontSize = (maxFontSize: number, maxWidth: number, widthAtMaxSize: number): number => {
  const fit = Math.min(1, maxWidth / widthAtMaxSize);
  return Math.max(MIN_FONT_SIZE, Math.floor(maxFontSize * fit));
};
