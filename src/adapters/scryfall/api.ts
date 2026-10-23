import type { Card } from '../../domain/cards';
import { toCard } from './toCard';
import type { ScryfallCard, ScryfallSymbology } from './types';
import * as throttledQueue from '../../utils/throttledQueue';

const SCRYFALL_API_URL = 'https://api.scryfall.com';
/** Time between requests: Scryfall allows 2 card lookups a second (https://scryfall.com/docs/api/rate-limits) */
const REQUEST_SPACING_MS = 500;
/** How many cards Scryfall looks up at once */
const MAX_BATCH_SIZE = 75;
/** How long Scryfall blocks clients that go over its rate limit (HTTP 429) */
const RATE_LIMIT_BLOCK_MS = 30_000;
/** How many times a request over the rate limit is retried */
const RATE_LIMIT_RETRIES = 2;
const HEADERS = { Accept: 'application/json' };

/** Requests to Scryfall, spaced out */
const requests = throttledQueue.create(REQUEST_SPACING_MS);

/**
 * Fetch the data of a card from Scryfall, given its name.
 */
export const fetchCardData = (cardName: string): Promise<ScryfallCard> => {
  return queueRequest(`${SCRYFALL_API_URL}/cards/named?exact=${encodeURIComponent(cardName)}`, { headers: HEADERS });
};

/**
 * Fetch a card from Scryfall, given its name.
 */
export const fetchCard = async (cardName: string): Promise<Card> => {
  return toCard(await fetchCardData(cardName));
};

/**
 * Fetch cards from Scryfall, given their names (e.g. a card list), with a
 * request per 75 of them, all sent right away (and spaced out).
 *
 * @returns Each card, in the order of the names, or why it couldn't be fetched
 */
export const fetchCollection = async (cardNames: string[]): Promise<(Card | Error)[]> => {
  const batches = Array.from({ length: Math.ceil(cardNames.length / MAX_BATCH_SIZE) }, (_, index) => {
    return cardNames.slice(index * MAX_BATCH_SIZE, (index + 1) * MAX_BATCH_SIZE);
  });
  const results = await Promise.all(batches.map(fetchBatch));
  return results.flat();
};

/**
 * Fetch the symbology data from Scryfall.
 */
export const fetchSymbology = (): Promise<ScryfallSymbology> => {
  return queueRequest(`${SCRYFALL_API_URL}/symbology`, { headers: HEADERS });
};

/**
 * Fetch up to 75 cards with a single request. Scryfall returns the cards
 * found in the order they were asked for, and lists the names it didn't find
 * apart.
 */
const fetchBatch = async (cardNames: string[]): Promise<(Card | Error)[]> => {
  const lookupNames = cardNames.map(toLookupName);

  try {
    const { data, not_found: notFound } = await queueRequest<{
      data: ScryfallCard[];
      not_found: { name: string }[];
    }>(`${SCRYFALL_API_URL}/cards/collection`, {
      method: 'POST',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifiers: lookupNames.map((name) => ({ name })) }),
    });

    const notFoundNames = new Set(notFound.map(({ name }) => name));
    const foundCards = [...data];
    return cardNames.map((cardName, index) => {
      const card = notFoundNames.has(lookupNames[index]) ? undefined : foundCards.shift();
      return card ? toCard(card) : new Error(`No card named "${cardName}"`);
    });
  } catch (error) {
    return cardNames.map(() => error as Error);
  }
};

/**
 * Name to look a card up by in a collection: the name of its first face for
 * full names of cards with several (e.g. "Fire" for "Fire // Ice"), which
 * Scryfall's collection lookups don't find.
 */
const toLookupName = (cardName: string): string => {
  return cardName.split(' // ')[0].trim();
};

/**
 * Request JSON from Scryfall, in its turn among the other requests. Requests
 * over the rate limit are retried next, once Scryfall stops blocking them.
 */
const queueRequest = <T>(url: string, init: RequestInit): Promise<T> => {
  return throttledQueue.push(requests, () => requestJson<T>(url, init, RATE_LIMIT_RETRIES));
};

const requestJson = async <T>(url: string, init: RequestInit, retries: number): Promise<T> => {
  const response = await fetch(url, init);

  if (response.status === 429 && retries > 0) {
    throttledQueue.pauseFor(requests, RATE_LIMIT_BLOCK_MS);
    return throttledQueue.unshift(requests, () => requestJson<T>(url, init, retries - 1));
  }
  if (!response.ok) throw await toError(response);
  return (await response.json()) as T;
};

/**
 * The error of a failed response: Scryfall's details, or its status for
 * responses that aren't Scryfall's errors (e.g. from its CDN).
 */
const toError = async (response: Response): Promise<Error> => {
  try {
    const { details } = (await response.json()) as { details?: string };
    if (details) return new Error(details);
  } catch {
    // Not JSON
  }
  return new Error(`${response.status} ${response.statusText}`.trim());
};
