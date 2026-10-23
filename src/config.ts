import { initialiseFlags, type FlagDefinitions } from './utils/flags';

/** The app's flags. Tests have them all off (`configTests.ts`) */
export const Features = {} satisfies FlagDefinitions;

// --- Config initialization --------

type FeatureToggles = typeof Features;

declare module './utils/flags' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Its members are the features
  interface FlagRegistry extends FeatureToggles {}
}

export const initialiseConfig = () => {
  initialiseFlags(Features);
};
