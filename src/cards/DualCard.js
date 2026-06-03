import { useEffect, useRef } from 'react';

const WIDTH = 500;
const HEIGHT = 700;
const HALF_HEIGHT = HEIGHT / 2;

const COLOR_SYMBOLS = ['W', 'U', 'B', 'R', 'G'];

const colorsFromManaCost = (manaCost = '') => {
  const found = new Set();
  for (const match of manaCost.matchAll(/\{([^}]+)\}/g)) {
    for (const part of match[1].split('/')) {
      if (COLOR_SYMBOLS.includes(part)) found.add(part);
    }
  }
  return [...found];
};

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

const DualCard = ({ Card, cardFaces, cardSet }) => {
  const outputCanvasRef = useRef(null);
  const face1CanvasRef = useRef(null);
  const face2CanvasRef = useRef(null);

  useEffect(() => {
    const composite = () => {
      const output = outputCanvasRef.current;
      const f1 = face1CanvasRef.current;
      const f2 = face2CanvasRef.current;
      if (!output || !f1 || !f2) return;

      const ctx = output.getContext('2d');
      ctx.clearRect(0, 0, WIDTH, HEIGHT);
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      drawRotatedCW(ctx, f1, 0, 0, WIDTH, HALF_HEIGHT);
      drawRotatedCW(ctx, f2, 0, HALF_HEIGHT, WIDTH, HALF_HEIGHT);
    };

    composite();
    const interval = setInterval(composite, 200);
    const timeout = setTimeout(() => clearInterval(interval), 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [cardFaces, Card]);

  const [face1, face2] = cardFaces;

  return (
    <>
      <canvas
        ref={outputCanvasRef}
        className="card"
        width={WIDTH}
        height={HEIGHT}
        style={{ background: 'white' }}
      />
      <div className="dual-card-sources" aria-hidden="true">
        <Card {...faceProps(face1, cardSet)} canvasRef={face1CanvasRef} />
        <Card {...faceProps(face2, cardSet)} canvasRef={face2CanvasRef} />
      </div>
    </>
  );
};

export default DualCard;
