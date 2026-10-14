export interface HeightItem {
  weight: number;
  minHeight: number;
  requiredHeight?: number;
}

/**
 * Split a height between items proportionally to their weights, giving each
 * item at least its minimum height. Items below their minimum get exactly
 * their minimum, and the rest of the height is split between the others.
 *
 * If the minimums don't fit, the height is split equally instead, raising the
 * items that need it to their required height (what must fit no matter what)
 * and splitting the rest equally between the others. If the required heights
 * don't fit either, the height is split equally.
 *
 * @param items - The required height defaults to the minimum height
 * @returns Height of each item, adding up to `totalHeight`
 */
export const distributeHeight = (totalHeight: number, items: HeightItem[]): number[] => {
  const sumOf = (heights: number[]) => heights.reduce((sum, height) => sum + height, 0);
  const minHeights = items.map(({ minHeight }) => minHeight);
  const requiredHeights = items.map(({ minHeight, requiredHeight = minHeight }) => requiredHeight);

  if (sumOf(minHeights) <= totalHeight) return distributeWithMinimums(totalHeight, items, minHeights);
  if (sumOf(requiredHeights) <= totalHeight) {
    return distributeWithMinimums(totalHeight, items.map(() => ({ weight: 1 })), requiredHeights);
  }
  return items.map(() => totalHeight / items.length);
};

const distributeWithMinimums = (totalHeight: number, items: { weight: number }[], minHeights: number[]): number[] => {
  const atMinHeight = new Set<number>();

  for (;;) {
    const fixedHeight = minHeights.reduce((sum, minHeight, i) => sum + (atMinHeight.has(i) ? minHeight : 0), 0);
    const freeWeight = items.reduce((sum, { weight }, i) => sum + (atMinHeight.has(i) ? 0 : weight), 0);
    const freeHeight = totalHeight - fixedHeight;
    const freeItems = items.length - atMinHeight.size;

    const heights = items.map(({ weight }, i) => {
      if (atMinHeight.has(i)) return minHeights[i];
      return freeWeight > 0 ? freeHeight * (weight / freeWeight) : freeHeight / freeItems;
    });

    const belowMinHeight = items
      .map((_item, i) => i)
      .filter(i => !atMinHeight.has(i) && heights[i] < minHeights[i]);
    if (belowMinHeight.length === 0) return heights;

    belowMinHeight.forEach(i => atMinHeight.add(i));
  }
};
