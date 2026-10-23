import { initialiseFlags, Toggle, type FlagDefinitions } from './utils/flags';

export const Features = {
  /** Show ToS dialog on startup */
  TERMS_DIALOG: Toggle.ON_PROD_ONLY,
} satisfies FlagDefinitions;

// --- Config initialization --------

type FeatureToggles = typeof Features;

declare module './utils/flags' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Its members are the features
  interface FlagRegistry extends FeatureToggles {}
}

export const initialiseConfig = () => {
  initialiseFlags(Features);
};
