/**
 * TreasureMapScroll — Parchment-style Deck Card at the center of the Archipelago.
 * Front: rolled-up scroll visual. Back: cryptic map clue pointing to Harvest Island.
 * Route: /hexisle/scroll
 * Uses DeckCardShell for consistent Multiverse Iteration appearance.
 * Introduced K376.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw } from "lucide-react";

const TreasureMapScroll = () => {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const [flipped, setFlipped] = useState(false);

  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";
  const parchmentBg = "linear-gradient(135deg, rgba(139,119,80,0.15), rgba(80,65,40,0.08), rgba(139,119,80,0.12))";

  return (
    <DeckCardShell>
      <AnimatePresence mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col items-center justify-between text-center cursor-pointer"
            onClick={() => setFlipped(true)}
          >
            <div className="w-full flex items-center justify-between">
              <button
                onClick={(e) => { e.stopPropagation(); navigate("/hexisle"); }}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <ArrowLeft className="w-3 h-3" /> Map
              </button>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.55rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "rgba(250,245,235,0.25)",
                }}
              >
                Treasure Map
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {/* Scroll visual */}
              <div
                style={{
                  width: "140px",
                  height: "180px",
                  borderRadius: "8px",
                  background: parchmentBg,
                  border: `1px solid ${accentColor}40`,
                  boxShadow: `0 0 30px rgba(201,169,110,0.1), inset 0 0 20px rgba(201,169,110,0.08)`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  overflow: "hidden",
                  marginBottom: "1.2rem",
                  transition: "border-color 0.5s ease",
                }}
              >
                {/* Torn edge top */}
                <div style={{
                  position: "absolute", top: 0, left: 0, right: 0, height: "6px",
                  background: "repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(139,119,80,0.3) 8px, rgba(139,119,80,0.3) 10px)",
                }} />
                {/* Torn edge bottom */}
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "6px",
                  background: "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(139,119,80,0.3) 6px, rgba(139,119,80,0.3) 9px)",
                }} />

                {/* Decorative compass */}
                <svg width="60" height="60" viewBox="0 0 60 60" style={{ opacity: 0.5, marginBottom: "8px" }}>
                  <circle cx="30" cy="30" r="24" fill="none" stroke={accentColor} strokeWidth="1" opacity="0.4" />
                  <circle cx="30" cy="30" r="2" fill={accentColor} opacity="0.6" />
                  <line x1="30" y1="6" x2="30" y2="18" stroke={accentColor} strokeWidth="1.5" opacity="0.5" />
                  <line x1="30" y1="42" x2="30" y2="54" stroke={accentColor} strokeWidth="1" opacity="0.3" />
                  <line x1="6" y1="30" x2="18" y2="30" stroke={accentColor} strokeWidth="1" opacity="0.3" />
                  <line x1="42" y1="30" x2="54" y2="30" stroke={accentColor} strokeWidth="1" opacity="0.3" />
                  <text x="30" y="4" textAnchor="middle" fill={accentColor} fontSize="5" fontFamily="'Crimson Pro', serif" opacity="0.6">N</text>
                </svg>

                <div style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "0.65rem",
                  color: accentColor,
                  opacity: 0.7,
                  fontStyle: "italic",
                  textAlign: "center",
                  padding: "0 12px",
                  transition: "color 0.5s ease",
                }}>
                  The way forward
                  <br />begins where you stand.
                </div>
              </div>

              <h1
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "clamp(1.2rem, 5vw, 1.6rem)",
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: "0.25rem",
                  transition: "color 0.5s ease",
                }}
              >
                The Treasure Map
              </h1>

              <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.7rem", fontStyle: "italic" }}>
                {xrayOn ? "Your onboarding compass" : "A clue, for those who seek."}
              </p>
            </div>

            <div className="flex items-center gap-1.5" style={{ color: "rgba(250,245,235,0.2)", fontSize: "0.6rem" }}>
              <RotateCcw className="w-3 h-3" />
              <span>Tap to unroll</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: 90, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setFlipped(false)}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <RotateCcw className="w-3 h-3" /> Roll up
              </button>
              <span style={{ fontSize: "0.55rem", color: accentColor, fontFamily: "'JetBrains Mono', monospace", transition: "color 0.5s ease" }}>
                {xrayOn ? "Onboarding" : "The Riddle"}
              </span>
            </div>

            <h2
              style={{
                fontFamily: "'Crimson Pro', Georgia, serif",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: accentColor,
                marginBottom: "0.75rem",
                transition: "color 0.5s ease",
              }}
            >
              {xrayOn ? "Your Journey Starts Here" : "The First Clue"}
            </h2>

            <div className="flex-1 overflow-y-auto pr-1">
              {xrayOn ? (
                <>
                  <p style={{ color: "rgba(250,245,235,0.7)", fontSize: "0.72rem", lineHeight: 1.7, marginBottom: "0.6rem" }}>
                    Every journey through the Archipelago begins at <strong style={{ color: "#22d3ee" }}>Harvest Island</strong> — the
                    southernmost point. There you'll find Verdana, the port city, with 12 districts
                    that map to real business functions.
                  </p>
                  <p style={{ color: "rgba(250,245,235,0.7)", fontSize: "0.72rem", lineHeight: 1.7, marginBottom: "0.6rem" }}>
                    Work your way north through 7 islands, each teaching a different business skill:
                    Manufacturing, Sales, R&D, Competition, Quality, Service, and Leadership.
                  </p>
                  <p style={{ color: "rgba(250,245,235,0.7)", fontSize: "0.72rem", lineHeight: 1.7 }}>
                    The Ghost World (game layer) and Real World (business layer) are two views of the
                    same content — flip between them with X-Ray Goggles.
                  </p>
                </>
              ) : (
                <>
                  <p style={{ color: "rgba(201,169,110,0.8)", fontSize: "0.78rem", lineHeight: 1.8, fontStyle: "italic", fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: "0.8rem" }}>
                    "Where waves meet stone and starving hands reach toward a stubborn tree,
                    there lies the first harvest. Begin at the southern shore."
                  </p>
                  <p style={{ color: "rgba(201,169,110,0.6)", fontSize: "0.72rem", lineHeight: 1.7, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: "0.8rem" }}>
                    "A star above a cave marks the coordinates no one remembers.
                    Find the glow. Follow it. The island chain stretches north — seven trials,
                    seven skills, one way home."
                  </p>
                  <p style={{ color: "rgba(201,169,110,0.5)", fontSize: "0.68rem", lineHeight: 1.7, fontFamily: "'Crimson Pro', Georgia, serif" }}>
                    "When the five keys are found and the portal opens,
                    the door through the dark sea awaits.
                    But first — you must harvest."
                  </p>
                </>
              )}
            </div>

            {/* CTA to Harvest */}
            <button
              onClick={() => navigate("/hexisle/harvest")}
              className="mt-3 w-full py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.98]"
              style={{
                background: accentColor,
                color: "#0a1628",
                fontFamily: "'Crimson Pro', Georgia, serif",
                transition: "background 0.5s ease",
              }}
            >
              {xrayOn ? "Begin at Harvest Island →" : "Sail to the Southern Shore →"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </DeckCardShell>
  );
};

export default TreasureMapScroll;
