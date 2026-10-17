import { fillMultilineText, renderTextWithSymbols } from './oracleTextRenderer';

vi.mock('../../../adapters/scryfall', () => ({
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

test('draws the text between symbols after them, leaving room for symbols as wide as the font is tall', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, [{ text: '{T}: Add {G}{G}.' }], 0, 20);

  // {T} takes 8px; {G}{G} takes 8px each, with 1px between them
  expect(ctx.fillText.mock.calls).toEqual([
    [': Add ', 8, 20],
    ['.', 85, 20],
  ]);
});

test('draws text without symbols as it is, without the spaces around it', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, [{ text: '  Flying ' }], 5, 20);

  expect(ctx.fillText.mock.calls).toEqual([['Flying', 5, 20]]);
});

test('measures lines with a placeholder for each symbol', () => {
  const ctx = createCtx();

  fillMultilineText(ctx, [[{ text: '{T}: Add {G}{G}.' }]], 0, 20);

  expect(ctx.measureText).toHaveBeenCalledWith('‹::›: Add ‹::›‹::›.');
});

describe('italics', () => {
  test('draws italic runs in italics, after the regular ones', () => {
    const ctx = createCtx();

    renderTextWithSymbols(ctx, [{ text: 'Trample ' }, { text: '(Excess damage.)', italic: true }], 0, 20);

    expect(ctx.drawn).toEqual([
      ['Trample ', 0, 20, '10px Serif'],
      ['(Excess damage.)', 80, 20, 'italic 10px Serif'],
    ]);
    expect(ctx.font).toBe('10px Serif');
  });

  test('keeps symbols inside italic runs', () => {
    const ctx = createCtx();

    renderTextWithSymbols(ctx, [{ text: '({U} or 2 life.)', italic: true }], 0, 20);

    // "(" is 5px wide in italics, and the symbol 8px
    expect(ctx.drawn).toEqual([
      ['(', 0, 20, 'italic 10px Serif'],
      [' or 2 life.)', 13, 20, 'italic 10px Serif'],
    ]);
  });

  test('draws each line in the styles of its runs', () => {
    const ctx = createCtx();

    fillMultilineText(
      ctx,
      [[{ text: 'Persist ' }, { text: '(When it', italic: true }], [{ text: 'dies.)', italic: true }]],
      0,
      20,
    );

    expect(ctx.drawn.map(([text, , , font]) => [text, font.startsWith('italic')])).toEqual([
      ['Persist ', false],
      ['(When it', true],
      ['dies.)', true],
    ]);
  });

  test('centers the whole line, in its fonts', () => {
    const ctx = createCtx();
    ctx.textAlign = 'center';

    renderTextWithSymbols(ctx, [{ text: 'Ab ' }, { text: '(cd)', italic: true }], 100, 20);

    // 30px of regular text and 20px of italic text
    expect(ctx.drawn.map(([text, x]) => [text, x])).toEqual([
      ['Ab ', 75],
      ['(cd)', 105],
    ]);
    expect(ctx.textAlign).toBe('center');
  });
});

// Text is 10px wide per character, or 5px in italics, and the font 8px tall above the baseline and 2px below
const createCtx = () => {
  const ctx = {
    font: '10px Serif',
    textAlign: 'start' as CanvasTextAlign,
    measureText: vi.fn((text: string) => {
      return {
        width: text.length * (ctx.font.startsWith('italic') ? 5 : 10),
        fontBoundingBoxAscent: 8,
        fontBoundingBoxDescent: 2,
      };
    }),
    // The text drawn, with its position and font
    drawn: [] as [string, number, number, string][],
    fillText: vi.fn((text: string, x: number, y: number) => {
      ctx.drawn.push([text, x, y, ctx.font]);
    }),
    drawImage: vi.fn(),
    canvas: document.createElement('canvas'),
  };
  return ctx as unknown as CanvasRenderingContext2D & {
    fillText: ReturnType<typeof vi.fn>;
    measureText: ReturnType<typeof vi.fn>;
    drawn: [string, number, number, string][];
  };
};
