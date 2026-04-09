/**
 * DoorCard — Full-width entry card for the 3-door home screen.
 * Each door has an icon, title, subtitle, and routes to a different journey.
 */
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface DoorCardProps {
  icon: string;
  title: string;
  subtitle: string;
  to: string;
  accentColor: string;
  delay?: number;
}

export function DoorCard({ icon, title, subtitle, to, accentColor, delay = 0 }: DoorCardProps) {
  const navigate = useNavigate();

  return (
    <motion.button
      onClick={() => navigate(to)}
      className="w-full text-left p-5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800/80 transition-colors active:scale-[0.98] group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 + delay }}
    >
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}40` }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-base group-hover:text-slate-50">
            {title}
          </div>
          <div className="text-slate-400 text-sm mt-0.5">{subtitle}</div>
        </div>
        <div className="text-slate-600 group-hover:text-slate-400 transition-colors text-lg">
          →
        </div>
      </div>
    </motion.button>
  );
}

export default DoorCard;
