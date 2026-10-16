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
    expect(getCardStyle('realistic')).toEqual({ render: renderRealisticCard, palette: REALISTIC_PALETTE });
    expect(getCardStyle('minimalist')).toEqual({ render: renderMinimalistCard, palette: MINIMALIST_PALETTE });
  });

  test('uses the realistic style for unknown styles', () => {
    expect(getCardStyle('baroque')).toBe(getCardStyle('realistic'));
  });
});
