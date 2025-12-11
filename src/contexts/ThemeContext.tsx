import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize theme from localStorage immediately
  const savedTheme = (typeof localStorage !== 'undefined' ? localStorage.getItem('theme') : null) as Theme | null;
  const initialTheme: Theme = savedTheme || 'light';
  
  // Calculate initial effective theme
  const getInitialEffectiveTheme = (): 'light' | 'dark' => {
    if (initialTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initialTheme;
  };
  
  const initialEffectiveTheme = getInitialEffectiveTheme();
  
  // Apply initial theme class immediately
  if (typeof document !== 'undefined') {
    if (initialEffectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  const [theme, setThemeState] = useState<Theme>(initialTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(initialEffectiveTheme);

  useEffect(() => {
    // Load saved theme from localStorage (if not already done in initialization)
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme && savedTheme !== theme) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const updateEffectiveTheme = () => {
      let effective: 'light' | 'dark';
      
      if (theme === 'system') {
        effective = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        effective = theme;
      }

      setEffectiveTheme(effective);
      
      if (effective === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateEffectiveTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateEffectiveTheme);

    return () => mediaQuery.removeEventListener('change', updateEffectiveTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
