import {
  posterizeLightAdaptive,
  traceContoursAdaptive,
  lightenGrayscale,
  shadeMidtonesAdaptive,
} from '../../common/canvasFilters';
import { drawWhenLoaded, loadImage } from '../../common/canvasRendering';
import type { ArtCrop } from '../../../../domain/cards';
import type { ArtFidelity } from '../../styles';

/**
 * Draw the card's art in the given area once it loads, with the low-ink filter.
 *
 * @param options.cardArtUrl - Nothing is drawn without it
 * @param options.cropArt - Draw only this part of
 *   the image, for split cards whose faces share an image with both arts
 */
export const drawArtImage = (
  ctx: CanvasRenderingContext2D,
  {
    cardArtUrl,
    cropArt,
    artFidelity = 'posterized',
    x,
    y,
    width,
    height,
  }: {
    cardArtUrl?: string;
    cropArt?: ArtCrop;
    artFidelity?: ArtFidelity;
    x: number;
    y: number;
    width: number;
    height: number;
  },
) => {
  if (!cardArtUrl || artFidelity === 'blank') return;

  void drawWhenLoaded(ctx, loadImage(cardArtUrl), (artImage) => {
    if (cropArt && cropArt !== 'full') {
      const halfWidth = artImage.naturalWidth / 2;
      const sourceX = cropArt === 'right-half' ? halfWidth : 0;
      ctx.drawImage(artImage, sourceX, 0, halfWidth, artImage.naturalHeight, x, y, width, height);
    } else {
      ctx.drawImage(artImage, x, y, width, height);
    }
    if (artFidelity === 'contours') traceContoursAdaptive(ctx, x, y, width, height);
    if (artFidelity === 'mid-tones') shadeMidtonesAdaptive(ctx, x, y, width, height);
    if (artFidelity === 'posterized') posterizeLightAdaptive(ctx, x, y, width, height);
    if (artFidelity === 'grayscale') lightenGrayscale(ctx, x, y, width, height);
  });
};
