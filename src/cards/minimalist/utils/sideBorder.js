import { SIDE_BORDER_PADDING, SIDE_BORDER_WIDTH } from '../config';

/**
 * Left and right edges of the colored border on the left of planeswalker and
 * saga oracle boxes.
 *
 * @param {number} x - Left of the oracle box
 * @returns {{ left: number, right: number }}
 */
export const getSideBorderEdges = (x) => ({
  left: x + SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * .65,
  right: x + SIDE_BORDER_PADDING + SIDE_BORDER_WIDTH * .35,
});
