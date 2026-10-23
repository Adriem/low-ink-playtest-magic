import { useCallback, useEffect, useState, type RefCallback } from 'react';
import { beginRender, drawWhenLoaded, finishRender, get2dContext } from './common/canvasRendering';
import { resolvePalette, setDisplayScale } from './common/canvasStyles';
import { drawCardFrame, type CardFrame } from './common/cardFrame';
import type { CardFace } from '../../domain/cards';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  getCardStyle,
  type ArtFidelity,
  type CardContentsRenderer,
  type CardRenderProps,
  type CustomPalette,
  type InkLevel,
} from './styles';

const HALF_HEIGHT = CARD_HEIGHT / 2;
/** Width of the line between the halves, for card styles that separate them */
const HALVES_SEPARATOR_WIDTH = 4;

/**
 * Card with two faces drawn side by side, rotated, in a single card canvas.
 * Each face is drawn on an off-screen canvas, and they're combined once both
 * have finished drawing their images.
 *
 * @param props.cardStyle - e.g. `realistic` or `minimalist`
 * @param props.outlined - With a line over the card's edges (not each face's)
 * @param props.roundedCorners - With rounded corners (not each face's), transparent outside them
 * @param props.ref - Called with the canvas, e.g. to export it
 */
const DualCard = ({
  cardStyle,
  faces,
  blackBordered,
  inkLevel,
  defaultArtFidelity,
  customPalette,
  outlined,
  roundedCorners,
  ref,
}: CardFrame & {
  cardStyle: string;
  faces: [CardFace, CardFace];
  blackBordered?: boolean;
  inkLevel?: InkLevel;
  defaultArtFidelity?: ArtFidelity;
  customPalette?: CustomPalette;
  ref?: RefCallback<HTMLCanvasElement>;
}) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const handleCanvasRef = useCallback(
    (element: HTMLCanvasElement | null) => {
      setCanvas(element);
      ref?.(element);
    },
    [ref],
  );
  const {
    renderCardContents,
    renderFooter,
    palette: defaultPalette,
    isDrawnSideways,
    separatesHalves,
  } = getCardStyle(cardStyle);
  const { PAPER: paper, LINE: line } = resolvePalette(defaultPalette, customPalette);
  const [face1, face2] = faces;

  useEffect(() => {
    if (canvas == null) return;

    const ctx = get2dContext(canvas);

    beginRender(canvas);
    const faceCanvases = [face1, face2].map((face) =>
      renderFace(renderCardContents, {
        face,
        blackBordered,
        inkLevel,
        defaultArtFidelity,
        customPalette,
        unified: true,
      }),
    );

    // Combining the faces is part of this render, so it's skipped if a newer
    // render starts before the faces finish
    void drawWhenLoaded(ctx, Promise.all(faceCanvases.map(finishRender)), () => {
      const [faceCanvas1, faceCanvas2] = faceCanvases;

      ctx.clearRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

      // Faces go sideways in their half, turned counterclockwise, so they read
      // in order with the card turned clockwise: the first one at the bottom,
      // on the left. Faces already drawn sideways (e.g. realistic battles, and
      // the first half of realistic aftermath cards) are turned back, upright,
      // and go on the right, on top.
      const [left, right] = isDrawnSideways(face1)
        ? [
            { face: face2, canvas: faceCanvas2 },
            { face: face1, canvas: faceCanvas1 },
          ]
        : [
            { face: face1, canvas: faceCanvas1 },
            { face: face2, canvas: faceCanvas2 },
          ];
      const drawFace = (face: CardFace) => (isDrawnSideways(face) ? drawRotatedCW : drawRotatedCCW);
      drawFace(left.face)(ctx, left.canvas, 0, HALF_HEIGHT, CARD_WIDTH, HALF_HEIGHT);
      drawFace(right.face)(ctx, right.canvas, 0, 0, CARD_WIDTH, HALF_HEIGHT);
      if (separatesHalves) {
        ctx.fillStyle = line;
        ctx.fillRect(0, HALF_HEIGHT - HALVES_SEPARATOR_WIDTH / 2, CARD_WIDTH, HALVES_SEPARATOR_WIDTH);
      }
      // Like the frame, the footer is drawn once for both halves: below the half that reads upright (e.g. a
      // battle), if there's one, or else along the bottom of the card turned to read its halves
      renderFooter(ctx, {
        faces: [face1, face2],
        placement: isDrawnSideways(face1) || isDrawnSideways(face2) ? 'upright-half' : 'right-side',
        blackBordered,
        defaultArtFidelity,
        customPalette,
      });
      drawCardFrame(ctx, { outlined, roundedCorners }, line);
    });
    void finishRender(canvas);
  }, [
    canvas,
    renderCardContents,
    renderFooter,
    isDrawnSideways,
    separatesHalves,
    paper,
    line,
    face1,
    face2,
    blackBordered,
    inkLevel,
    defaultArtFidelity,
    customPalette,
    outlined,
    roundedCorners,
  ]);

  return <canvas className="card" ref={handleCanvasRef} width={CARD_WIDTH} height={CARD_HEIGHT} />;
};

/**
 * Draw a portrait canvas turned counterclockwise into a landscape area.
 */
const drawRotatedCCW = (
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
) => {
  ctx.save();
  ctx.translate(dx, dy + dh);
  ctx.rotate(-Math.PI / 2);
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, dh, dw);
  ctx.restore();
};

/**
 * Draw a portrait canvas turned clockwise into a landscape area.
 */
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
const renderFace = (renderCardContents: CardContentsRenderer, props: CardRenderProps): HTMLCanvasElement => {
  const faceCanvas = document.createElement('canvas');
  faceCanvas.width = CARD_WIDTH;
  faceCanvas.height = CARD_HEIGHT;
  // The face is drawn rotated into half the card, as wide as the card is tall
  setDisplayScale(faceCanvas, HALF_HEIGHT / CARD_WIDTH);

  beginRender(faceCanvas);
  renderCardContents(faceCanvas, props);
  return faceCanvas;
};

export default DualCard;
