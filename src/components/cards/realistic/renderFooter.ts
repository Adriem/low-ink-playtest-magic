import { renderRegularCardFooter, renderSidewaysCardFooter } from '../common/renderCardFooter';
import { resolvePalette } from '../common/canvasStyles';
import {
  CARD_LAYOUTS,
  FONT_FAMILY,
  FOOTER_MAX_FONT_SIZE,
  UNIFIED_FOOTER_WITH_STATS_Y,
  UNIFIED_FOOTER_Y,
  UPRIGHT_HALF_FOOTER,
} from './config';
import { REALISTIC_PALETTE } from './palette';
import { getArtists, getLoyalty, getPowerAndToughness } from '../../../domain/cards';
import type { CardFooterProps } from '../styles';

/**
 * Draw the footer of a card in the realistic style, in the color of the
 * canvas around its card background (white on black-bordered cards):
 * - in two columns below portrait cards, and below the upright half of
 *   unified cards (e.g. battles, aftermath cards)
 * - in one centered line along landscape cards (e.g. battles), beside their
 *   defense box, and along unified cards whose halves read sideways (e.g.
 *   split cards), for both halves
 *
 * Artists are only credited when the art is drawn.
 */
export const renderRealisticFooter = (
  ctx: CanvasRenderingContext2D,
  { faces, placement, blackBordered, artFidelity = 'posterized', customPalette }: CardFooterProps,
) => {
  const palette = resolvePalette(REALISTIC_PALETTE, customPalette);
  const footer = {
    artist: artFidelity === 'blank' ? undefined : getArtists(faces),
    maxFontSize: FOOTER_MAX_FONT_SIZE,
    fontFamily: FONT_FAMILY,
    color: blackBordered ? palette.PAPER : palette.TEXT,
  };
  const portrait = CARD_LAYOUTS.portrait;
  const landscape = CARD_LAYOUTS.landscape;

  if (placement === 'right-side') {
    const hasStats = faces.some((face) => getPowerAndToughness(face) || getLoyalty(face));
    // Without a defense box, the line can be as wide as the card's content
    renderSidewaysCardFooter(ctx, {
      ...footer,
      x: landscape.width / 2,
      y: hasStats ? UNIFIED_FOOTER_WITH_STATS_Y : UNIFIED_FOOTER_Y,
      width: landscape.contentWidth,
    });
  } else if (placement === 'upright-half') {
    renderRegularCardFooter(ctx, { ...footer, ...UPRIGHT_HALF_FOOTER });
  } else if (faces[0]?.orientation === 'landscape') {
    renderSidewaysCardFooter(ctx, {
      ...footer,
      x: landscape.footerX + landscape.footerWidth / 2,
      y: landscape.footerY,
      width: landscape.footerWidth,
    });
  } else {
    renderRegularCardFooter(ctx, { ...footer, x: portrait.footerX, y: portrait.footerY, width: portrait.footerWidth });
  }
};
