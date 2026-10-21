// TODO: Review this
import semaphore from 'semaphore';
import type { Card } from '../../domain/cards';
import { toCard } from './toCard';
import type { ScryfallCard, ScryfallSymbology } from './types';
import i18n from '../../i18n';

const SCRYFALL_API_URL = 'https://api.scryfall.com';
// Scryfall asks to space requests at least 50-100ms apart
const REQUEST_SPACING_MS = 100;

const sem = semaphore(1);

/**
 * Fetch the data of a card given its name in Scryfall.io
 */
export const fetchCardData = async (cardName: string): Promise<ScryfallCard> => {
  await awaitIfNecessary();

  const response = await fetch(`${SCRYFALL_API_URL}/cards/named?exact=${encodeURIComponent(cardName)}`, {
    headers: { Origin: window.location.origin },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.details);
  }

  return await response.json();
};

/**
 * Fetch a card given its name in Scryfall.io
 */
export const fetchCard = async (cardName: string): Promise<Card> => {
  return toCard(await fetchCardData(cardName));
};

/**
 * Fetch the symbology data from Scryfall.io
 */
export const fetchSymbology = async (): Promise<ScryfallSymbology> => {
  await awaitIfNecessary();

  const response = await fetch(`${SCRYFALL_API_URL}/symbology`);

  if (!response.ok) {
    const error = await response.json();
    // TODO: Replace alert with a toast notification
    alert(i18n.t('errors.symbology', { reason: error.details }));
    throw new Error(error.details);
  }

  return await response.json();
};

const awaitIfNecessary = async () => {
  await new Promise<void>((resolve) => sem.take(() => resolve()));
  setTimeout(() => sem.leave(), REQUEST_SPACING_MS);
};
