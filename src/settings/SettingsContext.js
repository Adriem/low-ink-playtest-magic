import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadFromSessionStorage, saveToSessionStorage } from '../utils/sessionStorage';

const TREATMENT_OPTIONS = [
  { value: 'unified', label: 'Unified' },
  { value: 'separate', label: 'Separate' },
];

/**
 * @typedef {object} SettingDefinition
 * @prop {string} label
 * @prop {{ value: string, label: string }[]} options
 * @prop {string} default - Value of the default option
 * @prop {string} storageKey - Session storage key the value is saved in
 * @prop {boolean} [disabled] - Shown, but not available yet
 */

/** @type {Object<string, SettingDefinition>} */
export const SETTINGS_DEFINITIONS = {
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
    disabled: true,
  },
};

const loadInitialSettings = () => {
  const initial = {};
  for (const [name, def] of Object.entries(SETTINGS_DEFINITIONS)) {
    initial[name] = loadFromSessionStorage(def.storageKey, def.default);
  }
  return initial;
};

const SettingsContext = createContext(null);

export const SettingsContextProvider = ({ children }) => {
  const [settings, setSettings] = useState(loadInitialSettings);

  const setSetting = useCallback((name, value) => {
    setSettings(prev => ({ ...prev, [name]: value }));
  }, []);

  useEffect(() => {
    for (const [name, def] of Object.entries(SETTINGS_DEFINITIONS)) {
      saveToSessionStorage(def.storageKey, settings[name]);
    }
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, setSetting }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSetting = (name) => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSetting must be used within a SettingsContextProvider');
  return [ctx.settings[name], (value) => ctx.setSetting(name, value)];
};
