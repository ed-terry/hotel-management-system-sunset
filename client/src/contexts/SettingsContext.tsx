import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { UPDATE_USER_THEME_MUTATION, GET_USER_PREFERENCES_QUERY } from '../graphql/queries';

interface HotelSettings {
  name: string;
  logo: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  reportSchedule: string;
  emailNotifications: boolean;
}

interface SystemSettings {
  theme: string;
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  autoDarkMode: boolean;
  reduceMotion: boolean;
}

interface SettingsContextType {
  hotelSettings: HotelSettings;
  notificationSettings: NotificationSettings;
  systemSettings: SystemSettings;
  updateHotelSettings: (settings: Partial<HotelSettings>) => void;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => void;
  updateSystemSettings: (settings: Partial<SystemSettings>) => void;
  changeTheme: (theme: string) => void;
  toggleAutoDarkMode: () => void;
  toggleReduceMotion: () => void;
  isLoading: boolean;
}

const defaultHotelSettings: HotelSettings = {
  name: 'Grand Hotel',
  logo: '/logo.png',
  tagline: 'Luxury & Comfort Combined',
  address: '123 Hotel Street, City, State 12345',
  phone: '+1 (555) 123-4567',
  email: 'info@grandhotel.com'
};

const defaultNotificationSettings: NotificationSettings = {
  email: true,
  push: false,
  sms: true,
  reportSchedule: 'weekly',
  emailNotifications: true
};

const defaultSystemSettings: SystemSettings = {
  theme: 'dark',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'MM/dd/yyyy',
  currency: 'USD',
  autoDarkMode: false,
  reduceMotion: false
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [hotelSettings, setHotelSettings] = useState<HotelSettings>(defaultHotelSettings);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotificationSettings);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(defaultSystemSettings);
  const [isLoading, setIsLoading] = useState(true);

  // GraphQL hooks
  const { data: userPreferencesData } = useQuery(GET_USER_PREFERENCES_QUERY, {
    errorPolicy: 'ignore' // Ignore errors if user preferences don't exist yet
  });
  const [updateUserTheme] = useMutation(UPDATE_USER_THEME_MUTATION);

  useEffect(() => {
    // Load settings from localStorage (fallback)
    const savedHotelSettings = localStorage.getItem('hotelSettings');
    const savedNotificationSettings = localStorage.getItem('notificationSettings');
    const savedSystemSettings = localStorage.getItem('systemSettings');

    if (savedHotelSettings) {
      setHotelSettings({ ...defaultHotelSettings, ...JSON.parse(savedHotelSettings) });
    }

    if (savedNotificationSettings) {
      setNotificationSettings({ ...defaultNotificationSettings, ...JSON.parse(savedNotificationSettings) });
    }

    // Priority: Database preferences > localStorage > defaults
    if (userPreferencesData?.userPreferences) {
      const dbPreferences = userPreferencesData.userPreferences;
      const systemPrefs = {
        theme: dbPreferences.theme || 'dark',
        language: dbPreferences.language || 'en',
        timezone: dbPreferences.timezone || 'UTC',
        dateFormat: dbPreferences.dateFormat || 'MM/dd/yyyy',
        currency: dbPreferences.currency || 'USD',
        autoDarkMode: dbPreferences.autoDarkMode || false,
        reduceMotion: dbPreferences.reduceMotion || false,
      };
      setSystemSettings(systemPrefs);
      document.documentElement.setAttribute('data-theme', systemPrefs.theme);
      
      if (dbPreferences.notifications) {
        setNotificationSettings({ 
          ...defaultNotificationSettings, 
          ...dbPreferences.notifications 
        });
      }
    } else if (savedSystemSettings) {
      const parsed = JSON.parse(savedSystemSettings);
      setSystemSettings({ ...defaultSystemSettings, ...parsed });
      document.documentElement.setAttribute('data-theme', parsed.theme || 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    setIsLoading(false);
  }, [userPreferencesData]);

  const updateHotelSettings = (settings: Partial<HotelSettings>) => {
    const newSettings = { ...hotelSettings, ...settings };
    setHotelSettings(newSettings);
    localStorage.setItem('hotelSettings', JSON.stringify(newSettings));
    
    // Update page title if hotel name changed
    if (settings.name) {
      document.title = `${settings.name} - Management System`;
    }
  };

  const updateNotificationSettings = (settings: Partial<NotificationSettings>) => {
    const newSettings = { ...notificationSettings, ...settings };
    setNotificationSettings(newSettings);
    localStorage.setItem('notificationSettings', JSON.stringify(newSettings));
  };

  const updateSystemSettings = (settings: Partial<SystemSettings>) => {
    const newSettings = { ...systemSettings, ...settings };
    setSystemSettings(newSettings);
    localStorage.setItem('systemSettings', JSON.stringify(newSettings));
  };

  const changeTheme = async (theme: string) => {
    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update local state and localStorage
    updateSystemSettings({ theme });
    
    // Save to database
    try {
      await updateUserTheme({
        variables: { theme },
        errorPolicy: 'ignore' // Don't fail if backend is not available
      });
    } catch (error) {
      console.warn('Failed to save theme to database:', error);
      // Theme is still applied locally, so this is not a critical error
    }
  };

  // Auto dark mode functionality
  const toggleAutoDarkMode = () => {
    const newSetting = !systemSettings.autoDarkMode;
    updateSystemSettings({ autoDarkMode: newSetting });
    
    if (newSetting) {
      // Enable auto dark mode - check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const autoTheme = prefersDark ? 'dark' : 'light';
      if (systemSettings.theme !== autoTheme) {
        changeTheme(autoTheme);
      }
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const newTheme = e.matches ? 'dark' : 'light';
        changeTheme(newTheme);
      };
      mediaQuery.addEventListener('change', handleChange);
      
      // Store the listener to remove it later
      (window as any).__autoThemeListener = { mediaQuery, handleChange };
    } else {
      // Disable auto dark mode - remove listener
      const listener = (window as any).__autoThemeListener;
      if (listener) {
        listener.mediaQuery.removeEventListener('change', listener.handleChange);
        delete (window as any).__autoThemeListener;
      }
    }
  };

  // Reduce motion functionality
  const toggleReduceMotion = () => {
    const newSetting = !systemSettings.reduceMotion;
    updateSystemSettings({ reduceMotion: newSetting });
    
    // Apply reduce motion preference
    if (newSetting) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  };

  const value: SettingsContextType = {
    hotelSettings,
    notificationSettings,
    systemSettings,
    updateHotelSettings,
    updateNotificationSettings,
    updateSystemSettings,
    changeTheme,
    toggleAutoDarkMode,
    toggleReduceMotion,
    isLoading
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
