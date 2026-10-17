import { getRunsText, toAbilityParagraphs, toTextParagraphs, toTextRuns } from './textRuns';

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

  test('has only the reminder text for abilities without rules text', () => {
    expect(toTextRuns({ text: '', reminderText: '(Lore counters.)' })).toEqual([
      { text: '(Lore counters.)', italic: true },
    ]);
  });
});

test('follows an ability with a "• " paragraph for each of its modes', () => {
  const ability = { text: 'Choose one —', modes: [{ text: 'Draw a card.' }, { text: 'Gain 3 life.' }] };

  expect(toAbilityParagraphs(ability).map(getRunsText)).toEqual(['Choose one —', '• Draw a card.', '• Gain 3 life.']);
});

test('puts loyalty costs before the text, for boxes that draw them as text', () => {
  const lines = [{ text: 'Flying' }, { loyaltyCost: '−3', text: 'Destroy target creature.' }];

  expect(toTextParagraphs(lines).map(getRunsText)).toEqual(['Flying', '−3: Destroy target creature.']);
});
