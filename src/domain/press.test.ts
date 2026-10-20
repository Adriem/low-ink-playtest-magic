import { testCard, testFace } from '../testUtils';
import { groupCardsIntoSheets, moveCard, type SheetItem } from './press';

const doubleFacedCard = testCard({
  name: 'Front // Back',
  layout: 'double-faced',
  mainFace: testFace({ name: 'Front' }),
  secondaryFace: testFace({ name: 'Back' }),
});

const splitCard = testCard({
  name: 'Fire // Ice',
  layout: 'split',
  mainFace: testFace({ name: 'Fire' }),
  secondaryFace: testFace({ name: 'Ice' }),
});

const adventureCard = testCard({
  name: 'Bonecrusher Giant // Stomp',
  layout: 'subcard-left',
  mainFace: testFace({ name: 'Bonecrusher Giant' }),
  secondaryFace: testFace({ name: 'Stomp' }),
});

describe('groupCardsIntoSheets', () => {
  test('groups cards into sheets of the given size', () => {
    const cards = ['A', 'B', 'C', 'D', 'E'].map((name) => testCard({ name }));

    expect(names(groupCardsIntoSheets(cards, { sheetSize: 2 }))).toEqual([['A', 'B'], ['C', 'D'], ['E']]);
  });

  test('defaults to sheets of 9 cards', () => {
    const cards = Array.from({ length: 10 }, (_, i) => testCard({ name: `${i}` }));

    expect(groupCardsIntoSheets(cards).map((sheet) => sheet.length)).toEqual([9, 1]);
  });

  test('returns no sheets for an empty collection', () => {
    expect(groupCardsIntoSheets([])).toEqual([]);
  });

  test('keeps loading placeholders in place', () => {
    const cards = [testCard({ name: 'A' }), { loading: true as const, loadingCardId: 3 }];

    const [[, placeholder]] = groupCardsIntoSheets(cards);

    expect(placeholder).toEqual({ kind: 'loading', collectionIndex: 1, loadingCardId: 3 });
  });

  test('splits double-faced cards into one item per face when separate', () => {
    const sheets = groupCardsIntoSheets([doubleFacedCard], { doubleFacedCardTreatment: 'separate' });

    expect(names(sheets)).toEqual([['Front', 'Back']]);
    expect(sheets[0].map((item) => item.kind === 'face' && item.sheetFace)).toEqual(['main', 'secondary']);
  });

  test('keeps both faces of double-faced cards together when unified', () => {
    const [[item]] = groupCardsIntoSheets([doubleFacedCard], { doubleFacedCardTreatment: 'unified' });

    expect(item).toMatchObject({ kind: 'faces', faces: [doubleFacedCard.mainFace, doubleFacedCard.secondaryFace] });
  });

  test('keeps both halves of split cards together, whatever the double-faced card treatment', () => {
    const [[item]] = groupCardsIntoSheets([splitCard], { doubleFacedCardTreatment: 'separate' });

    expect(item).toMatchObject({ kind: 'faces', faces: [splitCard.mainFace, splitCard.secondaryFace] });
  });

  test('draws the secondary face of cards with a sub-card as the sub-card, whatever the treatments', () => {
    const [[item]] = groupCardsIntoSheets([adventureCard], { doubleFacedCardTreatment: 'unified' });

    expect(item).toMatchObject({
      kind: 'face',
      sheetFace: 'single',
      face: adventureCard.mainFace,
      subFace: adventureCard.secondaryFace,
      subFacePosition: 'left',
    });
  });

  test('tags each item with the index of the collection card it comes from', () => {
    const cards = [testCard({ name: 'A' }), doubleFacedCard, testCard({ name: 'B' })];
    const sheets = groupCardsIntoSheets(cards, { sheetSize: 2, doubleFacedCardTreatment: 'separate' });

    expect(sheets.flat().map((item) => item.collectionIndex)).toEqual([0, 1, 1, 2]);
  });
});

const names = (sheets: SheetItem[][]) => {
  return sheets.map((sheet) =>
    sheet.map((item) => {
      if (item.kind === 'loading') return 'loading';
      return item.kind === 'face' ? item.face.name : item.card.name;
    }),
  );
};

describe('moveCard', () => {
  test('moves a card to another position', () => {
    expect(moveCard(['A', 'B', 'C'], 0, 1)).toEqual(['B', 'A', 'C']);
    expect(moveCard(['A', 'B', 'C'], 2, 0)).toEqual(['C', 'A', 'B']);
  });

  test('leaves the collection as it is for moves outside of it', () => {
    const collection = ['A', 'B'];

    expect(moveCard(collection, 0, -1)).toBe(collection);
    expect(moveCard(collection, 1, 2)).toBe(collection);
    expect(moveCard(collection, 5, 0)).toBe(collection);
  });
});
