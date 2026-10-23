import { FULL_ART_CROP } from '../../domain/cards';
import { toCard } from './toCard';
import type { ScryfallCard } from './types';

test('maps a single-faced card to a card with its main face', () => {
  const card = toCard(
    scryfallCard({
      name: 'Colossal Dreadmaw',
      set: 'm21',
      multiverse_ids: [489897],
      mana_cost: '{4}{G}{G}',
      colors: ['G'],
      type_line: 'Creature — Dinosaur',
      oracle_text: 'Trample',
      power: '6',
      toughness: '6',
      image_uris: { art_crop: 'dreadmaw.jpg' },
    }),
  );

  expect(card).toEqual({
    name: 'Colossal Dreadmaw',
    layout: 'normal',
    set: 'm21',
    multiverseIds: ['489897'],
    mainFace: {
      name: 'Colossal Dreadmaw',
      manaCost: '{4}{G}{G}',
      faceLayout: 'regular',
      orientation: 'portrait',
      typeLine: 'Creature — Dinosaur',
      oracleText: { lines: [{ text: 'Trample' }] },
      colors: ['G'],
      stats: { power: '6', toughness: '6' },
      art: { assetUrl: 'dreadmaw.jpg', crop: FULL_ART_CROP },
    },
  });
});

test.each([
  ['split', 'split'],
  ['adventure', 'subcard-left'],
  ['prepare', 'subcard-right'],
  ['transform', 'double-faced'],
  ['modal_dfc', 'double-faced'],
  ['flip', 'double-faced'],
])('maps cards with the %s layout to the %s layout', (layout, expected) => {
  const card = toCard(scryfallCard({ name: 'A // B', layout, card_faces: [{ name: 'A' }, { name: 'B' }] }));

  expect(card.layout).toBe(expected);
  expect([card.mainFace.name, card.secondaryFace?.name]).toEqual(['A', 'B']);
});

test('tells planeswalkers, sagas and battles apart from regular faces', () => {
  const planeswalker = toCard(scryfallCard({ name: 'Jace', type_line: 'Legendary Planeswalker — Jace', loyalty: '3' }));
  const battle = toCard(scryfallCard({ name: 'Invasion of Ravnica', type_line: 'Battle — Siege', defense: '4' }));
  const sagaCreature = toCard(
    scryfallCard({ name: 'Summon: Titan', type_line: 'Enchantment Creature — Saga Giant', power: '7', toughness: '7' }),
  );

  expect(planeswalker.mainFace).toMatchObject({ faceLayout: 'planeswalker', stats: { loyalty: '3' } });
  expect(sagaCreature.mainFace).toMatchObject({ faceLayout: 'saga', stats: { power: '7', toughness: '7' } });
  expect(battle.mainFace).toMatchObject({ faceLayout: 'battle', stats: { defense: '4' } });
});

test('lays out battles and the first half of aftermath cards in landscape, as they are printed sideways', () => {
  const battle = toCard(scryfallCard({ name: 'Invasion of Ravnica', type_line: 'Battle — Siege', defense: '4' }));
  const aftermath = toCard(
    scryfallCard({
      name: 'Cut // Ribbons',
      layout: 'split',
      keywords: ['Aftermath'],
      card_faces: [{ name: 'Cut' }, { name: 'Ribbons' }],
    }),
  );
  const split = toCard(
    scryfallCard({ name: 'Fire // Ice', layout: 'split', card_faces: [{ name: 'Fire' }, { name: 'Ice' }] }),
  );

  expect(battle.mainFace.orientation).toBe('landscape');
  expect([aftermath.mainFace.orientation, aftermath.secondaryFace?.orientation]).toEqual(['landscape', 'portrait']);
  expect([split.mainFace.orientation, split.secondaryFace?.orientation]).toEqual(['portrait', 'portrait']);
});

describe('colors of faces', () => {
  test('uses the colors of each face when it has them', () => {
    const card = toCard(
      scryfallCard({
        name: 'Front // Back',
        layout: 'transform',
        colors: ['G'],
        card_faces: [
          { name: 'Front', colors: ['G'] },
          { name: 'Back', colors: ['B', 'G'] },
        ],
      }),
    );

    expect([card.mainFace.colors, card.secondaryFace?.colors]).toEqual([['G'], ['B', 'G']]);
  });

  test('uses the colors of the mana cost of faces without them, e.g. the halves of split cards', () => {
    const card = toCard(
      scryfallCard({
        name: 'Fire // Ice',
        layout: 'split',
        colors: ['U', 'R'],
        card_faces: [
          { name: 'Fire', mana_cost: '{1}{R}' },
          { name: 'Ice', mana_cost: '{1}{U}' },
        ],
      }),
    );

    expect([card.mainFace.colors, card.secondaryFace?.colors]).toEqual([['R'], ['U']]);
  });

  test('uses the colors of the card for faces without colors or a mana cost, e.g. flipped sides', () => {
    const card = toCard(
      scryfallCard({
        name: 'Bushi Tenderfoot // Kenzo the Hardhearted',
        layout: 'flip',
        colors: ['W'],
        card_faces: [
          { name: 'Bushi Tenderfoot', mana_cost: '{W}' },
          { name: 'Kenzo the Hardhearted', mana_cost: '' },
        ],
      }),
    );

    expect(card.secondaryFace?.colors).toEqual(['W']);
  });
});

describe('art of faces', () => {
  test('gives each half of a split card its half of the shared art', () => {
    const card = toCard(
      scryfallCard({
        name: 'Fire // Ice',
        layout: 'split',
        image_uris: { art_crop: 'fire-ice.jpg' },
        card_faces: [{ name: 'Fire' }, { name: 'Ice' }],
      }),
    );

    expect([card.mainFace.art, card.secondaryFace?.art]).toEqual([
      { assetUrl: 'fire-ice.jpg', crop: { from: 0, to: 0.5 } },
      { assetUrl: 'fire-ice.jpg', crop: { from: 0.5, to: 1 } },
    ]);
  });

  test('gives each half of an aftermath card its art, the first one wider', () => {
    const card = toCard(
      scryfallCard({
        name: 'Dusk // Dawn',
        layout: 'split',
        keywords: ['Aftermath'],
        card_faces: [{ name: 'Dusk' }, { name: 'Dawn' }],
      }),
    );

    expect([card.mainFace.art.crop, card.secondaryFace?.art.crop]).toEqual([
      { from: 0, to: 0.61 },
      { from: 0.615, to: 1 },
    ]);
  });

  test('uses the art of each face when it has its own', () => {
    const card = toCard(
      scryfallCard({
        name: 'Front // Back',
        layout: 'transform',
        card_faces: [
          { name: 'Front', image_uris: { art_crop: 'front.jpg' } },
          { name: 'Back', image_uris: { art_crop: 'back.jpg' } },
        ],
      }),
    );

    expect([card.mainFace.art, card.secondaryFace?.art]).toEqual([
      { assetUrl: 'front.jpg', crop: FULL_ART_CROP },
      { assetUrl: 'back.jpg', crop: FULL_ART_CROP },
    ]);
  });
});

describe('oracle text', () => {
  test('makes an oracle line of each line', () => {
    expect(toOracleText('Flying\nWhen this creature enters, draw a card.')).toEqual({
      lines: [{ text: 'Flying' }, { text: 'When this creature enters, draw a card.' }],
    });
  });

  test('has no lines without oracle text', () => {
    expect(toOracleText('')).toEqual({ lines: [] });
    expect(toOracleText(undefined)).toEqual({ lines: [] });
  });

  describe('reminder text', () => {
    test('takes the parenthetical that ends a line as its reminder text', () => {
      expect(toOracleText('Trample (This creature can deal excess combat damage.)').lines).toEqual([
        { text: 'Trample', reminderText: '(This creature can deal excess combat damage.)' },
      ]);
    });

    test('takes a line that is only a parenthetical as reminder text', () => {
      expect(toOracleText('({U/P} can be paid with either {U} or 2 life.)').lines).toEqual([
        { text: '', reminderText: '({U/P} can be paid with either {U} or 2 life.)' },
      ]);
    });

    test('keeps parentheticals in the middle of a line in its rules text', () => {
      const text = 'The first instant or sorcery spell you cast each turn costs {U} (or {1}) less to cast.';

      expect(toOracleText(text).lines).toEqual([{ text }]);
    });

    test('keeps the parentheses nested in the reminder text', () => {
      expect(toOracleText('Morph {2} (Exile it (face down).)').lines).toEqual([
        { text: 'Morph {2}', reminderText: '(Exile it (face down).)' },
      ]);
    });
  });

  describe('names', () => {
    test('takes ability words and names of abilities before " — " as the name', () => {
      expect(toOracleText('Landfall — Whenever a land you control enters, draw a card.').lines).toEqual([
        { name: 'Landfall', text: 'Whenever a land you control enters, draw a card.' },
      ]);
    });

    test('has no name for text that only looks like one', () => {
      expect(toOracleText('Choose one —').lines).toEqual([{ text: 'Choose one —' }]);
      expect(toOracleText('+ {1} — Draw a card.').lines).toEqual([{ text: '+ {1} — Draw a card.' }]);
    });
  });

  test('makes the "•" lines modes of the line above', () => {
    expect(toOracleText('Choose one —\n• Draw a card.\n• Gain 3 life (You get 3 life.)').lines).toEqual([
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

    expect(toOracleText(text).lines).toEqual([
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

    expect(toOracleText(text).lines).toEqual([
      { loyaltyCost: '+1', text: 'Draw a card.' },
      { loyaltyCost: '0', text: 'Untap target land.' },
      { loyaltyCost: '−3', text: 'Destroy target creature.' },
      { loyaltyCost: '−X', text: 'Deal X damage.' },
    ]);
  });
});

// The oracle text of a card with the given Scryfall oracle text
const toOracleText = (oracleText?: string) => {
  return toCard(scryfallCard({ name: 'Card', oracle_text: oracleText })).mainFace.oracleText;
};

const scryfallCard = (card: Partial<ScryfallCard> & { name: string }): ScryfallCard => {
  return {
    layout: 'normal',
    set: 'tst',
    ...card,
  };
};

describe('artists of faces', () => {
  test('credits the artist of each face, or of the card for faces without their own', () => {
    const card = toCard(
      scryfallCard({
        name: 'Fire // Ice',
        layout: 'split',
        artist: 'David Martin & Franz Vohwinkel',
        card_faces: [{ name: 'Fire', artist: 'David Martin' }, { name: 'Ice' }],
      }),
    );

    expect([card.mainFace.artist, card.secondaryFace?.artist]).toEqual([
      'David Martin',
      'David Martin & Franz Vohwinkel',
    ]);
  });
});
