import { testFace } from '../../testUtils';
import { MINIMALIST_PALETTE } from './minimalist/palette';
import { renderMinimalistCard } from './minimalist/render';
import { REALISTIC_PALETTE } from './realistic/palette';
import { renderRealisticCard } from './realistic/render';
import { getCardStyle } from './styles';

// The renderers load the mana symbols from Scryfall
vi.mock('../../adapters/scryfall', () => ({
  getSymbolImage: vi.fn(() => Promise.resolve(undefined)),
}));

describe('getCardStyle', () => {
  test('gets the renderer and palette of each style', () => {
    expect(getCardStyle('realistic')).toMatchObject({ render: renderRealisticCard, palette: REALISTIC_PALETTE });
    expect(getCardStyle('minimalist')).toMatchObject({ render: renderMinimalistCard, palette: MINIMALIST_PALETTE });
  });

  test('draws battles sideways in the realistic style only', () => {
    const battle = testFace({ name: 'Invasion of Ravnica', faceLayout: 'battle', stats: { defense: '4' } });
    const creature = testFace({ name: 'Colossal Dreadmaw' });

    expect(getCardStyle('realistic').isDrawnSideways(battle)).toBe(true);
    expect(getCardStyle('realistic').isDrawnSideways(creature)).toBe(false);
    expect(getCardStyle('minimalist').isDrawnSideways(battle)).toBe(false);
  });

  test('uses the realistic style for unknown styles', () => {
    expect(getCardStyle('baroque')).toBe(getCardStyle('realistic'));
  });
});
