import { drawWhenLoaded } from './canvasRendering';
import { getSymbolImage } from './symbols';

/**
 * Symbols of a mana cost, e.g. `['{2}', '{W}', '{U}']` for `{2}{W}{U}`.
 *
 * @param {string} [manaCost]
 * @returns {string[]}
 */
export const parseManaSymbols = (manaCost) => manaCost?.match(/{.*?}/g) ?? [];

// Mana symbols get a shadow, and a placeholder until their image loads
const MANA_SYMBOL_SHADOW_COLOR = '#424242';
const MANA_SYMBOL_PLACEHOLDER_COLOR = 'lightgray';

export const calculateManaCostWidth = ({ manaSymbols, symbolDiameter, symbolSpacing }) => {
  if (manaSymbols.length === 0) return 0;

  return symbolDiameter * manaSymbols.length + symbolSpacing * (manaSymbols.length - 1);
}

export const renderManaCost = (ctx, { manaSymbols, x, y, symbolDiameter, symbolSpacing, addShadow = true }) => {
  manaSymbols.forEach((symbol, i) => {
    const symbolRadius = symbolDiameter / 2;

    const symbolX = x + (symbolDiameter + symbolSpacing) * i;
    const symbolY = y;
    const symbolCenterX = symbolX + symbolRadius;
    const symbolCenterY = symbolY + symbolRadius;

    // Shadow
    if (addShadow) {
      ctx.beginPath();
      ctx.fillStyle = MANA_SYMBOL_SHADOW_COLOR;
      ctx.arc(symbolCenterX - 1, symbolCenterY + 2, symbolRadius * 1.05, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Symbol placeholder
    ctx.beginPath();
    ctx.fillStyle = MANA_SYMBOL_PLACEHOLDER_COLOR;
    ctx.arc(symbolCenterX, symbolCenterY, symbolRadius, 0, 2 * Math.PI);
    ctx.fill();

    // Symbol image
    void drawWhenLoaded(ctx, getSymbolImage(symbol), (symbolImage) => {
      ctx.drawImage(
        symbolImage,
        symbolX,
        symbolY,
        symbolDiameter,
        symbolDiameter,
      );
    });
  });
}
