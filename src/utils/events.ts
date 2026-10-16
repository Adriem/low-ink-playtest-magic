/**
 * Whether a click was triggered from the keyboard (Enter or Space), which
 * gives it no click count.
 */
export const isKeyboardClick = (event?: { detail: number } | null) => {
  return event?.detail === 0;
};
