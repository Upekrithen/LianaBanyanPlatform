import { useState, useEffect } from 'react';

const STORAGE_KEY = 'lb-dark-mode';

function readInitial(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark';
  } catch {
    return false;
  }
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch { /* storage unavailable */ }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
