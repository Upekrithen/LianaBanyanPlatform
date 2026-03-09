import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface SpotlightConfig {
  id: string;
  selector: string;
  title: string;
  message: string;
  position: "top" | "bottom" | "left" | "right";
  priority: number;
}

interface SpotlightPreferences {
  rangerModeEnabled: boolean;
  dismissedSpotlights: string[];
}

interface SpotlightContextType {
  preferences: SpotlightPreferences;
  isMember: boolean;
  showSpotlight: (id: string) => void;
  dismissSpotlight: (id: string, permanent?: boolean) => void;
  resetAllSpotlights: () => void;
  toggleRangerMode: () => void;
  shouldShowSpotlight: (id: string) => boolean;
  currentSpotlight: string | null;
  setCurrentSpotlight: (id: string | null) => void;
  sessionSeenSpotlights: Set<string>;
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);

const SPOTLIGHT_REGISTRY: Record<string, SpotlightConfig> = {
  "hero-card": {
    id: "hero-card",
    selector: ".hero-flip",
    title: "💚 The Heart",
    message: '"Help Each Other, Help Ourselves." This is the core of everything we do here.',
    position: "bottom",
    priority: 1,
  },
  "golden-key": {
    id: "golden-key",
    selector: ".yggdrasil-badge",
    title: "🔑 The Golden Key",
    message: "$5 a year. Cost + 20%. You keep 83.3% of what you earn. That's the deal.",
    position: "top",
    priority: 2,
  },
  "ghost-mode": {
    id: "ghost-mode",
    selector: ".ghost-mode-toggle",
    title: "👻 Ghost Mode",
    message: "Practice without consequences. Ghost Credits let you explore everything risk-free.",
    position: "bottom",
    priority: 3,
  },
  "beacon-drop": {
    id: "beacon-drop",
    selector: ".beacon-drop-button",
    title: "📍 Drop a Beacon",
    message: "Mark your path as you explore. Beacons let you portal back to any spot you've visited.",
    position: "left",
    priority: 4,
  },
  "candle-satchel": {
    id: "candle-satchel",
    selector: ".candle-display",
    title: "🕯️ Your Candles",
    message: "Candles are navigation currency. Use them to jump to distant locations instantly.",
    position: "bottom",
    priority: 5,
  },
  "initiative-card": {
    id: "initiative-card",
    selector: ".initiative-card",
    title: "🏛️ Initiatives",
    message: "These are the 16 ways we help each other. Each one is a real service you can use or provide.",
    position: "right",
    priority: 6,
  },
  "swoop-voting": {
    id: "swoop-voting",
    selector: ".swoop-vote-button",
    title: "🗳️ Do The Swoop",
    message: "500 votes activate a project. Vote with your Credits to help someone in need.",
    position: "top",
    priority: 7,
  },
  "treasury-chest": {
    id: "treasury-chest",
    selector: ".treasury-dialog-trigger",
    title: "💰 Your Treasury",
    message: "Track your Marks, Credits, and Joules. Watch your chest upgrade as you grow.",
    position: "bottom",
    priority: 8,
  },
  "design-battle": {
    id: "design-battle",
    selector: ".design-battle-card",
    title: "⚔️ Design Battles",
    message: "Compete to design the best solutions. Winners earn the pot, losers learn from the best.",
    position: "top",
    priority: 9,
  },
  "journey-map": {
    id: "journey-map",
    selector: ".journey-map-trigger",
    title: "🗺️ Your Journey Map",
    message: "See everywhere you've been. The MirrorMirror Helm shows your complete exploration history.",
    position: "right",
    priority: 10,
  },
};

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [preferences, setPreferences] = useState<SpotlightPreferences>({
    rangerModeEnabled: true,
    dismissedSpotlights: [],
  });
  const [currentSpotlight, setCurrentSpotlight] = useState<string | null>(null);
  const [sessionSeenSpotlights, setSessionSeenSpotlights] = useState<Set<string>>(new Set());
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    if (profile) {
      setIsMember(profile.membership_status === "active");
    }
  }, [profile]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (user) {
        const { data } = await supabase
          .from("user_spotlight_prefs")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data) {
          setPreferences({
            rangerModeEnabled: data.ranger_mode_enabled ?? true,
            dismissedSpotlights: data.dismissed_spotlights ?? [],
          });
        }
      } else {
        const stored = localStorage.getItem("spotlight_prefs");
        if (stored) {
          try {
            setPreferences(JSON.parse(stored));
          } catch {
            // Use defaults
          }
        }
      }
    };

    loadPreferences();
  }, [user]);

  const savePreferences = useCallback(
    async (newPrefs: SpotlightPreferences) => {
      setPreferences(newPrefs);

      if (user) {
        await supabase.from("user_spotlight_prefs").upsert({
          user_id: user.id,
          ranger_mode_enabled: newPrefs.rangerModeEnabled,
          dismissed_spotlights: newPrefs.dismissedSpotlights,
          updated_at: new Date().toISOString(),
        });
      } else {
        localStorage.setItem("spotlight_prefs", JSON.stringify(newPrefs));
      }
    },
    [user]
  );

  const shouldShowSpotlight = useCallback(
    (spotlightId: string): boolean => {
      if (!isMember) return true;
      if (!preferences.rangerModeEnabled) return false;
      if (preferences.dismissedSpotlights.includes(spotlightId)) return false;
      if (sessionSeenSpotlights.has(spotlightId)) return false;
      return true;
    },
    [isMember, preferences, sessionSeenSpotlights]
  );

  const showSpotlight = useCallback(
    (id: string) => {
      if (shouldShowSpotlight(id)) {
        setCurrentSpotlight(id);
        setSessionSeenSpotlights((prev) => new Set([...prev, id]));
      }
    },
    [shouldShowSpotlight]
  );

  const dismissSpotlight = useCallback(
    (id: string, permanent = false) => {
      setCurrentSpotlight(null);

      if (permanent && isMember) {
        const newPrefs = {
          ...preferences,
          dismissedSpotlights: [...preferences.dismissedSpotlights, id],
        };
        savePreferences(newPrefs);
      }
    },
    [isMember, preferences, savePreferences]
  );

  const resetAllSpotlights = useCallback(() => {
    const newPrefs = {
      ...preferences,
      dismissedSpotlights: [],
    };
    savePreferences(newPrefs);
    setSessionSeenSpotlights(new Set());
  }, [preferences, savePreferences]);

  const toggleRangerMode = useCallback(() => {
    if (!isMember) return;

    const newPrefs = {
      ...preferences,
      rangerModeEnabled: !preferences.rangerModeEnabled,
    };
    savePreferences(newPrefs);
  }, [isMember, preferences, savePreferences]);

  return (
    <SpotlightContext.Provider
      value={{
        preferences,
        isMember,
        showSpotlight,
        dismissSpotlight,
        resetAllSpotlights,
        toggleRangerMode,
        shouldShowSpotlight,
        currentSpotlight,
        setCurrentSpotlight,
        sessionSeenSpotlights,
      }}
    >
      {children}
    </SpotlightContext.Provider>
  );
}

export function useSpotlight() {
  const context = useContext(SpotlightContext);
  if (!context) {
    throw new Error("useSpotlight must be used within SpotlightProvider");
  }
  return context;
}

export { SPOTLIGHT_REGISTRY };
export type { SpotlightConfig };
