import { getLineHeight, reduceTextSize } from '../../common/canvasText';

export const fitTextInTwoLines = (
  ctx: CanvasRenderingContext2D,
  {
    text,
    line1MaxWidth,
    line2MaxWidth,
    maxHeight,
  }: { text: string; line1MaxWidth: number; line2MaxWidth: number; maxHeight: number },
) => {
  // Smaller and smaller, until the text fits
  while (true) {
    const [line1, line2] = wrapFirstLineOfText(ctx, { text, lineMaxWidth: line1MaxWidth });

    const line1Metrics = ctx.measureText(line1);
    const line2Metrics = ctx.measureText(line2);

    const textFitsVertically = getLineHeight(line1Metrics) + (line2.length && getLineHeight(line2Metrics)) <= maxHeight;
    const textFitsHorizontally = line2Metrics.width <= line2MaxWidth;
    if (textFitsVertically && textFitsHorizontally) return [line1, line2];

    reduceTextSize(ctx);
  }
};

const wrapFirstLineOfText = (
  ctx: CanvasRenderingContext2D,
  { text, lineMaxWidth }: { text: string; lineMaxWidth: number },
) => {
  let line1 = '';
  let line2 = '';
  const pendingWords = text.split(/\s+/);

  while (pendingWords.length) {
    const currentWord = pendingWords.shift() ?? '';
    const newLine1 = line1 ? `${line1} ${currentWord}` : currentWord;

    if (ctx.measureText(newLine1).width <= lineMaxWidth) {
      line1 = newLine1;
    } else {
      line2 = [currentWord, ...pendingWords.splice(0, pendingWords.length)].join(' ');
    }
  }

  return [line1, line2];
};
