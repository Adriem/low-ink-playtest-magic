import { fillMultilineText, renderTextWithSymbols } from './oracleTextRenderer';

vi.mock('../../../adapters/scryfall', () => ({
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

test('draws the text between symbols after them, leaving room for symbols as wide as the font is tall', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, '{T}: Add {G}{G}.', 0, 20);

  // {T} takes 8px; {G}{G} takes 8px each, with 1px between them
  expect(ctx.fillText.mock.calls).toEqual([
    [': Add ', 8, 20],
    ['.', 85, 20],
  ]);
});

test('draws text without symbols as it is, without the spaces around it', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, '  Flying ', 5, 20);

  expect(ctx.fillText.mock.calls).toEqual([['Flying', 5, 20]]);
});

test('measures lines with a placeholder for each symbol', () => {
  const ctx = createCtx();

  fillMultilineText(ctx, ['{T}: Add {G}{G}.'], 0, 20);

  expect(ctx.measureText).toHaveBeenCalledWith('‹::›: Add ‹::›‹::›.');
});

// Text is 10px wide per character, and the font 8px tall above the baseline and 2px below
const createCtx = () => {
  return {
    measureText: vi.fn((text: string) => ({
      width: text.length * 10,
      fontBoundingBoxAscent: 8,
      fontBoundingBoxDescent: 2,
    })),
    fillText: vi.fn(),
    drawImage: vi.fn(),
    canvas: document.createElement('canvas'),
  } as unknown as CanvasRenderingContext2D & {
    fillText: ReturnType<typeof vi.fn>;
    measureText: ReturnType<typeof vi.fn>;
  };
};
