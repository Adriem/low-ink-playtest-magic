/**
 * Load a JSON value saved in the session storage.
 *
 * @param fallback - Returned when nothing valid is saved
 * @param isValid - Check for the loaded value
 */
export const loadFromSessionStorage = <T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => boolean = () => true,
): T => {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return fallback;

    const value = JSON.parse(raw);
    return isValid(value) ? value : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Save a value as JSON in the session storage.
 */
export const saveToSessionStorage = (key: string, value: unknown) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
