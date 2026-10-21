import { useCallback, useEffect, useState, type RefCallback } from 'react';
import { beginRender, finishRender, get2dContext } from './common/canvasRendering';
import { drawCardFrame, type CardFrame } from './common/cardFrame';
import { resolvePalette } from './common/canvasStyles';
import { CARD_HEIGHT, CARD_WIDTH, getCardStyle, type CardRenderProps } from './styles';

/**
 * Card face drawn on a canvas in the given style. The canvas is marked as
 * rendered (`data-rendered`) once all its images have been drawn.
 *
 * @param props.cardStyle - e.g. `realistic` or `minimalist`
 * @param props.outlined - With a line over the card's edges
 * @param props.roundedCorners - With rounded corners, transparent outside them
 * @param props.ref - Called with the canvas, e.g. to export it
 */
const Card = ({
  cardStyle,
  face,
  subFace,
  subFacePosition,
  blackBordered,
  inkLevel,
  artFidelity,
  customPalette,
  outlined,
  roundedCorners,
  ref,
}: CardRenderProps & CardFrame & { cardStyle: string; ref?: RefCallback<HTMLCanvasElement> }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const handleCanvasRef = useCallback(
    (element: HTMLCanvasElement | null) => {
      setCanvas(element);
      ref?.(element);
    },
    [ref],
  );
  const { render, palette: defaultPalette } = getCardStyle(cardStyle);
  const line = resolvePalette(defaultPalette, customPalette).LINE;

  useEffect(() => {
    if (canvas == null) return;

    beginRender(canvas);
    render(canvas, { face, subFace, subFacePosition, blackBordered, inkLevel, artFidelity, customPalette });
    drawCardFrame(get2dContext(canvas), { outlined, roundedCorners }, line);
    void finishRender(canvas);
  }, [
    canvas,
    render,
    line,
    face,
    subFace,
    subFacePosition,
    blackBordered,
    inkLevel,
    artFidelity,
    customPalette,
    outlined,
    roundedCorners,
  ]);

  return <canvas className="card" ref={handleCanvasRef} width={CARD_WIDTH} height={CARD_HEIGHT} />;
};

export default Card;
