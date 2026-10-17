import { measureTextWidth, wrapText } from './canvasText';

// Characters are 10px wide, or 5px in italics
const createCtx = () => {
  const ctx = {
    font: '10px Serif',
    measureText: (text: string) => ({ width: text.length * (ctx.font.startsWith('italic') ? 5 : 10) }),
  };
  return ctx as unknown as CanvasRenderingContext2D;
};

describe('measureTextWidth', () => {
  test('measures reminder text in italics', () => {
    expect(measureTextWidth(createCtx(), 'ab (cd)')).toBe(3 * 10 + 4 * 5);
  });

  test('measures text that continues a reminder text in italics until it ends', () => {
    expect(measureTextWidth(createCtx(), 'cd) ef', true)).toBe(3 * 5 + 3 * 10);
  });

  test('keeps the font of the context', () => {
    const ctx = createCtx();

    measureTextWidth(ctx, 'ab (cd)');

    expect(ctx.font).toBe('10px Serif');
  });
});

describe('wrapText', () => {
  test('fits more reminder text in a line, as it is narrower in italics', () => {
    // Lines fit up to 9 characters of rules text, or 19 of reminder text
    expect(wrapText(createCtx(), 'aaaaa bbbbb', 100)).toEqual(['aaaaa', 'bbbbb']);
    expect(wrapText(createCtx(), '(aaaa bbbbb)', 100)).toEqual(['(aaaa bbbbb)']);
  });

  test('measures the lines that continue a reminder text in italics', () => {
    // The second line only fits both its words in italics, as it continues the reminder text
    expect(wrapText(createCtx(), '(aaaaaaaaaaaaaaaaa bbbbbbbb cccccccc)', 100)).toEqual([
      '(aaaaaaaaaaaaaaaaa',
      'bbbbbbbb cccccccc)',
    ]);
  });
});
