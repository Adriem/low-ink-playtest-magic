/** Whether a flag is on by default */
export enum Toggle {
  ON,
  OFF,
  ON_PROD_ONLY,
  ON_DEV_ONLY,
}

/** Flags (in UPPER_CASE) and their defaults */
export type FlagDefinitions = Record<Uppercase<string>, Toggle>;

/** The app's flags, declared by `src/config.ts` (declaration merging) */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Filled in by src/config.ts
export interface FlagRegistry {}

export type Flag = keyof FlagRegistry;

export type FlagListener = (name: Flag, value: boolean) => void;

export type Flags = Record<Flag, boolean> & {
  addListener: (listener: FlagListener) => void;
  removeListener: (listener: FlagListener) => void;
};

declare global {
  interface Window {
    /** The app's flags, which can be changed from the console (e.g. `flags.SOME_FLAG = true`) */
    readonly flags: Flags;
  }
}

/**
 * Set up `window.flags`, once. Assigning a flag tells the listeners; unknown
 * names are ignored. Flags and `window.flags` can't be redefined or deleted.
 *
 * @param target - Where to set them up, other than `window` in tests
 */
export const initialiseFlags = (
  toggles: Record<Flag, Toggle>,
  target: object = window,
  isDevelopment: boolean = import.meta.env.DEV,
) => {
  const values: Record<string, boolean> = Object.fromEntries(
    Object.entries<Toggle>(toggles).map(([name, toggle]) => [name, isOn(toggle, isDevelopment)]),
  );
  const listeners = new Set<FlagListener>();

  const isFlag = (name: PropertyKey): name is Flag => {
    return typeof name === 'string' && Object.hasOwn(toggles, name);
  };

  const setFlag = (name: PropertyKey, value: unknown) => {
    if (!isFlag(name)) {
      console.warn(`Unknown flag "${String(name)}". The flags are: ${Object.keys(toggles).join(', ')}`);
      return;
    }
    values[name] = Boolean(value);
    listeners.forEach((listener) => listener(name, values[name]));
  };

  // Not enumerable, so the flags show alone. Configurable, so the proxy can ignore assigning them
  Object.defineProperties(values, {
    addListener: { value: (listener: FlagListener) => listeners.add(listener), configurable: true },
    removeListener: { value: (listener: FlagListener) => listeners.delete(listener), configurable: true },
  });

  const flags = new Proxy(values as unknown as Flags, {
    set: (_target, name, value) => {
      setFlag(name, value);
      return true;
    },
    // Refused: Object.defineProperty and delete throw
    defineProperty: () => false,
    deleteProperty: () => false,
  });

  Object.defineProperty(target, 'flags', { value: flags, enumerable: true, writable: false, configurable: false });
};

const isOn = (toggle: Toggle, isDevelopment: boolean): boolean => {
  switch (toggle) {
    case Toggle.ON:
      return true;
    case Toggle.OFF:
      return false;
    case Toggle.ON_PROD_ONLY:
      return !isDevelopment;
    case Toggle.ON_DEV_ONLY:
      return isDevelopment;
  }
};
