import { detectPortal } from '@/utils/portalDetector';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingBag, Hammer, Briefcase, Globe, Heart, Rocket, Hexagon, Anchor, Factory } from 'lucide-react';

const PORTALS = [
  { key: 'marketplace', label: 'Marketplace', icon: ShoppingBag, domain: 'lianabanyan.com' },
  { key: 'dss', label: 'The Forge', icon: Hammer, domain: 'the2ndsecond.com' },
  { key: 'hexisle', label: 'HexIsle', icon: Hexagon, domain: 'hexisle.com' },
  { key: 'business', label: 'Business', icon: Briefcase, domain: 'lianabanyan.biz' },
  { key: 'network', label: 'Network', icon: Globe, domain: 'lianabanyan.net' },
  { key: 'nonprofit', label: 'Non-Profit', icon: Heart, domain: 'lianabanyan.org' },
] as const;

export function CrossPortalNav() {
  const { user } = useAuth();
  const current = detectPortal();

  if (!user) return null;

  return (
    <nav className="flex items-center gap-1 px-4 py-1.5 bg-muted/50 border-b text-xs overflow-x-auto">
      {PORTALS.map(p => {
        const isCurrent = p.key === current;
        const Icon = p.icon;
        return (
          <a
            key={p.key}
            href={`https://${p.domain}`}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
              isCurrent
                ? 'bg-primary text-primary-foreground font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
            {...(isCurrent ? {} : { target: '_self' })}
          >
            <Icon className="w-3 h-3" />
            {p.label}
          </a>
        );
      })}
      <span className="mx-1 text-muted-foreground/30">|</span>
      <a
        href="https://the2ndsecond.com"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-medium"
      >
        <Factory className="w-3 h-3" />
        2nd Second
      </a>
      <a
        href="https://lianabanyan.com/captain"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 font-medium"
      >
        <Anchor className="w-3 h-3" />
        Captain
      </a>
      <a
        href="https://lianabanyan.com/cue-cards/campaigns"
        className="flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap transition-colors text-amber-600 hover:bg-amber-50 font-medium"
      >
        <Rocket className="w-3 h-3" />
        Start a Project
      </a>
    </nav>
  );
}
