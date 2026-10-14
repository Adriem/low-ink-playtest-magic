import { midBrightnessPass } from '../../../utils/canvasFilters';
import { drawWhenLoaded, loadImage } from '../../../utils/canvasRendering';

/**
 * Draw the card's art in the given area once it loads, with the low-ink filter.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} options
 * @param {string} [options.cardArtUrl] - Nothing is drawn without it
 * @param {'left-half'|'right-half'} [options.cropArt] - Draw only this part of
 *   the image, for split cards whose faces share an image with both arts
 */
export const drawArtImage = (ctx, { cardArtUrl, cropArt, x, y, width, height }) => {
  if (!cardArtUrl) return;

  void drawWhenLoaded(ctx, loadImage(cardArtUrl), (artImage) => {
    if (cropArt) {
      const halfWidth = artImage.naturalWidth / 2;
      const sourceX = cropArt === 'right-half' ? halfWidth : 0;
      ctx.drawImage(artImage, sourceX, 0, halfWidth, artImage.naturalHeight, x, y, width, height);
    } else {
      ctx.drawImage(artImage, x, y, width, height);
    }
    midBrightnessPass(ctx, x, y, width, height);
  });
};
