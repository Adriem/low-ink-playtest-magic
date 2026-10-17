import { getSagaParts, isLoyaltyAbility, isSagaChapter, parseOracleText } from './oracleText';

describe('parseOracleText', () => {
  test('makes a paragraph of each line', () => {
    expect(parseOracleText('Flying\nWhen this creature enters, draw a card.')).toEqual({
      paragraphs: [{ text: 'Flying' }, { text: 'When this creature enters, draw a card.' }],
    });
  });

  test('has no paragraphs without oracle text', () => {
    expect(parseOracleText('')).toEqual({ paragraphs: [] });
    expect(parseOracleText(undefined)).toEqual({ paragraphs: [] });
  });

  describe('reminder text', () => {
    test('takes the parenthetical that ends a paragraph as its reminder text', () => {
      expect(parseOracleText('Trample (This creature can deal excess combat damage.)').paragraphs).toEqual([
        { text: 'Trample', reminderText: '(This creature can deal excess combat damage.)' },
      ]);
    });

    test('takes a paragraph that is only a parenthetical as reminder text', () => {
      expect(parseOracleText('({U/P} can be paid with either {U} or 2 life.)').paragraphs).toEqual([
        { text: '', reminderText: '({U/P} can be paid with either {U} or 2 life.)' },
      ]);
    });

    test('keeps parentheticals in the middle of a paragraph in its rules text', () => {
      const text = 'The first instant or sorcery spell you cast each turn costs {U} (or {1}) less to cast.';

      expect(parseOracleText(text).paragraphs).toEqual([{ text }]);
    });

    test('keeps the parentheses nested in the reminder text', () => {
      expect(parseOracleText('Morph {2} (Exile it (face down).)').paragraphs).toEqual([
        { text: 'Morph {2}', reminderText: '(Exile it (face down).)' },
      ]);
    });
  });

  describe('names', () => {
    test('takes ability words and names of abilities before " — " as the name', () => {
      expect(parseOracleText('Landfall — Whenever a land you control enters, draw a card.').paragraphs).toEqual([
        { name: 'Landfall', text: 'Whenever a land you control enters, draw a card.' },
      ]);
    });

    test('has no name for text that only looks like one', () => {
      expect(parseOracleText('Choose one —').paragraphs).toEqual([{ text: 'Choose one —' }]);
      expect(parseOracleText('+ {1} — Draw a card.').paragraphs).toEqual([{ text: '+ {1} — Draw a card.' }]);
    });
  });

  test('makes the "•" lines modes of the paragraph above', () => {
    expect(parseOracleText('Choose one —\n• Draw a card.\n• Gain 3 life (You get 3 life.)').paragraphs).toEqual([
      {
        text: 'Choose one —',
        modes: [{ text: 'Draw a card.' }, { text: 'Gain 3 life', reminderText: '(You get 3 life.)' }],
      },
    ]);
  });

  test('takes saga chapters, with their numbers and names', () => {
    const text = [
      '(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)',
      'I, II — Destroy up to one target nonland permanent.',
      'III — Draw two cards.',
      'IV — Mega Flare — This creature deals damage to each opponent.',
      'Flying',
    ].join('\n');

    expect(parseOracleText(text).paragraphs).toEqual([
      {
        text: '',
        reminderText: '(As this Saga enters and after your draw step, add a lore counter. Sacrifice after IV.)',
      },
      { chapterNumbers: ['I', 'II'], text: 'Destroy up to one target nonland permanent.' },
      { chapterNumbers: ['III'], text: 'Draw two cards.' },
      { chapterNumbers: ['IV'], name: 'Mega Flare', text: 'This creature deals damage to each opponent.' },
      { text: 'Flying' },
    ]);
  });

  test('takes loyalty abilities, with their costs', () => {
    const text = '+1: Draw a card.\n0: Untap target land.\n−3: Destroy target creature.\n−X: Deal X damage.';

    expect(parseOracleText(text).paragraphs).toEqual([
      { loyaltyCost: '+1', text: 'Draw a card.' },
      { loyaltyCost: '0', text: 'Untap target land.' },
      { loyaltyCost: '−3', text: 'Destroy target creature.' },
      { loyaltyCost: '−X', text: 'Deal X damage.' },
    ]);
  });
});

test('tells saga chapters and loyalty abilities apart from other paragraphs', () => {
  const [paragraph, chapter, ability] = parseOracleText('Flying\nI — Draw a card.\n+1: Scry 1.').paragraphs;

  expect([isSagaChapter(paragraph), isSagaChapter(chapter), isSagaChapter(ability)]).toEqual([false, true, false]);
  expect([isLoyaltyAbility(paragraph), isLoyaltyAbility(chapter), isLoyaltyAbility(ability)]).toEqual([
    false,
    false,
    true,
  ]);
});

describe('getSagaParts', () => {
  test('splits a saga into the paragraphs before its chapters, its chapters and the paragraphs after them', () => {
    const { introduction, chapters, conclusion } = getSagaParts(
      parseOracleText('(Lore counters.)\nI — Mill five cards.\nII, III — Return lands.\nReach, trample'),
    );

    expect(introduction).toEqual([{ text: '', reminderText: '(Lore counters.)' }]);
    expect(chapters.map((chapter) => chapter.chapterNumbers)).toEqual([['I'], ['II', 'III']]);
    expect(conclusion).toEqual([{ text: 'Reach, trample' }]);
  });

  test('has no chapters for text without them', () => {
    const oracleText = parseOracleText('Flying');

    expect(getSagaParts(oracleText)).toEqual({ introduction: oracleText.paragraphs, chapters: [], conclusion: [] });
  });
});
