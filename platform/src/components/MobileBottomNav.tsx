import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, ShoppingBag, Users, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',       href: '/',           icon: Home },
  { label: 'Initiatives',href: '/initiatives', icon: LayoutGrid },
  { label: 'Marketplace',href: '/frontier/marketplace', icon: ShoppingBag },
  { label: 'Community',  href: '/governance',  icon: Users },
  { label: 'Learn',      href: '/how-it-all-works', icon: BookOpen },
];

/**
 * Mobile bottom navigation bar. Renders only on screens < md (768px).
 * Provides 44px+ touch targets and active-state highlighting.
 * Mount once in the root layout; hidden on md+ via CSS.
 */
export function MobileBottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background border-t border-border safe-area-pb"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                to={href}
                className={cn(
                  'flex flex-col items-center justify-center h-full gap-0.5 text-[10px] font-medium',
                  'touch-manipulation transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : '')} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
