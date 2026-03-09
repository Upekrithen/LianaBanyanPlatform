import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface JournalEntry {
  id: string;
  timestamp: Date;
  title: string;
  content: string;
  type: "discovery" | "achievement" | "note" | "beacon" | "transaction";
  metadata?: Record<string, unknown>;
}

interface CollectedItem {
  id: string;
  type: "candle" | "friend_word" | "golden_key" | "event_ticket" | "beacon" | "map";
  name: string;
  quantity: number;
  acquiredAt: Date;
  metadata?: Record<string, unknown>;
}

interface SessionData {
  startTime: Date;
  entries: JournalEntry[];
  collected: CollectedItem[];
  areasDiscovered: string[];
  beaconsVisited: number;
  wordsCollected: number;
  candlesEarned: number;
}

interface Portfolio {
  maps: MapItem[];
  notes: NoteItem[];
  inventory: InventoryItem[];
  contacts: ContactItem[];
  achievements: AchievementItem[];
  lastSync: Date;
}

interface MapItem {
  id: string;
  locationId: string;
  discoveredAt: Date;
  notes?: string;
  isTreasureMap: boolean;
}

interface NoteItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryItem {
  id: string;
  type: string;
  name: string;
  quantity: number;
  acquiredAt: Date;
}

interface ContactItem {
  id: string;
  name: string;
  relationship: string;
  addedAt: Date;
}

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

interface LogbookContextType {
  session: SessionData;
  portfolio: Portfolio | null;
  isMember: boolean;
  addJournalEntry: (entry: Omit<JournalEntry, "id" | "timestamp">) => void;
  addCollectedItem: (item: Omit<CollectedItem, "id" | "acquiredAt">) => void;
  discoverArea: (areaId: string) => void;
  exportLogbook: () => string;
  emailLogbook: (email: string) => Promise<void>;
  applyHalfLife: () => void;
  getSessionDuration: () => number;
  sessionStats: {
    duration: number;
    entriesCount: number;
    itemsCount: number;
    areasCount: number;
  };
}

const LogbookContext = createContext<LogbookContextType | undefined>(undefined);

const STORAGE_KEY = "liana_logbook_session";
const HALF_LIFE_KEY = "liana_half_life_applied";

function applyHalfLifeToArray<T>(items: T[]): T[] {
  const keepCount = Math.floor(items.length / 2);
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, keepCount);
}

export function LogbookProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const [isMember, setIsMember] = useState(false);
  const [session, setSession] = useState<SessionData>({
    startTime: new Date(),
    entries: [],
    collected: [],
    areasDiscovered: [],
    beaconsVisited: 0,
    wordsCollected: 0,
    candlesEarned: 0,
  });
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);

  useEffect(() => {
    if (profile) {
      setIsMember(profile.membership_status === "active");
    }
  }, [profile]);

  useEffect(() => {
    const loadSession = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const wasHalfLifeApplied = localStorage.getItem(HALF_LIFE_KEY);
          
          if (!isMember && !wasHalfLifeApplied) {
            const decayed: SessionData = {
              ...parsed,
              startTime: new Date(),
              entries: applyHalfLifeToArray(parsed.entries || []),
              collected: applyHalfLifeToArray(parsed.collected || []),
              areasDiscovered: applyHalfLifeToArray(parsed.areasDiscovered || []),
              candlesEarned: Math.floor((parsed.candlesEarned || 0) / 2),
              wordsCollected: Math.floor((parsed.wordsCollected || 0) / 2),
            };
            setSession(decayed);
            localStorage.setItem(HALF_LIFE_KEY, "true");
            localStorage.setItem(STORAGE_KEY, JSON.stringify(decayed));
          } else {
            setSession({
              ...parsed,
              startTime: new Date(parsed.startTime),
            });
          }
        } catch {
          setSession({
            startTime: new Date(),
            entries: [],
            collected: [],
            areasDiscovered: [],
            beaconsVisited: 0,
            wordsCollected: 0,
            candlesEarned: 0,
          });
        }
      }
      localStorage.removeItem(HALF_LIFE_KEY);
    };

    loadSession();
  }, [isMember]);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (user && isMember) {
        const { data: portfolioData } = await supabase
          .from("user_portfolios")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (portfolioData) {
          const [inventory, notes, maps] = await Promise.all([
            supabase
              .from("portfolio_inventory")
              .select("*")
              .eq("user_id", user.id),
            supabase
              .from("portfolio_notes")
              .select("*")
              .eq("user_id", user.id),
            supabase
              .from("portfolio_maps")
              .select("*")
              .eq("user_id", user.id),
          ]);

          setPortfolio({
            maps: (maps.data || []).map((m) => ({
              id: m.id,
              locationId: m.location_id,
              discoveredAt: new Date(m.discovered_at),
              notes: m.notes,
              isTreasureMap: m.is_treasure_map,
            })),
            notes: (notes.data || []).map((n) => ({
              id: n.id,
              title: n.title || "",
              content: n.content || "",
              createdAt: new Date(n.created_at),
              updatedAt: new Date(n.updated_at),
            })),
            inventory: (inventory.data || []).map((i) => ({
              id: i.id,
              type: i.item_type,
              name: i.item_type,
              quantity: Number(i.quantity),
              acquiredAt: new Date(i.acquired_at),
            })),
            contacts: [],
            achievements: [],
            lastSync: new Date(),
          });
        }
      }
    };

    loadPortfolio();
  }, [user, isMember]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  const addJournalEntry = useCallback(
    (entry: Omit<JournalEntry, "id" | "timestamp">) => {
      const newEntry: JournalEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      };
      setSession((prev) => ({
        ...prev,
        entries: [...prev.entries, newEntry],
      }));
    },
    []
  );

  const addCollectedItem = useCallback(
    (item: Omit<CollectedItem, "id" | "acquiredAt">) => {
      const newItem: CollectedItem = {
        ...item,
        id: crypto.randomUUID(),
        acquiredAt: new Date(),
      };
      setSession((prev) => ({
        ...prev,
        collected: [...prev.collected, newItem],
      }));
    },
    []
  );

  const discoverArea = useCallback((areaId: string) => {
    setSession((prev) => {
      if (prev.areasDiscovered.includes(areaId)) return prev;
      return {
        ...prev,
        areasDiscovered: [...prev.areasDiscovered, areaId],
      };
    });
  }, []);

  const getSessionDuration = useCallback(() => {
    return Math.floor((Date.now() - session.startTime.getTime()) / 1000);
  }, [session.startTime]);

  const exportLogbook = useCallback(() => {
    const duration = getSessionDuration();
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    let markdown = `# Logbook Export
**User:** ${user?.email || "Guest Traveler"}
**Date:** ${new Date().toISOString().split("T")[0]}
**Session:** ${hours}h ${minutes}m

---

## 📜 Journal Entries

`;

    session.entries.forEach((entry) => {
      const time = entry.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      markdown += `### ${time} - ${entry.title}
${entry.content}

`;
    });

    markdown += `---

## 🎒 Inventory

| Item | Quantity | Notes |
|------|----------|-------|
`;

    const itemCounts: Record<string, number> = {};
    session.collected.forEach((item) => {
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
    });

    Object.entries(itemCounts).forEach(([name, qty]) => {
      markdown += `| ${name} | ${qty} | - |\n`;
    });

    markdown += `
---

## 🗺️ Discovered Locations

`;

    session.areasDiscovered.forEach((area) => {
      markdown += `- ${area} ✓\n`;
    });

    markdown += `
---

## 📊 Session Stats

- Beacons visited: ${session.beaconsVisited}
- Words collected: ${session.wordsCollected}
- Candles earned: ${session.candlesEarned}
- Time exploring: ${hours}h ${minutes}m

---

*Exported from Liana Banyan Platform*
*$5/year keeps your logbook forever*
`;

    return markdown;
  }, [session, user, getSessionDuration]);

  const emailLogbook = useCallback(
    async (email: string) => {
      // INFRASTRUCTURE NOTE: This function needs to send the logbook markdown via
      // a Supabase Edge Function that calls Resend or similar email service
      const markdown = exportLogbook();
    },
    [exportLogbook]
  );

  const applyHalfLife = useCallback(() => {
    if (isMember) return;

    setSession((prev) => ({
      ...prev,
      entries: applyHalfLifeToArray(prev.entries),
      collected: applyHalfLifeToArray(prev.collected),
      areasDiscovered: applyHalfLifeToArray(prev.areasDiscovered),
      candlesEarned: Math.floor(prev.candlesEarned / 2),
      wordsCollected: Math.floor(prev.wordsCollected / 2),
    }));
  }, [isMember]);

  const sessionStats = {
    duration: getSessionDuration(),
    entriesCount: session.entries.length,
    itemsCount: session.collected.length,
    areasCount: session.areasDiscovered.length,
  };

  return (
    <LogbookContext.Provider
      value={{
        session,
        portfolio,
        isMember,
        addJournalEntry,
        addCollectedItem,
        discoverArea,
        exportLogbook,
        emailLogbook,
        applyHalfLife,
        getSessionDuration,
        sessionStats,
      }}
    >
      {children}
    </LogbookContext.Provider>
  );
}

export function useLogbook() {
  const context = useContext(LogbookContext);
  if (!context) {
    throw new Error("useLogbook must be used within LogbookProvider");
  }
  return context;
}
