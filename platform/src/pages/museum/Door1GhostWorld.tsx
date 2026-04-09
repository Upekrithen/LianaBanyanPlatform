/**
 * Door 1 Exit: Ghost World — Free browse mode.
 * Full platform preview with Ghost Credits (fake currency).
 * Persistent bottom banner: "Exploring freely — join when ready."
 * NO signup wall. They can stay here forever.
 */
import { MuseumShell } from "@/components/museum/MuseumShell";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Ghost, ShoppingBag, Users, Lightbulb, Compass, Home } from "lucide-react";

const browseAreas = [
  { icon: ShoppingBag, label: "Marketplace", desc: "Browse what creators sell", color: "#10b981" },
  { icon: Users, label: "Guilds & Tribes", desc: "See professional and personal groups", color: "#8b5cf6" },
  { icon: Lightbulb, label: "Initiatives", desc: "16 programs being built", color: "#f59e0b" },
  { icon: Compass, label: "Guided Tour", desc: "252-item curated walk", color: "#3b82f6" },
  { icon: Home, label: "Housing", desc: "The housing hub", color: "#ec4899" },
  { icon: Ghost, label: "HexIsle", desc: "7-island world", color: "#06b6d4" },
];

const Door1GhostWorld = () => {
  const navigate = useNavigate();

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-32 max-w-md mx-auto">
        {/* Ghost mode header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
            <Ghost className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-xs font-medium">Ghost World — Free Exploration</span>
          </div>
          <h1 className="text-xl font-bold text-white">Browse Everything</h1>
          <p className="text-slate-400 text-sm mt-1">
            You have 100 Ghost Credits to play with. Nothing is real yet.
          </p>
        </motion.div>

        {/* Ghost Credit balance */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-slate-900/60 border border-purple-500/20">
          <Ghost className="w-5 h-5 text-purple-400" />
          <span className="text-purple-300 text-lg font-bold tabular-nums">100</span>
          <span className="text-purple-400/60 text-sm">Ghost Credits</span>
        </div>

        {/* Browse areas grid */}
        <div className="grid grid-cols-2 gap-3">
          {browseAreas.map((area, i) => {
            const Icon = area.icon;
            return (
              <motion.button
                key={area.label}
                className="flex flex-col items-center p-4 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/60 transition-colors active:scale-[0.97] text-center"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
              >
                <Icon className="w-8 h-8 mb-2" style={{ color: area.color }} />
                <div className="text-white text-sm font-medium">{area.label}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">{area.desc}</div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Persistent join banner */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 border-t border-slate-700/50 backdrop-blur-sm px-4 py-3 safe-area-bottom">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex-1">
            Exploring freely — your progress saves when you join
          </div>
          <button
            onClick={() => navigate("/join")}
            className="shrink-0 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors"
          >
            Join $5/yr →
          </button>
        </div>
      </div>
    </MuseumShell>
  );
};

export default Door1GhostWorld;
