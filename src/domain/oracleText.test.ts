import { getSagaParts, isLoyaltyAbility, isSagaChapter } from './oracleText';

test('tells saga chapters and loyalty abilities apart from other lines', () => {
  const ability = { text: 'Flying' };
  const chapter = { chapterNumbers: ['I'], text: 'Draw a card.' };
  const loyaltyAbility = { loyaltyCost: '+1', text: 'Scry 1.' };

  expect([isSagaChapter(ability), isSagaChapter(chapter), isSagaChapter(loyaltyAbility)]).toEqual([false, true, false]);
  expect([isLoyaltyAbility(ability), isLoyaltyAbility(chapter), isLoyaltyAbility(loyaltyAbility)]).toEqual([
    false,
    false,
    true,
  ]);
});

describe('getSagaParts', () => {
  test('splits a saga into the lines before its chapters, its chapters and the lines after them', () => {
    const { introduction, chapters, conclusion } = getSagaParts({
      lines: [
        { text: '', reminderText: '(Lore counters.)' },
        { chapterNumbers: ['I'], text: 'Mill five cards.' },
        { chapterNumbers: ['II', 'III'], text: 'Return lands.' },
        { text: 'Reach, trample' },
      ],
    });

    expect(introduction).toEqual([{ text: '', reminderText: '(Lore counters.)' }]);
    expect(chapters.map((chapter) => chapter.chapterNumbers)).toEqual([['I'], ['II', 'III']]);
    expect(conclusion).toEqual([{ text: 'Reach, trample' }]);
  });

  test('has no chapters for text without them', () => {
    const oracleText = { lines: [{ text: 'Flying' }] };

    expect(getSagaParts(oracleText)).toEqual({ introduction: oracleText.lines, chapters: [], conclusion: [] });
  });
});
