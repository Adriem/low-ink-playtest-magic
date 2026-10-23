import { useEffect, useState } from 'react';

/**
 * A value that follows another once it stops changing for a while, e.g. text
 * once the user pauses typing.
 *
 * @param delayMillis - How long the value has to stay the same
 */
export const useDebouncedValue = <T>(value: T, delayMillis: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMillis);
    return () => clearTimeout(timer);
  }, [value, delayMillis]);

  return debouncedValue;
};
