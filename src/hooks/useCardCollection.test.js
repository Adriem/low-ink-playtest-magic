import { act, renderHook } from '@testing-library/react';
import { useCardCollection } from './useCardCollection';
import { fetchCardData } from '../utils/scryfall';

vi.mock('../utils/scryfall', () => ({
  fetchCardData: vi.fn(),
  fetchSymbology: vi.fn(() => Promise.resolve({ data: [] })),
}));

const deferred = () => {
  let resolve, reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
};

const resolveCard = async (pending, card) => {
  await act(async () => {
    pending.resolve(card);
    await pending.promise;
  });
};

const rejectCard = async (pending, error) => {
  await act(async () => {
    pending.reject(error);
    await pending.promise.catch(() => {});
  });
};

const cardNames = (collection) => collection.map(card => card.name ?? 'loading');

// The hook's latest result, as `collection.current`
const setupCollection = (options = {}) => renderHook(() => useCardCollection(options)).result;

beforeEach(() => {
  fetchCardData.mockReset();
});

test('adds a loading placeholder that is replaced once the card loads', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  const collection = setupCollection();

  act(() => collection.current.addCardByName('Colossal Dreadmaw'));
  expect(collection.current.cardCollection).toEqual([{ _loading: true, _loadingCardId: expect.any(Number) }]);

  await resolveCard(pending, { name: 'Colossal Dreadmaw' });
  expect(collection.current.cardCollection).toEqual([{ name: 'Colossal Dreadmaw' }]);
});

test('keeps the order cards were added in, regardless of load order', async () => {
  const a = deferred(), b = deferred();
  fetchCardData.mockImplementation(name => ({ A: a, B: b })[name].promise);
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
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  const onCardLoadError = vi.fn();
  const collection = setupCollection({ onCardLoadError });

  act(() => collection.current.addCardByName('Not a card'));
  await rejectCard(pending, new Error('Not found'));

  expect(collection.current.cardCollection).toEqual([]);
  expect(onCardLoadError).toHaveBeenCalledWith('Not a card', expect.objectContaining({ message: 'Not found' }));
});

test('fetches each card name only once', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  const collection = setupCollection();

  act(() => {
    collection.current.addCardByName('A');
    collection.current.addCardByName('A');
  });
  await resolveCard(pending, { name: 'A' });
  // Cached cards still arrive asynchronously, through the cached promise
  await act(async () => collection.current.addCardByName('A'));

  expect(fetchCardData).toHaveBeenCalledTimes(1);
  expect(cardNames(collection.current.cardCollection)).toEqual(['A', 'A', 'A']);
});

test('fetches a failed card again when it is added again', async () => {
  const failing = deferred(), retry = deferred();
  fetchCardData.mockReturnValueOnce(failing.promise).mockReturnValueOnce(retry.promise);
  const collection = setupCollection();

  act(() => collection.current.addCardByName('A'));
  await rejectCard(failing, new Error('Network error'));

  act(() => collection.current.addCardByName('A'));
  await resolveCard(retry, { name: 'A' });

  expect(fetchCardData).toHaveBeenCalledTimes(2);
  expect(cardNames(collection.current.cardCollection)).toEqual(['A']);
});

test('drops a card that loads after its placeholder was removed', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  const collection = setupCollection({ initialCards: [{ name: 'B' }] });

  act(() => collection.current.addCardByName('A'));
  act(() => collection.current.removeCardAt(1));
  await resolveCard(pending, { name: 'A' });

  expect(cardNames(collection.current.cardCollection)).toEqual(['B']);
});

test('moves cards to another position', () => {
  const collection = setupCollection({ initialCards: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });

  act(() => collection.current.moveCard(0, 1));
  expect(cardNames(collection.current.cardCollection)).toEqual(['B', 'A', 'C']);

  act(() => collection.current.moveCard(2, 0));
  expect(cardNames(collection.current.cardCollection)).toEqual(['C', 'B', 'A']);
});

test('ignores moves outside the collection', () => {
  const collection = setupCollection({ initialCards: [{ name: 'A' }, { name: 'B' }] });
  const initialCollection = collection.current.cardCollection;

  act(() => collection.current.moveCard(0, -1));
  act(() => collection.current.moveCard(1, 2));
  act(() => collection.current.moveCard(5, 0));

  expect(collection.current.cardCollection).toBe(initialCollection);
});

test('removes cards by index and clears the collection', () => {
  const collection = setupCollection({ initialCards: () => [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });

  act(() => collection.current.removeCardAt(1));
  expect(cardNames(collection.current.cardCollection)).toEqual(['A', 'C']);

  act(() => collection.current.clearCollection());
  expect(collection.current.cardCollection).toEqual([]);
});
