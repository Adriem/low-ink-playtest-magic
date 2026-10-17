import { splitReminderText } from './reminderText';

describe('splitReminderText', () => {
  test('splits rules text from reminder text, which keeps its parentheses', () => {
    expect(splitReminderText('Trample (This creature can deal excess combat damage.)')).toEqual({
      runs: [
        { text: 'Trample ', reminder: false },
        { text: '(This creature can deal excess combat damage.)', reminder: true },
      ],
      endsInReminder: false,
    });
  });

  test('keeps text after a reminder text as rules text', () => {
    expect(splitReminderText('Flying (It can fly.) and more').runs).toEqual([
      { text: 'Flying ', reminder: false },
      { text: '(It can fly.)', reminder: true },
      { text: ' and more', reminder: false },
    ]);
  });

  test('tells whether a text ends inside a reminder text, and continues it', () => {
    const firstLine = splitReminderText('Persist (When this creature dies,');
    const secondLine = splitReminderText('return it.) Draw a card.', firstLine.endsInReminder);

    expect(firstLine.endsInReminder).toBe(true);
    expect(firstLine.runs.at(-1)).toEqual({ text: '(When this creature dies,', reminder: true });
    expect(secondLine.runs).toEqual([
      { text: 'return it.)', reminder: true },
      { text: ' Draw a card.', reminder: false },
    ]);
    expect(secondLine.endsInReminder).toBe(false);
  });

  test('keeps nested parentheses inside the reminder text', () => {
    expect(splitReminderText('(Exile it (face down).) Next').runs).toEqual([
      { text: '(Exile it (face down).)', reminder: true },
      { text: ' Next', reminder: false },
    ]);
  });

  test('has a single run of rules text without parentheses', () => {
    expect(splitReminderText('Draw a card.')).toEqual({
      runs: [{ text: 'Draw a card.', reminder: false }],
      endsInReminder: false,
    });
  });
});
