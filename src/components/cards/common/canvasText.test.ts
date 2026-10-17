import { fitFontSizeInXY, measureRunsWidth, wrapText } from './canvasText';

describe('measureRunsWidth', () => {
  test('measures each run in its style', () => {
    expect(measureRunsWidth(createCtx(), [{ text: 'ab ' }, { text: '(cd)', italic: true }])).toBe(3 * 10 + 4 * 5);
  });

  test('keeps the font of the context', () => {
    const ctx = createCtx();

    measureRunsWidth(ctx, [{ text: 'ab ' }, { text: '(cd)', italic: true }]);

    expect(ctx.font).toBe('10px Serif');
  });
});

describe('wrapText', () => {
  test('fits more italic text in a line, as it is narrower', () => {
    // Lines fit up to 9 characters of regular text, or 19 of italic text
    expect(wrapText(createCtx(), [{ text: 'aaaaa bbbbb' }], 100)).toEqual([[{ text: 'aaaaa' }], [{ text: 'bbbbb' }]]);
    expect(wrapText(createCtx(), [{ text: '(aaaa bbbbb)', italic: true }], 100)).toEqual([
      [{ text: '(aaaa bbbbb)', italic: true }],
    ]);
  });

  test('keeps the style of each word across lines, with the space between runs ending the first', () => {
    // The first line is 75px wide: 30px of regular text and 45px of italic text
    expect(
      wrapText(createCtx(), [{ text: 'Ab' }, { text: ' ' }, { text: '(aaaaaaaa bbbbbbbb)', italic: true }], 100),
    ).toEqual([[{ text: 'Ab ' }, { text: '(aaaaaaaa', italic: true }], [{ text: 'bbbbbbbb)', italic: true }]]);
  });
});

describe('fitFontSizeInXY', () => {
  test('separates the lines of each paragraph with an empty line', () => {
    expect(fitFontSizeInXY(createCtx(), [[{ text: 'a' }], [{ text: 'b' }]], 100, 100)).toEqual([
      [{ text: 'a' }],
      [],
      [{ text: 'b' }],
    ]);
  });

  test('has no lines without paragraphs', () => {
    expect(fitFontSizeInXY(createCtx(), [], 100, 100)).toEqual([]);
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
