import { getRunsText, toParagraphWithModes, toTextParagraphs, toTextRuns } from './textRuns';

describe('toTextRuns', () => {
  test('puts the name and the reminder text in italics, around the rules text', () => {
    expect(toTextRuns({ name: 'Landfall', text: 'Draw a card.', reminderText: '(Then discard.)' })).toEqual([
      { text: 'Landfall', italic: true },
      { text: ' — ' },
      { text: 'Draw a card.' },
      { text: ' ' },
      { text: '(Then discard.)', italic: true },
    ]);
  });

  test('has only the reminder text for paragraphs without rules text', () => {
    expect(toTextRuns({ text: '', reminderText: '(Lore counters.)' })).toEqual([
      { text: '(Lore counters.)', italic: true },
    ]);
  });
});

test('follows a paragraph with a "• " paragraph for each of its modes', () => {
  const paragraph = { text: 'Choose one —', modes: [{ text: 'Draw a card.' }, { text: 'Gain 3 life.' }] };

  expect(toParagraphWithModes(paragraph).map(getRunsText)).toEqual([
    'Choose one —',
    '• Draw a card.',
    '• Gain 3 life.',
  ]);
});

test('puts chapter numbers and loyalty costs before the text, for boxes that draw them as text', () => {
  const paragraphs = [
    { chapterNumbers: ['II', 'III'], text: 'Draw a card.' },
    { loyaltyCost: '−3', text: 'Destroy target creature.' },
  ];

  expect(toTextParagraphs(paragraphs).map(getRunsText)).toEqual([
    'II, III — Draw a card.',
    '−3: Destroy target creature.',
  ]);
});
