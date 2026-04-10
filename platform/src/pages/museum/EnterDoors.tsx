/**
 * EnterDoors — The 3-door card back (submarine door #1).
 * Route: /enter
 */
import { useNavigate } from "react-router-dom";
import { DeckCardShell } from "@/components/museum/DeckCardShell";
import { DoorCard } from "@/components/museum/DoorCard";
import { motion } from "framer-motion";

const EnterDoors = () => {
  const navigate = useNavigate();

  return (
    <DeckCardShell>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex-1 flex flex-col justify-center"
      >
        <div className="w-full">
          <div className="flex flex-col gap-2.5 mb-4">
            <DoorCard icon="🔍" title="What is this?" subtitle="See what we built" to="/explore" accentColor="#10b981" />
            <DoorCard icon="🔨" title="I want to build" subtitle="Start making money" to="/build" accentColor="#3b82f6" delay={0.06} />
            <DoorCard icon="🤝" title="I'm ready" subtitle="Join for $5/year" to="/join" accentColor="#f59e0b" delay={0.12} />
          </div>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={() => navigate("/tour")}
              className="flex items-center gap-1.5 text-sm font-medium transition-all"
              style={{ color: "#f97316" }}
              onMouseOver={(e) => (e.currentTarget.style.textShadow = "0 0 8px rgba(249,115,22,0.4)")}
              onMouseOut={(e) => (e.currentTarget.style.textShadow = "none")}
            >
              <span>🔥</span> Take the WildFire Tour
            </button>
            <div className="flex items-center justify-center gap-4 text-sm">
              <button
                onClick={() => navigate(-1)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => navigate("/explore")}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                Not sure? Just explore →
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </DeckCardShell>
  );
};

export default EnterDoors;
