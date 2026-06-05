import { midBrightnessPass } from '../../../utils/canvasFilters';
import { drawRectangle } from '../../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../../utils/canvasStyles';
import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH, PINLINE_THICKNESS } from '../config';

export const drawArtBox = (ctx, {
  cardColorIdentity,
  cardArtUrl,
}) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = CONTENT_WIDTH;
  const y = ARTWORK_Y;
  const height = ARTWORK_HEIGHT;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: x + PINLINE_THICKNESS,
    y: y + PINLINE_THICKNESS,
    width: width - PINLINE_THICKNESS * 2,
    height: height - PINLINE_THICKNESS * 2 + 1,
    lineWidth: PINLINE_THICKNESS,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const imageX = x + PINLINE_THICKNESS + 2;
  const imageWidth = width - PINLINE_THICKNESS * 2 - 4;
  const imageY = y + PINLINE_THICKNESS + 2;
  const imageHeight = height - PINLINE_THICKNESS * 2 - 4;

  const artImage = new Image();
  artImage.crossOrigin = 'Anonymous';
  artImage.src = cardArtUrl;
  artImage.onload = () => {
    ctx.drawImage(artImage, imageX, imageY, imageWidth, imageHeight);
    midBrightnessPass(ctx, imageX, imageY, imageWidth, imageHeight);
  };
};
