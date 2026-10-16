import { SIDE_BORDER_PADDING, SIDE_BORDER_WIDTH } from '../config';

/**
 * Left and right edges of the colored border on the left of planeswalker and
 * saga oracle boxes.
 *
 * @param x - Left of the oracle box
 */
export const getSideBorderEdges = (x: number) => {
  return {
    left: x + SIDE_BORDER_PADDING - SIDE_BORDER_WIDTH * 0.65,
    right: x + SIDE_BORDER_PADDING + SIDE_BORDER_WIDTH * 0.35,
  };
};
