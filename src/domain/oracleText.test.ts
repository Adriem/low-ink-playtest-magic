import { getSagaParts, isLoyaltyAbility, isSagaChapter } from './oracleText';

test('tells saga chapters and loyalty abilities apart from other paragraphs', () => {
  const paragraph = { text: 'Flying' };
  const chapter = { chapterNumbers: ['I'], text: 'Draw a card.' };
  const ability = { loyaltyCost: '+1', text: 'Scry 1.' };

  expect([isSagaChapter(paragraph), isSagaChapter(chapter), isSagaChapter(ability)]).toEqual([false, true, false]);
  expect([isLoyaltyAbility(paragraph), isLoyaltyAbility(chapter), isLoyaltyAbility(ability)]).toEqual([
    false,
    false,
    true,
  ]);
});

describe('getSagaParts', () => {
  test('splits a saga into the paragraphs before its chapters, its chapters and the paragraphs after them', () => {
    const { introduction, chapters, conclusion } = getSagaParts({
      paragraphs: [
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
    const oracleText = { paragraphs: [{ text: 'Flying' }] };

    expect(getSagaParts(oracleText)).toEqual({ introduction: oracleText.paragraphs, chapters: [], conclusion: [] });
  });
});
