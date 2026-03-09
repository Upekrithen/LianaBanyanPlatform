/**
 * DISCOVERY SLOT COMPONENT
 * ========================
 * Wraps content in a discovery-aware container.
 * If undiscovered: shows a chalk-line placeholder box with optional hint.
 * If discovered: shows the actual content.
 * 
 * Used for progressive disclosure on Dashboard and other pages.
 */

import { ReactNode, useState } from 'react';
import { useDiscovery, DiscoverySlug, DASHBOARD_DISCOVERY_MAP } from '@/hooks/useDiscovery';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface DiscoverySlotProps {
  /** Unique slug for this discoverable item */
  slug: DiscoverySlug | string;
  /** The actual content to show when discovered */
  children: ReactNode;
  /** Optional hint text shown on the placeholder */
  hint?: string;
  /** Optional title for the placeholder */
  title?: string;
  /** Optional icon component */
  icon?: ReactNode;
  /** Optional route that discovers this item when visited */
  discoveryRoute?: string;
  /** Optional: force show even if not discovered (for essentials) */
  alwaysShow?: boolean;
  /** Optional: custom placeholder className */
  placeholderClassName?: string;
  /** Optional: hide if not discovered (instead of showing placeholder) */
  hideIfUndiscovered?: boolean;
}

export function DiscoverySlot({
  slug,
  children,
  hint = "Discover this feature by exploring the platform",
  title = "Undiscovered",
  icon,
  discoveryRoute,
  alwaysShow = false,
  placeholderClassName,
  hideIfUndiscovered = false,
}: DiscoverySlotProps) {
  const { isDiscovered, discoverCard, isLoading } = useDiscovery();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);

  const discovered = alwaysShow || isDiscovered(slug);

  // Loading state - show skeleton
  if (isLoading) {
    return (
      <Card className="animate-pulse bg-muted/30">
        <CardHeader>
          <div className="h-5 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded mt-2" />
        </CardHeader>
      </Card>
    );
  }

  // Discovered - show actual content
  if (discovered) {
    return <>{children}</>;
  }

  // Hide if not discovered
  if (hideIfUndiscovered) {
    return null;
  }

  // Undiscovered - show chalk-line placeholder
  const handleExplore = () => {
    if (discoveryRoute) {
      // Navigate to discovery route
      navigate(discoveryRoute);
    } else {
      // Direct discover (for testing/demos)
      const category = DASHBOARD_DISCOVERY_MAP[slug as DiscoverySlug];
      discoverCard(slug, category);
    }
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500 cursor-pointer group",
        "border-2 border-dashed border-muted-foreground/30 hover:border-primary/50",
        "bg-gradient-to-br from-muted/10 via-transparent to-muted/20",
        placeholderClassName
      )}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* Chalk-line decorative corners */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-dashed border-muted-foreground/40" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-dashed border-muted-foreground/40" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-dashed border-muted-foreground/40" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-dashed border-muted-foreground/40" />

      <div 
        className={cn(
          "transition-all duration-500 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front: Chalk outline */}
        <CardHeader 
          className={cn(
            "backface-hidden",
            isFlipped && "invisible"
          )}
        >
          <CardTitle className="flex items-center gap-2 text-muted-foreground/70">
            {icon || <Lock className="h-5 w-5" />}
            <span className="font-light tracking-wide">{title}</span>
            <Sparkles className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </CardTitle>
          <CardDescription className="text-muted-foreground/50 italic">
            Click to reveal hint...
          </CardDescription>
        </CardHeader>

        {/* Back: Hint + Explore button */}
        {isFlipped && (
          <CardHeader className="absolute inset-0 flex flex-col justify-center items-center bg-background/95 backface-hidden rotate-y-180">
            <CardDescription className="text-center mb-4 text-sm">
              {hint}
            </CardDescription>
            {discoveryRoute && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleExplore();
                }}
                className="gap-2"
              >
                Explore <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
        )}
      </div>
    </Card>
  );
}

/**
 * Simple wrapper that only shows children if the item is discovered.
 * No placeholder - just conditional rendering.
 */
export function DiscoveryGated({ 
  slug, 
  children,
  fallback = null,
}: { 
  slug: string; 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isDiscovered, isLoading } = useDiscovery();
  
  if (isLoading) return null;
  
  return isDiscovered(slug) ? <>{children}</> : <>{fallback}</>;
}
