import type { Palette } from '../../../../domain/colorTreatment';
import { CARD_LAYOUTS, type Orientation } from '../config';
import { ART_INSET } from '../planeswalkerLayout';
import { drawArtImage } from './drawArtImage';
import { drawFramedBox, type CornerRadii } from './drawFramedBox';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { ArtCrop } from '../../../../domain/cards';
import type { ArtFidelity } from '../../styles';

export const drawArtBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardColorTreatment,
    cardArtUrl,
    cropArt,
    artFidelity,
    orientation = 'portrait',
    y = CARD_LAYOUTS[orientation].artY,
    width = CARD_LAYOUTS[orientation].contentWidth,
    height = CARD_LAYOUTS[orientation].artHeight,
    cornerRadii,
  }: {
    palette: Palette;
    cardColorTreatment: CardColorTreatment;
    cardArtUrl?: string;
    cropArt?: ArtCrop;
    artFidelity?: ArtFidelity;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
    /** Top of the box, higher on planeswalkers */
    y?: number;
    /** Width of the box, centered on the card, wider on planeswalkers */
    width?: number;
    /** Height of the box, which planeswalkers lay out from their art */
    height?: number;
    /** Rounded corners of the box's pinline (its outer edge) and of its art, e.g. planeswalkers' egg-shaped art */
    cornerRadii?: { pinline: CornerRadii; art: CornerRadii };
  },
) => {
  const x = (CARD_LAYOUTS[orientation].width - width) / 2;

  const innerRadii = cornerRadii?.art;
  const inner = drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'rectangle',
    orientation,
    innerHeightAdjustment: 1,
    cornerRadii: cornerRadii && { outer: cornerRadii.pinline, inner: cornerRadii.art },
  });

  if (innerRadii) {
    // Rounded art fills the inner box, clipped to its corners, under its inner line
    drawArtImage(ctx, {
      cardArtUrl,
      cropArt,
      artFidelity,
      ...inner,
      outline: { radii: innerRadii, color: palette.LINE },
    });
    return;
  }

  drawArtImage(ctx, {
    cardArtUrl,
    cropArt,
    artFidelity,
    x: x + ART_INSET,
    y: y + ART_INSET,
    width: width - ART_INSET * 2,
    height: height - ART_INSET * 2,
  });
};
