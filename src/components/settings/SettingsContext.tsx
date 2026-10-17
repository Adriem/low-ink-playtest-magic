import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { ArtFidelity, CardStyle, InkLevel } from '../cards/styles';
import type { CardTreatment } from '../../domain/press';
import { loadFromSessionStorage, saveToSessionStorage } from '../../utils/sessionStorage';

/** The value of each setting */
export interface Settings {
  cardVariant: CardStyle;
  splitCardTreatment: CardTreatment;
  doubleFacedCardTreatment: CardTreatment;
  inkLevel: InkLevel;
  artFidelity: ArtFidelity;
}

export type SettingName = keyof Settings;

export interface SettingDefinition<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  /** Value of the default option */
  default: T;
  /** Session storage key the value is saved in */
  storageKey: string;
  /** Shown, but not available yet */
  disabled?: boolean;
  /** How the options are picked: radio buttons (the default), or a slider through them in order */
  control?: 'radio' | 'slider';
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
    storageKey: 'press:cardVariant',
  },
  splitCardTreatment: {
    label: 'Split card treatment',
    options: TREATMENT_OPTIONS,
    default: 'unified',
    storageKey: 'press:splitCardTreatment',
  },
  doubleFacedCardTreatment: {
    label: 'Double-Faced card treatment',
    options: TREATMENT_OPTIONS,
    default: 'separate',
    storageKey: 'press:doubleFacedCardTreatment',
  },
  inkLevel: {
    label: 'Ink level',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'splurge', label: 'Splurge' },
    ],
    default: 'low',
    storageKey: 'press:inkLevel',
  },
  artFidelity: {
    label: 'Art fidelity',
    options: [
      { value: 'none', label: 'No art' },
      { value: 'minimal', label: 'Minimal' },
      { value: 'black-and-white', label: 'Black & white' },
      { value: 'full', label: 'Full' },
    ],
    default: 'minimal',
    storageKey: 'press:artFidelity',
    control: 'slider',
  },
};

export const SETTING_NAMES = Object.keys(SETTINGS_DEFINITIONS) as SettingName[];

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
    for (const name of SETTING_NAMES) {
      saveToSessionStorage(SETTINGS_DEFINITIONS[name].storageKey, settings[name]);
    }
  }, [settings]);

  return <SettingsContext.Provider value={{ settings, setSetting }}>{children}</SettingsContext.Provider>;
};

const loadInitialSettings = (): Settings => {
  return {
    cardVariant: loadSetting('cardVariant'),
    splitCardTreatment: loadSetting('splitCardTreatment'),
    doubleFacedCardTreatment: loadSetting('doubleFacedCardTreatment'),
    inkLevel: loadSetting('inkLevel'),
    artFidelity: loadSetting('artFidelity'),
  };
};

const loadSetting = <Name extends SettingName>(name: Name): Settings[Name] => {
  const definition = SETTINGS_DEFINITIONS[name];
  return loadFromSessionStorage(definition.storageKey, definition.default);
};

export const useSetting = <Name extends SettingName>(name: Name): [Settings[Name], (value: Settings[Name]) => void] => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSetting must be used within a SettingsContextProvider');
  return [ctx.settings[name], (value) => ctx.setSetting(name, value)];
};
