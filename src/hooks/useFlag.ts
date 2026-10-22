import { useSyncExternalStore } from 'react';
import type { Flag, Flags } from '../utils/flags';

/** Whether a flag is on, re-rendering when it changes */
export const useFlag = (name: Flag): boolean => {
  return useFlagsStore((flags) => flags[name]);
};

/** A value read from the flags, re-read whenever they change */
const useFlagsStore = <T>(read: (flags: Flags) => T): T => {
  return useSyncExternalStore(subscribeToFlags, () => read(window.flags));
};

const subscribeToFlags = (onChange: () => void) => {
  window.flags.addListener(onChange);
  return () => {
    window.flags.removeListener(onChange);
  };
};
