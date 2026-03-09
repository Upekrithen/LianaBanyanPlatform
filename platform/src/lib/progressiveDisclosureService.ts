/**
 * PROGRESSIVE DISCLOSURE SERVICE (60/30/10 Rule)
 * ===============================================
 * Implements the Samurai Jack color principle for UI learning:
 *
 *   60% — FAMILIAR (comfortable/mastered)
 *     Vast calm backgrounds. Fast paths, minimal decoration.
 *     The user knows these features. Get out of the way.
 *
 *   30% — NEXT-STEP (explored/practiced)
 *     Supporting secondary elements. Gentle nudges.
 *     "Hey, you've seen this — maybe try it?"
 *
 *   10% — ACTION-ITEM (undiscovered/glimpsed)
 *     Small bright accent that your eye is drawn to.
 *     The NEW thing. The CTA. The "what's this?" spark.
 *
 * This is NOT the x-ray goggles system (which has its own levels).
 * This is about LEARNING THE PLATFORM — tracking which features
 * a user has discovered and used, so the UI can show the right
 * balance of familiar paths and new possibilities.
 *
 * Discovery levels:
 *   undiscovered → glimpsed → explored → practiced → comfortable → mastered
 *
 * The service reads from `user_feature_discovery` and `platform_features`
 * tables, and provides utilities for components to decide how to present
 * features based on the user's learning progress.
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DiscoveryLevel =
  | "undiscovered"
  | "glimpsed"
  | "explored"
  | "practiced"
  | "comfortable"
  | "mastered";

export type DisclosureZone = "action" | "nudge" | "familiar";

export interface PlatformFeature {
  id: string;
  slug: string;
  display_name: string;
  description: string | null;
  area: string;
  icon: string | null;
  route: string | null;
  prerequisite_slugs: string[] | null;
  difficulty_tier: number;
  is_active: boolean;
  display_order: number;
}

export interface FeatureDiscovery {
  feature_slug: string;
  feature_area: string;
  discovery_level: DiscoveryLevel;
  first_seen_at: string | null;
  first_used_at: string | null;
  use_count: number;
  last_used_at: string | null;
}

export interface DisclosureState {
  /** Features in the 60% familiar zone (comfortable/mastered) */
  familiar: PlatformFeature[];
  /** Features in the 30% next-step zone (explored/practiced) */
  nudge: PlatformFeature[];
  /** Features in the 10% action-item zone (undiscovered/glimpsed) */
  action: PlatformFeature[];
  /** Current ratio as percentages */
  ratio: { familiar: number; nudge: number; action: number };
  /** Total active features */
  totalFeatures: number;
}

// ─── Discovery Level → Zone Mapping ──────────────────────────────────────────

const LEVEL_TO_ZONE: Record<DiscoveryLevel, DisclosureZone> = {
  undiscovered: "action",
  glimpsed: "action",
  explored: "nudge",
  practiced: "nudge",
  comfortable: "familiar",
  mastered: "familiar",
};

const LEVEL_ORDER: DiscoveryLevel[] = [
  "undiscovered",
  "glimpsed",
  "explored",
  "practiced",
  "comfortable",
  "mastered",
];

// ─── Core Functions ──────────────────────────────────────────────────────────

/**
 * Get the disclosure zone for a discovery level.
 * Used by UI components to decide visual weight.
 */
export function getDisclosureZone(level: DiscoveryLevel): DisclosureZone {
  return LEVEL_TO_ZONE[level] || "action";
}

/**
 * Get visual styling hints for a disclosure zone.
 * Components use these to apply the 60/30/10 visual weight.
 */
export function getZoneStyling(zone: DisclosureZone): {
  weight: "primary" | "secondary" | "accent";
  opacity: string;
  ring: boolean;
  pulse: boolean;
  badge: string | null;
  description: string;
} {
  switch (zone) {
    case "familiar":
      return {
        weight: "primary",
        opacity: "opacity-100",
        ring: false,
        pulse: false,
        badge: null,
        description: "You know this. Fast path, no decoration.",
      };
    case "nudge":
      return {
        weight: "secondary",
        opacity: "opacity-90",
        ring: true,
        pulse: false,
        badge: "Try it",
        description: "You've seen this — maybe give it a go?",
      };
    case "action":
      return {
        weight: "accent",
        opacity: "opacity-100",
        ring: true,
        pulse: true,
        badge: "New",
        description: "Something new! Take a look.",
      };
  }
}

/**
 * Determine the next discovery level based on current interaction.
 * Call this when a user interacts with a feature to advance their level.
 */
export function getNextLevel(
  current: DiscoveryLevel,
  interactionType: "view" | "click" | "use"
): DiscoveryLevel {
  const currentIndex = LEVEL_ORDER.indexOf(current);

  switch (interactionType) {
    case "view":
      // Viewing advances from undiscovered to glimpsed
      if (current === "undiscovered") return "glimpsed";
      return current;

    case "click":
      // Clicking advances up to "explored"
      if (currentIndex < LEVEL_ORDER.indexOf("explored")) return "explored";
      return current;

    case "use":
      // Using advances one level at a time
      if (currentIndex < LEVEL_ORDER.length - 1) {
        return LEVEL_ORDER[currentIndex + 1];
      }
      return current;
  }
}

// ─── Supabase Operations ──────────────────────────────────────────────────────

/**
 * Fetch all platform features (catalog of what exists)
 */
export async function fetchPlatformFeatures(): Promise<PlatformFeature[]> {
  const { data, error } = await supabase
    .from("platform_features")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Fetch user's discovery state for all features
 */
export async function fetchUserDiscovery(
  userId: string
): Promise<FeatureDiscovery[]> {
  const { data, error } = await supabase
    .from("user_feature_discovery")
    .select("feature_slug, feature_area, discovery_level, first_seen_at, first_used_at, use_count, last_used_at")
    .eq("user_id", userId);

  if (error) throw error;
  return (data || []) as FeatureDiscovery[];
}

/**
 * Calculate the full disclosure state for a user.
 * Returns features grouped into 60/30/10 zones with current ratios.
 */
export async function calculateDisclosureState(
  userId: string
): Promise<DisclosureState> {
  const [features, discoveries] = await Promise.all([
    fetchPlatformFeatures(),
    fetchUserDiscovery(userId),
  ]);

  const discoveryMap = new Map(
    discoveries.map((d) => [d.feature_slug, d])
  );

  const familiar: PlatformFeature[] = [];
  const nudge: PlatformFeature[] = [];
  const action: PlatformFeature[] = [];

  for (const feature of features) {
    const discovery = discoveryMap.get(feature.slug);
    const level: DiscoveryLevel = (discovery?.discovery_level as DiscoveryLevel) || "undiscovered";
    const zone = getDisclosureZone(level);

    switch (zone) {
      case "familiar":
        familiar.push(feature);
        break;
      case "nudge":
        nudge.push(feature);
        break;
      case "action":
        action.push(feature);
        break;
    }
  }

  const total = features.length || 1; // Avoid division by zero

  return {
    familiar,
    nudge,
    action,
    ratio: {
      familiar: Math.round((familiar.length / total) * 100),
      nudge: Math.round((nudge.length / total) * 100),
      action: Math.round((action.length / total) * 100),
    },
    totalFeatures: features.length,
  };
}

/**
 * Record a feature interaction.
 * Advances the user's discovery level for the feature and updates timestamps/counts.
 */
export async function recordFeatureInteraction(
  userId: string,
  featureSlug: string,
  featureArea: string,
  interactionType: "view" | "click" | "use"
): Promise<void> {
  // Get current discovery state
  const { data: existing } = await supabase
    .from("user_feature_discovery")
    .select("*")
    .eq("user_id", userId)
    .eq("feature_slug", featureSlug)
    .maybeSingle();

  const now = new Date().toISOString();
  const currentLevel: DiscoveryLevel = (existing?.discovery_level as DiscoveryLevel) || "undiscovered";
  const newLevel = getNextLevel(currentLevel, interactionType);

  if (existing) {
    // Update existing record
    const updates: Record<string, unknown> = {
      discovery_level: newLevel,
      updated_at: now,
    };

    if (interactionType === "view" && !existing.first_seen_at) {
      updates.first_seen_at = now;
    }

    if (interactionType === "use" || interactionType === "click") {
      if (!existing.first_used_at) {
        updates.first_used_at = now;
      }
      updates.use_count = (existing.use_count || 0) + 1;
      updates.last_used_at = now;
    }

    await supabase
      .from("user_feature_discovery")
      .update(updates)
      .eq("id", existing.id);
  } else {
    // Create new record
    await supabase.from("user_feature_discovery").insert({
      user_id: userId,
      feature_slug: featureSlug,
      feature_area: featureArea,
      discovery_level: newLevel,
      first_seen_at: interactionType === "view" ? now : null,
      first_used_at: interactionType === "use" || interactionType === "click" ? now : null,
      use_count: interactionType === "use" || interactionType === "click" ? 1 : 0,
      last_used_at: interactionType === "use" || interactionType === "click" ? now : null,
    });
  }
}

/**
 * Get the single best "action item" feature to highlight.
 * This is the ONE bright accent in the 10% zone —
 * the feature the user should discover next.
 *
 * Priority:
 *   1. Lowest difficulty tier first (learn basics before advanced)
 *   2. Prerequisites met (don't show advanced before basics)
 *   3. Lowest display_order (platform-defined learning path)
 */
export async function getNextActionItem(
  userId: string
): Promise<PlatformFeature | null> {
  const state = await calculateDisclosureState(userId);

  if (state.action.length === 0) return null;

  // Get user's discovered feature slugs (for prerequisite checking)
  const discoveries = await fetchUserDiscovery(userId);
  const discoveredSlugs = new Set(
    discoveries
      .filter((d) =>
        ["explored", "practiced", "comfortable", "mastered"].includes(
          d.discovery_level
        )
      )
      .map((d) => d.feature_slug)
  );

  // Find the best candidate
  const candidates = state.action
    .filter((feature) => {
      // Check prerequisites
      if (feature.prerequisite_slugs && feature.prerequisite_slugs.length > 0) {
        return feature.prerequisite_slugs.every((slug) =>
          discoveredSlugs.has(slug)
        );
      }
      return true;
    })
    .sort((a, b) => {
      // Sort by difficulty tier first, then display order
      if (a.difficulty_tier !== b.difficulty_tier) {
        return a.difficulty_tier - b.difficulty_tier;
      }
      return a.display_order - b.display_order;
    });

  return candidates[0] || null;
}

/**
 * Get disclosure zone for a specific feature slug.
 * Quick lookup for individual components.
 */
export async function getFeatureZone(
  userId: string,
  featureSlug: string
): Promise<DisclosureZone> {
  const { data } = await supabase
    .from("user_feature_discovery")
    .select("discovery_level")
    .eq("user_id", userId)
    .eq("feature_slug", featureSlug)
    .maybeSingle();

  const level: DiscoveryLevel = (data?.discovery_level as DiscoveryLevel) || "undiscovered";
  return getDisclosureZone(level);
}
