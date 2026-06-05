import { useState, useEffect, useCallback } from 'react';

export type HexTheme = 'dark' | 'light';

const STORAGE_KEY = 'lb-theme';

function applyHexTheme(theme: HexTheme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-hex-mode', 'light');
  } else {
    document.documentElement.removeAttribute('data-hex-mode');
  }
}

/** Returns the stored theme without side effects (safe to call in render) */
function getStoredTheme(): HexTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function useHexTheme() {
  const [hexTheme, setHexThemeState] = useState<HexTheme>(getStoredTheme);

  // Apply on mount and whenever hexTheme changes
  useEffect(() => {
    applyHexTheme(hexTheme);
  }, [hexTheme]);

  const toggleHexTheme = useCallback(() => {
    setHexThemeState(prev => {
      const next: HexTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch { /* ignore */ }
      applyHexTheme(next);
      return next;
    });
  }, []);

  return { hexTheme, toggleHexTheme };
}
