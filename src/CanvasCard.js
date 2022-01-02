import { useLayoutEffect, useRef } from 'react';
import { midBrightnessPass } from './utils/canvasFilters';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY, wrapText } from './utils/canvasText';
import { getSymbolImage } from './utils/symbols';

const Colors = {
  COLORLESS: 'rgb(210,210,210)',
  // COLORLESS: 'rgb(145, 145, 145)',
  WHITE: 'rgb(213, 194, 167)',
  BLUE: 'rgb(41, 133, 225)',
  BLACK: 'rgb(105, 92, 114)',
  RED: 'rgb(211, 14, 14)',
  GREEN: 'rgb(6, 147, 45)',
  MULTI: 'rgb(239, 164, 0)',
  ARTIFACT: 'rgb(156,168,182)',
  // ARTIFACT: 'rgb(138,145,162)',
  // ARTIFACT: 'rgb(176, 184, 203)',
  LAND: 'rgb(143, 120, 90)',
};

const getColorMappings = (cardColors, cardTypeLine) => {
  if (!cardColors) return '';
  if (cardColors.length === 0 && /artifact/i.test(cardTypeLine)) return 'artifact';
  if (cardColors.length === 0 && /land/i.test(cardTypeLine)) return 'land';
  if (cardColors.length === 0) return 'colorless';

  if (cardColors.length === 1 && cardColors.includes('W')) return 'white';
  if (cardColors.length === 1 && cardColors.includes('U')) return 'blue';
  if (cardColors.length === 1 && cardColors.includes('B')) return 'black';
  if (cardColors.length === 1 && cardColors.includes('R')) return 'red';
  if (cardColors.length === 1 && cardColors.includes('G')) return 'green';

  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('U')) return 'azorius';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('B')) return 'orzhov';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('R')) return 'boros';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('G')) return 'selesnya';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('B')) return 'dimir';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('R')) return 'izzet';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('G')) return 'simic';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('R')) return 'rakdos';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('G')) return 'golgari';
  if (cardColors.length === 2 && cardColors.includes('R') && cardColors.includes('G')) return 'gruul';

  if (cardColors.length > 2) return 'multi';
};

const getColorIdentityStyle = (ctx, colorIdentity, { devoid } = {}) => {
  switch (colorIdentity) {
    case 'white': return Colors.WHITE;
    case 'blue': return Colors.BLUE;
    case 'black': return Colors.BLACK;
    case 'red': return Colors.RED;
    case 'green': return Colors.GREEN;

    case 'gruul':
      const gruulGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      gruulGradient.addColorStop(.4, Colors.RED);
      gruulGradient.addColorStop(.6, Colors.GREEN);
      return gruulGradient;

    case 'izzet':
      const izzetGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      izzetGradient.addColorStop(.4, Colors.BLUE);
      izzetGradient.addColorStop(.6, Colors.RED);
      return izzetGradient;

    case 'rakdos':
      const rakdosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      rakdosGradient.addColorStop(.4, Colors.BLACK);
      rakdosGradient.addColorStop(.6, Colors.RED);
      return rakdosGradient;

    case 'orzhov':
      const orzhovGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      orzhovGradient.addColorStop(.4, Colors.WHITE);
      orzhovGradient.addColorStop(.6, Colors.BLACK);
      return orzhovGradient;

    case 'golgari':
      const golgariGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      golgariGradient.addColorStop(.4, Colors.BLACK);
      golgariGradient.addColorStop(.6, Colors.GREEN);
      return golgariGradient;

    case 'azorius':
      const azoriusGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      azoriusGradient.addColorStop(.4, Colors.WHITE);
      azoriusGradient.addColorStop(.6, Colors.BLUE);
      return azoriusGradient;

    case 'simic':
      const simicGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      simicGradient.addColorStop(.4, Colors.GREEN);
      simicGradient.addColorStop(.6, Colors.BLUE);
      return simicGradient;

    case 'selesnya':
      const selesnyaGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      selesnyaGradient.addColorStop(.4, Colors.GREEN);
      selesnyaGradient.addColorStop(.6, Colors.WHITE);
      return selesnyaGradient;

    case 'dimir':
      const dimigGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      dimigGradient.addColorStop(.4, Colors.BLUE);
      dimigGradient.addColorStop(.6, Colors.BLACK);
      return dimigGradient;

    case 'boros':
      const borosGradient = ctx.createLinearGradient(0, 0, ctx.canvas.width, 0);
      borosGradient.addColorStop(.4, Colors.RED);
      borosGradient.addColorStop(.6, Colors.WHITE);
      return borosGradient;

    case 'artifact': return Colors.ARTIFACT;
    case 'land': return Colors.LAND;
    case 'colorless': return Colors.COLORLESS;
    case 'multi': return Colors.MULTI;
    default: return Colors.COLORLESS;
  }
};

const drawRectangle = (ctx, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle,
  fillStyle,
  borderRadiusTop = 0,
  borderRadiusBottom = borderRadiusTop,
}) => {
  ctx.moveTo(x, y);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

  ctx.beginPath();
  ctx.arc(
    x + lineWidth / 2 + borderRadiusTop,
    y + lineWidth / 2 + borderRadiusTop,
    borderRadiusTop,
    Math.PI,
    1.5 * Math.PI,
  );
  ctx.arc(
    x + width - lineWidth / 2 - borderRadiusTop,
    y + lineWidth / 2 + borderRadiusTop,
    borderRadiusTop,
    1.5 * Math.PI,
    0,
  );
  ctx.arc(
    x + width - lineWidth / 2 - borderRadiusBottom,
    y + height - lineWidth / 2 - borderRadiusBottom,
    borderRadiusBottom,
    0,
    0.5 * Math.PI,
  );
  ctx.arc(
    x + lineWidth / 2 + borderRadiusBottom,
    y + height - lineWidth / 2 - borderRadiusBottom,
    borderRadiusBottom,
    0.5 * Math.PI,
    Math.PI,
  );
  ctx.closePath();

  if (strokeStyle != null) ctx.stroke();
  if (fillStyle != null) ctx.fill();
}

const drawRoundedBox = (ctx, {
  x,
  y,
  width,
  height,
  lineWidth = 0,
  strokeStyle = null,
  fillStyle = null,
}) => {
  ctx.moveTo(x, y);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.fillStyle = fillStyle;

  ctx.beginPath();
  ctx.ellipse(
    x + lineWidth / 2 + height / 4,
    y + lineWidth / 2 + height / 2,
    height / 4,
    height / 2,
    0,
    0.5 * Math.PI,
    1.5 * Math.PI,
  );
  ctx.ellipse(
    x + width - lineWidth / 2 - height / 4,
    y + lineWidth / 2 + height / 2,
    height / 4,
    height / 2,
    0,
    1.5 * Math.PI,
    0.5 * Math.PI,
  );
  ctx.closePath();

  if (fillStyle != null) ctx.fill();
  if (strokeStyle != null) ctx.stroke();
}

const drawOuterFrame = (ctx, { blackBordered }) => {
  const OUTER_BORDER_RADIUS = 20;
  const OUTER_BORDER_STROKE = 8;

  const INNER_BORDER_MARGIN = 20;
  const INNER_BORDER_MARGIN_BOTTOM = 30;
  const INNER_BORDER_RADIUS_TOP = 10;
  const INNER_BORDER_RADIUS_BOTTOM = 70;
  const INNER_BORDER_STROKE = 4;

  drawRectangle(ctx, {
    x: 0,
    y: 0,
    width: ctx.canvas.width,
    height: ctx.canvas.height,
    lineWidth: OUTER_BORDER_STROKE,
    strokeStyle: 'black',
    fillStyle: blackBordered ? 'black' : 'white',
    borderRadiusTop: OUTER_BORDER_RADIUS,
  });
  drawRectangle(ctx, {
    x: INNER_BORDER_MARGIN,
    y: INNER_BORDER_MARGIN,
    width: ctx.canvas.width - INNER_BORDER_MARGIN * 2,
    height: ctx.canvas.height - INNER_BORDER_MARGIN * 2 - INNER_BORDER_MARGIN_BOTTOM,
    lineWidth: INNER_BORDER_STROKE,
    strokeStyle: 'black',
    fillStyle: 'white',
    borderRadiusTop: INNER_BORDER_RADIUS_TOP,
    borderRadiusBottom: INNER_BORDER_RADIUS_BOTTOM,
  });
};

const drawTitleBox = (ctx, {
  cardName,
  cardColorIdentity,
  cardManaCost,
}) => {
  const [...manaSymbols] = cardManaCost.match(/({.*?})/g) || [];

  const manaSymbolWidth = 24;
  const manaSymbolMargin = 2.5;
  const manaSymbolOffsetX = 37;

  const titleOriginX = 40;
  const titleEndX = ctx.canvas.width
    - manaSymbols.length * manaSymbolWidth
    - (Math.max(manaSymbols.length - 1, 0)) * manaSymbolMargin
    - (manaSymbols.length ? manaSymbolOffsetX + 10 : titleOriginX);

  drawRoundedBox(ctx, {
    x: 25,
    y: 32,
    width: ctx.canvas.width - 25 * 2,
    height: 48,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRoundedBox(ctx, {
    x: 29,
    y: 36,
    width: ctx.canvas.width - 29 * 2,
    height: 38,
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  ctx.font = "bold 28px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - titleOriginX)
  ctx.fillText(cardName, 40, 65);

  manaSymbols.forEach(async (symbol, i) => {
    const yOffset = 2;
    const shadowYOffset = 2;
    const radius = manaSymbolWidth / 2;
    const xEnd = ctx.canvas.width - manaSymbolOffsetX;

    const originX = xEnd - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
    const originY = 65 + yOffset - radius;

    // Shadow
    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + shadowYOffset, radius, 0, 2 * Math.PI);
    ctx.fill();

    // Symbol placeholder
    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.drawImage(
      await getSymbolImage(symbol),
      originX - radius,
      originY - radius,
      2 * radius,
      2 * radius,
    );

  });
};

const drawTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
}) => {
  const typeOriginX = 40;
  const typeEndX = ctx.canvas.width - 40;

  drawRoundedBox(ctx, {
    x: 25,
    y: 392,
    width: ctx.canvas.width - 25 * 2,
    height: 48,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRoundedBox(ctx, {
    x: 29,
    y: 396,
    width: ctx.canvas.width - 29 * 2,
    height: 38,
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  ctx.font = "bold 23px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, typeEndX - typeOriginX)
  ctx.fillText(cardType, 40, 422);
};

const drawOracleBox = (ctx, {
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  cardColorIdentity,
}) => {
  drawRectangle(ctx, {
    x: 33,
    y: 438,
    width: ctx.canvas.width - 33 * 2,
    height: 213,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: 37,
    y: 439,
    width: ctx.canvas.width - 37 * 2,
    height: 208,
    lineWidth: 4,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  ctx.font = "25px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    cardOracleText.split('\n'),
    ctx.canvas.width - 45 * 2,
    ((cardPower != null && cardToughness != null) || cardLoyalty != null ? 625 : 640) - 450,
  ), 45, 470);
};

const drawArtBox = (ctx, {
  cardColorIdentity,
  cardArtUrl,
}) => {
  drawRectangle(ctx, {
    x: 33,
    y: 76,
    width: ctx.canvas.width - 33 * 2,
    height: 319,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: 37,
    y: 80,
    width: ctx.canvas.width - 37 * 2,
    height: 312,
    lineWidth: 4,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const artImage = new Image();
  artImage.src = `https://api.allorigins.win/raw?url=${cardArtUrl}`;
  artImage.crossOrigin = 'Anonymous';
  artImage.onload = () => {
    ctx.drawImage(artImage, 39, 82, ctx.canvas.width - 37 * 2 - 4, 308);
    midBrightnessPass(ctx, 39, 82, ctx.canvas.width - 37 * 2 - 4, 308);
  };
}

const drawStatsBox = (ctx, { cardPower, cardToughness, cardColorIdentity }) => {
  drawRoundedBox(ctx, {
    x: 385,
    y: 624,
    width: 88,
    height: 41,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRoundedBox(ctx, {
    x: 389,
    y: 628,
    width: 80,
    height: 31,
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
  });
  ctx.font = "28px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(`${cardPower}/${cardToughness}`, 389 + 40, 654);
};

const drawLoyaltyBox = (ctx, { cardLoyalty, cardColorIdentity }) => {
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.moveTo(439, 664);
  ctx.arc(378, 645, 29, 0.075 * Math.PI, 1.765 * Math.PI, true);
  ctx.arc(439, 612, 11, 0.90 * Math.PI, 0.1 * Math.PI, true);
  ctx.arc(499, 645, 29, 1.225 * Math.PI, 0.925 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.moveTo(439, 659);
  ctx.arc(379, 645, 32, 0.045 * Math.PI, 1.82 * Math.PI, true);
  ctx.arc(439, 613, 15, 0.825 * Math.PI, 0.175 * Math.PI, true);
  ctx.arc(498, 645, 32, 1.18 * Math.PI, 0.955 * Math.PI, true);
  ctx.closePath();
  ctx.fill();

  ctx.font = "bold 27px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'center';
  ctx.fillText(cardLoyalty, 439, 652);
};

const CanvasCard = ({
  cardName,
  cardManaCost,
  cardArtUrl,
  cardColors,
  cardTypeLine,
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  cardSet = 'PXY',
  devoid,
  blackBordered,
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;
  const CARD_PADDING = 2;
  const BORDER_STROKE = 4;
  const OUTER_BORDER_WIDTH = 20;

  const canvasRef = useRef();
  const canvas = canvasRef.current;

  useLayoutEffect(() => {
    if (canvas == null) return;

    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity });
    drawArtBox(ctx, { cardArtUrl, cardColorIdentity });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardLoyalty, cardColorIdentity })

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, cardColorIdentity });
    }
  }, [
    canvas,
    cardName,
    cardManaCost,
    cardArtUrl,
    cardColors,
    cardTypeLine,
    cardOracleText,
    cardPower,
    cardToughness,
    cardLoyalty,
    cardSet = 'PXY',
    devoid,
    blackBordered,
  ]);

  return <canvas className="card" ref={canvasRef} height={HEIGHT} width={WIDTH} style={{ background: 'white' }} />
};

export default CanvasCard;
