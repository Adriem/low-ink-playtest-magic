/** Storages the app saves its data in */
export type StorageArea = 'localStorage' | 'sessionStorage';

/**
 * Key the app saves data under, with the version of its shape after `@`, e.g.
 * `press:SETTINGS@1`. Bump the version when a release changes the shape in a
 * way data saved by older releases can't be read with: that data is dropped.
 */
export type StorageKey = `press:${Uppercase<string>}@${number}`;

/** Prefix of the keys of all the data the app saves */
export const STORAGE_KEY_PREFIX = 'press:';

/** Data as saved, with the version of its shape */
interface SavedData {
  version: number;
  data: unknown;
}

/**
 * Load a JSON value saved in a storage. Storage can be unavailable (e.g. with
 * site data blocked), which reading it is the same as reading nothing for.
 *
 * @param fallback - Returned when nothing valid is saved (or saved by a
 *   release with data of another shape)
 * @param isValid - Check for the loaded value
 */
export const loadFromStorage = <T>(
  area: StorageArea,
  key: StorageKey,
  fallback: T,
  isValid: (value: unknown) => boolean = () => true,
): T => {
  try {
    const { storedKey, version } = parseStorageKey(key);
    const raw = window[area].getItem(storedKey);
    if (raw == null) return fallback;

    const saved = JSON.parse(raw) as Partial<SavedData> | null;
    if (saved?.version !== version) {
      // Saved by a release with data of another shape, so it would never be read again
      window[area].removeItem(storedKey);
      return fallback;
    }
    return isValid(saved.data) ? (saved.data as T) : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save a value as JSON in a storage, with the version of its shape. Nothing is
 * saved when storage is unavailable (e.g. with site data blocked) or full.
 */
export const saveToStorage = (area: StorageArea, key: StorageKey, value: unknown) => {
  try {
    const { storedKey, version } = parseStorageKey(key);
    const saved: SavedData = { version, data: value };
    window[area].setItem(storedKey, JSON.stringify(saved));
  } catch {
    // The app works without saving its data
  }
};

/**
 * Remove all the data the app saved, leaving other data alone (e.g. of other
 * sites on the same domain, like GitHub Pages').
 */
export const clearSavedData = () => {
  (['localStorage', 'sessionStorage'] as const).forEach((area) => {
    try {
      const storage = window[area];
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index));
      keys.filter((key) => key?.startsWith(STORAGE_KEY_PREFIX)).forEach((key) => storage.removeItem(key!));
    } catch {
      // Nothing was saved
    }
  });
};

/**
 * The key a value is stored under, without its version (so a new version
 * replaces the old data instead of adding to it), and that version.
 */
const parseStorageKey = (key: StorageKey) => {
  const versionStart = key.lastIndexOf('@');
  return { storedKey: key.slice(0, versionStart), version: Number(key.slice(versionStart + 1)) };
};
