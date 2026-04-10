/**
 * CampaignForge — DM campaign creation & management hub (K381).
 * Route: /hexisle/forge
 *
 * Phase 1 page shell: campaign list + create flow placeholder.
 * Foundation for K382 (Map Editor) and K384 (DM Summoning).
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Swords, Puzzle, Ship, Castle, Wand2, Settings } from "lucide-react";

const CAMPAIGN_TYPES = [
  { id: "adventure", label: "Adventure", icon: Swords, desc: "Classic quest through the islands", color: "#d4a855" },
  { id: "raid", label: "Raid", icon: Castle, desc: "Storm a fortress, seize the prize", color: "#8b3a3a" },
  { id: "puzzle", label: "Puzzle", icon: Puzzle, desc: "Solve riddles to advance", color: "#9b59b6" },
  { id: "trade", label: "Trade", icon: Ship, desc: "Build trade routes between islands", color: "#4a90d9" },
  { id: "siege", label: "Siege", icon: Castle, desc: "Defend your keep from invaders", color: "#e74c3c" },
  { id: "custom", label: "Custom", icon: Wand2, desc: "Design your own campaign type", color: "#00bcd4" },
] as const;

type ForgeView = "list" | "create";

const CampaignForge = () => {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const [view, setView] = useState<ForgeView>("list");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";

  return (
    <DeckCardShell>
      <AnimatePresence mode="wait">
        {view === "list" ? (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
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
                CAMPAIGN FORGE
              </span>
            </div>

            {/* Title */}
            <div className="text-center mb-4">
              <h1
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "clamp(1.3rem, 4vw, 1.6rem)",
                  fontWeight: 700,
                  color: accentColor,
                  transition: "color 0.5s ease",
                }}
              >
                Campaign Forge
              </h1>
              <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.7rem", fontStyle: "italic", marginTop: 4 }}>
                {xrayOn
                  ? "Create structured business challenges for your guild"
                  : "Forge your legend. Build campaigns for your crew."}
              </p>
            </div>

            {/* Empty state — no campaigns yet */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                style={{
                  background: `${accentColor}10`,
                  border: `2px dashed ${accentColor}30`,
                }}
              >
                <Settings className="w-7 h-7" style={{ color: `${accentColor}60` }} />
              </div>
              <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.75rem", textAlign: "center", maxWidth: "85%", lineHeight: 1.6 }}>
                No campaigns yet. Create your first campaign to become a Dungeon Master.
              </p>
            </div>

            {/* Create button */}
            <motion.button
              onClick={() => setView("create")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                transition: "all 0.2s ease",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Create Campaign
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="create"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => { setView("list"); setSelectedType(null); }}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  color: accentColor,
                }}
              >
                NEW CAMPAIGN
              </span>
            </div>

            {/* Campaign type picker */}
            <h2
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: accentColor,
                marginBottom: "0.75rem",
                textAlign: "center",
              }}
            >
              Choose Your Campaign Type
            </h2>

            <div className="flex-1 grid grid-cols-2 gap-2 content-start overflow-y-auto">
              {CAMPAIGN_TYPES.map((ct) => {
                const Icon = ct.icon;
                const isSelected = selectedType === ct.id;
                return (
                  <motion.button
                    key={ct.id}
                    onClick={() => setSelectedType(ct.id)}
                    className="flex flex-col items-center p-3 rounded-lg text-center"
                    style={{
                      background: isSelected ? `${ct.color}18` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? `${ct.color}50` : "rgba(250,245,235,0.08)"}`,
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Icon className="w-5 h-5 mb-1.5" style={{ color: ct.color }} />
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: ct.color }}>
                      {ct.label}
                    </span>
                    <span style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.4)", marginTop: 2 }}>
                      {ct.desc}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Forge button (Phase 2 wiring — currently shows placeholder) */}
            <motion.button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg mt-3"
              style={{
                background: selectedType ? `${accentColor}15` : "rgba(255,255,255,0.02)",
                border: `1px solid ${selectedType ? `${accentColor}40` : "rgba(250,245,235,0.08)"}`,
                color: selectedType ? accentColor : "rgba(250,245,235,0.3)",
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
                cursor: selectedType ? "pointer" : "not-allowed",
                transition: "all 0.2s ease",
              }}
              whileHover={selectedType ? { scale: 1.02 } : {}}
              whileTap={selectedType ? { scale: 0.98 } : {}}
            >
              <Swords className="w-4 h-4" />
              {selectedType ? "Forge Campaign" : "Select a type"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </DeckCardShell>
  );
};

export default CampaignForge;
