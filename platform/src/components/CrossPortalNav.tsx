import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { detectPortal, type PortalType } from '@/utils/portalDetector';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { buildAuthRelayUrl } from '@/utils/crossDomainAuth';
import { ShoppingBag, Hammer, Briefcase, Globe, Heart, Rocket, Hexagon, Anchor, Menu, X } from 'lucide-react';

const PORTALS: { key: PortalType; label: string; icon: typeof ShoppingBag; domain: string }[] = [
  { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, domain: 'lianabanyan.com' },
  { key: 'dss', label: 'The 2nd Second', icon: Hammer, domain: 'the2ndsecond.com' },
  { key: 'hexisle', label: 'HexIsle', icon: Hexagon, domain: 'hexisle.com' },
  { key: 'business', label: 'Business', icon: Briefcase, domain: 'lianabanyan.biz' },
  { key: 'network', label: 'Network', icon: Globe, domain: 'lianabanyan.net' },
  { key: 'nonprofit', label: 'Non-Profit', icon: Heart, domain: 'lianabanyan.org' },
];

export function CrossPortalNav() {
  const { user, session } = useAuth();
  const current = detectPortal();
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [drawerOpen]);

  const portalHref = (domain: string, path = '/') => {
    const raw = `https://${domain}${path}`;
    return session ? buildAuthRelayUrl(raw, session) : raw;
  };

  const currentPortal = PORTALS.find(p => p.key === current);
  const CurrentIcon = currentPortal?.icon ?? ShoppingBag;

  if (isMobile) {
    return (
      <div ref={drawerRef} className="relative z-[200]">
        <nav className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b text-xs">
          <a
            href="#"
            onClick={e => e.preventDefault()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium"
          >
            <CurrentIcon className="w-3.5 h-3.5" />
            {currentPortal?.label ?? 'Portal'}
          </a>
          <button
            onClick={() => setDrawerOpen(o => !o)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            aria-label={drawerOpen ? 'Close portal menu' : 'Open portal menu'}
          >
            {drawerOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {drawerOpen && (
          <div
            className="absolute top-full left-0 right-0 bg-card border-b shadow-lg"
            style={{ animation: 'cpnSlideDown 150ms ease-out' }}
          >
            <div className="py-2 px-3 space-y-0.5">
              {PORTALS.map(p => {
                const isCurrent = p.key === current;
                const Icon = p.icon;
                return (
                  <a
                    key={p.key}
                    href={isCurrent ? '#' : portalHref(p.domain)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isCurrent
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={isCurrent ? (e) => { e.preventDefault(); setDrawerOpen(false); } : () => setDrawerOpen(false)}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm">{p.label}</span>
                    {isCurrent && <span className="ml-auto text-[10px] text-primary/60">current</span>}
                  </a>
                );
              })}
              {user && (
                <>
                  <div className="border-t border-border my-1.5" />
                  <a
                    href={portalHref('lianabanyan.com', '/captain')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Anchor className="w-4 h-4 shrink-0" />
                    <span className="text-sm">Captain</span>
                  </a>
                  <a
                    href={portalHref('lianabanyan.com', '/cue-cards/campaigns')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-50/10 font-medium"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <Rocket className="w-4 h-4 shrink-0" />
                    <span className="text-sm">Start a Project</span>
                  </a>
                </>
              )}
            </div>
          </div>
        )}

        <style>{`
          @keyframes cpnSlideDown {
            from { opacity: 0; transform: translateY(-8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 px-4 py-1.5 bg-muted/50 border-b text-xs overflow-x-auto">
      {PORTALS.map(p => {
        const isCurrent = p.key === current;
        const Icon = p.icon;
        return (
          <a
            key={p.key}
            href={isCurrent ? '#' : portalHref(p.domain)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              isCurrent
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={isCurrent ? (e) => e.preventDefault() : undefined}
            title={p.label}
          >
            <Icon className="w-3 h-3" />
            {p.label}
          </a>
        );
      })}
      {user && (
        <>
          <span className="mx-1 text-muted-foreground/30">|</span>
          <a
            href={portalHref('lianabanyan.com', '/captain')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
          >
            <Anchor className="w-3 h-3" />
            Captain
          </a>
          <a
            href={portalHref('lianabanyan.com', '/cue-cards/campaigns')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-50/10 font-medium"
          >
            <Rocket className="w-3 h-3" />
            Start a Project
          </a>
        </>
      )}
    </nav>
  );
}
