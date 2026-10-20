import { toPlainText } from './canvasText';
import {
  fillMultilineText,
  fitOracleLines,
  fitOracleLinesIntoBox,
  getOracleTextLength,
  renderTextWithSymbols,
} from './oracleTextRenderer';

vi.mock('../../../adapters/scryfall', () => ({
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

test('draws the text between symbols after them, leaving room for symbols as wide as the font is tall', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, [{ text: '{T}: Add {G}{G}.', format: 'regular' }], 0, 20);

  // {T} takes 8px; {G}{G} takes 8px each, with 1px between them
  expect(ctx.fillText.mock.calls).toEqual([
    [': Add ', 8, 20],
    ['.', 85, 20],
  ]);
});

test('draws text without symbols as it is, without the spaces around it', () => {
  const ctx = createCtx();

  renderTextWithSymbols(ctx, [{ text: '  Flying ', format: 'regular' }], 5, 20);

  expect(ctx.fillText.mock.calls).toEqual([['Flying', 5, 20]]);
});

test('measures lines with a placeholder for each symbol', () => {
  const ctx = createCtx();

  fillMultilineText(ctx, [[{ text: '{T}: Add {G}{G}.', format: 'regular' }]], 0, 20);

  expect(ctx.measureText).toHaveBeenCalledWith('‹::›: Add ‹::›‹::›.');
});

describe('oracle lines', () => {
  test('formats the name and the reminder text of a line in italics, around its rules text', () => {
    const lines = fitOracleLines(
      createCtx(),
      [{ name: 'Landfall', text: 'Draw a card.', reminderText: '(Then discard.)' }],
      1000,
      1000,
    );

    expect(lines).toEqual([
      [
        { text: 'Landfall ', format: 'italic' },
        { text: '— Draw a card. ', format: 'regular' },
        { text: '(Then discard.)', format: 'italic' },
      ],
    ]);
  });

  test('has only the reminder text for lines without rules text', () => {
    expect(fitOracleLines(createCtx(), [{ text: '', reminderText: '(Lore counters.)' }], 1000, 1000)).toEqual([
      [{ text: '(Lore counters.)', format: 'italic' }],
    ]);
  });

  test('follows a line with a "• " paragraph for each of its modes', () => {
    const line = { text: 'Choose one —', modes: [{ text: 'Draw a card.' }, { text: 'Gain 3 life.' }] };

    expect(fitOracleLines(createCtx(), [line], 1000, 1000).map(toPlainText)).toEqual([
      'Choose one —',
      '',
      '• Draw a card.',
      '',
      '• Gain 3 life.',
    ]);
  });

  test('writes loyalty costs before the text when asked, for boxes that draw them as text', () => {
    const lines = [{ text: 'Flying' }, { loyaltyCost: '−3', text: 'Destroy target creature.' }];

    expect(fitOracleLines(createCtx(), lines, 1000, 1000).map(toPlainText)).toEqual([
      'Flying',
      '',
      'Destroy target creature.',
    ]);
    expect(fitOracleLines(createCtx(), lines, 1000, 1000, { inlineLoyaltyCost: true }).map(toPlainText)).toEqual([
      'Flying',
      '',
      '−3: Destroy target creature.',
    ]);
  });

  test('writes chapter numbers before the text when asked, for boxes that draw them as text', () => {
    const lines = [
      { text: '', reminderText: '(Lore counters.)' },
      { chapterNumbers: ['I', 'II'], text: 'Draw a card.' },
    ];

    expect(fitOracleLines(createCtx(), lines, 1000, 1000).map(toPlainText)).toEqual([
      '(Lore counters.)',
      '',
      'Draw a card.',
    ]);
    expect(fitOracleLines(createCtx(), lines, 1000, 1000, { inlineChapterNumbers: true }).map(toPlainText)).toEqual([
      '(Lore counters.)',
      '',
      'I, II — Draw a card.',
    ]);
  });

  test('fits each line and each of its modes into a box, telling which line they come from', () => {
    const ability = { loyaltyCost: '+1', text: 'Choose one —', modes: [{ text: 'Draw a card.' }] };

    const paragraphs = fitOracleLinesIntoBox(
      createCtx(),
      [ability],
      (line) => ('loyaltyCost' in line ? 500 : 1000),
      1000,
    );

    expect(paragraphs.map(({ lines, line, isMode }) => [lines.map(toPlainText), line, isMode])).toEqual([
      [['Choose one —'], ability, false],
      [['• Draw a card.'], ability, true],
    ]);
  });

  test('measures the length of the text of lines, with their modes', () => {
    expect(getOracleTextLength([{ text: 'Choose one —', modes: [{ text: 'Draw.' }] }])).toBe(
      'Choose one —• Draw.'.length,
    );
  });
});

describe('italics', () => {
  test('draws italic pieces in italics, after the regular ones', () => {
    const ctx = createCtx();

    renderTextWithSymbols(
      ctx,
      [
        { text: 'Trample ', format: 'regular' },
        { text: '(Excess damage.)', format: 'italic' },
      ],
      0,
      20,
    );

    expect(ctx.drawn).toEqual([
      ['Trample ', 0, 20, '10px Serif'],
      ['(Excess damage.)', 80, 20, 'italic 10px Serif'],
    ]);
    expect(ctx.font).toBe('10px Serif');
  });

  test('keeps symbols inside italic pieces', () => {
    const ctx = createCtx();

    renderTextWithSymbols(ctx, [{ text: '({U} or 2 life.)', format: 'italic' }], 0, 20);

    // "(" is 5px wide in italics, and the symbol 8px
    expect(ctx.drawn).toEqual([
      ['(', 0, 20, 'italic 10px Serif'],
      [' or 2 life.)', 13, 20, 'italic 10px Serif'],
    ]);
  });

  test('draws each line in the formats of its pieces', () => {
    const ctx = createCtx();

    fillMultilineText(
      ctx,
      [
        [
          { text: 'Persist ', format: 'regular' },
          { text: '(When it', format: 'italic' },
        ],
        [{ text: 'dies.)', format: 'italic' }],
      ],
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

    renderTextWithSymbols(
      ctx,
      [
        { text: 'Ab ', format: 'regular' },
        { text: '(cd)', format: 'italic' },
      ],
      100,
      20,
    );

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
    getTransform: vi.fn(),
    setTransform: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    canvas: document.createElement('canvas'),
  };
  return ctx as unknown as CanvasRenderingContext2D & {
    fillText: ReturnType<typeof vi.fn>;
    measureText: ReturnType<typeof vi.fn>;
    drawn: [string, number, number, string][];
  };
};
