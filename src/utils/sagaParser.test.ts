import { parseSagaOracleText, splitSagaCreatureText } from './sagaParser';

const sagaCreatureText = [
  '(As this Saga enters and after your draw step, add a lore counter.)',
  'I — Mill five cards.',
  'II, III — Return all land cards from your graveyard to the battlefield tapped.',
  'Reach, trample',
].join('\n');

test('parses the paragraphs before, the chapters and the paragraphs after', () => {
  expect(parseSagaOracleText(sagaCreatureText)).toEqual({
    topParagraphs: ['(As this Saga enters and after your draw step, add a lore counter.)'],
    chapters: [
      { labels: ['I'], text: 'Mill five cards.' },
      { labels: ['II', 'III'], text: 'Return all land cards from your graveyard to the battlefield tapped.' },
    ],
    bottomParagraphs: ['Reach, trample'],
  });
});

test('splits a saga creature into its saga text and its creature abilities', () => {
  expect(splitSagaCreatureText(sagaCreatureText)).toEqual({
    sagaText: [
      '(As this Saga enters and after your draw step, add a lore counter.)',
      'I — Mill five cards.',
      'II, III — Return all land cards from your graveyard to the battlefield tapped.',
    ].join('\n'),
    creatureText: 'Reach, trample',
  });
});

test('gives saga creatures without abilities after the chapters an empty creature text', () => {
  expect(splitSagaCreatureText('I — Draw a card.').creatureText).toBe('');
});
