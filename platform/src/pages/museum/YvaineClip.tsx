/**
 * YvaineClip — "What do stars do? SHINE." YouTube embed (submarine door #6).
 * Route: /yvaine
 */
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { motion } from "framer-motion";

const YvaineClip = () => {
  const navigate = useNavigate();

  return (
    <DeckCardShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center px-2"
      >
        <h2 className="mb-3" style={{ fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "clamp(1rem, 3.5vw, 1.3rem)", fontWeight: 700, color: "#faf5eb" }}>
          ✨ What do stars do?
        </h2>
        <div className="w-full rounded-lg overflow-hidden" style={{ maxWidth: "320px", aspectRatio: "16/9" }}>
          <iframe
            src="https://www.youtube.com/embed/QJil32g386E?autoplay=1&start=0&rel=0&modestbranding=1"
            title="Yvaine — What do stars do? They SHINE."
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
        <p className="mt-3 text-xs italic" style={{ color: "rgba(250,245,235,0.5)" }}>
          — Yvaine, Stardust (2007)
        </p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 py-2 px-5 rounded-lg border border-slate-600 text-slate-300 text-sm hover:bg-slate-800/50 transition-colors"
        >
          ← Back
        </button>
      </motion.div>
    </DeckCardShell>
  );
};

export default YvaineClip;
