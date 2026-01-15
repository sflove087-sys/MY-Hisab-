
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { ColorThemeName, themes, DesignStyle } from '../utils/themes';
import { safeStorage } from '../utils/storage';

type Mode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
  colorTheme: ColorThemeName;
  setColorTheme: (themeName: ColorThemeName) => void;
  designStyle: DesignStyle;
  resolvedMode: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<Mode>(() => {
    try {
      const savedMode = safeStorage.getItem('themeMode') as Mode;
      return savedMode || 'system';
    } catch (error) {
      return 'system';
    }
  });

  const [colorTheme, setColorThemeState] = useState<ColorThemeName>(() => {
    try {
      const savedColorTheme = safeStorage.getItem('colorTheme') as ColorThemeName;
      return savedColorTheme || 'nagad';
    } catch (error) {
      return 'nagad';
    }
  });

  const designStyle = useMemo(() => themes[colorTheme]?.designStyle || themes['nagad'].designStyle, [colorTheme]);

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');

  const updateResolvedMode = (currentMode: Mode) => {
    const root = document.documentElement;
    let target: 'light' | 'dark' = 'light';

    if (currentMode === 'system') {
      const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      target = systemIsDark ? 'dark' : 'light';
    } else {
      target = currentMode;
    }

    if (target === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setResolvedMode(target);
  };

  useEffect(() => {
    updateResolvedMode(mode);
    safeStorage.setItem('themeMode', mode);

    if (mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => updateResolvedMode('system');
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [mode]);

  useEffect(() => {
    try {
      safeStorage.setItem('colorTheme', colorTheme);
      const root = document.documentElement;
      const themeProperties = themes[colorTheme] || themes['nagad'];
      root.style.setProperty('--color-primary-hsl', themeProperties.primary);
    } catch (error) {
      console.error("Failed to save color theme:", error);
    }
  }, [colorTheme]);

  const setMode = (newMode: Mode) => {
    setModeState(newMode);
  };

  const setColorTheme = (themeName: ColorThemeName) => {
    setColorThemeState(themeName);
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorTheme, setColorTheme, designStyle, resolvedMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
