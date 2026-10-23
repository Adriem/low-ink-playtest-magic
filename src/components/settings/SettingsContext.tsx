import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ArtFidelity, CardStyle, CustomPalette, InkLevel } from '../cards/styles';
import type { CardTreatment } from '../../domain/press';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { isRecord } from '../../utils/object';

/** The value of each setting */
export interface Settings {
  cardVariant: CardStyle;
  doubleFacedCardTreatment: CardTreatment;
  inkLevel: InkLevel;
  artFidelity: ArtFidelity;
  includeArt: IncludeArt;
  cardBorder: CardBorder;
  cardCorners: CardCorners;
}

/**
 * Border of the cards: none, a black outline over their edges, or a full black
 * border around their content
 */
export type CardBorder = 'none' | 'outline' | 'full';

/** Whether the cards draw their art (unfiltered) or not, as the art fidelity it's drawn with */
export type IncludeArt = Extract<ArtFidelity, 'blank' | 'no-filter'>;

/** Whether the cards have rounded or square corners */
export type CardCorners = 'rounded' | 'square';

export type SettingName = keyof Settings;

/** Local storage key the settings are saved in, as a JSON object */
const SETTINGS_STORAGE_KEY = 'press:settings';

/** Local storage key prefix each card style's palette is saved in, as a JSON object of its colors */
const PALETTE_STORAGE_KEY_PREFIX = 'press:palette:';

export interface SettingDefinition<T extends string> {
  /** Key of the setting's name in the texts of the app (`src/i18n`), as are its options' labels */
  label: string;
  options: { value: T; label: string }[];
  /** Value of the default option */
  default: T;
  /** Shown, but not available yet */
  disabled?: boolean;
  /**
   * How the options are picked: radio buttons (the default), a slider through
   * them in order, or a checkbox, unchecked for the first option and checked
   * for the second
   */
  control?: 'radio' | 'slider' | 'checkbox';
  /** Key of the checkbox's text, for a checkbox in its own group (whose name is the label) */
  checkboxLabel?: string;
  /** Setting whose group the setting's checkbox is shown in, below its options */
  group?: SettingName;
  /** Card styles the setting applies to, and is enabled for: all of them, if not given */
  cardStyles?: CardStyle[];
}

const TREATMENT_OPTIONS: SettingDefinition<CardTreatment>['options'] = [
  { value: 'unified', label: 'settings.double_faced_card_treatment.options.unified' },
  { value: 'separate', label: 'settings.double_faced_card_treatment.options.separate' },
];

export const SETTINGS_DEFINITIONS: { [Name in SettingName]: SettingDefinition<Settings[Name]> } = {
  cardVariant: {
    label: 'settings.card_variant.label',
    options: [
      { value: 'realistic', label: 'settings.card_variant.options.realistic' },
      { value: 'minimalist', label: 'settings.card_variant.options.minimalist' },
    ],
    default: 'realistic',
  },
  doubleFacedCardTreatment: {
    label: 'settings.double_faced_card_treatment.label',
    options: TREATMENT_OPTIONS,
    default: 'separate',
  },
  inkLevel: {
    label: 'settings.ink_level.label',
    options: [
      { value: 'low', label: 'settings.ink_level.options.low' },
      { value: 'medium', label: 'settings.ink_level.options.medium' },
      { value: 'high', label: 'settings.ink_level.options.high' },
    ],
    default: 'medium',
  },
  artFidelity: {
    label: 'settings.art_fidelity.label',
    options: [
      { value: 'blank', label: 'settings.art_fidelity.options.blank' },
      { value: 'contours', label: 'settings.art_fidelity.options.contours' },
      { value: 'mid-tones', label: 'settings.art_fidelity.options.mid_tones' },
      { value: 'posterized', label: 'settings.art_fidelity.options.posterized' },
      { value: 'grayscale', label: 'settings.art_fidelity.options.grayscale' },
      { value: 'no-filter', label: 'settings.art_fidelity.options.no_filter' },
    ],
    default: 'posterized',
    control: 'slider',
    // The minimalist style has no art
    cardStyles: ['realistic'],
  },
  includeArt: {
    label: 'settings.include_art.label',
    checkboxLabel: 'settings.include_art.checkbox',
    options: [
      { value: 'blank', label: 'settings.include_art.options.blank' },
      { value: 'no-filter', label: 'settings.include_art.options.no_filter' },
    ],
    default: 'no-filter',
    control: 'checkbox',
    cardStyles: ['realistic'],
  },
  cardBorder: {
    label: 'settings.card_border.label',
    options: [
      { value: 'none', label: 'settings.card_border.options.none' },
      { value: 'outline', label: 'settings.card_border.options.outline' },
      { value: 'full', label: 'settings.card_border.options.full' },
    ],
    default: 'outline',
  },
  cardCorners: {
    label: 'settings.card_corners.label',
    group: 'cardBorder',
    control: 'checkbox',
    options: [
      { value: 'square', label: 'settings.card_corners.options.square' },
      { value: 'rounded', label: 'settings.card_corners.options.rounded' },
    ],
    default: 'rounded',
  },
};

export const SETTING_NAMES = Object.keys(SETTINGS_DEFINITIONS) as SettingName[];

/**
 * Whether a setting applies to a card style, so its controls are enabled.
 */
export const isSettingAvailable = (name: SettingName, cardStyle: CardStyle): boolean => {
  return SETTINGS_DEFINITIONS[name].cardStyles?.includes(cardStyle) ?? true;
};

interface SettingsContextValue {
  settings: Settings;
  setSetting: <Name extends SettingName>(name: Name, value: Settings[Name]) => void;
  restoreDefaults: () => void;
  /** Custom colors saved for each card style's palette */
  palettes: Record<CardStyle, CustomPalette>;
  /** Colors being edited and not saved yet, which the cards are drawn with meanwhile */
  palettePreviews: Partial<Record<CardStyle, CustomPalette>>;
  previewPalette: (cardStyle: CardStyle, palette: CustomPalette) => void;
  savePalette: (cardStyle: CardStyle, palette: CustomPalette) => void;
  discardPalettePreviews: (cardStyle?: CardStyle) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsContextProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState(loadInitialSettings);

  const setSetting = useCallback(<Name extends SettingName>(name: Name, value: Settings[Name]) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  }, []);

  const restoreDefaults = useCallback(() => {
    setSettings(getDefaultSettings());
  }, []);

  const [palettes, setPalettes] = useState(loadPalettes);
  const [palettePreviews, setPalettePreviews] = useState<Partial<Record<CardStyle, CustomPalette>>>({});

  const previewPalette = useCallback((cardStyle: CardStyle, palette: CustomPalette) => {
    setPalettePreviews((prev) => ({ ...prev, [cardStyle]: palette }));
  }, []);

  // Each palette is saved on its own, and stops being a preview
  const savePalette = useCallback((cardStyle: CardStyle, palette: CustomPalette) => {
    setPalettes((prev) => ({ ...prev, [cardStyle]: palette }));
    setPalettePreviews((prev) => withoutPreview(prev, cardStyle));
    saveToStorage(localStorage, PALETTE_STORAGE_KEY_PREFIX + cardStyle, palette);
  }, []);

  // The preview of a card style's palette, or of every one
  const discardPalettePreviews = useCallback((cardStyle?: CardStyle) => {
    setPalettePreviews((prev) => (cardStyle == null ? {} : withoutPreview(prev, cardStyle)));
  }, []);

  useEffect(() => {
    saveToStorage(localStorage, SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSetting,
        restoreDefaults,
        palettes,
        palettePreviews,
        previewPalette,
        savePalette,
        discardPalettePreviews,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Palette previews without a card style's.
 */
const withoutPreview = (previews: Partial<Record<CardStyle, CustomPalette>>, cardStyle: CardStyle) => {
  const rest = { ...previews };
  delete rest[cardStyle];
  return rest;
};

/**
 * The custom colors saved for each card style's palette.
 */
const loadPalettes = (): Record<CardStyle, CustomPalette> => {
  const cardStyles = SETTINGS_DEFINITIONS.cardVariant.options.map(({ value }) => value);
  return Object.fromEntries(
    cardStyles.map((cardStyle) => {
      return [
        cardStyle,
        loadFromStorage<CustomPalette>(localStorage, PALETTE_STORAGE_KEY_PREFIX + cardStyle, {}, isRecord),
      ];
    }),
  ) as Record<CardStyle, CustomPalette>;
};

/**
 * The default of every setting.
 */
const getDefaultSettings = (): Settings => {
  return {
    cardVariant: SETTINGS_DEFINITIONS.cardVariant.default,
    doubleFacedCardTreatment: SETTINGS_DEFINITIONS.doubleFacedCardTreatment.default,
    inkLevel: SETTINGS_DEFINITIONS.inkLevel.default,
    artFidelity: SETTINGS_DEFINITIONS.artFidelity.default,
    includeArt: SETTINGS_DEFINITIONS.includeArt.default,
    cardBorder: SETTINGS_DEFINITIONS.cardBorder.default,
    cardCorners: SETTINGS_DEFINITIONS.cardCorners.default,
  };
};

/**
 * The saved settings, with the default of each one that isn't saved or isn't
 * one of its options.
 */
const loadInitialSettings = (): Settings => {
  const saved = loadFromStorage<Record<string, unknown>>(localStorage, SETTINGS_STORAGE_KEY, {}, isRecord);
  return {
    cardVariant: getSavedSetting(saved, 'cardVariant'),
    doubleFacedCardTreatment: getSavedSetting(saved, 'doubleFacedCardTreatment'),
    inkLevel: getSavedSetting(saved, 'inkLevel'),
    artFidelity: getSavedSetting(saved, 'artFidelity'),
    includeArt: getSavedSetting(saved, 'includeArt'),
    cardBorder: getSavedSetting(saved, 'cardBorder'),
    cardCorners: getSavedSetting(saved, 'cardCorners'),
  };
};

const getSavedSetting = <Name extends SettingName>(saved: Record<string, unknown>, name: Name): Settings[Name] => {
  const definition = SETTINGS_DEFINITIONS[name];
  const option = definition.options.find(({ value }) => value === saved[name]);
  return option ? option.value : definition.default;
};

export const useSetting = <Name extends SettingName>(name: Name): [Settings[Name], (value: Settings[Name]) => void] => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSetting must be used within a SettingsContextProvider');
  return [ctx.settings[name], (value) => ctx.setSetting(name, value)];
};

/**
 * Function that sets every setting back to its default.
 */
export const useRestoreDefaultSettings = (): (() => void) => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useRestoreDefaultSettings must be used within a SettingsContextProvider');
  return ctx.restoreDefaults;
};

/**
 * The custom colors to draw a card style with: the ones being edited, if any,
 * or the saved ones.
 */
export const useCardPalette = (cardStyle: CardStyle): CustomPalette => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useCardPalette must be used within a SettingsContextProvider');
  return ctx.palettePreviews[cardStyle] ?? ctx.palettes[cardStyle];
};

/**
 * What the editor of a card style's palette needs: its saved colors, its
 * colors being edited, if any, and functions to preview, save and discard
 * them.
 */
export const usePaletteEditor = (cardStyle: CardStyle) => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('usePaletteEditor must be used within a SettingsContextProvider');
  return {
    savedPalette: ctx.palettes[cardStyle],
    previewedPalette: ctx.palettePreviews[cardStyle],
    preview: (palette: CustomPalette) => ctx.previewPalette(cardStyle, palette),
    save: (palette: CustomPalette) => ctx.savePalette(cardStyle, palette),
    discard: () => ctx.discardPalettePreviews(cardStyle),
  };
};

/**
 * Function that discards the colors of every palette being edited and not saved.
 */
export const useDiscardPalettePreviews = (): (() => void) => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useDiscardPalettePreviews must be used within a SettingsContextProvider');
  return () => ctx.discardPalettePreviews();
};
