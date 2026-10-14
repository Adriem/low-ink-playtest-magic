import { midBrightnessPass } from '../../../utils/canvasFilters';
import { drawWhenLoaded, loadImage } from '../../../utils/canvasRendering';
import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH, PINLINE_THICKNESS } from '../config';
import { drawFramedBox } from './drawFramedBox';

export const drawArtBox = (ctx, {
  cardColorIdentity,
  cardArtUrl,
  cropArt,
}) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = CONTENT_WIDTH;
  const y = ARTWORK_Y;
  const height = ARTWORK_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorIdentity,
    shape: 'rectangle',
    innerHeightAdjustment: 1,
  });

  const imageX = x + PINLINE_THICKNESS + 2;
  const imageWidth = width - PINLINE_THICKNESS * 2 - 4;
  const imageY = y + PINLINE_THICKNESS + 2;
  const imageHeight = height - PINLINE_THICKNESS * 2 - 4;

  if (!cardArtUrl) return;

  void drawWhenLoaded(ctx, loadImage(cardArtUrl), (artImage) => {
    if (cropArt) {
      // Draw only this face's half of an image with both faces' art side by side
      const halfWidth = artImage.naturalWidth / 2;
      const sourceX = cropArt === 'right-half' ? halfWidth : 0;
      ctx.drawImage(artImage, sourceX, 0, halfWidth, artImage.naturalHeight, imageX, imageY, imageWidth, imageHeight);
    } else {
      ctx.drawImage(artImage, imageX, imageY, imageWidth, imageHeight);
    }
    midBrightnessPass(ctx, imageX, imageY, imageWidth, imageHeight);
  });
};
