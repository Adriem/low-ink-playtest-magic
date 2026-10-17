/**
 * Load a JSON value saved in a storage, e.g. `sessionStorage` or `localStorage`.
 *
 * @param fallback - Returned when nothing valid is saved
 * @param isValid - Check for the loaded value
 */
export const loadFromStorage = <T>(
  storage: Storage,
  key: string,
  fallback: T,
  isValid: (value: unknown) => boolean = () => true,
): T => {
  try {
    const raw = storage.getItem(key);
    if (raw == null) return fallback;

    const value = JSON.parse(raw);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save a value as JSON in a storage, e.g. `sessionStorage` or `localStorage`.
 */
export const saveToStorage = (storage: Storage, key: string, value: unknown) => {
  storage.setItem(key, JSON.stringify(value));
};
