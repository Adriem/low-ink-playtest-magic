import { useEffect, useState } from 'react';
import { midBrightnessPass } from '../../utils/canvasFilters';
import {
  drawLoyaltyBox, drawLoyaltyMinus,
  drawLoyaltyPlus, drawLoyaltyZero,
  drawRectangle,
  drawRoundedBox,
} from '../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY } from '../../utils/canvasText';
import { getColorMappings } from '../../utils/colors';
import { getSymbolImage } from '../../utils/symbols';

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
  // drawRectangle(ctx, {
  //   x: INNER_BORDER_MARGIN,
  //   y: INNER_BORDER_MARGIN,
  //   width: ctx.canvas.width - INNER_BORDER_MARGIN * 2,
  //   height: ctx.canvas.height - INNER_BORDER_MARGIN * 2 - INNER_BORDER_MARGIN_BOTTOM,
  //   lineWidth: INNER_BORDER_STROKE,
  //   strokeStyle: 'black',
  //   fillStyle: 'white',
  //   borderRadiusTop: INNER_BORDER_RADIUS_TOP,
  //   borderRadiusBottom: INNER_BORDER_RADIUS_BOTTOM,
  // });
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
  artImage.crossOrigin = 'Anonymous';
  artImage.src = cardArtUrl;
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

const RealisticCard = ({
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
  canvasClassName = 'card',
  canvasRef,
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;
  const CARD_PADDING = 2;
  const BORDER_STROKE = 4;
  const OUTER_BORDER_WIDTH = 20;

  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
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
      drawLoyaltyBox(ctx, { cardLoyalty, x: 439, y: 664 });
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

  return (
    <canvas
      className={canvasClassName}
      ref={(canvas) => {
        setCanvas(canvas);
        if (canvasRef) canvasRef.current = canvas;
      }}
      height={HEIGHT}
      width={WIDTH}
      style={{ background: 'white' }}
    />
  )
};

export default RealisticCard;
