/**
 * LevelGatedLink - Site-wide level-gated navigation
 * 
 * Wraps navigation to enforce pathway level requirements.
 * When level gating is enabled and user hasn't reached required level,
 * shows a locked state instead of navigating.
 */

import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { usePathwayProgress } from '@/contexts/PathwayProgressContext';
import { PathwayLevel, ALL_PATHWAYS } from '@/lib/pathwayLevels';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Route to level mapping - defines what level is needed for each route
const ROUTE_LEVELS: Record<string, PathwayLevel> = {
  // Level 1 - Entry points
  '/': 1,
  '/get-a-job': 1,
  '/build-a-business': 1,
  '/plant-seeds': 1,
  '/ghost': 1,
  '/explore': 1,
  '/help-each-other': 1,
  '/help-wanted': 1,
  '/RedCarpet': 1,
  '/business-pathway': 1,
  
  // Level 2 - Requires Level 1 three-pack
  '/economics': 2,
  '/patent-portfolio': 2,
  '/governance': 2,
  '/hexisle': 2,
  '/transparency': 2,
  '/the-300': 2,
  '/star-chamber': 2,
  '/contingency-operators': 2,
  '/sponsor': 2,
  '/deck': 2,
  '/hofund': 2,
  '/asset-library': 2,
  '/guilds': 2,
  '/peer-contracts': 2,
  '/swoop': 2,
  '/treasure-map': 2,
  '/beacons': 2,
  '/fly-on-the-wall': 2,
  '/the-helm': 2,
  '/the-bridge': 2,
  
  // Level 3 - Advanced features
  '/portfolio': 3,
  '/social-admin': 3,
  '/beacon-explainer': 3,
  '/production-queue': 3,
  '/dashboard': 3,
};

// Initiative routes - all Level 2 except specified
const INITIATIVE_LEVEL: PathwayLevel = 2;

export function getRouteLevel(route: string): PathwayLevel {
  // Check exact match first
  if (ROUTE_LEVELS[route]) {
    return ROUTE_LEVELS[route];
  }
  
  // Check if it's an initiative route
  if (route.startsWith('/initiatives/')) {
    return INITIATIVE_LEVEL;
  }
  
  // Check pathway definitions
  const pathway = ALL_PATHWAYS.find(p => p.route === route);
  if (pathway) {
    return pathway.level;
  }
  
  // Default to Level 1 for unknown routes
  return 1;
}

interface LevelGatedLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  showLevelBadge?: boolean;
  lockedClassName?: string;
  onMouseOver?: (e: React.MouseEvent) => void;
  onMouseOut?: (e: React.MouseEvent) => void;
}

export function LevelGatedLink({
  to,
  children,
  className,
  style,
  onClick,
  showLevelBadge = false,
  lockedClassName,
  onMouseOver,
  onMouseOut,
}: LevelGatedLinkProps) {
  const { progress, isLevelGatingEnabled } = usePathwayProgress();
  const navigate = useNavigate();
  
  const requiredLevel = getRouteLevel(to);
  const isLocked = isLevelGatingEnabled() && requiredLevel > progress.currentLevel;
  
  const handleClick = (e: React.MouseEvent) => {
    if (isLocked) {
      e.preventDefault();
      e.stopPropagation();
      toast.info(`🔒 Level ${requiredLevel} Required`, {
        description: `Complete a Level ${requiredLevel - 1} three-pack to unlock this area.`,
        duration: 3000,
      });
      return;
    }
    
    if (onClick) {
      onClick(e);
    }
  };
  
  if (isLocked) {
    return (
      <span
        className={cn(
          "cursor-not-allowed opacity-60",
          lockedClassName || className
        )}
        style={style}
        onClick={handleClick}
        onMouseOver={onMouseOver}
        onMouseOut={onMouseOut}
      >
        {children}
        {showLevelBadge && (
          <Badge variant="outline" className="ml-2 text-xs opacity-50">
            <Lock className="w-3 h-3 mr-1" />
            Lvl {requiredLevel}
          </Badge>
        )}
      </span>
    );
  }
  
  return (
    <Link
      to={to}
      className={className}
      style={style}
      onClick={onClick}
      onMouseOver={onMouseOver}
      onMouseOut={onMouseOut}
    >
      {children}
      {showLevelBadge && (
        <Badge className="ml-2 text-xs bg-green-600">
          Lvl {requiredLevel}
        </Badge>
      )}
    </Link>
  );
}

// Hook for programmatic navigation with level gating
export function useLevelGatedNavigate() {
  const { progress, isLevelGatingEnabled } = usePathwayProgress();
  const navigate = useNavigate();
  
  return (to: string, options?: { replace?: boolean }) => {
    const requiredLevel = getRouteLevel(to);
    const isLocked = isLevelGatingEnabled() && requiredLevel > progress.currentLevel;
    
    if (isLocked) {
      toast.info(`🔒 Level ${requiredLevel} Required`, {
        description: `Complete a Level ${requiredLevel - 1} three-pack to unlock this area.`,
        duration: 3000,
      });
      return false;
    }
    
    navigate(to, options);
    return true;
  };
}

export default LevelGatedLink;
