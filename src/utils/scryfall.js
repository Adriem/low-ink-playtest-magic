// TODO: Review this
// NOTE: Scryfall requests should be spaced 100ms each
import semaphore from 'semaphore'

const sem = semaphore(1)
const awaitIfNecessary = async () => {
  await new Promise(resolve => sem.take(resolve))
  setTimeout(() => sem.leave(), 100)
}

/**
 * @typedef {object} ScryfallCard
 */

/**
 * @typedef {object} Symbology
 * @prop {{symbol: string, svg_uri: string}[]} data
 */

/**
 * Fetch the data of a card given its name in Scryfall.io
 * @param {string} cardName
 * @returns {Promise<ScryfallCard|null>}
 */
export const fetchCardData = async (cardName) => {
  await awaitIfNecessary()

  const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}&lang:es`, {
    headers: { Origin: window.location.origin }
  });

  if (!response.ok) {
    const error = await response.json();
    alert(`Could not fetch the card. Reason: ${error.details}`);
    throw new Error(error.details);
  }

  return await response.json();
}

/**
 * Fetch the symbology data from Scryfall.io
 *
 * @returns {Promise<Symbology>}
 */
export const fetchSymbology = async () => {
  await awaitIfNecessary()

  const response = await fetch('https://api.scryfall.com/symbology')

  if (!response.ok) {
    const error = await response.json();
    alert(`Could not fetch symbology. Reason: ${error.details}`);
    throw new Error(error.details);
  }

  return await response.json()
}