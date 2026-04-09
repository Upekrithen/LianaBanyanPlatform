/**
 * StewardCard — A Deck Card that lets a member "turn-key" a cold-start project.
 * Each of the 6 pathways has a Steward Card. Collecting one means you've committed
 * to shepherd that pathway from concept to active production.
 *
 * Visual: 5:7 card ratio, pathway icon + color, "STEWARD" badge,
 * production bars showing what's needed to launch.
 */
import { motion } from "framer-motion";

interface StewardCardProps {
  pathway: {
    id: string;
    icon: string;
    label: string;
    color: string;
  };
  bars?: Array<{ label: string; current: number; target: number; unit?: string }>;
  unlocked?: boolean;
  onClick?: () => void;
}

const hexBg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='1'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`;

export function StewardCard({ pathway, bars = [], unlocked = false, onClick }: StewardCardProps) {
  return (
    <motion.div
      className="w-full max-w-[200px] mx-auto cursor-pointer"
      style={{ perspective: "600px" }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          background: "#0a1628",
          aspectRatio: "5/7",
          border: `2px solid ${unlocked ? pathway.color : "rgba(100,116,139,0.3)"}`,
          boxShadow: unlocked ? `0 0 20px ${pathway.color}30` : "none",
          transition: "border-color 0.3s, box-shadow 0.3s",
        }}
      >
        {/* Hex pattern */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: hexBg, backgroundRepeat: "repeat", opacity: 0.03 }} />

        <div className="relative z-10 flex flex-col items-center text-center p-4 h-full">
          {/* STEWARD badge */}
          <div
            className="px-3 py-0.5 rounded-full text-[9px] tracking-[0.2em] uppercase font-bold mb-3"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: `${pathway.color}20`,
              border: `1px solid ${pathway.color}40`,
              color: pathway.color,
            }}
          >
            STEWARD
          </div>

          {/* Pathway icon */}
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-3"
            style={{ background: `${pathway.color}15`, border: `1px solid ${pathway.color}30` }}
          >
            {pathway.icon}
          </div>

          {/* Pathway label */}
          <h3
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "'Crimson Pro', Georgia, serif", color: "#faf5eb" }}
          >
            {pathway.label}
          </h3>

          <p className="text-[10px] text-slate-500 mb-3">Turn-key this pathway</p>

          {/* Production bars (mini version) */}
          {bars.length > 0 && (
            <div className="w-full space-y-1.5 mt-auto">
              {bars.slice(0, 3).map((bar) => {
                const pct = Math.min((bar.current / bar.target) * 100, 100);
                return (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[8px] mb-0.5">
                      <span className="text-slate-500">{bar.label}</span>
                      <span className="text-slate-600 tabular-nums">{bar.current}/{bar.target}</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: pathway.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Lock/unlock indicator */}
          {!unlocked && (
            <div className="mt-auto pt-2">
              <span className="text-[10px] text-slate-600">🔒 Requires Golden Key</span>
            </div>
          )}
        </div>

        {/* LB corner marks */}
        <div className="absolute top-1.5 left-1.5 text-[6px] text-emerald-500/30 font-mono font-bold">LB</div>
        <div className="absolute top-1.5 right-1.5 text-[6px] text-emerald-500/30 font-mono font-bold" style={{ transform: "rotate(90deg)" }}>LB</div>
        <div className="absolute bottom-1.5 left-1.5 text-[6px] text-emerald-500/30 font-mono font-bold" style={{ transform: "rotate(270deg)" }}>LB</div>
        <div className="absolute bottom-1.5 right-1.5 text-[6px] text-emerald-500/30 font-mono font-bold" style={{ transform: "rotate(180deg)" }}>LB</div>
      </div>
    </motion.div>
  );
}

export default StewardCard;
