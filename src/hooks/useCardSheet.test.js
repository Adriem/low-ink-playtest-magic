import { groupCardsIntoSheets } from './useCardSheet';

const names = (sheets) => sheets.map(sheet => sheet.map(card => card.name ?? 'loading'));

const doubleFacedCard = {
  name: 'Front // Back',
  layout: 'transform',
  card_faces: [{ name: 'Front' }, { name: 'Back' }],
};

const splitCard = {
  name: 'Fire // Ice',
  layout: 'split',
  card_faces: [{ name: 'Fire' }, { name: 'Ice' }],
};

const adventureCard = {
  name: 'Bonecrusher Giant // Stomp',
  layout: 'adventure',
  card_faces: [{ name: 'Bonecrusher Giant' }, { name: 'Stomp' }],
};

test('groups cards into sheets of the given size', () => {
  const cards = ['A', 'B', 'C', 'D', 'E'].map(name => ({ name }));

  expect(names(groupCardsIntoSheets(cards, { sheetSize: 2 }))).toEqual([['A', 'B'], ['C', 'D'], ['E']]);
});

test('defaults to sheets of 9 cards', () => {
  const cards = Array.from({ length: 10 }, (_, i) => ({ name: `${i}` }));

  expect(groupCardsIntoSheets(cards).map(sheet => sheet.length)).toEqual([9, 1]);
});

test('returns no sheets for an empty collection', () => {
  expect(groupCardsIntoSheets([])).toEqual([]);
});

test('keeps loading placeholders in place', () => {
  const cards = [{ name: 'A' }, { _loading: true, _loadingCardId: 3 }];

  expect(names(groupCardsIntoSheets(cards))).toEqual([['A', 'loading']]);
});

test('splits double-faced cards into one card per face when separate', () => {
  const sheets = groupCardsIntoSheets([doubleFacedCard], { doubleFacedCardTreatment: 'separate' });

  expect(names(sheets)).toEqual([['Front', 'Back']]);
  expect(sheets[0].map(card => card._faceIndex)).toEqual([0, 1]);
});

test('keeps double-faced cards whole when unified', () => {
  const sheets = groupCardsIntoSheets([doubleFacedCard], { doubleFacedCardTreatment: 'unified' });

  expect(names(sheets)).toEqual([['Front // Back']]);
  expect(sheets[0][0]._faceIndex).toBeUndefined();
});

test('applies the split card treatment to split cards', () => {
  expect(names(groupCardsIntoSheets([splitCard], { splitCardTreatment: 'separate' }))).toEqual([['Fire', 'Ice']]);
  expect(names(groupCardsIntoSheets([splitCard], { splitCardTreatment: 'unified' }))).toEqual([['Fire // Ice']]);
});

test('turns the second face of adventure cards into a sub face', () => {
  const [[card]] = groupCardsIntoSheets([adventureCard]);

  expect(card.name).toBe('Bonecrusher Giant');
  expect(card._subFace).toEqual({ name: 'Stomp' });
});

test('tags each sheet card with the index of the collection card it comes from', () => {
  const cards = [{ name: 'A' }, doubleFacedCard, { name: 'B' }];
  const sheets = groupCardsIntoSheets(cards, { sheetSize: 2, doubleFacedCardTreatment: 'separate' });

  expect(sheets.flat().map(card => [card.name, card._collectionIndex])).toEqual([
    ['A', 0],
    ['Front', 1],
    ['Back', 1],
    ['B', 2],
  ]);
});

test('gives unified faces without their own art the art of the card', () => {
  const splitCardWithArt = { ...splitCard, image_uris: { art_crop: 'fire-ice.jpg' } };

  const [[card]] = groupCardsIntoSheets([splitCardWithArt], { splitCardTreatment: 'unified' });

  expect(card.card_faces.map(face => face.image_uris?.art_crop)).toEqual(['fire-ice.jpg', 'fire-ice.jpg']);
});

test('keeps the art of unified faces that have their own', () => {
  const faces = [
    { name: 'Front', image_uris: { art_crop: 'front.jpg' } },
    { name: 'Back', image_uris: { art_crop: 'back.jpg' } },
  ];

  const [[card]] = groupCardsIntoSheets([{ ...doubleFacedCard, card_faces: faces }], { doubleFacedCardTreatment: 'unified' });

  expect(card.card_faces.map(face => face.image_uris.art_crop)).toEqual(['front.jpg', 'back.jpg']);
});
