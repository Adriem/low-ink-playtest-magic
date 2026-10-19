import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ArtFidelity, CardStyle, InkLevel } from '../cards/styles';
import type { CardTreatment } from '../../domain/press';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { isRecord } from '../../utils/object';

/** The value of each setting */
export interface Settings {
  cardVariant: CardStyle;
  splitCardTreatment: CardTreatment;
  doubleFacedCardTreatment: CardTreatment;
  inkLevel: InkLevel;
  artFidelity: ArtFidelity;
}

export type SettingName = keyof Settings;

/** Local storage key the settings are saved in, as a JSON object */
const SETTINGS_STORAGE_KEY = 'press:settings';

export interface SettingDefinition<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  /** Value of the default option */
  default: T;
  /** Shown, but not available yet */
  disabled?: boolean;
  /** How the options are picked: radio buttons (the default), or a slider through them in order */
  control?: 'radio' | 'slider';
  /** Card styles the setting applies to, and is enabled for: all of them, if not given */
  cardStyles?: CardStyle[];
}

const TREATMENT_OPTIONS: SettingDefinition<CardTreatment>['options'] = [
  { value: 'unified', label: 'Unified' },
  { value: 'separate', label: 'Separate' },
];

export const SETTINGS_DEFINITIONS: { [Name in SettingName]: SettingDefinition<Settings[Name]> } = {
  cardVariant: {
    label: 'Card style',
    options: [
      { value: 'realistic', label: 'Realistic' },
      { value: 'minimalist', label: 'Minimalist' },
    ],
    default: 'realistic',
  },
  splitCardTreatment: {
    label: 'Split card treatment',
    options: TREATMENT_OPTIONS,
    default: 'unified',
  },
  doubleFacedCardTreatment: {
    label: 'Double-Faced card treatment',
    options: TREATMENT_OPTIONS,
    default: 'separate',
  },
  inkLevel: {
    label: 'Ink level',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'splurge', label: 'Splurge' },
    ],
    default: 'medium',
  },
  artFidelity: {
    label: 'Art fidelity',
    options: [
      { value: 'blank', label: '1' },
      { value: 'contours', label: '2' },
      { value: 'mid-tones', label: '3' },
      { value: 'posterized', label: '4' },
      { value: 'grayscale', label: '5' },
      { value: 'no-filter', label: '6' },
    ],
    default: 'posterized',
    control: 'slider',
    // The minimalist style has no art
    cardStyles: ['realistic'],
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
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export const SettingsContextProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState(loadInitialSettings);

  const setSetting = useCallback(<Name extends SettingName>(name: Name, value: Settings[Name]) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    saveToStorage(localStorage, SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  return <SettingsContext.Provider value={{ settings, setSetting }}>{children}</SettingsContext.Provider>;
};

/**
 * The saved settings, with the default of each one that isn't saved or isn't
 * one of its options.
 */
const loadInitialSettings = (): Settings => {
  const saved = loadFromStorage<Record<string, unknown>>(localStorage, SETTINGS_STORAGE_KEY, {}, isRecord);
  return {
    cardVariant: getSavedSetting(saved, 'cardVariant'),
    splitCardTreatment: getSavedSetting(saved, 'splitCardTreatment'),
    doubleFacedCardTreatment: getSavedSetting(saved, 'doubleFacedCardTreatment'),
    inkLevel: getSavedSetting(saved, 'inkLevel'),
    artFidelity: getSavedSetting(saved, 'artFidelity'),
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
