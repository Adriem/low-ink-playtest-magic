import { initialiseFlags, Toggle, type Flag, type Flags } from './flags';

// Flags of their own, as the app may have none
type TestFlags = Flags & { SHINY: boolean; BETA: boolean };

// Set up apart from window, so each test has its own
const setupFlags = () => {
  const target = {} as { flags: TestFlags };
  initialiseFlags({ SHINY: Toggle.ON, BETA: Toggle.OFF } as unknown as Record<Flag, Toggle>, target);
  return target;
};

describe('initialiseFlags', () => {
  test('turns each flag on or off as its toggle says where the app runs', () => {
    const toggles = { ON: Toggle.ON, OFF: Toggle.OFF, PROD: Toggle.ON_PROD_ONLY, DEV: Toggle.ON_DEV_ONLY };
    const inDevelopment = {} as { flags: Flags };
    const inProduction = {} as { flags: Flags };

    initialiseFlags(toggles as unknown as Record<Flag, Toggle>, inDevelopment, true);
    initialiseFlags(toggles as unknown as Record<Flag, Toggle>, inProduction, false);

    expect(inDevelopment.flags).toEqual({ ON: true, OFF: false, PROD: false, DEV: true });
    expect(inProduction.flags).toEqual({ ON: true, OFF: false, PROD: true, DEV: false });
  });

  test('starts with the defaults, showing the flags alone', () => {
    const { flags } = setupFlags();

    expect(flags.SHINY).toBe(true);
    expect(flags).toEqual({ SHINY: true, BETA: false });
    expect(Object.keys(flags)).toEqual(['SHINY', 'BETA']);
  });

  test('changes a flag assigned on the flags, telling its listeners', () => {
    const { flags } = setupFlags();
    const listener = vi.fn();
    flags.addListener(listener);

    flags.BETA = true;

    expect(flags.BETA).toBe(true);
    expect(listener).toHaveBeenCalledExactlyOnceWith('BETA', true);
  });

  test('changes several flags at once, telling its listeners of each', () => {
    const { flags } = setupFlags();
    const listener = vi.fn();
    flags.addListener(listener);

    Object.assign(flags, { SHINY: false, BETA: true });

    expect([flags.SHINY, flags.BETA]).toEqual([false, true]);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  test('keeps flags as booleans', () => {
    const { flags } = setupFlags();

    (flags as Record<string, unknown>).BETA = 'yes';

    expect(flags.BETA).toBe(true);
  });

  test('ignores names that are not flags, including its listener functions, with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { flags } = setupFlags();
    const { addListener } = flags;
    const listener = vi.fn();
    flags.addListener(listener);

    (flags as Record<string, unknown>).unknown = true;
    (flags as Record<string, unknown>).addListener = () => {};

    expect(flags).toEqual({ SHINY: true, BETA: false });
    expect(flags.addListener).toBe(addListener);
    expect(listener).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  test('does not let flags be defined or deleted, which would skip its listeners', () => {
    const { flags } = setupFlags();
    const listener = vi.fn();
    flags.addListener(listener);

    expect(() => Object.defineProperty(flags, 'BETA', { value: true })).toThrow(TypeError);
    expect(() => delete (flags as Partial<TestFlags>).BETA).toThrow(TypeError);

    expect(flags).toEqual({ SHINY: true, BETA: false });
    expect(listener).not.toHaveBeenCalled();
  });

  test('stops telling a listener once it is removed', () => {
    const { flags } = setupFlags();
    const listener = vi.fn();
    flags.addListener(listener);

    flags.removeListener(listener);
    flags.BETA = true;

    expect(listener).not.toHaveBeenCalled();
  });

  test('does not let the flags be replaced, redefined, deleted or set up again', () => {
    const target = setupFlags();
    const { flags } = target;

    // Test files are strict, so refused changes throw
    expect(() => {
      (target as { flags: unknown }).flags = {};
    }).toThrow(TypeError);
    expect(() => Object.defineProperty(target, 'flags', { value: {} })).toThrow(TypeError);
    expect(() => delete (target as { flags?: unknown }).flags).toThrow(TypeError);
    expect(() => initialiseFlags({} as unknown as Record<Flag, Toggle>, target)).toThrow(TypeError);

    expect(target.flags).toBe(flags);
  });
});
