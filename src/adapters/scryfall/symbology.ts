import type { CardSymbol } from '../../domain/symbols';
import { fetchSymbology } from './api';

// Fetched as soon as the app loads, so symbol images can start loading with the first cards
const symbolImageUrls = fetchSymbology().then(
  ({ data }) => new Map(data.map(({ symbol, svg_uri }) => [symbol as CardSymbol, svg_uri])),
);

// Images of the symbols already used, so each one is loaded once
const symbolImages = new Map<CardSymbol, Promise<HTMLImageElement>>();

/**
 * Image of a symbol from Scryfall, loaded the first time it's used.
 *
 * @returns The image, or undefined for unknown symbols
 */
export const getSymbolImage = async (symbol: CardSymbol): Promise<HTMLImageElement | undefined> => {
  const loading = symbolImages.get(symbol);
  if (loading) return loading;

  const imageUrl = (await symbolImageUrls).get(symbol);
  if (!imageUrl) return undefined;

  // Another use of the symbol may have started loading it while waiting for the URLs
  if (!symbolImages.has(symbol)) symbolImages.set(symbol, loadImage(imageUrl));
  return symbolImages.get(symbol);
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
