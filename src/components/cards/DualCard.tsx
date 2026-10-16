import { useEffect, useState } from 'react';
import { beginRender, drawWhenLoaded, finishRender, get2dContext } from './common/canvasRendering';
import type { CardFace } from '../../domain/cards';
import { CARD_HEIGHT, CARD_WIDTH, getCardStyle, type CardRenderer } from './styles';

const HALF_HEIGHT = CARD_HEIGHT / 2;

/**
 * Card with two faces drawn side by side, rotated, in a single card canvas.
 * Each face is drawn on an off-screen canvas, and they're combined once both
 * have finished drawing their images.
 *
 * @param props.cardStyle - e.g. `realistic` or `minimalist`
 */
const DualCard = ({ cardStyle, faces }: { cardStyle: string; faces: [CardFace, CardFace] }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const { render, palette } = getCardStyle(cardStyle);
  const [face1, face2] = faces;

  useEffect(() => {
    if (canvas == null) return;

    const ctx = get2dContext(canvas);

    beginRender(canvas);
    const faceCanvases = [renderFace(render, face1), renderFace(render, face2)];

    // Combining the faces is part of this render, so it's skipped if a newer
    // render starts before the faces finish
    void drawWhenLoaded(ctx, Promise.all(faceCanvases.map(finishRender)), () => {
      const [faceCanvas1, faceCanvas2] = faceCanvases;

      ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.fillStyle = palette.PAPER;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      drawRotatedCW(ctx, faceCanvas1, 0, 0, CARD_WIDTH, HALF_HEIGHT);
      drawRotatedCW(ctx, faceCanvas2, 0, HALF_HEIGHT, CARD_WIDTH, HALF_HEIGHT);
    });
    void finishRender(canvas);
  }, [canvas, render, palette, face1, face2]);

  return (
    <canvas
      className="card"
      ref={setCanvas}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      style={{ background: palette.PAPER }}
    />
  );
};

const drawRotatedCW = (
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) => {
  ctx.save();
  ctx.translate(dx + dw, dy);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, dh, dw);
  ctx.restore();
};

/**
 * Draw a face on its own off-screen canvas.
 */
const renderFace = (render: CardRenderer, face: CardFace): HTMLCanvasElement => {
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = CARD_WIDTH;
  faceCanvas.height = CARD_HEIGHT;

  beginRender(faceCanvas);
  render(faceCanvas, { face });
  return faceCanvas;
};

export default DualCard;
