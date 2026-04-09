/**
 * Door 2: "I want to build something" — The Maker
 * 6-pathway grid → pathway detail with Creator Gauge + Production Bars.
 * Tapping a pathway shows its detail view. Back button returns to grid.
 */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { PathwayCard, PATHWAYS } from "@/components/museum/PathwayCard";
import { CreatorGauge } from "@/components/museum/CreatorGauge";
import { ProductionBars } from "@/components/museum/ProductionBars";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const pathwayDetails: Record<string, {
  tagline: string;
  bars: Array<{ label: string; current: number; target: number; unit?: string }>;
}> = {
  food: {
    tagline: "Cook meals. Deliver joy. Keep 83.3%.",
    bars: [
      { label: "Funding", current: 800, target: 3000, unit: "$" },
      { label: "Leadership", current: 0, target: 1 },
      { label: "Auditors", current: 0, target: 25 },
      { label: "Community", current: 12, target: 100 },
    ],
  },
  manufacturing: {
    tagline: "Make real things. Desktop injection molding. Earn Marks.",
    bars: [
      { label: "Funding", current: 2100, target: 5000, unit: "$" },
      { label: "Equipment", current: 1, target: 3 },
      { label: "Makers", current: 4, target: 50 },
      { label: "Bounties posted", current: 7, target: 20 },
    ],
  },
  service: {
    tagline: "Your skills. Your rates. 83.3% yours.",
    bars: [
      { label: "Funding", current: 400, target: 2000, unit: "$" },
      { label: "Service providers", current: 3, target: 50 },
      { label: "Active bounties", current: 2, target: 15 },
      { label: "Reviews", current: 0, target: 10 },
    ],
  },
  "local-business": {
    tagline: "Bring your customers. Pay less than DoorDash.",
    bars: [
      { label: "Captains", current: 1, target: 5 },
      { label: "Local businesses", current: 0, target: 20 },
      { label: "Pitch packets sent", current: 3, target: 50 },
      { label: "Onboarded", current: 0, target: 10 },
    ],
  },
  guild: {
    tagline: "Organize your trade. Treasury. Volume discounts. Identity.",
    bars: [
      { label: "Guilds formed", current: 2, target: 10 },
      { label: "Members across guilds", current: 8, target: 100 },
      { label: "Guild treasuries", current: 0, target: 5, unit: "$" },
      { label: "Benefit cascades", current: 0, target: 3 },
    ],
  },
  tribe: {
    tagline: "Your church. Your block. Your people. Connected.",
    bars: [
      { label: "Tribes formed", current: 1, target: 10 },
      { label: "Family Tables active", current: 1, target: 5 },
      { label: "Shared meal plans", current: 0, target: 10 },
      { label: "Community events", current: 0, target: 5 },
    ],
  },
};

const Door2Pathways = () => {
  const navigate = useNavigate();
  const { pathway: urlPathway } = useParams<{ pathway?: string }>();
  const [selected, setSelected] = useState<string | null>(urlPathway || null);

  const handleSelect = (id: string) => {
    setSelected(id);
    window.history.replaceState(null, "", `/build/${id}`);
  };

  const handleBack = () => {
    setSelected(null);
    window.history.replaceState(null, "", "/build");
  };

  const pathwayData = selected ? PATHWAYS.find((p) => p.id === selected) : null;
  const detail = selected ? pathwayDetails[selected] : null;

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!selected ? (
            /* Pathway Grid */
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h1 className="text-xl font-bold text-white mb-1">Pick your starting path.</h1>
              <p className="text-slate-400 text-sm mb-6">You can branch later.</p>

              <div className="grid grid-cols-2 gap-3">
                {PATHWAYS.map((p, i) => (
                  <PathwayCard key={p.id} pathway={p} onSelect={handleSelect} index={i} />
                ))}
              </div>

              <div className="mt-6 flex items-start gap-3">
                <LRHCharacter size={28} />
                <MascotBubble
                  message="Tap the one that feels right. You can always switch."
                  showIcon={false}
                  maxWidth={280}
                />
              </div>
            </motion.div>
          ) : (
            /* Pathway Detail */
            <motion.div
              key={`detail-${selected}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> All pathways
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{pathwayData?.icon}</span>
                <h1 className="text-xl font-bold text-white">{pathwayData?.label}</h1>
              </div>
              <p className="text-slate-400 text-sm mb-6">{detail?.tagline}</p>

              {/* Creator Gauge */}
              <CreatorGauge />

              {/* Production Bars */}
              <div className="mt-6 p-4 rounded-xl border border-slate-700/50 bg-slate-900/60">
                <div className="text-xs text-slate-400 mb-3">What's needed to launch:</div>
                <ProductionBars bars={detail?.bars || []} />
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={() => navigate("/join")}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  Join and start →
                </button>
                <button
                  onClick={() => navigate("/browse")}
                  className="w-full py-2.5 px-4 rounded-lg border border-slate-600 text-slate-400 hover:text-slate-200 text-sm transition-colors"
                >
                  Browse first →
                </button>
              </div>

              {/* LRH */}
              <div className="mt-6 flex items-start gap-3">
                <LRHCharacter size={28} />
                <MascotBubble
                  message="This is real. Those bars fill as people join and contribute."
                  showIcon={false}
                  maxWidth={280}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MuseumShell>
  );
};

export default Door2Pathways;
