/**
 * Door 1: "What is this?" — The Curious Visitor
 * LRH appears with an offer to guide. 5-stop tour, user-paced.
 * Exits to Ghost World, Door 2, or Door 3.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { CreatorGauge } from "@/components/museum/CreatorGauge";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { useXRay } from "@/components/museum/XRayContext";
import { TrustBadges } from "@/components/museum/TrustBadges";
import { motion, AnimatePresence } from "framer-motion";

interface TourStop {
  title: string;
  message: string;
  content: React.ReactNode;
}

const Door1Tour = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [stop, setStop] = useState(0);
  const [lrhHovered, setLrhHovered] = useState(false);
  const { xrayOn } = useXRay();

  const stops: TourStop[] = [
    {
      title: "Stop 1: The Deal",
      message: "When you sell something here, you keep 83.3%. Every time. The platform takes Cost + 20% — that's it. Slide the price to see what you'd keep.",
      content: <CreatorGauge />,
    },
    {
      title: "Stop 2: Where the 20% Goes",
      message: "That 20%? It doesn't go to investors. It funds 16 programs — food, healthcare, legal protection, education. Real initiatives with real progress bars.",
      content: (
        <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
          {["🍳 Food", "🏥 Health", "⚖️ Legal", "📚 Education", "🏠 Housing", "🚗 Transport", "🏭 Making", "🎨 Design", "💼 Business", "🔧 Service", "🏕️ Community", "🛡️ Defense", "📡 Network", "🗳️ Governance", "🎭 Culture", "🌍 Expansion"].map((item) => (
            <div key={item} className="text-center p-2 rounded-lg bg-slate-800/50 border border-slate-700/40">
              <div className="text-sm">{item.split(" ")[0]}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">{item.split(" ")[1]}</div>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "Stop 3: Who Decides",
      message: "This isn't run by a CEO. 300 people govern it — Crowns, Board, Captains. Real names. Real accountability. You can see who's been invited.",
      content: (
        <div className="max-w-sm mx-auto p-4 rounded-xl border border-slate-700/50 bg-slate-900/60">
          <div className="text-xs text-slate-400 mb-3">The 300 — Governance Seats</div>
          <div className="w-full h-4 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div className="h-full rounded-full bg-amber-500/80" style={{ width: "12%" }} />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>12 of 300 seats filled</span>
            <span>4%</span>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            {["Crowns", "Board", "Captains"].map((role) => (
              <span key={role} className="text-[10px] px-2 py-1 rounded-full border border-slate-600 text-slate-400">
                {role}
              </span>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Stop 4: No Tricks",
      message: "No ads. No data collection. No venture capital. The price cap can never increase. This is structural — it's in the bylaws, not a marketing promise.",
      content: <TrustBadges />,
    },
    {
      title: "Stop 5: Your Turn",
      message: "That's the 90-second version. What do you want to do?",
      content: (
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          <TourExitButton
            icon="🔍"
            label="Let me browse first"
            sublabel="Free exploration, no signup"
            onClick={() => navigate("/browse")}
          />
          <TourExitButton
            icon="🔨"
            label="I want to build something"
            sublabel="See 6 pathways"
            onClick={() => navigate("/build")}
          />
          <TourExitButton
            icon="🤝"
            label="I'm in — let me join"
            sublabel="$5/year, full access"
            onClick={() => navigate("/join")}
          />
        </div>
      ),
    },
  ];

  // Intro screen before tour starts
  if (!started) {
    return (
      <MuseumShell hideFabs>
        <div className="min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="mb-6 flex justify-center"
              onMouseEnter={() => setLrhHovered(true)}
              onMouseLeave={() => setLrhHovered(false)}
            >
              <LRHCharacter size={80} />
            </div>
            <MascotBubble
              title={lrhHovered && !xrayOn ? "Put Your GOGGLES On!!" : "Hey! I'm the Little Red Hen."}
              message={lrhHovered && !xrayOn
                ? "Click me to activate X-Ray Goggles and see what's hidden."
                : xrayOn
                  ? "X-Ray Goggles are ON. You can see the hidden keyholes now. Click me again to turn them off."
                  : "The value is in the services and products provided through Liana Banyan. Let me show you what we built. It takes 90 seconds. Click me for Xray Mode."
              }
              maxWidth={320}
            >
              <div className="flex flex-col gap-2 mt-3">
                <button
                  onClick={() => setStarted(true)}
                  className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  Show me →
                </button>
                <button
                  onClick={() => navigate("/browse")}
                  className="w-full py-2 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  I'll explore on my own
                </button>
              </div>
            </MascotBubble>
          </motion.div>
        </div>
      </MuseumShell>
    );
  }

  const current = stops[stop];
  const isLast = stop === stops.length - 1;

  return (
    <MuseumShell hideFabs>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {stops.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === stop ? "bg-emerald-400" : i < stop ? "bg-emerald-700" : "bg-slate-700"
              }`}
            />
          ))}
        </div>

        {/* LRH speech bubble */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stop}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start gap-3 mb-6">
              <LRHCharacter size={36} />
              <MascotBubble
                title={current.title}
                message={current.message}
                maxWidth={340}
                showIcon={false}
              />
            </div>

            {/* Interactive content */}
            <div className="my-6">{current.content}</div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {!isLast && (
          <div className="mt-auto flex justify-between items-center pt-6">
            <button
              onClick={() => setStop(Math.max(0, stop - 1))}
              className={`text-sm text-slate-500 hover:text-slate-300 transition-colors ${stop === 0 ? "invisible" : ""}`}
            >
              ← Back
            </button>
            <button
              onClick={() => setStop(stop + 1)}
              className="py-2.5 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </MuseumShell>
  );
};

function TourExitButton({ icon, label, sublabel, onClick }: { icon: string; label: string; sublabel: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800/80 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <div>
          <div className="text-white text-sm font-medium">{label}</div>
          <div className="text-slate-400 text-xs">{sublabel}</div>
        </div>
      </div>
    </button>
  );
}

export default Door1Tour;
