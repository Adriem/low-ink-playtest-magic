import { getSymbolImage } from '../../../adapters/scryfall';
import type { CardSymbol } from '../../../domain/symbols';
import { drawWhenLoaded } from './canvasRendering';

// Mana symbols get a shadow, and a placeholder until their image loads
const MANA_SYMBOL_SHADOW_COLOR = '#424242';
const MANA_SYMBOL_PLACEHOLDER_COLOR = 'lightgray';

interface ManaCostSize {
  manaSymbols: CardSymbol[];
  symbolDiameter: number;
  symbolSpacing: number;
}

export const calculateManaCostWidth = ({ manaSymbols, symbolDiameter, symbolSpacing }: ManaCostSize) => {
  if (manaSymbols.length === 0) return 0;

  return symbolDiameter * manaSymbols.length + symbolSpacing * (manaSymbols.length - 1);
}

export const renderManaCost = (
  ctx: CanvasRenderingContext2D,
  { manaSymbols, x, y, symbolDiameter, symbolSpacing, addShadow = true }: ManaCostSize & { x: number, y: number, addShadow?: boolean },
) => {
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
      if (!symbolImage) return;
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
