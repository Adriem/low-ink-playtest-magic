/**
 * Load a JSON value saved in the session storage.
 *
 * @template T
 * @param {string} key
 * @param {T} fallback - Returned when nothing valid is saved
 * @param {function(value: *): boolean} [isValid] - Check for the loaded value
 * @returns {T}
 */
export const loadFromSessionStorage = (key, fallback, isValid = () => true) => {
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
 *
 * @param {string} key
 * @param {*} value
 */
export const saveToSessionStorage = (key, value) => {
  sessionStorage.setItem(key, JSON.stringify(value));
};
