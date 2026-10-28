import { fitTextInTwoLines } from './fitTextInTwoLines';

test('wraps the text in two lines, the first one as full as its width allows', () => {
  expect(
    fitTextInTwoLines(createCtx(), { text: 'aaa bbb ccc', line1MaxWidth: 70, line2MaxWidth: 100, maxHeight: 20 }),
  ).toEqual(['aaa bbb', 'ccc']);
});

test('leaves the second line empty when the text fits in the first one', () => {
  expect(
    fitTextInTwoLines(createCtx(), { text: 'aaa', line1MaxWidth: 100, line2MaxWidth: 100, maxHeight: 10 }),
  ).toEqual(['aaa', '']);
});

test('stops shrinking the text at the smallest font size, when it still does not fit', () => {
  const ctx = createCtx();

  fitTextInTwoLines(ctx, { text: 'aaa bbb ccc', line1MaxWidth: 10, line2MaxWidth: 10, maxHeight: 5 });

  expect(ctx.font).toBe('6px Serif');
});

// Characters are 10px wide and lines 10px tall, whatever the font size
const createCtx = () => {
  const ctx = {
    font: '10px Serif',
    measureText: (text: string) => {
      return { width: text.length * 10, fontBoundingBoxAscent: 8, fontBoundingBoxDescent: 2 };
    },
  };
  return ctx as unknown as CanvasRenderingContext2D;
};
