import { act, renderHook } from '@testing-library/react';
import { useCardCollection } from './useCardCollection';
import { deferred, testCard, type Deferred } from '../testUtils';
import { fetchCard } from '../adapters/scryfall';
import type { Card } from '../domain/cards';
import { isLoadingCard, type CollectionCard } from '../domain/press';

vi.mock('../adapters/scryfall', () => ({
  fetchCard: vi.fn(),
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

beforeEach(() => {
  vi.mocked(fetchCard).mockReset();
});

test('adds a loading placeholder that is replaced once the card loads', async () => {
  const pending = deferred<Card>();
  vi.mocked(fetchCard).mockReturnValue(pending.promise);
  const collection = setupCollection();

  act(() => collection.current.addCardByName('Colossal Dreadmaw'));
  expect(collection.current.cardCollection).toEqual([{ loading: true, loadingCardId: expect.any(Number) }]);

  await resolveCard(pending, { name: 'Colossal Dreadmaw' });
  expect(collection.current.cardCollection).toEqual([{ name: 'Colossal Dreadmaw' }]);
});

test('keeps the order cards were added in, regardless of load order', async () => {
  const a = deferred<Card>(),
    b = deferred<Card>();
  vi.mocked(fetchCard).mockImplementation((name) => (({ A: a, B: b }) as Record<string, Deferred<Card>>)[name].promise);
  const collection = setupCollection();

  act(() => {
    collection.current.addCardByName('A');
    collection.current.addCardByName('B');
  });

  await resolveCard(b, { name: 'B' });
  expect(cardNames(collection.current.cardCollection)).toEqual(['loading', 'B']);

  await resolveCard(a, { name: 'A' });
  expect(cardNames(collection.current.cardCollection)).toEqual(['A', 'B']);
});

test('removes the placeholder and reports the error when a card fails to load', async () => {
  const pending = deferred<Card>();
  vi.mocked(fetchCard).mockReturnValue(pending.promise);
  const onCardLoadError = vi.fn();
  const collection = setupCollection({ onCardLoadError });

  act(() => collection.current.addCardByName('Not a card'));
  await rejectCard(pending, new Error('Not found'));

  expect(collection.current.cardCollection).toEqual([]);
  expect(onCardLoadError).toHaveBeenCalledWith('Not a card', expect.objectContaining({ message: 'Not found' }));
});

test('fetches each card name only once', async () => {
  const pending = deferred<Card>();
  vi.mocked(fetchCard).mockReturnValue(pending.promise);
  const collection = setupCollection();

  act(() => {
    collection.current.addCardByName('A');
    collection.current.addCardByName('A');
  });
  await resolveCard(pending, { name: 'A' });
  // Cached cards still arrive asynchronously, through the cached promise
  await act(async () => collection.current.addCardByName('A'));

  expect(fetchCard).toHaveBeenCalledTimes(1);
  expect(cardNames(collection.current.cardCollection)).toEqual(['A', 'A', 'A']);
});

test('fetches a failed card again when it is added again', async () => {
  const failing = deferred<Card>(),
    retry = deferred<Card>();
  vi.mocked(fetchCard).mockReturnValueOnce(failing.promise).mockReturnValueOnce(retry.promise);
  const collection = setupCollection();

  act(() => collection.current.addCardByName('A'));
  await rejectCard(failing, new Error('Network error'));

  act(() => collection.current.addCardByName('A'));
  await resolveCard(retry, { name: 'A' });

  expect(fetchCard).toHaveBeenCalledTimes(2);
  expect(cardNames(collection.current.cardCollection)).toEqual(['A']);
});

test('drops a card that loads after its placeholder was removed', async () => {
  const pending = deferred<Card>();
  vi.mocked(fetchCard).mockReturnValue(pending.promise);
  const collection = setupCollection({ initialCards: [testCard({ name: 'B' })] });

  act(() => collection.current.addCardByName('A'));
  act(() => collection.current.removeCardAt(1));
  await resolveCard(pending, { name: 'A' });

  expect(cardNames(collection.current.cardCollection)).toEqual(['B']);
});

test('moves cards to another position', () => {
  const collection = setupCollection({
    initialCards: [testCard({ name: 'A' }), testCard({ name: 'B' }), testCard({ name: 'C' })],
  });

  act(() => collection.current.moveCard(0, 1));
  expect(cardNames(collection.current.cardCollection)).toEqual(['B', 'A', 'C']);

  act(() => collection.current.moveCard(2, 0));
  expect(cardNames(collection.current.cardCollection)).toEqual(['C', 'B', 'A']);
});

test('ignores moves outside the collection', () => {
  const collection = setupCollection({ initialCards: [testCard({ name: 'A' }), testCard({ name: 'B' })] });
  const initialCollection = collection.current.cardCollection;

  act(() => collection.current.moveCard(0, -1));
  act(() => collection.current.moveCard(1, 2));
  act(() => collection.current.moveCard(5, 0));

  expect(collection.current.cardCollection).toBe(initialCollection);
});

test('removes cards by index and clears the collection', () => {
  const collection = setupCollection({
    initialCards: () => [testCard({ name: 'A' }), testCard({ name: 'B' }), testCard({ name: 'C' })],
  });

  act(() => collection.current.removeCardAt(1));
  expect(cardNames(collection.current.cardCollection)).toEqual(['A', 'C']);

  act(() => collection.current.clearCollection());
  expect(collection.current.cardCollection).toEqual([]);
});

// Cards only need the fields the tests check
const resolveCard = async (pending: Deferred<Card>, card: { name: string }) => {
  await act(async () => {
    pending.resolve(card as Card);
    await pending.promise;
  });
};

const rejectCard = async (pending: Deferred<Card>, error: Error) => {
  await act(async () => {
    pending.reject(error);
    await pending.promise.catch(() => {});
  });
};

const cardNames = (collection: CollectionCard[]) => {
  return collection.map((card) => (isLoadingCard(card) ? 'loading' : card.name));
};

// The hook's latest result, as `collection.current`
test('edits the card at an index, leaving the other cards and placeholders as they are', () => {
  const placeholder = { loading: true as const, loadingCardId: 7 };
  const collection = setupCollection({
    initialCards: [testCard({ name: 'A' }), testCard({ name: 'B' }), placeholder],
  });

  act(() => collection.current.editCardAt(1, (card) => ({ ...card, set: 'edited' })));
  act(() => collection.current.editCardAt(2, (card) => ({ ...card, set: 'edited' })));

  expect(collection.current.cardCollection).toEqual([
    testCard({ name: 'A' }),
    testCard({ name: 'B', set: 'edited' }),
    placeholder,
  ]);
});

const setupCollection = (options: Parameters<typeof useCardCollection>[0] = {}) => {
  return renderHook(() => useCardCollection(options)).result;
};
