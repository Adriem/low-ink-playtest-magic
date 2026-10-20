import { ARTWORK_HEIGHT, ARTWORK_Y, CONTENT_WIDTH, ORACLE_HEIGHT, ORACLE_Y, TITLE_Y, TYPELINE_Y } from './config';
import { getPlaneswalkerLayout } from './planeswalkerLayout';

// The boxes above the oracle box go a quarter of the title box (48px) higher
const RAISE = 12;

test('raises the boxes above the oracle box, which grows to the top, and widens the art box', () => {
  expect(getPlaneswalkerLayout()).toEqual({
    titleY: TITLE_Y - RAISE,
    artY: ARTWORK_Y - RAISE,
    artWidth: CONTENT_WIDTH + 8,
    artHeight: ARTWORK_HEIGHT,
    typelineY: TYPELINE_Y - RAISE,
    oracleY: ORACLE_Y - RAISE,
    oracleHeight: ORACLE_HEIGHT + RAISE,
  });
});

test('keeps the aspect ratio of the art, giving the rest of the card to the oracle box', () => {
  // Jace, the Mind Sculptor's art is 633x397: 272px tall at the 434px wide inside of the art box, plus its 4px pinline on each side
  const layout = getPlaneswalkerLayout({ naturalWidth: 633, naturalHeight: 397 });
  const shift = 272 + 8 - ARTWORK_HEIGHT;

  expect(layout).toMatchObject({
    artHeight: 280,
    typelineY: TYPELINE_Y + shift - RAISE,
    oracleY: ORACLE_Y + shift - RAISE,
    oracleHeight: ORACLE_HEIGHT - shift + RAISE,
  });
  // The oracle box ends where it does on other cards
  expect(layout.oracleY + layout.oracleHeight).toBe(ORACLE_Y + ORACLE_HEIGHT);
});

test('lays out art of regular cards a bit taller, as the art box is wider', () => {
  // Regular art crops are 626x457: 317px tall at 434px wide, plus the pinline
  expect(getPlaneswalkerLayout({ naturalWidth: 626, naturalHeight: 457 }).artHeight).toBe(325);
});

test('leaves the oracle box room for the abilities with tall art', () => {
  const layout = getPlaneswalkerLayout({ naturalWidth: 633, naturalHeight: 900 });

  expect(layout.oracleHeight).toBe(160 + RAISE);
  expect(layout.oracleY + layout.oracleHeight).toBe(ORACLE_Y + ORACLE_HEIGHT);
});
