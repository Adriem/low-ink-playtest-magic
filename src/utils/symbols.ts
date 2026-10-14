import { fetchSymbology } from './scryfall';

// Symbol image URLs, replaced with the loading image the first time each symbol is used
const symbolsMapPromise = fetchSymbology().then((response) => {
  return response.data.reduce((symbolsMap, symbolDef) => {
    symbolsMap.set(symbolDef.symbol, symbolDef.svg_uri);

    return symbolsMap
  }, new Map<string, string | Promise<HTMLImageElement>>())
});

/**
 * Get the image of a specified symbol.
 *
 * @param symbol - Symbol code (e.g. {T} for "untap")
 * @returns Image of the symbol, or undefined for unknown symbols
 */
export const getSymbolImage = async (symbol: string): Promise<HTMLImageElement | undefined> => {
  const symbolsMap = await symbolsMapPromise;
  const symbolContent = symbolsMap.get(symbol);

  if (typeof symbolContent === 'string') {
    const actualContentPromise = new Promise<HTMLImageElement>((resolve, reject) => {
      const symbolImage = new Image();
      symbolImage.crossOrigin = 'Anonymous';
      symbolImage.src = symbolContent;
      symbolImage.onload = () => resolve(symbolImage);
      symbolImage.onerror = reject;
    });

    symbolsMap.set(symbol, actualContentPromise);

    return actualContentPromise;
  }

  return symbolContent;
}
