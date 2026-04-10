/**
 * SubmissionsPedestal — Community submissions gallery & submit flow (K385).
 * Route: /hexisle/submissions
 *
 * Members view featured/approved submissions and submit their own work
 * (art, writing, code, designs, music, maps, characters).
 * Submissions go through a review pipeline before appearing on the pedestal.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { useXRay } from "@/components/museum/XRayContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Star, ThumbsUp, Trophy, Eye } from "lucide-react";

type PedestalView = "gallery" | "submit" | "detail";

const SUBMISSION_TYPES = [
  { id: "art", label: "Art", icon: "🎨" },
  { id: "writing", label: "Writing", icon: "✍️" },
  { id: "code", label: "Code", icon: "💻" },
  { id: "design", label: "Design", icon: "📐" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "map", label: "Map", icon: "🗺️" },
  { id: "character", label: "Character", icon: "🧙" },
  { id: "other", label: "Other", icon: "📦" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "#eab308",
  reviewing: "#3b82f6",
  approved: "#38a169",
  featured: "#f59e0b",
  rejected: "#ef4444",
  revision_requested: "#f97316",
};

interface FeaturedSubmission {
  id: string;
  title: string;
  submitter: string;
  type: string;
  icon: string;
  stars: number;
  status: string;
}

const FEATURED: FeaturedSubmission[] = [
  { id: "f1", title: "Harvest Island — Sunrise", submitter: "Artist Guild", type: "art", icon: "🎨", stars: 12, status: "featured" },
  { id: "f2", title: "The Navigator's Log", submitter: "Caleb J.", type: "writing", icon: "✍️", stars: 8, status: "featured" },
  { id: "f3", title: "Battle Island Theme", submitter: "Sound Forge", type: "music", icon: "🎵", stars: 15, status: "featured" },
];

const SubmissionsPedestal = () => {
  const navigate = useNavigate();
  const { xrayOn } = useXRay();
  const [view, setView] = useState<PedestalView>("gallery");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const accentColor = xrayOn ? "#22d3ee" : "#c9a96e";

  return (
    <DeckCardShell>
      <AnimatePresence mode="wait">
        {view === "gallery" ? (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
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
                PEDESTAL
              </span>
            </div>

            {/* Title */}
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Trophy className="w-4 h-4" style={{ color: accentColor }} />
                <h1
                  style={{
                    fontFamily: "'Crimson Pro', Georgia, serif",
                    fontSize: "clamp(1.2rem, 4vw, 1.5rem)",
                    fontWeight: 700,
                    color: accentColor,
                  }}
                >
                  Submissions Pedestal
                </h1>
              </div>
              <p style={{ color: "rgba(250,245,235,0.4)", fontSize: "0.65rem", fontStyle: "italic" }}>
                {xrayOn
                  ? "Community-reviewed creative contributions"
                  : "Where legends display their craft."}
              </p>
            </div>

            {/* Featured submissions */}
            <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
              <p
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(250,245,235,0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.05em",
                }}
              >
                FEATURED
              </p>
              {FEATURED.map((sub) => (
                <motion.button
                  key={sub.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg text-left w-full"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${STATUS_COLORS[sub.status]}20`,
                    transition: "all 0.2s ease",
                  }}
                  whileHover={{ scale: 1.02, background: "rgba(255,255,255,0.04)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setView("detail")}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: `${STATUS_COLORS[sub.status]}15`,
                      fontSize: "1.2rem",
                    }}
                  >
                    {sub.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(250,245,235,0.85)" }}>
                      {sub.title}
                    </div>
                    <div style={{ fontSize: "0.55rem", color: "rgba(250,245,235,0.4)" }}>
                      by {sub.submitter}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3" style={{ color: "#f59e0b" }} />
                    <span style={{ fontSize: "0.6rem", color: "#f59e0b" }}>{sub.stars}</span>
                  </div>
                </motion.button>
              ))}

              {/* Empty My Submissions (placeholder) */}
              <p
                className="mt-2"
                style={{
                  fontSize: "0.55rem",
                  color: "rgba(250,245,235,0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                  letterSpacing: "0.05em",
                }}
              >
                MY SUBMISSIONS
              </p>
              <div
                className="flex items-center justify-center p-4 rounded-lg"
                style={{
                  background: "rgba(255,255,255,0.015)",
                  border: "1px dashed rgba(250,245,235,0.08)",
                }}
              >
                <p style={{ fontSize: "0.65rem", color: "rgba(250,245,235,0.3)", textAlign: "center" }}>
                  No submissions yet. Share your talent with the Archipelago.
                </p>
              </div>
            </div>

            {/* Submit CTA */}
            <motion.button
              onClick={() => setView("submit")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg mt-2"
              style={{
                background: `${accentColor}12`,
                border: `1px solid ${accentColor}30`,
                color: accentColor,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.75rem",
                letterSpacing: "0.05em",
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Upload className="w-4 h-4" />
              Submit Work
            </motion.button>
          </motion.div>
        ) : view === "submit" ? (
          <motion.div
            key="submit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => { setView("gallery"); setSelectedType(null); }}
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
                NEW SUBMISSION
              </span>
            </div>

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
              What are you sharing?
            </h2>

            {/* Type grid */}
            <div className="flex-1 grid grid-cols-2 gap-2 content-start overflow-y-auto">
              {SUBMISSION_TYPES.map((st) => {
                const isSelected = selectedType === st.id;
                return (
                  <motion.button
                    key={st.id}
                    onClick={() => setSelectedType(st.id)}
                    className="flex flex-col items-center p-3 rounded-lg text-center"
                    style={{
                      background: isSelected ? `${accentColor}15` : "rgba(255,255,255,0.02)",
                      border: `1px solid ${isSelected ? `${accentColor}40` : "rgba(250,245,235,0.08)"}`,
                      transition: "all 0.2s ease",
                    }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span className="text-xl mb-1">{st.icon}</span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "rgba(250,245,235,0.8)" }}>
                      {st.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Continue button */}
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
              }}
              whileHover={selectedType ? { scale: 1.02 } : {}}
              whileTap={selectedType ? { scale: 0.98 } : {}}
            >
              <Upload className="w-4 h-4" />
              {selectedType ? "Continue" : "Select a type"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setView("gallery")}
                className="text-xs flex items-center gap-1 transition-colors"
                style={{ color: "rgba(250,245,235,0.35)" }}
                onMouseOver={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.7)")}
                onMouseOut={(e) => (e.currentTarget.style.color = "rgba(250,245,235,0.35)")}
              >
                <ArrowLeft className="w-3 h-3" /> Gallery
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div
                className="w-20 h-20 rounded-xl flex items-center justify-center mb-3"
                style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", fontSize: "2rem" }}
              >
                🎨
              </div>
              <h2
                style={{
                  fontFamily: "'Crimson Pro', Georgia, serif",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: accentColor,
                  marginBottom: 4,
                }}
              >
                Harvest Island — Sunrise
              </h2>
              <p style={{ fontSize: "0.6rem", color: "rgba(250,245,235,0.4)", marginBottom: 8 }}>
                by Artist Guild
              </p>
              <p style={{ fontSize: "0.7rem", color: "rgba(250,245,235,0.6)", lineHeight: 1.6, maxWidth: "90%" }}>
                A stunning depiction of dawn breaking over the desolate beach where every journey begins.
                The thin tree on the distant hill catches the first light.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <button className="flex items-center gap-1 transition-colors" style={{ color: "#38a169", fontSize: "0.65rem" }}>
                  <ThumbsUp className="w-3.5 h-3.5" /> 24
                </button>
                <button className="flex items-center gap-1 transition-colors" style={{ color: "#f59e0b", fontSize: "0.65rem" }}>
                  <Star className="w-3.5 h-3.5" /> 12
                </button>
                <span className="flex items-center gap-1" style={{ color: "rgba(250,245,235,0.3)", fontSize: "0.65rem" }}>
                  <Eye className="w-3.5 h-3.5" /> 87
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DeckCardShell>
  );
};

export default SubmissionsPedestal;
