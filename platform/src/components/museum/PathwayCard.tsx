/**
 * PathwayCard — One of the 6 cold-start pathway cards in Door 2.
 * 2x3 grid on mobile. Icon + one word + subtitle.
 */
import { motion } from "framer-motion";

export interface Pathway {
  id: string;
  icon: string;
  label: string;
  subtitle: string;
  color: string;
}

export const PATHWAYS: Pathway[] = [
  { id: "food", icon: "🍳", label: "Food", subtitle: "Feed your family better", color: "#f97316" },
  { id: "manufacturing", icon: "🏭", label: "Make", subtitle: "Build real things", color: "#64748b" },
  { id: "service", icon: "🔧", label: "Service", subtitle: "Use your skills", color: "#3b82f6" },
  { id: "local-business", icon: "🏪", label: "Local", subtitle: "Bring your business", color: "#10b981" },
  { id: "guild", icon: "⚔️", label: "Guild", subtitle: "Organize your trade", color: "#8b5cf6" },
  { id: "tribe", icon: "🏕️", label: "Tribe", subtitle: "Connect your people", color: "#eab308" },
];

interface PathwayCardProps {
  pathway: Pathway;
  onSelect: (id: string) => void;
  index: number;
}

export function PathwayCard({ pathway, onSelect, index }: PathwayCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(pathway.id)}
      className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800/80 transition-colors active:scale-[0.97] text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-2"
        style={{ background: `${pathway.color}15`, border: `1px solid ${pathway.color}30` }}
      >
        {pathway.icon}
      </div>
      <div className="text-white font-semibold text-sm">{pathway.label}</div>
      <div className="text-slate-400 text-xs mt-0.5">{pathway.subtitle}</div>
    </motion.button>
  );
}

export default PathwayCard;
