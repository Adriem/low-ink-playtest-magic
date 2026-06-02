import { fetchSymbology } from './scryfall';

const symbolsMapPromise = fetchSymbology().then((response) => {
  return response.data.reduce((symbolsMap, symbolDef) => {
    symbolsMap.set(symbolDef.symbol, symbolDef.svg_uri);

    return symbolsMap
  }, new Map())
});

/**
 * Get the image of a specified symbol.
 *
 * @param {string} symbol - Symbol code (e.g. {T} for "untap")
 * @returns {Promise<Image>} Image of the symbol
 */
export const getSymbolImage = async (symbol) => {
  const symbolsMap = await symbolsMapPromise;
  const symbolContent = symbolsMap.get(symbol);

  if (typeof symbolContent === 'string') {
    const actualContentPromise = new Promise((resolve, reject) => {
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
