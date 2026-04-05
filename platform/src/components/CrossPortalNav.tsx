import { useLocation } from 'react-router-dom';
import { detectPortal, type PortalType } from '@/utils/portalDetector';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { buildAuthRelayUrl } from '@/utils/crossDomainAuth';
import { ShoppingBag, Hammer, Briefcase, Globe, Heart, Rocket, Hexagon, Anchor } from 'lucide-react';

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
  const compactMode = isMobile && pathname === '/';

  const portalHref = (domain: string, path = '/') => {
    const raw = `https://${domain}${path}`;
    return session ? buildAuthRelayUrl(raw, session) : raw;
  };

  return (
    <nav className={`flex items-center ${compactMode ? 'justify-center gap-2 px-2 py-1' : 'gap-1 px-4 py-1.5'} bg-muted/50 border-b text-xs overflow-x-auto`}>
      {PORTALS.map(p => {
        const isCurrent = p.key === current;
        const Icon = p.icon;
        return (
          <a
            key={p.key}
            href={isCurrent ? '#' : portalHref(p.domain)}
            className={`flex items-center ${compactMode ? 'p-1.5' : 'gap-1.5 px-3 py-1'} rounded-full whitespace-nowrap transition-colors ${
              isCurrent
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            onClick={isCurrent ? (e) => e.preventDefault() : undefined}
            title={p.label}
          >
            <Icon className={compactMode ? 'w-4 h-4' : 'w-3 h-3'} />
            {!compactMode && p.label}
          </a>
        );
      })}
      {user && !compactMode && (
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
