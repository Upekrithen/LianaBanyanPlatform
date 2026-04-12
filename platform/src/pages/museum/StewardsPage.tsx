/**
 * StewardsPage — Grid of 6 Steward Cards for Cold-Start pathways.
 * Route: /stewards
 * Each card shows pathway progress. Locked until member has a Golden Key.
 */
import { useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { StewardCard } from "@/components/museum/StewardCard";
import { RecipeSlot, NotCentsLegend } from "@/components/museum/RecipeSlot";
import { LRHCharacter } from "@/components/museum/LRHCharacter";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

const STEWARD_PATHWAYS = [
  {
    pathway: { id: "food", icon: "🍳", label: "Food", color: "#f97316" },
    bars: [
      { label: "Funding", current: 800, target: 3000, unit: "$" },
      { label: "Leadership", current: 0, target: 1 },
      { label: "Community", current: 12, target: 100 },
    ],
  },
  {
    pathway: { id: "manufacturing", icon: "🏭", label: "Make", color: "#64748b" },
    bars: [
      { label: "Funding", current: 2100, target: 5000, unit: "$" },
      { label: "Equipment", current: 1, target: 3 },
      { label: "Makers", current: 4, target: 50 },
    ],
  },
  {
    pathway: { id: "service", icon: "🔧", label: "Service", color: "#3b82f6" },
    bars: [
      { label: "Funding", current: 400, target: 2000, unit: "$" },
      { label: "Providers", current: 3, target: 50 },
      { label: "Bounties", current: 2, target: 15 },
    ],
  },
  {
    pathway: { id: "local-business", icon: "🏪", label: "Local", color: "#10b981" },
    bars: [
      { label: "Captains", current: 1, target: 5 },
      { label: "Businesses", current: 0, target: 20 },
      { label: "Onboarded", current: 0, target: 10 },
    ],
  },
  {
    pathway: { id: "guild", icon: "⚔️", label: "Guild", color: "#8b5cf6" },
    bars: [
      { label: "Guilds", current: 2, target: 10 },
      { label: "Members", current: 8, target: 100 },
      { label: "Treasuries", current: 0, target: 5, unit: "$" },
    ],
  },
  {
    pathway: { id: "tribe", icon: "🏕️", label: "Tribe", color: "#eab308" },
    bars: [
      { label: "Tribes", current: 1, target: 10 },
      { label: "Family Tables", current: 1, target: 5 },
      { label: "Events", current: 0, target: 5 },
    ],
  },
];

const EXAMPLE_RECIPE = {
  recipeName: "Project Launch",
  description: "Combine a Steward card with an Accountant and an Engineer to unlock a new project.",
  slots: [
    { cardType: "Steward", currency: "credit" as const, filled: true, cardName: "Food Steward" },
    { cardType: "Accountant", currency: "mark" as const, filled: false },
    { cardType: "Engineer", currency: "joule" as const, filled: false },
  ],
  resultType: "project_launch",
  resultDescription: "A new production project is created with its own Bridge dashboard, funding tracker, and crew roster.",
};

const StewardsPage = () => {
  const navigate = useNavigate();

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-lg mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-xl font-bold text-white mb-1">Steward Cards</h1>
          <p className="text-slate-400 text-sm mb-6">
            Each pathway needs a Steward — someone to turn the key and bring it to life.
          </p>

          {/* Judge Cat: what Stewards do and don't do */}
          <div className="mb-6">
            <SummonMascot
              mascotId="cat"
              topic="What Stewards do and don't do"
              startClosed
              message={
                <>
                  Stewards hold <strong>turn-keys</strong> for specific decisions — they don't run the
                  platform, they run the specific moment that needs a turnkey. Every Steward-held key
                  has a matching <em>Frame Lock</em> that prevents unilateral moves. A Steward can start
                  something. A Steward cannot extract from it.
                </>
              }
              helperMessage={
                <>
                  This is the difference between a Steward and a CEO. A CEO can redirect the ship.
                  A Steward can open a door the ship needs to go through. The ship still belongs to
                  everyone on board.
                </>
              }
            />
          </div>

          {/* Steward Card Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {STEWARD_PATHWAYS.map((sp) => (
              <StewardCard
                key={sp.pathway.id}
                pathway={sp.pathway}
                bars={sp.bars}
                onClick={() => navigate(`/build/${sp.pathway.id}`)}
              />
            ))}
          </div>

          {/* NotCents Legend */}
          <div className="mb-6">
            <p className="text-[10px] text-slate-500 text-center mb-2 uppercase tracking-widest">Currency Shapes</p>
            <NotCentsLegend />
          </div>

          {/* Example Recipe */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-2">How cards combine:</p>
            <RecipeSlot {...EXAMPLE_RECIPE} />
          </div>

          {/* LRH explanation */}
          <div className="flex items-start gap-3">
            <LRHCharacter size={28} />
            <MascotBubble
              message="Steward Cards are the keys to launching real projects. Collect the right combination and you unlock production capacity."
              showIcon={false}
              maxWidth={300}
            />
          </div>
        </motion.div>
      </div>
    </MuseumShell>
  );
};

export default StewardsPage;
