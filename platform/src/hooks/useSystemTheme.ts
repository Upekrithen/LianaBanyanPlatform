import { useEffect, useState } from 'react';

export type SystemTheme = 'dark' | 'light';

/**
 * Detects the OS-level color scheme preference via prefers-color-scheme.
 * Updates reactively when the user switches system theme.
 * Used by the root layout to apply or remove the `dark` class on <html>.
 */
export function useSystemTheme(): SystemTheme {
  const getSystemTheme = (): SystemTheme =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

  const [systemTheme, setSystemTheme] = useState<SystemTheme>(getSystemTheme);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return systemTheme;
}

/**
 * Applies or removes the `dark` class on <html> based on system preference.
 * Call once from the root App component or a layout wrapper.
 * If the user has an explicit persisted theme override (localStorage key
 * `lb-color-mode`), that takes precedence over system detection.
 */
export function useApplySystemTheme(): { mode: SystemTheme; override: (m: SystemTheme | 'system') => void } {
  const systemTheme = useSystemTheme();
  const [userOverride, setUserOverride] = useState<SystemTheme | 'system'>(() => {
    const stored = localStorage.getItem('lb-color-mode') as SystemTheme | 'system' | null;
    return stored ?? 'system';
  });

  const effectiveTheme: SystemTheme = userOverride === 'system' ? systemTheme : userOverride;

  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [effectiveTheme]);

  const override = (m: SystemTheme | 'system') => {
    setUserOverride(m);
    if (m === 'system') {
      localStorage.removeItem('lb-color-mode');
    } else {
      localStorage.setItem('lb-color-mode', m);
    }
  };

  return { mode: effectiveTheme, override };
}
