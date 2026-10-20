import {
  posterizeLightAdaptive,
  traceContoursAdaptive,
  lightenGrayscale,
  shadeMidtonesAdaptive,
} from '../../common/canvasFilters';
import { drawWhenLoaded, get2dContext, loadImage } from '../../common/canvasRendering';
import { traceRectangle, type Box } from '../../common/canvasShapes';
import { drawInnerLine, type CornerRadii } from './drawFramedBox';
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
    outline,
    x,
    y,
    width,
    height,
  }: {
    cardArtUrl?: string;
    cropArt?: ArtCrop;
    artFidelity?: ArtFidelity;
    /** Rounded outline to clip the art to, with the inner line drawn over its edge */
    outline?: { radii: CornerRadii; color: string };
    x: number;
    y: number;
    width: number;
    height: number;
  },
) => {
  if (!cardArtUrl || artFidelity === 'blank') return;

  void drawWhenLoaded(ctx, loadImage(cardArtUrl), (artImage) => {
    if (!outline && ctx.getTransform().isIdentity) {
      drawFilteredArt(ctx, artImage, { cropArt, artFidelity, x, y, width, height });
      return;
    }

    // Filters change every pixel of a rectangle on the canvas, whatever the
    // context's transform, so rounded art, or art drawn sideways (e.g. on
    // battles), is filtered on its own canvas, and clipped to its corners when
    // drawn on the card
    const art = document.createElement('canvas');
    art.width = Math.ceil(width);
    art.height = Math.ceil(height);
    drawFilteredArt(get2dContext(art), artImage, { cropArt, artFidelity, x: 0, y: 0, width, height });

    if (!outline) {
      ctx.drawImage(art, x, y);
      return;
    }
    ctx.save();
    traceRectangle(ctx, { x, y, width, height }, outline.radii);
    ctx.clip();
    ctx.drawImage(art, x, y);
    ctx.restore();
    drawInnerLine(ctx, { x, y, width, height }, outline.radii, outline.color);
  });
};

/**
 * Draw the art in an area, cropped to its half for split cards, and filtered
 * for its fidelity.
 */
const drawFilteredArt = (
  ctx: CanvasRenderingContext2D,
  artImage: HTMLImageElement,
  { cropArt, artFidelity, x, y, width, height }: { cropArt?: ArtCrop; artFidelity: ArtFidelity } & Box,
) => {
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
};
