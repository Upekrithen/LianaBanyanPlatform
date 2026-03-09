/**
 * DISCOVERY TRACKER HOOK
 * =======================
 * Watches the current route. When a user visits a route that matches
 * a discoverable_card.discovery_route, automatically marks it as discovered.
 *
 * Also handles:
 * - Mirror + Compass as core onboarding items
 * - Ghost discovery storage in localStorage
 * - Triggers chalk-outline reveal animations
 * - Fires discovery toasts
 */

import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const GHOST_DISCOVERIES_KEY = "lb_ghost_discoveries";

// Core items that everyone should find
const CORE_ITEMS = {
  mirror: { route: "/durins-door", name: "The Mirror", icon: "\uD83E\uDE9E" },
  compass: { route: "/the-helm", name: "The Compass", icon: "\uD83E\uDDED" },
};

export function useDiscoveryTracker() {
  const { user } = useAuth();
  const location = useLocation();
  const discoveredThisSession = useRef<Set<string>>(new Set());
  const cardsRef = useRef<Array<{ slug: string; category_slug: string; discovery_route: string | null }>>([]);
  const loadedRef = useRef(false);

  // Load discoverable cards once
  useEffect(() => {
    loadCards();
  }, []);

  // Track route changes
  useEffect(() => {
    if (loadedRef.current) {
      checkDiscovery(location.pathname);
    }
  }, [location.pathname, user]);

  const loadCards = async () => {
    const { data } = await supabase
      .from("discoverable_cards")
      .select("slug, category_slug, discovery_route");
    if (data) {
      cardsRef.current = data;
      loadedRef.current = true;
    }
  };

  const checkDiscovery = async (path: string) => {
    // Find matching cards
    const matches = cardsRef.current.filter(
      (c) => c.discovery_route && path.startsWith(c.discovery_route)
    );

    for (const card of matches) {
      if (discoveredThisSession.current.has(card.slug)) continue;
      discoveredThisSession.current.add(card.slug);

      if (user) {
        // Authenticated: write to database
        const { error } = await supabase
          .from("user_discovery_state")
          .upsert({
            user_id: user.id,
            category_slug: card.category_slug,
            card_slug: card.slug,
          }, { onConflict: "user_id,category_slug,card_slug" });

        if (!error) {
          // Also discover the category itself
          await supabase
            .from("user_discovery_state")
            .upsert({
              user_id: user.id,
              category_slug: card.category_slug,
              card_slug: null,
            }, { onConflict: "user_id,category_slug,card_slug" });

          toast.success(`Discovered: ${card.slug.replace(/-/g, " ")}`, {
            description: "A new card has been added to your collection.",
            duration: 3000,
          });
        }
      } else {
        // Ghost: store in localStorage
        const existing = JSON.parse(localStorage.getItem(GHOST_DISCOVERIES_KEY) || "[]");
        if (!existing.includes(card.slug)) {
          existing.push(card.slug);
          localStorage.setItem(GHOST_DISCOVERIES_KEY, JSON.stringify(existing));

          toast.success(`Discovered: ${card.slug.replace(/-/g, " ")}`, {
            description: "This discovery will carry over when you join.",
            duration: 3000,
          });
        }
      }
    }

    // Check core items
    if (path.startsWith(CORE_ITEMS.mirror.route)) {
      handleCoreDiscovery("mirror");
    }
    if (path.startsWith(CORE_ITEMS.compass.route)) {
      handleCoreDiscovery("compass");
    }
  };

  const handleCoreDiscovery = (item: "mirror" | "compass") => {
    const key = `lb_core_${item}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "true");

    const core = CORE_ITEMS[item];

    if (item === "mirror") {
      toast.success(`${core.icon} You found The Mirror!`, {
        description: "Your Crow Feathers meter has been revealed. The Mirror shows who you are.",
        duration: 5000,
      });
    } else {
      toast.success(`${core.icon} You found The Compass!`, {
        description: "Navigation unlocked. Your bookshelf expands. The Compass shows where you're going.",
        duration: 5000,
      });
    }
  };
}

/**
 * Get ghost discoveries from localStorage (for carry-over on signup)
 */
export function getGhostDiscoveries(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GHOST_DISCOVERIES_KEY) || "[]");
  } catch {
    return [];
  }
}

/**
 * Check if a core item has been found
 */
export function hasCoreItem(item: "mirror" | "compass"): boolean {
  return localStorage.getItem(`lb_core_${item}`) === "true";
}
