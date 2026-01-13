
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { ColorThemeName, themes, DesignStyle } from '../utils/themes';
import { safeStorage } from '../utils/storage';

type Mode = 'light' | 'dark';

interface ThemeContextType {
  mode: Mode;
  toggleMode: () => void;
  colorTheme: ColorThemeName;
  setColorTheme: (themeName: ColorThemeName) => void;
  designStyle: DesignStyle;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(() => {
    try {
      const savedMode = safeStorage.getItem('themeMode') as Mode;
      return savedMode || 'light';
    } catch (error) {
      console.error("Failed to load theme mode from safeStorage:", error);
      return 'light';
    }
  });

  const [colorTheme, setColorThemeState] = useState<ColorThemeName>(() => {
    try {
      const savedColorTheme = safeStorage.getItem('colorTheme') as ColorThemeName;
      return savedColorTheme || 'nagad';
    } catch (error) {
      console.error("Failed to load color theme from safeStorage:", error);
      return 'nagad';
    }
  });

  const designStyle = useMemo(() => themes[colorTheme]?.designStyle || themes['nagad'].designStyle, [colorTheme]);

  useEffect(() => {
    try {
      safeStorage.setItem('themeMode', mode);
      const root = document.documentElement;
      if (mode === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } catch (error) {
      console.error("Failed to save theme mode to safeStorage:", error);
    }
  }, [mode]);

  useEffect(() => {
    try {
      safeStorage.setItem('colorTheme', colorTheme);
      const root = document.documentElement;
      const themeProperties = themes[colorTheme] || themes['nagad'];
      root.style.setProperty('--color-primary-hsl', themeProperties.primary);
    } catch (error) {
      console.error("Failed to save color theme to safeStorage:", error);
    }
  }, [colorTheme]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setColorTheme = (themeName: ColorThemeName) => {
    setColorThemeState(themeName);
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleMode, colorTheme, setColorTheme, designStyle }}>
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
