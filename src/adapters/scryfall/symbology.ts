import type { CardSymbol } from '../../domain/symbols';
import { fetchSymbology } from './api';

/** URLs of the images of the symbols, by symbol, once they're fetched (or while they are) */
let symbolImageUrls: Promise<Map<CardSymbol, string>> | undefined;

// Images of the symbols already used, so each one is loaded once
const symbolImages = new Map<CardSymbol, Promise<HTMLImageElement>>();

/**
 * Image of a symbol from Scryfall, loaded the first time it's used.
 *
 * @returns The image, or undefined for unknown symbols, and while Scryfall's
 *   symbols can't be fetched (e.g. offline): they're tried again the next time
 */
export const getSymbolImage = async (symbol: CardSymbol): Promise<HTMLImageElement | undefined> => {
  const loading = symbolImages.get(symbol);
  if (loading) return loading;

  const imageUrl = (await getSymbolImageUrls().catch(() => undefined))?.get(symbol);
  if (!imageUrl) return undefined;

  // Another use of the symbol may have started loading it while waiting for the URLs
  if (!symbolImages.has(symbol)) symbolImages.set(symbol, loadImage(imageUrl));
  return symbolImages.get(symbol);
};

/**
 * URLs of the images of the symbols, fetched the first time they're needed,
 * and again after failing.
 */
const getSymbolImageUrls = () => {
  symbolImageUrls ??= fetchSymbology().then(
    ({ data }) => new Map(data.map(({ symbol, svg_uri }) => [symbol as CardSymbol, svg_uri])),
  );
  symbolImageUrls.catch(() => (symbolImageUrls = undefined));
  return symbolImageUrls;
};

const loadImage = (src: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};
