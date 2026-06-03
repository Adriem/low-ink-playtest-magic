import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SETTINGS_DEFINITIONS = {
  cardVariant: { default: 'original', storageKey: 'press:cardVariant' },
  splitCardTreatment: { default: 'unified', storageKey: 'press:splitCardTreatment' },
  doubleFacedCardTreatment: { default: 'separate', storageKey: 'press:doubleFacedCardTreatment' },
  inkLevel: { default: 'low', storageKey: 'press:inkLevel' },
};

const loadPersisted = (key, fallback) => {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const loadInitialSettings = () => {
  const initial = {};
  for (const [name, def] of Object.entries(SETTINGS_DEFINITIONS)) {
    initial[name] = loadPersisted(def.storageKey, def.default);
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
      sessionStorage.setItem(def.storageKey, JSON.stringify(settings[name]));
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
