const symbolsMapPromise = fetch('https://api.scryfall.com/symbology')
  .then((response) => response.json())
  .then((response) => response.data.reduce((symbolsMap, symbolDef) => {
    symbolsMap.set(symbolDef.symbol, symbolDef.svg_uri);

    return symbolsMap
  }, new Map()));

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
      symbolImage.src = `https://api.allorigins.win/raw?url=${symbolContent}`;
      symbolImage.crossOrigin = 'Anonymous';
      symbolImage.onload = () => resolve(symbolImage);
      symbolImage.onerror = reject;
    });

    symbolsMap.set(symbol, actualContentPromise);

    return actualContentPromise;
  }

  return symbolContent;
}
