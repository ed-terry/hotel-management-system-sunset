import React from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useSettings } from '../contexts/SettingsContext';

const ThemeToggle: React.FC = () => {
  const { systemSettings, changeTheme } = useSettings();
  const isDark = systemSettings.theme === 'dark' || 
                 systemSettings.theme === 'ocean' || 
                 systemSettings.theme === 'sunset' ||
                 systemSettings.theme === 'forest' ||
                 systemSettings.theme === 'royal' ||
                 systemSettings.theme === 'midnight' ||
                 systemSettings.theme === 'rose' ||
                 systemSettings.theme === 'dracula' ||
                 systemSettings.theme === 'cyberpunk';

  const toggleTheme = () => {
    changeTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative p-3 text-base-content/70 hover:text-base-content transition-all duration-300 rounded-xl hover:bg-gradient-to-br hover:from-primary/20 hover:to-secondary/20 group overflow-hidden border border-transparent hover:border-primary/30 hover:shadow-lg hover:scale-105"
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
        {isDark ? (
          <SunIcon className="h-5 w-5 transition-all duration-300 group-hover:text-warning group-hover:drop-shadow-lg" />
        ) : (
          <MoonIcon className="h-5 w-5 transition-all duration-300 group-hover:text-info group-hover:drop-shadow-lg" />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </button>
  );
};

export default ThemeToggle;
