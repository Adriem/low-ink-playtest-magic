import type { Palette } from '../../../../domain/colorTreatment';
import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH } from '../config';
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
    y = ARTWORK_Y,
    width = CONTENT_WIDTH,
    height = ARTWORK_HEIGHT,
    cornerRadii,
  }: {
    palette: Palette;
    cardColorTreatment: CardColorTreatment;
    cardArtUrl?: string;
    cropArt?: ArtCrop;
    artFidelity?: ArtFidelity;
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
  const x = (ctx.canvas.width - width) / 2;

  const innerRadii = cornerRadii?.art;
  const inner = drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'rectangle',
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
