import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH, PINLINE_THICKNESS } from '../config';
import { drawArtImage } from './drawArtImage';
import { drawFramedBox } from './drawFramedBox';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { ArtCrop } from '../../../../domain/cards';
import type { ArtFidelity } from '../../styles';

export const drawArtBox = (
  ctx: CanvasRenderingContext2D,
  {
    cardColorTreatment,
    cardArtUrl,
    cropArt,
    artFidelity,
  }: { cardColorTreatment: CardColorTreatment; cardArtUrl?: string; cropArt?: ArtCrop; artFidelity?: ArtFidelity },
) => {
  const x = (ctx.canvas.width - CONTENT_WIDTH) / 2;
  const width = CONTENT_WIDTH;
  const y = ARTWORK_Y;
  const height = ARTWORK_HEIGHT;

  drawFramedBox(ctx, {
    x,
    y,
    width,
    height,
    cardColorTreatment,
    shape: 'rectangle',
    innerHeightAdjustment: 1,
  });

  drawArtImage(ctx, {
    cardArtUrl,
    cropArt,
    artFidelity,
    x: x + PINLINE_THICKNESS + 2,
    y: y + PINLINE_THICKNESS + 2,
    width: width - PINLINE_THICKNESS * 2 - 4,
    height: height - PINLINE_THICKNESS * 2 - 4,
  });
};
