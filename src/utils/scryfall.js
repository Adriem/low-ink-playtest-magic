// TODO: Review this
import semaphore from 'semaphore'

const SCRYFALL_API_URL = 'https://api.scryfall.com';
// Scryfall asks to space requests at least 50-100ms apart
const REQUEST_SPACING_MS = 100;

const sem = semaphore(1)
const awaitIfNecessary = async () => {
  await new Promise(resolve => sem.take(resolve))
  setTimeout(() => sem.leave(), REQUEST_SPACING_MS)
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

  const response = await fetch(`${SCRYFALL_API_URL}/cards/named?exact=${encodeURIComponent(cardName)}`, {
    headers: { Origin: window.location.origin }
  });

  if (!response.ok) {
    const error = await response.json();
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

  const response = await fetch(`${SCRYFALL_API_URL}/symbology`)

  if (!response.ok) {
    const error = await response.json();
    // TODO: Replace alert with a toast notification
    alert(`Could not fetch symbology. Reason: ${error.details}`);
    throw new Error(error.details);
  }

  return await response.json()
}