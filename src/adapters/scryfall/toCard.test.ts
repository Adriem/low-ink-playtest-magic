import { toCard } from './toCard';
import type { ScryfallCard } from './types';

const scryfallCard = (card: Partial<ScryfallCard> & { name: string }): ScryfallCard => ({
  layout: 'normal',
  set: 'tst',
  ...card,
});

test('maps a single-faced card to a card with its main face', () => {
  const card = toCard(scryfallCard({
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
  }));

  expect(card).toEqual({
    name: 'Colossal Dreadmaw',
    layout: 'normal',
    set: 'm21',
    multiverseIds: ['489897'],
    mainFace: {
      name: 'Colossal Dreadmaw',
      manaCost: '{4}{G}{G}',
      faceLayout: 'regular',
      typeLine: 'Creature — Dinosaur',
      oracleText: 'Trample',
      colors: ['G'],
      stats: { power: '6', toughness: '6' },
      art: { assetUrl: 'dreadmaw.jpg', crop: 'full' },
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

test('tells planeswalkers and sagas apart from regular faces', () => {
  const planeswalker = toCard(scryfallCard({ name: 'Jace', type_line: 'Legendary Planeswalker — Jace', loyalty: '3' }));
  const sagaCreature = toCard(scryfallCard({ name: 'Summon: Titan', type_line: 'Enchantment Creature — Saga Giant', power: '7', toughness: '7' }));

  expect(planeswalker.mainFace).toMatchObject({ faceLayout: 'planeswalker', stats: { loyalty: '3' } });
  expect(sagaCreature.mainFace).toMatchObject({ faceLayout: 'saga', stats: { power: '7', toughness: '7' } });
});

describe('colors of faces', () => {
  test('uses the colors of each face when it has them', () => {
    const card = toCard(scryfallCard({
      name: 'Front // Back',
      layout: 'transform',
      colors: ['G'],
      card_faces: [{ name: 'Front', colors: ['G'] }, { name: 'Back', colors: ['B', 'G'] }],
    }));

    expect([card.mainFace.colors, card.secondaryFace?.colors]).toEqual([['G'], ['B', 'G']]);
  });

  test('uses the colors of the mana cost of faces without them, e.g. the halves of split cards', () => {
    const card = toCard(scryfallCard({
      name: 'Fire // Ice',
      layout: 'split',
      colors: ['U', 'R'],
      card_faces: [{ name: 'Fire', mana_cost: '{1}{R}' }, { name: 'Ice', mana_cost: '{1}{U}' }],
    }));

    expect([card.mainFace.colors, card.secondaryFace?.colors]).toEqual([['R'], ['U']]);
  });

  test('uses the colors of the card for faces without colors or a mana cost, e.g. flipped sides', () => {
    const card = toCard(scryfallCard({
      name: 'Bushi Tenderfoot // Kenzo the Hardhearted',
      layout: 'flip',
      colors: ['W'],
      card_faces: [{ name: 'Bushi Tenderfoot', mana_cost: '{W}' }, { name: 'Kenzo the Hardhearted', mana_cost: '' }],
    }));

    expect(card.secondaryFace?.colors).toEqual(['W']);
  });
});

describe('art of faces', () => {
  test('gives each half of a split card its half of the shared art', () => {
    const card = toCard(scryfallCard({
      name: 'Fire // Ice',
      layout: 'split',
      image_uris: { art_crop: 'fire-ice.jpg' },
      card_faces: [{ name: 'Fire' }, { name: 'Ice' }],
    }));

    expect([card.mainFace.art, card.secondaryFace?.art]).toEqual([
      { assetUrl: 'fire-ice.jpg', crop: 'left-half' },
      { assetUrl: 'fire-ice.jpg', crop: 'right-half' },
    ]);
  });

  test('keeps the whole art for aftermath cards, whose arts are not halves', () => {
    const card = toCard(scryfallCard({
      name: 'Dusk // Dawn',
      layout: 'split',
      keywords: ['Aftermath'],
      card_faces: [{ name: 'Dusk' }, { name: 'Dawn' }],
    }));

    expect([card.mainFace.art.crop, card.secondaryFace?.art.crop]).toEqual(['full', 'full']);
  });

  test('uses the art of each face when it has its own', () => {
    const card = toCard(scryfallCard({
      name: 'Front // Back',
      layout: 'transform',
      card_faces: [
        { name: 'Front', image_uris: { art_crop: 'front.jpg' } },
        { name: 'Back', image_uris: { art_crop: 'back.jpg' } },
      ],
    }));

    expect([card.mainFace.art, card.secondaryFace?.art]).toEqual([
      { assetUrl: 'front.jpg', crop: 'full' },
      { assetUrl: 'back.jpg', crop: 'full' },
    ]);
  });
});
