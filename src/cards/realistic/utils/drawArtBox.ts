import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH, PINLINE_THICKNESS } from '../config';
import { drawArtImage } from './drawArtImage';
import { drawFramedBox } from './drawFramedBox';
import type { ColorIdentity } from '../../../utils/colors';
import type { CropArt } from '../../../types/cards';

export const drawArtBox = (ctx: CanvasRenderingContext2D, {
  cardColorIdentity,
  cardArtUrl,
  cropArt,
}: { cardColorIdentity?: ColorIdentity, cardArtUrl?: string, cropArt?: CropArt }) => {
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

  drawArtImage(ctx, {
    cardArtUrl,
    cropArt,
    x: x + PINLINE_THICKNESS + 2,
    y: y + PINLINE_THICKNESS + 2,
    width: width - PINLINE_THICKNESS * 2 - 4,
    height: height - PINLINE_THICKNESS * 2 - 4,
  });
};
