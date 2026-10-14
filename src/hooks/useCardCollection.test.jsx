import { act, render } from '@testing-library/react';
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

let collection;
const Harness = (options) => {
  collection = useCardCollection(options);
  return null;
};

const renderCollection = (options = {}) => render(<Harness {...options} />);

beforeEach(() => {
  fetchCardData.mockReset();
});

test('adds a loading placeholder that is replaced once the card loads', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  renderCollection();

  act(() => collection.addCardByName('Colossal Dreadmaw'));
  expect(collection.cardCollection).toEqual([{ _loading: true, _loadingCardId: expect.any(Number) }]);

  await resolveCard(pending, { name: 'Colossal Dreadmaw' });
  expect(collection.cardCollection).toEqual([{ name: 'Colossal Dreadmaw' }]);
});

test('keeps the order cards were added in, regardless of load order', async () => {
  const a = deferred(), b = deferred();
  fetchCardData.mockImplementation(name => ({ A: a, B: b })[name].promise);
  renderCollection();

  act(() => {
    collection.addCardByName('A');
    collection.addCardByName('B');
  });

  await resolveCard(b, { name: 'B' });
  expect(cardNames(collection.cardCollection)).toEqual(['loading', 'B']);

  await resolveCard(a, { name: 'A' });
  expect(cardNames(collection.cardCollection)).toEqual(['A', 'B']);
});

test('removes the placeholder and reports the error when a card fails to load', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  const onCardLoadError = vi.fn();
  renderCollection({ onCardLoadError });

  act(() => collection.addCardByName('Not a card'));
  await rejectCard(pending, new Error('Not found'));

  expect(collection.cardCollection).toEqual([]);
  expect(onCardLoadError).toHaveBeenCalledWith('Not a card', expect.objectContaining({ message: 'Not found' }));
});

test('fetches each card name only once', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  renderCollection();

  act(() => {
    collection.addCardByName('A');
    collection.addCardByName('A');
  });
  await resolveCard(pending, { name: 'A' });
  // Cached cards still arrive asynchronously, through the cached promise
  await act(async () => collection.addCardByName('A'));

  expect(fetchCardData).toHaveBeenCalledTimes(1);
  expect(cardNames(collection.cardCollection)).toEqual(['A', 'A', 'A']);
});

test('fetches a failed card again when it is added again', async () => {
  const failing = deferred(), retry = deferred();
  fetchCardData.mockReturnValueOnce(failing.promise).mockReturnValueOnce(retry.promise);
  renderCollection();

  act(() => collection.addCardByName('A'));
  await rejectCard(failing, new Error('Network error'));

  act(() => collection.addCardByName('A'));
  await resolveCard(retry, { name: 'A' });

  expect(fetchCardData).toHaveBeenCalledTimes(2);
  expect(cardNames(collection.cardCollection)).toEqual(['A']);
});

test('drops a card that loads after its placeholder was removed', async () => {
  const pending = deferred();
  fetchCardData.mockReturnValue(pending.promise);
  renderCollection({ initialCards: [{ name: 'B' }] });

  act(() => collection.addCardByName('A'));
  act(() => collection.removeCardAt(1));
  await resolveCard(pending, { name: 'A' });

  expect(cardNames(collection.cardCollection)).toEqual(['B']);
});

test('moves cards to another position', () => {
  renderCollection({ initialCards: [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });

  act(() => collection.moveCard(0, 1));
  expect(cardNames(collection.cardCollection)).toEqual(['B', 'A', 'C']);

  act(() => collection.moveCard(2, 0));
  expect(cardNames(collection.cardCollection)).toEqual(['C', 'B', 'A']);
});

test('ignores moves outside the collection', () => {
  renderCollection({ initialCards: [{ name: 'A' }, { name: 'B' }] });
  const initialCollection = collection.cardCollection;

  act(() => collection.moveCard(0, -1));
  act(() => collection.moveCard(1, 2));
  act(() => collection.moveCard(5, 0));

  expect(collection.cardCollection).toBe(initialCollection);
});

test('removes cards by index and clears the collection', () => {
  renderCollection({ initialCards: () => [{ name: 'A' }, { name: 'B' }, { name: 'C' }] });

  act(() => collection.removeCardAt(1));
  expect(cardNames(collection.cardCollection)).toEqual(['A', 'C']);

  act(() => collection.clearCollection());
  expect(collection.cardCollection).toEqual([]);
});
