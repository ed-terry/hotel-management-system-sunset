import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { CheckIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface Theme {
  id: string;
  name: string;
  description: string;
  preview: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  category: 'custom' | 'daisyui';
}

const themes: Theme[] = [
  {
    id: 'dark',
    name: 'Dark Corporate',
    description: 'Professional dark theme for business environments',
    preview: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#6366f1',
      background: '#111827'
    },
    category: 'custom'
  },
  {
    id: 'light',
    name: 'Light Corporate',
    description: 'Clean professional light theme',
    preview: {
      primary: '#1f2937',
      secondary: '#374151',
      accent: '#6366f1',
      background: '#ffffff'
    },
    category: 'custom'
  }
];

const ThemePicker: React.FC = () => {
  const { systemSettings, changeTheme, toggleAutoDarkMode, toggleReduceMotion } = useSettings();
  const currentTheme = systemSettings.theme;
  const [pendingTheme, setPendingTheme] = useState<string>(currentTheme);
  const [hasChanges, setHasChanges] = useState(false);

  // Update pending theme when current theme changes externally
  React.useEffect(() => {
    setPendingTheme(currentTheme);
    setHasChanges(false);
    // Ensure the theme is applied
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const handleThemePreview = (themeId: string) => {
    setPendingTheme(themeId);
    setHasChanges(themeId !== currentTheme);
    // Apply theme immediately for preview
    document.documentElement.setAttribute('data-theme', themeId);
  };

  const handleSaveChanges = () => {
    if (hasChanges && pendingTheme !== currentTheme) {
      changeTheme(pendingTheme);
      setHasChanges(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingTheme(currentTheme);
    setHasChanges(false);
    // Revert to current theme
    document.documentElement.setAttribute('data-theme', currentTheme);
  };

  const ThemeCard = ({ theme }: { theme: Theme }) => (
    <div
      key={theme.id}
      onClick={() => handleThemePreview(theme.id)}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:scale-105 ${
        pendingTheme === theme.id
          ? 'border-primary shadow-lg shadow-primary/20'
          : 'border-base-300 hover:border-base-content/50'
      }`}
      style={{ backgroundColor: theme.preview.background }}
    >
      {/* Theme Preview */}
      <div className="relative mb-4 overflow-hidden rounded-lg">
        <div 
          className="h-20 w-full rounded-lg flex items-center justify-center relative"
          style={{ backgroundColor: theme.preview.background }}
        >
          {/* Color palette preview */}
          <div className="flex space-x-1">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: theme.preview.primary }}
            ></div>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: theme.preview.secondary }}
            ></div>
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: theme.preview.accent }}
            ></div>
          </div>
          
          {/* Mini UI preview */}
          <div className="absolute inset-2 border rounded opacity-50"
               style={{ borderColor: theme.preview.primary }}>
            <div className="w-full h-2 rounded-t"
                 style={{ backgroundColor: theme.preview.primary }}></div>
            <div className="p-1 space-y-1">
              <div className="w-3/4 h-1 rounded"
                   style={{ backgroundColor: theme.preview.secondary }}></div>
              <div className="w-1/2 h-1 rounded"
                   style={{ backgroundColor: theme.preview.accent }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Theme Info */}
      <div className="text-base-content">
        <h4 className="font-semibold text-sm mb-1 flex items-center justify-between">
          {theme.name}
          {currentTheme === theme.id && !hasChanges && (
            <CheckIcon className="h-4 w-4 text-success" />
          )}
          {pendingTheme === theme.id && hasChanges && (
            <CheckIcon className="h-4 w-4 text-primary" />
          )}
          {currentTheme === theme.id && hasChanges && pendingTheme !== theme.id && (
            <CheckIcon className="h-4 w-4 text-base-content/50" />
          )}
        </h4>
        <p className="text-xs text-base-content/70">
          {theme.description}
        </p>
      </div>

      {/* Category badge */}
      <div className="absolute top-2 right-2">
        <span className={`px-2 py-1 text-xs rounded-full ${
          theme.category === 'custom' 
            ? 'bg-primary/20 text-primary' 
            : 'bg-secondary/20 text-secondary'
        }`}>
          {theme.category === 'custom' ? 'Custom' : 'DaisyUI'}
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Current Theme Display */}
      <div className="bg-base-200 rounded-lg p-6 border border-base-300">
        <h3 className="text-lg font-semibold text-base-content mb-2 flex items-center justify-between">
          Current Theme
          {hasChanges && (
            <span className="text-sm text-warning flex items-center">
              <span className="w-2 h-2 bg-warning rounded-full mr-2"></span>
              Unsaved changes
            </span>
          )}
        </h3>
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            {(() => {
              const displayTheme = hasChanges ? pendingTheme : currentTheme;
              const current = themes.find(t => t.id === displayTheme);
              return current ? (
                <>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-base-content/20" 
                    style={{ backgroundColor: current.preview.primary }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-base-content/20" 
                    style={{ backgroundColor: current.preview.secondary }}
                  ></div>
                  <div 
                    className="w-6 h-6 rounded-full border-2 border-base-content/20" 
                    style={{ backgroundColor: current.preview.accent }}
                  ></div>
                </>
              ) : (
                <div className="text-base-content/70">Theme not found</div>
              );
            })()}
          </div>
          <div>
            <p className="text-base-content font-medium">
              {themes.find(t => t.id === (hasChanges ? pendingTheme : currentTheme))?.name || 'Unknown Theme'}
              {hasChanges && <span className="text-warning ml-2">(Preview)</span>}
            </p>
            <p className="text-base-content/70 text-sm">
              {themes.find(t => t.id === (hasChanges ? pendingTheme : currentTheme))?.description || 'No description available'}
            </p>
          </div>
        </div>
      </div>

      {/* Corporate Themes */}
      <div>
        <h3 className="text-lg font-semibold text-base-content mb-4">Corporate Themes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {themes.map(theme => (
            <ThemeCard key={theme.id} theme={theme} />
          ))}
        </div>
      </div>

      {/* Theme Options */}
      <div className="bg-base-200 rounded-lg p-6 border border-base-300">
        <h3 className="text-lg font-semibold text-base-content mb-4">Theme Options</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content font-medium">Auto Dark Mode</p>
              <p className="text-base-content/70 text-sm">Automatically switch to dark theme at sunset</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={systemSettings.autoDarkMode}
                onChange={toggleAutoDarkMode}
              />
              <div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base-content font-medium">Reduce Motion</p>
              <p className="text-base-content/70 text-sm">Minimize animations and transitions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={systemSettings.reduceMotion}
                onChange={toggleReduceMotion}
              />
              <div className="w-11 h-6 bg-base-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Save Changes Section */}
      {hasChanges && (
        <div className="bg-base-200 rounded-lg p-6 border border-warning/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-1">Unsaved Changes</h3>
              <p className="text-base-content/70 text-sm">
                You have selected "{themes.find(t => t.id === pendingTheme)?.name}" theme. 
                Save to apply changes or discard to keep current theme.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-base-content/70 hover:text-base-content border border-base-300 hover:border-base-content/50 rounded-lg transition-colors"
              >
                Discard
              </button>
              <button
                onClick={handleSaveChanges}
                className="px-6 py-2 bg-primary hover:bg-primary/80 text-primary-content rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <CloudArrowUpIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemePicker;
