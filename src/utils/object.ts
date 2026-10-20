/**
 * Whether a value is a plain object, e.g. parsed from a JSON object, and not
 * `null` or an array.
 */
export const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
