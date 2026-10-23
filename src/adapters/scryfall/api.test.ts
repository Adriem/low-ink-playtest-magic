import type { ScryfallCard } from './types';

// Cards are converted as they are, so they can be told apart by name
vi.mock('./toCard', () => ({ toCard: (card: ScryfallCard) => ({ name: card.name }) }));

const fetchMock = vi.fn();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  // The queue of requests is state of the module: a new one for each test
  vi.resetModules();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

const loadApi = () => import('./api');

const scryfallCard = (name: string) => ({ name }) as ScryfallCard;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

/** A response of Scryfall's collection lookups */
const collection = (data: ScryfallCard[], notFound: string[] = []) => {
  return json({ data, not_found: notFound.map((name) => ({ name })) });
};

const requestedNames = (call: unknown[]) => {
  const { identifiers } = JSON.parse((call[1] as RequestInit).body as string) as { identifiers: { name: string }[] };
  return identifiers.map(({ name }) => name);
};

test('fetches a card by its exact name', async () => {
  const { fetchCardData } = await loadApi();
  fetchMock.mockResolvedValueOnce(json(scryfallCard('Fire // Ice')));

  const card = fetchCardData('Fire // Ice');
  await vi.runAllTimersAsync();

  await expect(card).resolves.toEqual(scryfallCard('Fire // Ice'));
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  expect(url).toBe('https://api.scryfall.com/cards/named?exact=Fire%20%2F%2F%20Ice');
  expect(init.headers).toMatchObject({ Accept: 'application/json' });
});

test('spaces requests 500 ms apart', async () => {
  const { fetchCardData } = await loadApi();
  fetchMock.mockImplementation(async () => json(scryfallCard('Island')));

  void fetchCardData('Island');
  void fetchCardData('Island');
  await vi.advanceTimersByTimeAsync(499);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

test('fetches a card list with a single request, with the cards in order, or why they failed', async () => {
  const { fetchCollection } = await loadApi();
  fetchMock.mockResolvedValueOnce(
    collection([scryfallCard('Colossal Dreadmaw'), scryfallCard('Fire // Ice')], ['Nope']),
  );

  const cards = fetchCollection(['Colossal Dreadmaw', 'Nope', 'Fire // Ice']);
  await vi.runAllTimersAsync();

  await expect(cards).resolves.toEqual([
    { name: 'Colossal Dreadmaw' },
    new Error('No card named "Nope"'),
    { name: 'Fire // Ice' },
  ]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock.mock.calls[0][0]).toBe('https://api.scryfall.com/cards/collection');
  // Full names of cards with several faces aren't found: they're looked up by their first face
  expect(requestedNames(fetchMock.mock.calls[0])).toEqual(['Colossal Dreadmaw', 'Nope', 'Fire']);
});

test('fetches longer lists with a request per 75 cards, spaced out', async () => {
  const { fetchCollection } = await loadApi();
  fetchMock.mockImplementation(async (_url: string, init: RequestInit) => {
    return collection(requestedNames([undefined, init]).map(scryfallCard));
  });

  const names = Array.from({ length: 80 }, (_, i) => `Card ${i}`);
  const cards = fetchCollection(names);
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(requestedNames(fetchMock.mock.calls[0])).toHaveLength(75);

  await vi.advanceTimersByTimeAsync(500);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(requestedNames(fetchMock.mock.calls[1])).toHaveLength(5);
  await expect(cards).resolves.toEqual(names.map((name) => ({ name })));
});

test('fails the cards of a list whose request fails', async () => {
  const { fetchCollection } = await loadApi();
  fetchMock.mockResolvedValueOnce(json({ details: 'Something broke' }, 500));

  const cards = fetchCollection(['Island', 'Swamp']);
  await vi.runAllTimersAsync();

  await expect(cards).resolves.toEqual([new Error('Something broke'), new Error('Something broke')]);
});

test('retries requests over the rate limit next, once Scryfall stops blocking them', async () => {
  const { fetchCardData } = await loadApi();
  fetchMock
    .mockResolvedValueOnce(new Response('{}', { status: 429 }))
    .mockResolvedValueOnce(json(scryfallCard('Colossal Dreadmaw')))
    .mockResolvedValueOnce(json(scryfallCard('Island')));

  const dreadmaw = fetchCardData('Colossal Dreadmaw');
  await vi.advanceTimersByTimeAsync(0);
  const island = fetchCardData('Island');
  await vi.advanceTimersByTimeAsync(29_999);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(1);
  await expect(dreadmaw).resolves.toEqual(scryfallCard('Colossal Dreadmaw'));
  await vi.advanceTimersByTimeAsync(500);
  await expect(island).resolves.toEqual(scryfallCard('Island'));
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test('gives up on requests still over the rate limit after retrying them twice', async () => {
  const { fetchCardData } = await loadApi();
  fetchMock.mockImplementation(async () => new Response('{}', { status: 429 }));

  const failure = expect(fetchCardData('Colossal Dreadmaw')).rejects.toThrow('429');
  await vi.runAllTimersAsync();

  await failure;
  expect(fetchMock).toHaveBeenCalledTimes(3);
});

test("fails with Scryfall's details, or the status of responses that aren't Scryfall's errors", async () => {
  const { fetchCardData } = await loadApi();
  fetchMock
    .mockResolvedValueOnce(json({ details: 'Something broke' }, 500))
    .mockResolvedValueOnce(new Response('<html>Bad gateway</html>', { status: 502, statusText: 'Bad Gateway' }));

  const first = expect(fetchCardData('A')).rejects.toThrow('Something broke');
  await vi.runAllTimersAsync();
  await first;

  const second = expect(fetchCardData('B')).rejects.toThrow('502 Bad Gateway');
  await vi.runAllTimersAsync();
  await second;
});

test('fetches the symbology through the same queue', async () => {
  const { fetchCardData, fetchSymbology } = await loadApi();
  fetchMock.mockResolvedValueOnce(json(scryfallCard('Island'))).mockResolvedValueOnce(json({ data: [] }));

  void fetchCardData('Island');
  const symbology = fetchSymbology();
  await vi.advanceTimersByTimeAsync(0);
  expect(fetchMock).toHaveBeenCalledTimes(1);

  await vi.advanceTimersByTimeAsync(500);
  await expect(symbology).resolves.toEqual({ data: [] });
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.scryfall.com/symbology');
});
