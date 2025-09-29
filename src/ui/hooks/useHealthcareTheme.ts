/**
 * Healthcare Theme Hook with RTL and Glass Morphism support
 */

import { useState, useEffect, useCallback } from 'react';
import { UIConfig } from '@/types/ui';

export interface HealthcareTheme {
  theme: 'light' | 'dark' | 'auto';
  rtl: boolean;
  glassMorphism: {
    enabled: boolean;
    opacity: number;
    blur: number;
  };
  performance: {
    targetFps: number;
    lazyLoading: boolean;
    virtualScrolling: boolean;
  };
}

export interface UseHealthcareThemeReturn {
  theme: HealthcareTheme;
  isDark: boolean;
  updateTheme: (updates: Partial<HealthcareTheme>) => void;
  toggleDarkMode: () => void;
  toggleRTL: () => void;
  toggleGlassMorphism: () => void;
  resetTheme: () => void;
}

const defaultTheme: HealthcareTheme = {
  theme: 'light',
  rtl: false,
  glassMorphism: {
    enabled: true,
    opacity: 0.1,
    blur: 20,
  },
  performance: {
    targetFps: 60,
    lazyLoading: true,
    virtualScrolling: true,
  },
};

const THEME_STORAGE_KEY = 'brainsait-healthcare-theme';

export const useHealthcareTheme = (initialConfig?: Partial<UIConfig>): UseHealthcareThemeReturn => {
  const [theme, setTheme] = useState<HealthcareTheme>(() => {
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Partial<HealthcareThemeConfig>;
          return { ...defaultTheme, ...parsed };
        }
      } catch (error) {
        // Use a proper logger instead of console for production
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load theme from localStorage:', error);
        }
      }
    }

    // Use initial config or default
    return {
      ...defaultTheme,
      ...(initialConfig && {
        theme: initialConfig.theme ?? defaultTheme.theme,
        glassMorphism: {
          ...defaultTheme.glassMorphism,
          ...initialConfig.glassMorphism,
        },
        performance: {
          ...defaultTheme.performance,
          ...initialConfig.performance,
        },
      }),
    };
  });

  const [isDark, setIsDark] = useState(false);

  // Auto-detect system theme preference
  useEffect(() => {
    if (theme.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
      };

      setIsDark(mediaQuery.matches);
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setIsDark(theme.theme === 'dark');
      return undefined;
    }
  }, [theme.theme]);

  // Persist theme to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
      } catch (error) {
        console.warn('Failed to save theme to localStorage:', error);
      }
    }
  }, [theme]);

  // Apply CSS custom properties for theme
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;

      // Theme colors
      if (isDark) {
        root.style.setProperty('--bg-primary', 'rgba(17, 24, 39, 0.95)');
        root.style.setProperty('--bg-secondary', 'rgba(31, 41, 55, 0.9)');
        root.style.setProperty('--text-primary', 'rgba(255, 255, 255, 0.95)');
        root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
      } else {
        root.style.setProperty('--bg-primary', 'rgba(255, 255, 255, 0.95)');
        root.style.setProperty('--bg-secondary', 'rgba(249, 250, 251, 0.9)');
        root.style.setProperty('--text-primary', 'rgba(17, 24, 39, 0.95)');
        root.style.setProperty('--text-secondary', 'rgba(107, 114, 128, 0.9)');
        root.style.setProperty('--border-color', 'rgba(229, 231, 235, 0.8)');
      }

      // RTL direction
      root.style.setProperty('--direction', theme.rtl ? 'rtl' : 'ltr');
      root.setAttribute('dir', theme.rtl ? 'rtl' : 'ltr');

      // Glass morphism
      root.style.setProperty('--glass-opacity', theme.glassMorphism.opacity.toString());
      root.style.setProperty('--glass-blur', `${theme.glassMorphism.blur}px`);
      root.style.setProperty('--glass-enabled', theme.glassMorphism.enabled ? '1' : '0');

      // Performance
      root.style.setProperty('--target-fps', theme.performance.targetFps.toString());
    }
  }, [isDark, theme]);

  const updateTheme = useCallback((updates: Partial<HealthcareTheme>) => {
    setTheme(prev => ({
      ...prev,
      ...updates,
      glassMorphism: {
        ...prev.glassMorphism,
        ...updates.glassMorphism,
      },
      performance: {
        ...prev.performance,
        ...updates.performance,
      },
    }));
  }, []);

  const toggleDarkMode = useCallback(() => {
    setTheme(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const toggleRTL = useCallback(() => {
    setTheme(prev => ({
      ...prev,
      rtl: !prev.rtl,
    }));
  }, []);

  const toggleGlassMorphism = useCallback(() => {
    setTheme(prev => ({
      ...prev,
      glassMorphism: {
        ...prev.glassMorphism,
        enabled: !prev.glassMorphism.enabled,
      },
    }));
  }, []);

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
  }, []);

  return {
    theme,
    isDark,
    updateTheme,
    toggleDarkMode,
    toggleRTL,
    toggleGlassMorphism,
    resetTheme,
  };
};
