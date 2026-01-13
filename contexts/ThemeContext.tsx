
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
import { ColorThemeName, themes, DesignStyle } from '../utils/themes';

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
    const savedMode = localStorage.getItem('themeMode') as Mode;
    return savedMode || 'light';
  });

  const [colorTheme, setColorThemeState] = useState<ColorThemeName>(() => {
    const savedColorTheme = localStorage.getItem('colorTheme') as ColorThemeName;
    return savedColorTheme || 'nagad';
  });

  const designStyle = useMemo(() => themes[colorTheme].designStyle, [colorTheme]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    const root = document.documentElement;
    if (mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('colorTheme', colorTheme);
    const root = document.documentElement;
    const themeProperties = themes[colorTheme];
    root.style.setProperty('--color-primary-hsl', themeProperties.primary);
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
