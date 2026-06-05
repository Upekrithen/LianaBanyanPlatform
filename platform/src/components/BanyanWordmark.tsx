import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

/**
 * Founder canon (BP074-W3):
 * "Liana" = WHITE on dark/moon background, BLACK on light/sun background
 * "Banyan" = GREEN on BOTH backgrounds (constant)
 * Moon icon = dark mode active; Sun icon = light mode active
 * Clicking the icon toggles modes, persists to localStorage
 */
export function BanyanWordmark() {
  const { isDark, toggle } = useDarkMode();

  return (
    <div className="flex items-center gap-1.5 shrink-0 select-none">
      <span
        className="font-bold text-base leading-none tracking-tight"
        aria-label="Liana Banyan"
      >
        <span
          className="transition-colors duration-200"
          style={{ color: isDark ? '#ffffff' : '#000000' }}
        >
          Liana
        </span>
        <span
          className="transition-colors duration-200"
          style={{ color: 'var(--banyan-green)' }}
        >
          Banyan
        </span>
      </span>
      <button
        type="button"
        onClick={toggle}
        aria-label={isDark ? 'Switch to light mode (sun)' : 'Switch to dark mode (moon)'}
        className="p-1.5 rounded-md hover:bg-muted transition-colors duration-200 text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isDark ? (
          <Sun className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Moon className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
