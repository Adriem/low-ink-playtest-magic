import { renderCardFooterNotice, renderRegularCardFooter } from '../common/renderCardFooter';
import { resolvePalette } from '../common/canvasStyles';
import { CARD_HEIGHT, CARD_WIDTH } from '../common/cardSize';
import type { CardFooterProps } from '../styles';
import { FOOTER_MAX_FONT_SIZE, FOOTER_WIDTH, FOOTER_X, FOOTER_Y, TEXT_FONT_FAMILY } from './config';
import { MINIMALIST_PALETTE } from './palette';

/**
 * Draw the footer of a card in the minimalist style: the copyright, then "NOT
 * FOR SALE", left of the stats and loyalty boxes. Minimalist cards have no
 * art, so there's no artist to credit.
 *
 * Unified cards, whose halves' stats boxes reach the bottom of the turned
 * card, share it between their halves: the copyright below the bottom one,
 * and "NOT FOR SALE" below the upper one. Their halves never read upright.
 */
export const renderMinimalistFooter = (
  ctx: CanvasRenderingContext2D,
  { faces, placement, customPalette }: CardFooterProps,
) => {
  const palette = resolvePalette(MINIMALIST_PALETTE, customPalette);
  const footer = {
    x: FOOTER_X,
    width: FOOTER_WIDTH,
    y: FOOTER_Y,
    maxFontSize: FOOTER_MAX_FONT_SIZE,
    fontFamily: TEXT_FONT_FAMILY,
    color: palette.TEXT,
  };

  if (placement !== 'right-side') {
    renderRegularCardFooter(ctx, { ...footer, copyrightFirst: true });
    return;
  }

  // Each half takes half the card turned clockwise, as it's read, with a face shrunk into it: the first
  // one is on the bottom half of the card
  const halfWidth = CARD_HEIGHT / 2;
  const notices = ['copyright', 'not-for-sale'] as const;
  faces.forEach((_, index) => {
    ctx.save();
    ctx.translate(0, CARD_HEIGHT);
    ctx.rotate(-Math.PI / 2);
    ctx.translate(index * halfWidth, 0);
    ctx.scale(halfWidth / CARD_WIDTH, CARD_WIDTH / CARD_HEIGHT);
    // As big as on other cards, rather than shrunk with the half
    renderCardFooterNotice(ctx, {
      ...footer,
      notice: notices[index],
      maxFontSize: (FOOTER_MAX_FONT_SIZE * CARD_HEIGHT) / CARD_WIDTH,
    });
    ctx.restore();
  });
};
