import { useCallback, useEffect, useState, type RefCallback } from 'react';
import { beginRender, finishRender } from './common/canvasRendering';
import { resolvePalette } from './common/canvasStyles';
import { CARD_HEIGHT, CARD_WIDTH, getCardStyle, type CardRenderProps } from './styles';

/**
 * Card face drawn on a canvas in the given style. The canvas is marked as
 * rendered (`data-rendered`) once all its images have been drawn.
 *
 * @param props.cardStyle - e.g. `realistic` or `minimalist`
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
  ref,
}: CardRenderProps & { cardStyle: string; ref?: RefCallback<HTMLCanvasElement> }) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const handleCanvasRef = useCallback(
    (element: HTMLCanvasElement | null) => {
      setCanvas(element);
      ref?.(element);
    },
    [ref],
  );
  const { render, palette: defaultPalette } = getCardStyle(cardStyle);
  const paper = resolvePalette(defaultPalette, customPalette).PAPER;

  useEffect(() => {
    if (canvas == null) return;

    beginRender(canvas);
    render(canvas, { face, subFace, subFacePosition, blackBordered, inkLevel, artFidelity, customPalette });
    void finishRender(canvas);
  }, [canvas, render, face, subFace, subFacePosition, blackBordered, inkLevel, artFidelity, customPalette]);

  return (
    <canvas
      className="card"
      ref={handleCanvasRef}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      style={{ background: paper }}
    />
  );
};

export default Card;
