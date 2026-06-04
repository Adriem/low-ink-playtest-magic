import { getSymbolImage } from './symbols';

export const calculateManaCostWidth = ({ manaSymbols, symbolDiameter, symbolSpacing }) => {
  if (manaSymbols.length === 0) return 0;

  return symbolDiameter * manaSymbols.length + symbolSpacing * (manaSymbols.length - 1);
}

export const renderManaCost = (ctx, { manaSymbols, x, y, symbolDiameter, symbolSpacing, addShadow = true, drawState }) => {
  manaSymbols.forEach(async (symbol, i) => {
    if (drawState?.cancelled) return;

    const symbolRadius = symbolDiameter / 2;

    const symbolX = x + (symbolDiameter + symbolSpacing) * i;
    const symbolY = y;
    const symbolCenterX = symbolX + symbolRadius;
    const symbolCenterY = symbolY + symbolRadius;

    // Shadow
    if (addShadow) {
      ctx.beginPath();
      ctx.fillStyle = '#424242';
      ctx.arc(symbolCenterX - 1, symbolCenterY + 2, symbolRadius * 1.05, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Symbol placeholder
    ctx.beginPath();
    ctx.fillStyle = 'lightgray';
    ctx.arc(symbolCenterX, symbolCenterY, symbolRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Symbol image
    const symbolImage = await getSymbolImage(symbol);
    if (drawState?.cancelled) return;
    ctx.drawImage(
      symbolImage,
      symbolX,
      symbolY,
      symbolDiameter,
      symbolDiameter,
    );
  });
}
