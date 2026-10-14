/**
 * Whether a click was triggered from the keyboard (Enter or Space), which
 * gives it no click count.
 *
 * @param {MouseEvent} [event]
 * @returns {boolean}
 */
export const isKeyboardClick = (event) => event?.detail === 0;
