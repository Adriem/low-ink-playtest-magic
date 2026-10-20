import { fitFontSizeInXY, fitTextIntoBox, measureRichTextWidth, wrapText } from './canvasText';

describe('measureRichTextWidth', () => {
  test('measures each piece in its format', () => {
    expect(
      measureRichTextWidth(createCtx(), [
        { text: 'ab ', format: 'regular' },
        { text: '(cd)', format: 'italic' },
      ]),
    ).toBe(3 * 10 + 4 * 5);
  });

  test('keeps the font of the context', () => {
    const ctx = createCtx();

    measureRichTextWidth(ctx, [
      { text: 'ab ', format: 'regular' },
      { text: '(cd)', format: 'italic' },
    ]);

    expect(ctx.font).toBe('10px Serif');
  });
});

describe('wrapText', () => {
  test('fits more italic text in a line, as it is narrower', () => {
    // Lines fit up to 9 characters of regular text, or 19 of italic text
    expect(wrapText(createCtx(), [{ text: 'aaaaa bbbbb', format: 'regular' }], 100)).toEqual([
      [{ text: 'aaaaa', format: 'regular' }],
      [{ text: 'bbbbb', format: 'regular' }],
    ]);
    expect(wrapText(createCtx(), [{ text: '(aaaa bbbbb)', format: 'italic' }], 100)).toEqual([
      [{ text: '(aaaa bbbbb)', format: 'italic' }],
    ]);
  });

  test('keeps the format of each word across lines, with the space between pieces ending the first', () => {
    // The first line is 75px wide: 30px of regular text and 45px of italic text
    expect(
      wrapText(
        createCtx(),
        [
          { text: 'Ab', format: 'regular' },
          { text: ' ', format: 'regular' },
          { text: '(aaaaaaaa bbbbbbbb)', format: 'italic' },
        ],
        100,
      ),
    ).toEqual([
      [
        { text: 'Ab ', format: 'regular' },
        { text: '(aaaaaaaa', format: 'italic' },
      ],
      [{ text: 'bbbbbbbb)', format: 'italic' }],
    ]);
  });
});

describe('fitFontSizeInXY', () => {
  test('separates the lines of each paragraph with an empty line', () => {
    expect(
      fitFontSizeInXY(createCtx(), [[{ text: 'a', format: 'regular' }], [{ text: 'b', format: 'regular' }]], 100, 100),
    ).toEqual([[{ text: 'a', format: 'regular' }], [], [{ text: 'b', format: 'regular' }]]);
  });

  test('has no lines without paragraphs', () => {
    expect(fitFontSizeInXY(createCtx(), [], 100, 100)).toEqual([]);
  });
});

describe('fitTextIntoBox', () => {
  test('gives paragraphs at least their minimum height, centering their text in it', () => {
    const paragraphs = fitTextIntoBox(
      createCtx(),
      [
        { content: [{ text: 'a', format: 'regular' }], width: 100, minHeight: 30 },
        { content: [{ text: 'b', format: 'regular' }], width: 100 },
      ],
      1000,
    );

    // 30px, plus the space between paragraphs (0.75 of the 10px font); the last paragraph has none
    expect(paragraphs.map(({ paragraphHeight, textOffset }) => [paragraphHeight, textOffset])).toEqual([
      [37.5, 10],
      [10, 0],
    ]);
  });

  test('stops shrinking the text at the smallest font size, when it still does not fit', () => {
    const ctx = createCtx();

    fitTextIntoBox(ctx, [{ content: [{ text: 'a', format: 'regular' }], width: 100, minHeight: 100 }], 50);

    expect(ctx.font).toBe('6px Serif');
  });
});

// Characters are 10px wide, or 5px in italics, and lines 10px tall
const createCtx = () => {
  const ctx = {
    font: '10px Serif',
    measureText: (text: string) => {
      return {
        width: text.length * (ctx.font.startsWith('italic') ? 5 : 10),
        fontBoundingBoxAscent: 8,
        fontBoundingBoxDescent: 2,
      };
    },
  };
  return ctx as unknown as CanvasRenderingContext2D;
};
