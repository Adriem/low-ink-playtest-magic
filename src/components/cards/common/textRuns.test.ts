import { parseOracleText } from '../../../domain/oracleText';
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
  const [paragraph] = parseOracleText('Choose one —\n• Draw a card.\n• Gain 3 life.').paragraphs;

  expect(toParagraphWithModes(paragraph).map(getRunsText)).toEqual([
    'Choose one —',
    '• Draw a card.',
    '• Gain 3 life.',
  ]);
});

test('puts chapter numbers and loyalty costs before the text, for boxes that draw them as text', () => {
  const { paragraphs } = parseOracleText('II, III — Draw a card.\n−3: Destroy target creature.');

  expect(toTextParagraphs(paragraphs).map(getRunsText)).toEqual([
    'II, III — Draw a card.',
    '−3: Destroy target creature.',
  ]);
});
