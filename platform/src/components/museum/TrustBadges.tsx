/**
 * TrustBadges — Three structural guarantees.
 * Zero PII / No VC / Cost Cap Locked.
 * Tap for one-paragraph explanation.
 */
import { useState } from "react";
import { ShieldCheck, Ban, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const badges = [
  {
    id: "pii",
    icon: ShieldCheck,
    label: "Zero PII",
    color: "#10b981",
    detail: "We collect no demographic data. No age, gender, race, or location requirements. Your ADAPT Score measures what you do, not who you are.",
  },
  {
    id: "vc",
    icon: Ban,
    label: "No VC",
    color: "#f59e0b",
    detail: "Zero venture capital. No investors to please. No growth-at-all-costs pressure. The platform is funded by its own $5/year memberships and Cost + 20% margin.",
  },
  {
    id: "cap",
    icon: Lock,
    label: "Cost Cap Locked",
    color: "#6366f1",
    detail: "The Cost + 20% margin is a Structural Bylaw. It cannot be changed by normal vote. It requires Founder approval. The price cap can never increase.",
  },
];

export function TrustBadges() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex gap-3 justify-center">
      {badges.map((badge) => {
        const Icon = badge.icon;
        const isOpen = expanded === badge.id;

        return (
          <div key={badge.id} className="relative">
            <button
              onClick={() => setExpanded(isOpen ? null : badge.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-slate-700/50 bg-slate-900/60 hover:bg-slate-800/60 transition-colors active:scale-[0.97]"
              aria-expanded={isOpen}
            >
              <Icon className="w-6 h-6" style={{ color: badge.color }} />
              <span className="text-[10px] text-slate-400 font-medium">{badge.label}</span>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 p-3 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300 leading-relaxed z-10 shadow-xl"
                >
                  {badge.detail}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

export default TrustBadges;
