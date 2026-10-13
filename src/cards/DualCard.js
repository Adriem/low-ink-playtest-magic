import { useCallback, useEffect, useRef } from 'react';
import { colorsFromManaCost } from '../utils/colors';

const WIDTH = 500;
const HEIGHT = 700;
const HALF_HEIGHT = HEIGHT / 2;

const drawRotatedCW = (ctx, src, dx, dy, dw, dh) => {
  ctx.save();
  ctx.translate(dx + dw, dy);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, dh, dw);
  ctx.restore();
};

const faceProps = (face, cardSet) => ({
  cardName: face.name,
  cardManaCost: face.mana_cost,
  cardColors: face.colors ?? colorsFromManaCost(face.mana_cost),
  cardOracleText: face.oracle_text,
  cardTypeLine: face.type_line,
  cardArtUrl: face.image_uris?.art_crop,
  cardLoyalty: face.loyalty,
  cardPower: face.power,
  cardToughness: face.toughness,
  cardSet,
  canvasClassName: 'dual-card-source',
});

const isRendered = (canvas) => canvas?.dataset.rendered === 'true';

/**
 * Card with two faces drawn side by side, rotated, in a single card canvas.
 * Each face is rendered in its own hidden canvas, and they're combined once
 * both have finished rendering.
 */
const DualCard = ({ Card, cardFaces, cardSet }) => {
  const outputCanvasRef = useRef(null);
  const face1CanvasRef = useRef(null);
  const face2CanvasRef = useRef(null);

  // Whenever a face starts rendering again, the combined card is outdated
  // until both faces are done
  useEffect(() => {
    const faces = [face1CanvasRef.current, face2CanvasRef.current];
    const observer = new MutationObserver(() => {
      const output = outputCanvasRef.current;
      if (output && !faces.every(isRendered)) output.dataset.rendered = 'false';
    });

    faces.forEach(face => face && observer.observe(face, { attributes: true, attributeFilter: ['data-rendered'] }));
    return () => observer.disconnect();
  }, [Card]);

  const handleFaceRendered = useCallback(() => {
    const output = outputCanvasRef.current;
    const f1 = face1CanvasRef.current;
    const f2 = face2CanvasRef.current;
    if (!output || !isRendered(f1) || !isRendered(f2)) return;

    const ctx = output.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    drawRotatedCW(ctx, f1, 0, 0, WIDTH, HALF_HEIGHT);
    drawRotatedCW(ctx, f2, 0, HALF_HEIGHT, WIDTH, HALF_HEIGHT);

    output.dataset.rendered = 'true';
  }, []);

  const [face1, face2] = cardFaces;

  return (
    <>
      <canvas
        ref={outputCanvasRef}
        className="card"
        width={WIDTH}
        height={HEIGHT}
        style={{ background: 'white' }}
        data-rendered="false"
      />
      <div className="dual-card-sources" aria-hidden="true">
        <Card {...faceProps(face1, cardSet)} canvasRef={face1CanvasRef} onRendered={handleFaceRendered} />
        <Card {...faceProps(face2, cardSet)} canvasRef={face2CanvasRef} onRendered={handleFaceRendered} />
      </div>
    </>
  );
};

export default DualCard;
