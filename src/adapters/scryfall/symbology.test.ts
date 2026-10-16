import { getSymbolImage } from './symbology';

vi.mock('./api', () => ({
  fetchSymbology: vi.fn(() => Promise.resolve({
    data: [
      { symbol: '{W}', svg_uri: 'white.svg' },
      { symbol: '{U}', svg_uri: 'blue.svg' },
    ],
  })),
}));

describe('getSymbolImage', () => {
  // jsdom doesn't load images, so they "load" as soon as they get their source
  class FakeImage {
    crossOrigin = '';
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    #src = '';

    get src() { return this.#src; }

    set src(src: string) {
      this.#src = src;
      queueMicrotask(() => this.onload?.());
    }
  }

  beforeEach(() => {
    // A regular function, so it can be called with `new`
    vi.stubGlobal('Image', vi.fn(function () { return new FakeImage(); }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('loads the image of a symbol from its URL in Scryfall', async () => {
    const image = await getSymbolImage('{W}');

    expect(image?.src).toBe('white.svg');
    expect(image?.crossOrigin).toBe('Anonymous');
  });

  test('loads the image of each symbol once', async () => {
    const [first, second] = await Promise.all([getSymbolImage('{U}'), getSymbolImage('{U}')]);
    const third = await getSymbolImage('{U}');

    expect(Image).toHaveBeenCalledTimes(1);
    expect(second).toBe(first);
    expect(third).toBe(first);
  });

  test('has no image for unknown symbols', async () => {
    await expect(getSymbolImage('{Z}')).resolves.toBeUndefined();
    expect(Image).not.toHaveBeenCalled();
  });
});
