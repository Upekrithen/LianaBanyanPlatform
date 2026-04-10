/**
 * WardrobeDepartment — Game-mode gated character customization (K383).
 * Route: /hexisle/wardrobe
 *
 * Members browse and equip wardrobe items unlocked through gameplay.
 * Items are organized by category (hat, outfit, accessory, etc.)
 * and filtered by game mode when applicable.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Lock, Sparkles } from "lucide-react";

type WardrobeCategory = "all" | "hat" | "outfit" | "accessory" | "banner" | "aura" | "emote" | "title" | "frame";

const CATEGORY_ICONS: Record<WardrobeCategory, string> = {
  all: "🎭",
  hat: "🎩",
  outfit: "👔",
  accessory: "💍",
  banner: "🏴",
  aura: "✨",
  emote: "😄",
  title: "📜",
  frame: "🖼️",
};

const RARITY_COLORS: Record<string, string> = {
  common: "#9ca3af",
  uncommon: "#38a169",
  rare: "#3b82f6",
  epic: "#9b59b6",
  legendary: "#f59e0b",
};

interface WardrobeItem {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  gameMode: string | null;
  locked: boolean;
  equipped: boolean;
  icon: string;
}

const DEMO_ITEMS: WardrobeItem[] = [
  { id: "1", name: "Explorer's Hat", description: "For those who dare to explore.", category: "hat", rarity: "common", gameMode: null, locked: false, equipped: true, icon: "🎩" },
  { id: "2", name: "Harvest Overalls", description: "Sturdy workwear from Harvest Island.", category: "outfit", rarity: "common", gameMode: null, locked: false, equipped: false, icon: "👕" },
  { id: "3", name: "Navigator's Compass", description: "Always points toward opportunity.", category: "accessory", rarity: "uncommon", gameMode: null, locked: true, equipped: false, icon: "🧭" },
  { id: "4", name: "Battle Standard", description: "Fly your colors.", category: "banner", rarity: "rare", gameMode: "adventure", locked: true, equipped: false, icon: "🏴" },
  { id: "5", name: "Seeker's Glow", description: "A golden aura earned by finding all keys.", category: "aura", rarity: "epic", gameMode: "puzzle", locked: true, equipped: false, icon: "✨" },
  { id: "6", name: "DM Crown", description: "For Dungeon Masters who forge campaigns.", category: "hat", rarity: "legendary", gameMode: null, locked: true, equipped: false, icon: "👑" },
  { id: "7", name: "Ghost World Frame", description: "From the space between worlds.", category: "frame", rarity: "rare", gameMode: null, locked: true, equipped: false, icon: "🖼️" },
  { id: "8", name: "Engineer's Goggles", description: "See through the lens of innovation.", category: "accessory", rarity: "uncommon", gameMode: null, locked: true, equipped: false, icon: "🥽" },
];

const WardrobeDepartment = () => {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const [category, setCategory] = useState<WardrobeCategory>("all");
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);

  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";
  const filtered = category === "all"
    ? DEMO_ITEMS
    : DEMO_ITEMS.filter((item) => item.category === category);

  return (
    <DeckCardShell>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => navigate("/hexisle")}
            className="text-xs flex items-center gap-1 transition-colors"
            style={{ color: "rgba(250,245,235,0.35)" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
          >
            <ArrowLeft className="w-3 h-3" /> Archipelago
          </button>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.55rem",
              letterSpacing: "0.1em",
              color: "rgba(250,245,235,0.2)",
            }}
          >
            WARDROBE
          </span>
        </div>

        {/* Title */}
        <div className="text-center mb-3">
          <h1
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
              fontWeight: 700,
              color: accentColor,
            }}
          >
            Wardrobe Department
          </h1>
          <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.65rem", fontStyle: "italic", marginTop: 2 }}>
            {xrayOn ? "Cosmetic customization earned through gameplay" : "Dress for the adventure you want."}
          </p>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none mb-2">
          {(Object.keys(CATEGORY_ICONS) as WardrobeCategory[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="shrink-0 px-2 py-1 rounded-full transition-all text-center"
              style={{
                background: category === cat ? `${accentColor}18` : "rgba(255,255,255,0.03)",
                border: `1px solid ${category === cat ? `${accentColor}40` : "rgba(250,245,235,0.08)"}`,
                fontSize: "0.55rem",
                color: category === cat ? accentColor : "rgba(250,245,235,0.4)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>

        {/* Item grid */}
        <div className="flex-1 grid grid-cols-2 gap-2 overflow-y-auto content-start">
          {filtered.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="relative flex flex-col items-center p-2.5 rounded-lg text-center"
              style={{
                background: item.equipped ? `${accentColor}10` : "rgba(255,255,255,0.02)",
                border: `1px solid ${item.equipped ? `${accentColor}30` : "rgba(250,245,235,0.06)"}`,
                transition: "all 0.2s ease",
                opacity: item.locked ? 0.5 : 1,
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {item.locked && (
                <Lock
                  className="absolute top-1.5 right-1.5 w-3 h-3"
                  style={{ color: "rgba(250,245,235,0.3)" }}
                />
              )}
              {item.equipped && (
                <Sparkles
                  className="absolute top-1.5 right-1.5 w-3 h-3"
                  style={{ color: accentColor }}
                />
              )}
              <span className="text-xl mb-1">{item.icon}</span>
              <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "rgba(250,245,235,0.8)" }}>
                {item.name}
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: RARITY_COLORS[item.rarity] || "#9ca3af",
                  fontFamily: "'JetBrains Mono', monospace",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  marginTop: 2,
                }}
              >
                {item.rarity}
              </span>
              {item.gameMode && (
                <span style={{ fontSize: "0.45rem", color: "rgba(250,245,235,0.3)", marginTop: 1 }}>
                  {item.gameMode} mode
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected item detail */}
        <AnimatePresence>
          {selectedItem && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="mt-2 p-2.5 rounded-lg"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${RARITY_COLORS[selectedItem.rarity]}30`,
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{selectedItem.icon}</span>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: RARITY_COLORS[selectedItem.rarity] }}>
                  {selectedItem.name}
                </span>
              </div>
              <p style={{ fontSize: "0.6rem", color: "rgba(250,245,235,0.5)", lineHeight: 1.5 }}>
                {selectedItem.description}
              </p>
              {selectedItem.locked && (
                <p style={{ fontSize: "0.55rem", color: "#f97316", marginTop: 4, fontStyle: "italic" }}>
                  Locked — Complete the unlock challenge to earn this item.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DeckCardShell>
  );
};

export default WardrobeDepartment;
