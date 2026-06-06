/**
 * TourBanner — Persistent bottom banner during WildFire Tour.
 * Orange pill with fire icon + "Exit Tour" button.
 * Shows progress (islands flipped / 7).
 * K358 / B092.
 */
import { motion } from "framer-motion";
import { useArchipelagoTourSafe } from "@/contexts/ArchipelagoTourContext";
import { useLocation } from "react-router-dom";
import { Flame, X } from "lucide-react";

export function TourBanner() {
  const { isTourActive, endTour, flippedIslands } = useArchipelagoTourSafe();
  const { pathname } = useLocation();

  if (!isTourActive) return null;
  if (pathname === '/') return null;

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center pb-3 pt-2 pointer-events-none"
    >
      <div
        className="flex items-center gap-2.5 px-4 py-2 rounded-full pointer-events-auto shadow-lg"
        style={{
          background: "rgba(249, 115, 22, 0.92)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(249, 115, 22, 0.6)",
          boxShadow: "0 4px 20px rgba(249, 115, 22, 0.3)",
        }}
      >
        <Flame className="w-4 h-4 text-white" />
        <span
          className="text-white font-semibold text-xs tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          WildFire Tour
        </span>
        <span className="text-white/70 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          {flippedIslands.length}/7
        </span>
        <button
          onClick={endTour}
          className="ml-1 flex items-center gap-1 text-white/80 hover:text-white text-xs transition-colors"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <X className="w-3 h-3" />
          Exit
        </button>
      </div>
    </motion.div>
  );
}

export default TourBanner;
