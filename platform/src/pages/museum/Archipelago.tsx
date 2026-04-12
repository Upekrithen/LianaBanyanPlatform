/**
 * Archipelago — Top-down view of the 7 HexIsle islands.
 * Vertical archipelago layout matching Caleb's world map art.
 * Island 1 (Harvest) at south, progressing north through the chain.
 * Central castle cluster (Islands 4-6), Island 7 at top.
 *
 * Desktop: fills most of viewport height.
 * Mobile: scrollable tall map.
 *
 * Phase 1 of the HexIsle interactive world.
 * Introduced B092.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { useXRay } from "@/components/museum/XRayContext";
import { useArchipelagoTourSafe, DIALOGUE_TEXT } from "@/contexts/ArchipelagoTourContext";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { motion, AnimatePresence } from "framer-motion";
import { Map, Scroll, Lock } from "lucide-react";
import "@/components/museum/HologramOverlay.css";
import { YouAreHereBeacon } from "@/components/museum/YouAreHereBeacon";

interface HexIsleProgress {
  visitedIslands: string[];
  currentIsland: string;
}

function getProgress(): HexIsleProgress {
  try {
    const raw = localStorage.getItem("hexisle_progress");
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { visitedIslands: [], currentIsland: "" };
}

/**
 * Island positions matched to Caleb's world map art.
 * Vertical archipelago: south-to-north progression.
 * Coordinates are % within a 3:5 (tall) map area.
 */
const ISLANDS = [
  {
    number: 1,
    name: "Harvest",
    theme: "Manufacturing",
    skill: "Production & supply chain",
    loreHook: "You awaken to the sound of waves...",
    color: "#d4a855",
    glowColor: "rgba(212, 168, 85, 0.3)",
    icon: "🌾",
    artImage: "/images/hexisle/island-1-harvest.jpg",
    x: 62, y: 91,
    size: 44,
    hologramTier: 1 as const,
  },
  {
    number: 2,
    name: "Navigate",
    theme: "Sales",
    skill: "Market navigation & trade",
    loreHook: "Great walls of rock rise from the sea...",
    color: "#4a90d9",
    glowColor: "rgba(74, 144, 217, 0.3)",
    icon: "🧭",
    artImage: "/images/hexisle/island-2-navigate.jpg",
    x: 58, y: 76,
    size: 48,
    hologramTier: 2 as const,
  },
  {
    number: 3,
    name: "Engineer",
    theme: "R&D",
    skill: "Research & development",
    loreHook: "Massive fossilized tree stumps tower above...",
    color: "#6b8e23",
    glowColor: "rgba(107, 142, 35, 0.3)",
    icon: "⚙️",
    artImage: "/images/hexisle/island-3-engineer.jpg",
    x: 63, y: 60,
    size: 32,
    hologramTier: 3 as const,
  },
  {
    number: 4,
    name: "Battle",
    theme: "Competition",
    skill: "Competitive strategy",
    loreHook: "A dark island permanently covered by storms...",
    color: "#8b3a3a",
    glowColor: "rgba(139, 58, 58, 0.3)",
    icon: "⚔️",
    artImage: "/images/hexisle/island-4-battle.jpg",
    x: 47, y: 49,
    size: 60,
    hologramTier: 3 as const,
  },
  {
    number: 5,
    name: "Seek",
    theme: "Quality",
    skill: "Quality assurance & testing",
    loreHook: "A chain of 5 islets with distributed keys...",
    color: "#9b59b6",
    glowColor: "rgba(155, 89, 182, 0.3)",
    icon: "🔑",
    artImage: "/images/hexisle/island-5-seek.jpg",
    x: 56, y: 26,
    size: 54,
    hologramTier: 2 as const,
  },
  {
    number: 6,
    name: "Magic",
    theme: "Service",
    skill: "Customer service & delight",
    loreHook: "Beneath the sea, in a great bubble...",
    color: "#00bcd4",
    glowColor: "rgba(0, 188, 212, 0.3)",
    icon: "✨",
    artImage: "/images/hexisle/island-6-magic.jpg",
    x: 36, y: 36,
    size: 56,
    hologramTier: 1 as const,
  },
  {
    number: 7,
    name: "Train",
    theme: "Leadership",
    skill: "Team building & management",
    loreHook: "A great forcefield surrounds the central hub...",
    color: "#f39c12",
    glowColor: "rgba(243, 156, 18, 0.3)",
    icon: "👑",
    artImage: "/images/hexisle/island-7-train.jpg",
    x: 32, y: 10,
    size: 48,
    hologramTier: 4 as const,
  },
];

/** Dashed path connections — south to north progression */
const PATHS: Array<[number, number]> = [
  [0, 1], // Harvest → Navigate
  [1, 2], // Navigate → Engineer
  [2, 3], // Engineer → Battle
  [3, 4], // Battle → Seek
  [3, 5], // Battle → Magic (central branch)
  [4, 6], // Seek → Train
  [5, 6], // Magic → Train
];

const Archipelago = () => {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const tour = useArchipelagoTourSafe();
  const [progress, setProgress] = useState<HexIsleProgress>(getProgress);

  useEffect(() => {
    const onStorage = () => setProgress(getProgress());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const oceanColor = xrayOn ? "rgba(34, 211, 238, 0.06)" : "rgba(56, 161, 105, 0.04)";
  const pathColor = xrayOn ? "rgba(34, 211, 238, 0.25)" : "rgba(201, 169, 110, 0.2)";
  const visitedPathColor = xrayOn ? "rgba(34, 211, 238, 0.5)" : "rgba(201, 169, 110, 0.45)";
  const titleColor = xrayOn ? "#22d3ee" : "#c9a96e";

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col items-center px-4 py-4 relative">
        {/* Ocean tint overlay */}
        <div
          className="fixed inset-0 pointer-events-none z-[1]"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${oceanColor} 0%, transparent 70%)`,
            transition: "background 0.5s ease",
          }}
        />

        {/* Title — compact */}
        <motion.div
          className="text-center mb-2 relative z-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 mb-0.5">
            <Map className="w-4 h-4" style={{ color: titleColor, transition: "color 0.5s ease" }} />
            <h1
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "clamp(1rem, 3vw, 1.3rem)",
                fontWeight: 700,
                color: titleColor,
                transition: "color 0.5s ease",
              }}
            >
              The Archipelago
            </h1>
          </div>
          <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.65rem", fontStyle: "italic" }}>
            {xrayOn ? "7 Islands · 7 Business Skills · Your Journey" : "7 Islands · 7 Trials · One Way Home"}
          </p>
        </motion.div>

        {/* Mouse: how the 7 islands connect */}
        <div className="relative z-10 mb-2 max-w-md">
          <SummonMascot
            mascotId="mouse"
            topic="How the 7 islands connect"
            startClosed
            message={
              <>
                Each island is a distinct part of the platform — HexIsle is the decentralized factory,
                the Marketplace is the commerce layer, the Agora is where governance happens, and so on.
                The pathways between them are real. Stuff made on one island can ship through another.
                You can walk, sail, or portal between them depending on what you're carrying.
              </>
            }
            helperMessage={
              <>
                The order you visit them in is up to you. Most people start where their first skill lives
                and only later discover they needed a detour through an island they never thought was theirs.
                The map is the same; the route is yours.
              </>
            }
          />
        </div>

        {/* Map area — tall vertical layout filling viewport */}
        <div
          className="relative z-10 flex-1 w-full"
          style={{
            maxWidth: "min(600px, 90vw)",
            minHeight: "min(75vh, 700px)",
            aspectRatio: "3/5",
            margin: "0 auto",
          }}
        >
          {/* SVG path connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {PATHS.map(([from, to], i) => {
              const fromName = ISLANDS[from].name.toLowerCase();
              const toName = ISLANDS[to].name.toLowerCase();
              const bothVisited = progress.visitedIslands.includes(fromName) && progress.visitedIslands.includes(toName);
              const tourUnlocked = tour.isTourActive
                && tour.flippedIslands.includes(fromName)
                && tour.isIslandUnlocked(toName);
              const isSolid = bothVisited || tourUnlocked;
              return (
                <motion.line
                  key={i}
                  x1={ISLANDS[from].x}
                  y1={ISLANDS[from].y}
                  x2={ISLANDS[to].x}
                  y2={ISLANDS[to].y}
                  stroke={isSolid ? visitedPathColor : pathColor}
                  strokeWidth={isSolid ? "0.5" : "0.3"}
                  strokeDasharray={isSolid ? "none" : "1.5 1.5"}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.12, duration: 0.8 }}
                  style={{ transition: "stroke 0.5s ease" }}
                />
              );
            })}
          </svg>

          {/* Island nodes */}
          {ISLANDS.map((island, i) => {
            const slug = island.name.toLowerCase();
            const isVisited = progress.visitedIslands.includes(slug);
            const isCurrent = progress.currentIsland === slug;
            const unlocked = tour.isIslandUnlocked(slug);
            const isFlipped = tour.flippedIslands.includes(slug);
            const tourLocked = tour.isTourActive && !unlocked;

            const nodeOpacity = tourLocked
              ? 0.3
              : isVisited || progress.visitedIslands.length === 0
                ? 1
                : 0.4;

            return (
            <motion.button
              key={island.number}
              onClick={() => {
                if (tourLocked) return;
                navigate(`/hexisle/${slug}`);
              }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${island.x}%`,
                top: `${island.y}%`,
                transform: "translate(-50%, -50%)",
                cursor: tourLocked ? "not-allowed" : "pointer",
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: nodeOpacity, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
              whileHover={tourLocked ? {} : { scale: 1.15, opacity: 1 }}
              title={
                tourLocked
                  ? `${island.name} — Locked (explore previous islands first)`
                  : xrayOn
                    ? `${island.name} — ${island.skill}`
                    : `${island.name} Island`
              }
            >
              {/* Island circle — concept art thumbnail */}
              <div style={{ position: "relative" }}>
                {isCurrent && !tourLocked && (
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: "-4px",
                      borderRadius: "50%",
                      border: `2px solid ${island.color}`,
                    }}
                    animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.06, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                )}
                <div
                  className={tourLocked ? "" : `hologram-character hologram-tier-${island.hologramTier} hologram-delay-${i % 6}`}
                  style={{
                    width: `${island.size}px`,
                    height: `${island.size}px`,
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: tourLocked
                      ? "2px dashed rgba(250,245,235,0.15)"
                      : `2px solid ${island.color}60`,
                    boxShadow: tourLocked
                      ? "none"
                      : `0 0 ${island.size * 0.4}px ${island.glowColor}, inset 0 0 ${island.size * 0.3}px ${island.glowColor}`,
                    transition: "all 0.3s ease",
                    filter: tourLocked ? "grayscale(0.8)" : "none",
                    position: "relative",
                  }}
                >
                  <img
                    src={island.artImage}
                    alt={island.name}
                    className="hologram-target"
                    style={{ width: "100%", height: "100%", objectFit: "cover", opacity: tourLocked ? 0.3 : 1 }}
                  />
                  {tourLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock className="w-3 h-3" style={{ color: "rgba(250,245,235,0.4)" }} />
                    </div>
                  )}
                </div>
                {/* Flipped checkmark for tour progress */}
                {tour.isTourActive && isFlipped && (
                  <div
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: "#f97316", fontSize: "0.5rem", color: "#fff" }}
                  >
                    ✓
                  </div>
                )}
              </div>

              {/* Island label */}
              <div className="mt-1 text-center" style={{ whiteSpace: "nowrap" }}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    color: tourLocked ? "rgba(250,245,235,0.25)" : island.color,
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    letterSpacing: "0.03em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6)",
                  }}
                >
                  {island.name}
                </div>
                {xrayOn && !tourLocked && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    style={{
                      fontSize: "0.5rem",
                      color: "#22d3ee",
                      fontFamily: "'JetBrains Mono', monospace",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                  >
                    {island.theme}
                  </motion.div>
                )}
              </div>
            </motion.button>
          );
          })}

          {/* K379: YOU ARE HERE beacon — positioned at current island */}
          {(() => {
            const currentIsland = ISLANDS.find((isl) => isl.name.toLowerCase() === progress.currentIsland);
            if (!currentIsland) return null;
            const isFirstVisit = progress.visitedIslands.length <= 1;
            return (
              <motion.div
                className="absolute pointer-events-none"
                style={{
                  left: `${currentIsland.x}%`,
                  top: `${currentIsland.y}%`,
                  transform: "translate(-50%, -130%)",
                  zIndex: 5,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.5 }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <YouAreHereBeacon
                    mode={isFirstVisit ? "welcome" : "pin"}
                    color={currentIsland.color}
                    label={isFirstVisit ? "WELCOME" : "YOU ARE HERE"}
                  />
                </motion.div>
              </motion.div>
            );
          })()}

          {/* Treasure Map scroll — clickable center link */}
          <motion.button
            onClick={() => navigate("/hexisle/scroll")}
            className="absolute flex flex-col items-center"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.2 }}
            whileHover={{ opacity: 1, scale: 1.1 }}
            title="Open the Treasure Map"
          >
            <motion.div
              animate={{ boxShadow: ["0 0 8px rgba(201,169,110,0.2)", "0 0 20px rgba(201,169,110,0.4)", "0 0 8px rgba(201,169,110,0.2)"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: "50%", padding: "10px", background: "rgba(201,169,110,0.06)" }}
            >
              <Scroll className="w-10 h-10" style={{ color: "#c9a96e" }} />
            </motion.div>
            <span style={{
              fontSize: "0.5rem",
              color: "#c9a96e",
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontStyle: "italic",
              marginTop: "4px",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}>
              Treasure Map
            </span>
          </motion.button>
        </div>

        {/* LRH Tour dialogue bubble */}
        <AnimatePresence>
          {tour.isTourActive && tour.currentDialogue && DIALOGUE_TEXT[tour.currentDialogue] && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="relative z-20 w-full flex justify-center mb-2"
              style={{ maxWidth: "min(360px, 90vw)", margin: "0 auto" }}
            >
              <MascotBubble
                title={DIALOGUE_TEXT[tour.currentDialogue].title}
                message={DIALOGUE_TEXT[tour.currentDialogue].message}
                maxWidth={340}
              >
                <button
                  onClick={tour.advanceDialogue}
                  className="text-[11px] text-orange-400 hover:text-orange-300 transition-colors mt-1"
                >
                  Got it →
                </button>
              </MascotBubble>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          className="text-center relative z-10 mt-2 pb-4"
          style={{ paddingBottom: tour.isTourActive ? "3.5rem" : "1rem" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              color: "rgba(250,245,235,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.05em",
            }}
          >
            {xrayOn
              ? "Each island teaches a business skill · Tap to explore"
              : "Tap an island to begin your journey"}
          </p>

          <button
            onClick={() => navigate("/")}
            className="mt-3 text-xs transition-colors"
            style={{ color: "rgba(250,245,235,0.2)", fontFamily: "'JetBrains Mono', monospace" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.6)")}
            onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.2)")}
          >
            ← Back to the Museum
          </button>
        </motion.div>
      </div>
    </MuseumShell>
  );
};

export default Archipelago;
