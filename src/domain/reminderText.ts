/**
 * A run of rules text, or of reminder text: the explanations in parentheses,
 * e.g. "(This creature can deal excess combat damage…)", printed in italics.
 */
export type TextRun = { text: string; reminder: boolean };

/**
 * Split a text into runs of rules text and runs of reminder text, which
 * include their parentheses.
 *
 * @param startsInReminder - Whether the text starts inside a reminder text,
 *   e.g. a line that continues one
 * @returns The runs, and whether the text ends inside a reminder text
 */
export const splitReminderText = (
  text: string,
  startsInReminder = false,
): { runs: TextRun[]; endsInReminder: boolean } => {
  const runs: TextRun[] = [];
  let depth = startsInReminder ? 1 : 0;
  let current = '';

  const endRun = (reminder: boolean) => {
    if (current) runs.push({ text: current, reminder });
    current = '';
  };

  for (const char of text) {
    if (char === '(') {
      if (depth === 0) endRun(false);
      depth++;
      current += char;
    } else if (char === ')' && depth > 0) {
      current += char;
      depth--;
      if (depth === 0) endRun(true);
    } else {
      current += char;
    }
  }
  endRun(depth > 0);

  return { runs, endsInReminder: depth > 0 };
};
