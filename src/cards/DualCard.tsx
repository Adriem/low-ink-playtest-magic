import { useEffect, useState } from 'react';
import { beginRender, drawWhenLoaded, finishRender, get2dContext } from '../utils/canvasRendering';
import { colorsFromManaCost, InkColors } from '../utils/colors';
import type { ScryfallCardFace } from '../types/cards';
import { CARD_HEIGHT, CARD_WIDTH, getCardRenderer, type CardProps, type CardRenderer } from './styles';

const HALF_HEIGHT = CARD_HEIGHT / 2;

const drawRotatedCW = (ctx: CanvasRenderingContext2D, src: HTMLCanvasElement, dx: number, dy: number, dw: number, dh: number) => {
  ctx.save();
  ctx.translate(dx + dw, dy);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, dh, dw);
  ctx.restore();
};

const faceProps = (face: ScryfallCardFace, cardSet?: string): CardProps => ({
  cardName: face.name,
  cardManaCost: face.mana_cost,
  cardColors: face.colors ?? colorsFromManaCost(face.mana_cost),
  cardOracleText: face.oracle_text,
  cardTypeLine: face.type_line,
  cardArtUrl: face.image_uris?.art_crop,
  cropArt: face._cropArt,
  cardLoyalty: face.loyalty,
  cardPower: face.power,
  cardToughness: face.toughness,
  cardSet,
});

/**
 * Draw a face on its own off-screen canvas.
 */
const renderFace = (render: CardRenderer, face: ScryfallCardFace, cardSet?: string): HTMLCanvasElement => {
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = CARD_WIDTH;
  faceCanvas.height = CARD_HEIGHT;

  beginRender(faceCanvas);
  render(faceCanvas, faceProps(face, cardSet));
  return faceCanvas;
};

/**
 * Card with two faces drawn side by side, rotated, in a single card canvas.
 * Each face is drawn on an off-screen canvas, and they're combined once both
 * have finished drawing their images.
 *
 * @param props.cardStyle - e.g. `realistic` or `minimalist`
 */
const DualCard = ({ cardStyle, cardFaces, cardSet }: { cardStyle: string, cardFaces: ScryfallCardFace[], cardSet?: string }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvas == null) return;

    const render = getCardRenderer(cardStyle);
    const [face1, face2] = cardFaces;
    const ctx = get2dContext(canvas);

    beginRender(canvas);
    const faceCanvases = [renderFace(render, face1, cardSet), renderFace(render, face2, cardSet)];

    // Combining the faces is part of this render, so it's skipped if a newer
    // render starts before the faces finish
    void drawWhenLoaded(ctx, Promise.all(faceCanvases.map(finishRender)), () => {
      const [faceCanvas1, faceCanvas2] = faceCanvases;

      ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.fillStyle = InkColors.PAPER;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      drawRotatedCW(ctx, faceCanvas1, 0, 0, CARD_WIDTH, HALF_HEIGHT);
      drawRotatedCW(ctx, faceCanvas2, 0, HALF_HEIGHT, CARD_WIDTH, HALF_HEIGHT);
    });
    void finishRender(canvas);
  }, [canvas, cardStyle, cardFaces, cardSet]);

  return (
    <canvas
      className="card"
      ref={setCanvas}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      style={{ background: InkColors.PAPER }}
    />
  );
};

export default DualCard;
