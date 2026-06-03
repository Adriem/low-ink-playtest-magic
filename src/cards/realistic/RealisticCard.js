import { useEffect, useState } from 'react';
import { midBrightnessPass } from '../../utils/canvasFilters';
import {
  drawLoyaltyBox,
  drawRectangle,
  drawRoundedBox,
} from '../../utils/canvasShapes';
import { getColorIdentityStyle } from '../../utils/canvasStyles';
import { fillMultilineText, fitFontSizeInX, fitFontSizeInXY } from '../../utils/canvasText';
import { colorsFromManaCost, getColorMappings } from '../../utils/colors';
import { getSymbolImage } from '../../utils/symbols';

const drawOuterFrame = (ctx, { blackBordered }) => {
  const OUTER_BORDER_RADIUS = 20;
  const OUTER_BORDER_STROKE = 8;

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
};

const drawTitleBox = (ctx, {
  cardName,
  cardColorIdentity,
  cardManaCost,
  drawState,
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

    if (drawState?.cancelled) return;

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

    const symbolImage = await getSymbolImage(symbol);
    if (drawState?.cancelled) return;
    ctx.drawImage(
      symbolImage,
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
  subCardPosition,
}) => {
  const canvasWidth = ctx.canvas.width;

  const fullOuterX = 33;
  const fullOuterWidth = canvasWidth - 33 * 2;
  const fullInnerX = 37;
  const fullInnerWidth = canvasWidth - 37 * 2;
  const fullTextX = 45;
  const fullTextWidth = canvasWidth - 45 * 2;

  const halfOuter = canvasWidth / 2 - 33;
  const halfInner = canvasWidth / 2 - 37;
  const halfText = canvasWidth / 2 - 45;

  const outerX = subCardPosition === 'left' ? canvasWidth / 2 : fullOuterX;
  const outerWidth = subCardPosition ? halfOuter : fullOuterWidth;
  const innerX = subCardPosition === 'left' ? canvasWidth / 2 + 4 : fullInnerX;
  const innerWidth = subCardPosition ? halfInner - 4 : fullInnerWidth;
  const textX = subCardPosition === 'left' ? canvasWidth / 2 + 12 : fullTextX;
  const textWidth = subCardPosition ? halfText - 12 : fullTextWidth;

  drawRectangle(ctx, {
    x: outerX,
    y: 438,
    width: outerWidth,
    height: 213,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: innerX,
    y: 439,
    width: innerWidth,
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
    textWidth,
    ((cardPower != null && cardToughness != null) || cardLoyalty != null ? 625 : 640) - 450,
  ), textX, 470);
};

const drawArtBox = (ctx, {
  cardColorIdentity,
  cardArtUrl,
  drawState,
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
    if (drawState?.cancelled) return;
    ctx.drawImage(artImage, 39, 82, ctx.canvas.width - 37 * 2 - 4, 308);
    midBrightnessPass(ctx, 39, 82, ctx.canvas.width - 37 * 2 - 4, 308);
  };
};

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

const SUB_TITLE_Y = 438;
const SUB_TITLE_HEIGHT = 38;
const SUB_INNER_HEIGHT = 28;
const SUB_INNER_STROKE = 2;
const SUB_BORDER_THICKNESS = (SUB_TITLE_HEIGHT - SUB_INNER_HEIGHT) / 2;
const SUB_TYPE_Y = SUB_TITLE_Y + SUB_TITLE_HEIGHT - SUB_BORDER_THICKNESS + SUB_INNER_STROKE;
const SUB_TYPE_HEIGHT = 38;
const SUB_ORACLE_Y = SUB_TYPE_Y + SUB_TYPE_HEIGHT - SUB_BORDER_THICKNESS + SUB_INNER_STROKE;
const SUB_ORACLE_BOTTOM = 651;
const SUB_ORACLE_HEIGHT = SUB_ORACLE_BOTTOM - SUB_ORACLE_Y;

const drawSubCardTitleBox = (ctx, {
  cardName,
  cardManaCost,
  cardColorIdentity,
  position,
  drawState,
}) => {
  const half = ctx.canvas.width / 2;
  const x = position === 'left' ? 25 : half;
  const width = half - 25;
  const right = x + width;
  const flatSide = position === 'left' ? 'right' : 'left';

  const y = SUB_TITLE_Y;
  const height = SUB_TITLE_HEIGHT;
  const innerHeight = 28;
  const manaSymbolWidth = 21;
  const fontSize = 20;
  const manaSymbolMargin = 2.5;
  const manaSymbolEdgePadding = 12;

  const [...manaSymbols] = (cardManaCost ?? '').match(/({.*?})/g) || [];

  const innerOffset = (height - innerHeight) / 2;
  const innerLeftPad = flatSide === 'left' ? 0 : 4;
  const innerRightPad = flatSide === 'right' ? 0 : 4;
  const innerX = x + innerLeftPad;
  const innerRight = right - innerRightPad;
  const textX = flatSide === 'left' ? x + 4 : x + 15;
  const textRight = flatSide === 'right' ? right - 4 : right - 15;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    flatSide,
  });
  drawRoundedBox(ctx, {
    x: innerX,
    y: y + innerOffset,
    width: innerRight - innerX,
    height: innerHeight,
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
    flatSide,
  });

  const manaTotalWidth = manaSymbols.length * manaSymbolWidth
    + Math.max(manaSymbols.length - 1, 0) * manaSymbolMargin;
  const manaAnchorRight = innerRight - 8;
  const titleEndX = manaSymbols.length
    ? manaAnchorRight - manaTotalWidth - manaSymbolEdgePadding
    : textRight;
  const innerCenterY = y + innerOffset + innerHeight / 2;

  ctx.font = `bold ${fontSize}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardName, titleEndX - textX);
  ctx.fillText(cardName, textX, innerCenterY + fontSize / 3);

  manaSymbols.forEach(async (symbol, i) => {
    const radius = manaSymbolWidth / 2;
    const originX = manaAnchorRight - radius - (manaSymbolWidth + manaSymbolMargin) * (manaSymbols.length - i - 1);
    const originY = innerCenterY;

    if (drawState?.cancelled) return;

    ctx.beginPath();
    ctx.fillStyle = '#424242';
    ctx.arc(originX, originY + 2, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(originX, originY, radius, 0, 2 * Math.PI);
    ctx.fill();

    const symbolImage = await getSymbolImage(symbol);
    if (drawState?.cancelled) return;
    ctx.drawImage(
      symbolImage,
      originX - radius,
      originY - radius,
      2 * radius,
      2 * radius,
    );
  });
};

const drawSubCardTypeBox = (ctx, {
  cardType,
  cardColorIdentity,
  position,
}) => {
  const half = ctx.canvas.width / 2;
  const x = position === 'left' ? 25 : half;
  const width = half - 25;
  const right = x + width;
  const flatSide = position === 'left' ? 'right' : 'left';

  const y = SUB_TYPE_Y;
  const height = SUB_TYPE_HEIGHT;
  const innerHeight = 28;
  const fontSize = 18;

  const innerOffset = (height - innerHeight) / 2;
  const innerLeftPad = flatSide === 'left' ? 0 : 4;
  const innerRightPad = flatSide === 'right' ? 0 : 4;
  const innerX = x + innerLeftPad;
  const innerRight = right - innerRightPad;
  const textX = flatSide === 'left' ? x + 4 : x + 15;
  const textRight = flatSide === 'right' ? right - 4 : right - 15;
  const innerCenterY = y + innerOffset + innerHeight / 2;

  drawRoundedBox(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
    flatSide,
  });
  drawRoundedBox(ctx, {
    x: innerX,
    y: y + innerOffset,
    width: innerRight - innerX,
    height: innerHeight,
    lineWidth: 2,
    strokeStyle: 'black',
    fillStyle: 'white',
    flatSide,
  });

  ctx.font = `bold ${fontSize}px Serif`;
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';
  fitFontSizeInX(ctx, cardType, textRight - textX);
  ctx.fillText(cardType, textX, innerCenterY + fontSize / 3);
};

const drawSubCardOracleBox = (ctx, {
  cardOracleText,
  cardColorIdentity,
  position,
}) => {
  const half = ctx.canvas.width / 2;
  const x = position === 'left' ? 33 : half;
  const width = half - 33;
  const flatSide = position === 'left' ? 'right' : 'left';

  const y = SUB_ORACLE_Y;
  const height = SUB_ORACLE_HEIGHT;

  const innerLeftPad = flatSide === 'left' ? 0 : 4;
  const innerRightPad = flatSide === 'right' ? 0 : 4;
  const innerX = x + innerLeftPad;
  const innerWidth = width - innerLeftPad - innerRightPad;
  const innerY = y + 4;
  const innerHeight = height - 8;

  drawRectangle(ctx, {
    x,
    y,
    width,
    height,
    lineWidth: 0,
    fillStyle: getColorIdentityStyle(ctx, cardColorIdentity),
  });
  drawRectangle(ctx, {
    x: innerX,
    y: innerY,
    width: innerWidth,
    height: innerHeight,
    lineWidth: 4,
    strokeStyle: 'black',
    fillStyle: 'white',
  });

  const textPaddingX = 8;
  const textX = innerX + textPaddingX;
  const textRight = innerX + innerWidth - textPaddingX;
  const textTopY = innerY + 22;
  const textBottomY = innerY + innerHeight - 6;

  ctx.font = "20px Serif";
  ctx.fillStyle = 'black';
  ctx.textAlign = 'start';

  fillMultilineText(ctx, fitFontSizeInXY(
    ctx,
    (cardOracleText ?? '').split('\n'),
    textRight - textX,
    textBottomY - textTopY,
  ), textX, textTopY);
};

const drawSubCard = (ctx, { subCard, subCardPosition, drawState }) => {
  const subColors = subCard.colors ?? colorsFromManaCost(subCard.mana_cost);
  const subColorIdentity = getColorMappings(subColors, subCard.type_line);

  drawSubCardTitleBox(ctx, {
    cardName: subCard.name,
    cardManaCost: subCard.mana_cost,
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
    drawState,
  });
  drawSubCardTypeBox(ctx, {
    cardType: subCard.type_line,
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
  });
  drawSubCardOracleBox(ctx, {
    cardOracleText: subCard.oracle_text,
    cardColorIdentity: subColorIdentity,
    position: subCardPosition,
  });
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
  subCardPosition,
  subCard,
  canvasClassName = 'card',
  canvasRef,
}) => {
  const WIDTH = 500;
  const HEIGHT = 700;

  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (canvas == null) return;

    const drawState = { cancelled: false };
    const cardColorIdentity = getColorMappings(cardColors, cardTypeLine);

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawOuterFrame(ctx, { blackBordered });
    drawTitleBox(ctx, { cardName, cardManaCost, cardColorIdentity, drawState });
    drawArtBox(ctx, { cardArtUrl, cardColorIdentity, drawState });
    drawTypeBox(ctx, { cardType: cardTypeLine, cardColorIdentity });
    drawOracleBox(ctx, { cardOracleText, cardPower, cardToughness, cardLoyalty, cardColorIdentity, subCardPosition });

    if (subCard && subCardPosition) {
      drawSubCard(ctx, { subCard, subCardPosition, drawState });
    }

    if (cardPower && cardToughness) {
      drawStatsBox(ctx, { cardPower, cardToughness, cardColorIdentity });
    }

    if (cardLoyalty) {
      drawLoyaltyBox(ctx, { cardLoyalty, x: 439, y: 664 });
    }

    return () => {
      drawState.cancelled = true;
    };
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
    cardSet,
    devoid,
    blackBordered,
    subCardPosition,
    subCard,
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
  );
};

export default RealisticCard;
