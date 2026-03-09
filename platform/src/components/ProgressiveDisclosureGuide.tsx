/**
 * PROGRESSIVE DISCLOSURE GUIDE
 * =============================
 * The visual manifestation of the 60/30/10 Samurai Jack rule.
 *
 * Three components exported:
 *
 * 1. <DisclosureGuidePanel /> — Full dashboard showing discovery progress,
 *    categorized features with zone indicators, and next-step suggestions.
 *    Used in: Settings, Dashboard, Cold Start page.
 *
 * 2. <FeatureNudge /> — Inline nudge component that wraps a nav item or
 *    button and applies the correct visual weight based on discovery zone.
 *    Used in: Sidebar nav, feature cards, onboarding flows.
 *
 * 3. <NextActionSpotlight /> — The 10% bright accent CTA that highlights
 *    the ONE feature the user should discover next.
 *    Used in: Dashboard header, sidebar bottom, onboarding steps.
 *
 * The 60/30/10 balance:
 *   60% (familiar): clean, fast, no decoration — the calm background
 *   30% (nudge): subtle ring, "Try it" badge — the supporting accent
 *   10% (action): pulse, bright CTA, "New" badge — the eye-catcher
 */

import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  ArrowRight,
  Eye,
  Zap,
  CheckCircle2,
  Target,
  Compass,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import {
  calculateDisclosureState,
  getNextActionItem,
  recordFeatureInteraction,
  getDisclosureZone,
  getZoneStyling,
  type DisclosureZone,
  type DiscoveryLevel,
  type PlatformFeature,
  type DisclosureState,
} from "@/lib/progressiveDisclosureService";

// ─── 1. DisclosureGuidePanel ──────────────────────────────────────────────────

export function DisclosureGuidePanel({ className = "" }: { className?: string }) {
  const { user } = useAuth();

  const { data: state, isLoading } = useQuery({
    queryKey: ["disclosure-state", user?.id],
    queryFn: () => calculateDisclosureState(user!.id),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading || !state) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-muted rounded w-1/3" />
            <div className="h-2 bg-muted rounded" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Compass className="h-5 w-5 text-violet-500" />
          Your Discovery Progress
        </CardTitle>
        <CardDescription>
          Platform features you've explored, and what's waiting to be discovered
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 60/30/10 Ratio Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-emerald-600 dark:text-emerald-400">
              Familiar ({state.ratio.familiar}%)
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              Next Step ({state.ratio.nudge}%)
            </span>
            <span className="text-amber-600 dark:text-amber-400">
              Undiscovered ({state.ratio.action}%)
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${state.ratio.familiar}%` }}
            />
            <div
              className="bg-blue-500 h-full transition-all duration-500"
              style={{ width: `${state.ratio.nudge}%` }}
            />
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${state.ratio.action}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {state.familiar.length} mastered · {state.nudge.length} exploring · {state.action.length} undiscovered
            <span className="float-right">{state.totalFeatures} total features</span>
          </p>
        </div>

        {/* Feature Lists by Zone */}
        {state.action.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" /> Ready to Discover
            </h4>
            <div className="space-y-1">
              {state.action.slice(0, 5).map((feature) => (
                <FeatureListItem key={feature.slug} feature={feature} zone="action" />
              ))}
              {state.action.length > 5 && (
                <p className="text-xs text-muted-foreground pl-6">
                  +{state.action.length - 5} more to discover
                </p>
              )}
            </div>
          </div>
        )}

        {state.nudge.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <Target className="h-4 w-4" /> Keep Exploring
            </h4>
            <div className="space-y-1">
              {state.nudge.slice(0, 5).map((feature) => (
                <FeatureListItem key={feature.slug} feature={feature} zone="nudge" />
              ))}
            </div>
          </div>
        )}

        {state.familiar.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> Comfortable With
            </h4>
            <div className="space-y-1">
              {state.familiar.map((feature) => (
                <FeatureListItem key={feature.slug} feature={feature} zone="familiar" />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FeatureListItem({
  feature,
  zone,
}: {
  feature: PlatformFeature;
  zone: DisclosureZone;
}) {
  const zoneColors: Record<DisclosureZone, string> = {
    action: "text-amber-600 dark:text-amber-400",
    nudge: "text-blue-600 dark:text-blue-400",
    familiar: "text-emerald-600 dark:text-emerald-400",
  };

  const zoneIcons: Record<DisclosureZone, React.ReactNode> = {
    action: <Sparkles className="h-3.5 w-3.5" />,
    nudge: <Eye className="h-3.5 w-3.5" />,
    familiar: <CheckCircle2 className="h-3.5 w-3.5" />,
  };

  return (
    <div className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/40 transition-colors group">
      <span className={`flex-shrink-0 ${zoneColors[zone]}`}>
        {zoneIcons[zone]}
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">
          {feature.display_name}
        </span>
      </div>
      {feature.route && (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
      {zone === "action" && (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-600 dark:border-amber-700 dark:text-amber-400"
        >
          New
        </Badge>
      )}
      {zone === "nudge" && (
        <Badge
          variant="outline"
          className="text-[10px] px-1.5 py-0 border-blue-300 text-blue-600 dark:border-blue-700 dark:text-blue-400"
        >
          Try it
        </Badge>
      )}
    </div>
  );
}

// ─── 2. FeatureNudge ──────────────────────────────────────────────────────────

/**
 * Wraps a navigation item or button and applies 60/30/10 visual weight.
 *
 * Usage:
 *   <FeatureNudge featureSlug="deck-card-studio" zone="action">
 *     <NavLink to="/deck-card-studio">Deck Card Studio</NavLink>
 *   </FeatureNudge>
 */
export function FeatureNudge({
  featureSlug,
  zone,
  children,
  className = "",
  showBadge = true,
}: {
  featureSlug: string;
  zone: DisclosureZone;
  children: React.ReactNode;
  className?: string;
  showBadge?: boolean;
}) {
  const styling = getZoneStyling(zone);

  const wrapperClasses = [
    "relative inline-flex items-center",
    className,
    zone === "action" && "ring-2 ring-amber-400/50 rounded-md",
    zone === "nudge" && "ring-1 ring-blue-300/40 rounded-md",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={wrapperClasses}>
      {children}
      {showBadge && styling.badge && (
        <Badge
          className={`absolute -top-2 -right-2 text-[10px] px-1 py-0 pointer-events-none ${
            zone === "action"
              ? "bg-amber-500 text-white border-amber-600"
              : "bg-blue-500 text-white border-blue-600"
          } ${styling.pulse ? "animate-pulse" : ""}`}
        >
          {styling.badge}
        </Badge>
      )}
    </div>
  );
}

// ─── 3. NextActionSpotlight ──────────────────────────────────────────────────

/**
 * The 10% bright accent CTA.
 * Shows ONE feature the user should discover next,
 * with a compelling call-to-action.
 *
 * Usage:
 *   <NextActionSpotlight onNavigate={(route) => navigate(route)} />
 */
export function NextActionSpotlight({
  onNavigate,
  compact = false,
  className = "",
}: {
  onNavigate?: (route: string) => void;
  compact?: boolean;
  className?: string;
}) {
  const { user } = useAuth();

  const { data: nextAction, isLoading } = useQuery({
    queryKey: ["next-action-item", user?.id],
    queryFn: () => getNextActionItem(user!.id),
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  if (isLoading || !nextAction) return null;

  if (compact) {
    return (
      <button
        onClick={() => nextAction.route && onNavigate?.(nextAction.route)}
        className={`flex items-center gap-2 w-full p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors text-left ${className}`}
      >
        <div className="p-1 bg-amber-500 rounded text-white flex-shrink-0">
          <Zap className="h-3 w-3" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-amber-800 dark:text-amber-300 truncate">
            {nextAction.display_name}
          </p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate">
            {nextAction.description}
          </p>
        </div>
        <ArrowRight className="h-3 w-3 text-amber-500 flex-shrink-0" />
      </button>
    );
  }

  return (
    <Card className={`border-amber-200 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500 rounded-lg text-white flex-shrink-0 animate-pulse">
            <Zap className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-0.5">
              Discover Next
            </p>
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              {nextAction.display_name}
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
              {nextAction.description}
            </p>
            {nextAction.route && (
              <Button
                size="sm"
                className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => onNavigate?.(nextAction.route!)}
              >
                Explore <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
