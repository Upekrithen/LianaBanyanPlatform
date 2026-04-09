/**
 * MirrorMirror — Keyhole unlock reveal (submarine door #5).
 * Route: /mirror
 */
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { motion } from "framer-motion";

const MirrorMirror = () => {
  const navigate = useNavigate();

  return (
    <DeckCardShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center px-2"
      >
        <div className="text-4xl mb-3">💎</div>
        <h2 style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1.3rem, 5vw, 1.8rem)", fontWeight: 700, color: "#38a169", marginBottom: "1rem" }}>
          Mirror Mirror
        </h2>
        <p style={{ color: "#faf5eb", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: "300px" }}>
          You found a keyhole. Hidden doors are scattered throughout
          — each one unlocks something different. This one opens
          Mirror Mirror, which translates the entire site into 50+
          languages. Fair means everyone can read it.
        </p>
        <div className="mt-4 mx-auto p-3 rounded-lg" style={{ background: "rgba(214, 158, 46, 0.08)", border: "1px solid rgba(214, 158, 46, 0.25)", maxWidth: "280px" }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-sm">🔑</span>
            <span style={{ color: "#d69e2e", fontSize: "0.75rem", fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em" }}>
              GOLDEN KEY — 1 of ?
            </span>
          </div>
          <p style={{ color: "rgba(250,245,235,0.6)", fontSize: "0.75rem", lineHeight: 1.5 }}>
            Collect golden keys to unlock Easter Egg Knowledge
            — hidden features, secret tools, and deeper layers.
          </p>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={() => navigate(-1)}
            className="py-2 px-4 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
          >
            ← Go Back
          </button>
          <button
            onClick={() => navigate("/library")}
            className="py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ background: "#38a169" }}
          >
            Go to Mirror Mirror →
          </button>
        </div>
      </motion.div>
    </DeckCardShell>
  );
};

export default MirrorMirror;
