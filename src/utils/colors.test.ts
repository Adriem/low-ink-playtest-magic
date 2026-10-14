import { getColorMappings } from './colors';
import { getColorIdentityStyle } from './canvasStyles';

describe('getColorMappings', () => {
  test.each([
    [['W'], 'white'],
    [['G'], 'green'],
    [['W', 'U'], 'azorius'],
    [['U', 'W'], 'azorius'],
    [['G', 'R'], 'gruul'],
    [['B', 'G'], 'golgari'],
    [['W', 'U', 'B'], 'multi'],
  ])('%j is %s', (colors, identity) => {
    expect(getColorMappings(colors, 'Creature')).toBe(identity);
  });

  test('colorless cards are artifacts, lands or colorless', () => {
    expect(getColorMappings([], 'Artifact')).toBe('artifact');
    expect(getColorMappings([], 'Land')).toBe('land');
    expect(getColorMappings([], 'Creature — Eldrazi')).toBe('colorless');
  });

  test('cards without colors have no identity', () => {
    expect(getColorMappings(undefined, 'Creature')).toBe('');
  });
});

describe('getColorIdentityStyle', () => {
  const palette = { WHITE: 'w', BLUE: 'u', BLACK: 'b', RED: 'r', GREEN: 'g', COLORLESS: 'c', MULTI: 'm', ARTIFACT: 'a', LAND: 'l' };
  interface FakeGradient {
    stops: [number, string][];
    addColorStop: (offset: number, color: string) => void;
  }
  const createCtx = () => {
    const gradient: FakeGradient = { stops: [], addColorStop: (offset, color) => { gradient.stops.push([offset, color]); } };
    return { canvas: { width: 500 }, createLinearGradient: vi.fn(() => gradient) } as unknown as CanvasRenderingContext2D;
  };

  test('uses the palette color of single-color identities', () => {
    expect(getColorIdentityStyle(createCtx(), 'red', { palette })).toBe('r');
    expect(getColorIdentityStyle(createCtx(), 'artifact', { palette })).toBe('a');
  });

  test('uses a horizontal gradient for two-color identities', () => {
    const ctx = createCtx();

    const style = getColorIdentityStyle(ctx, 'izzet', { palette });

    expect(ctx.createLinearGradient).toHaveBeenCalledWith(0, 0, 500, 0);
    expect((style as unknown as FakeGradient).stops).toEqual([[0.4, 'u'], [0.6, 'r']]);
  });

  test('uses colorless for unknown identities', () => {
    expect(getColorIdentityStyle(createCtx(), '', { palette })).toBe('c');
  });
});
