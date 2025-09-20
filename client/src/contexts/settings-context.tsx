import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { settingsSchema, type Settings } from '@shared/schema';

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_KEY = 'voice-translator-settings';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge stored settings with new defaults to ensure new fields get their defaults
        const defaults = settingsSchema.parse({});
        const mergedSettings = { 
          ...defaults, 
          ...parsed,
          // Force new default values for these specific settings
          autoplay: true,
          autoDetectLanguage: true
        };
        return settingsSchema.parse(mergedSettings);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return settingsSchema.parse({});
  });

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: Settings) => {
    console.log('=== SETTINGS UPDATE ===');
    console.log('Current settings:', settings);
    console.log('New settings:', newSettings);
    console.log('autoDetectLanguage changed from', settings.autoDetectLanguage, 'to', newSettings.autoDetectLanguage);
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}