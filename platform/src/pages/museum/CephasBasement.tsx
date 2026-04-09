/**
 * Cephas Basement — Always-accessible library.
 * Three depth choices (Skipping Stones / Wading In / Deep Dive).
 * Search, Guided Tour, Browse by Topic.
 * The underground complex beneath the museum.
 */
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { motion } from "framer-motion";
import { BookOpen, Search, Compass, Grid3X3, ArrowLeft } from "lucide-react";

type Depth = "stones" | "wading" | "deep";

const depths: Array<{
  id: Depth;
  icon: string;
  label: string;
  sublabel: string;
  description: string;
  color: string;
}> = [
  {
    id: "stones",
    icon: "☕",
    label: "Skipping Stones",
    sublabel: "2-min reads",
    description: "Quick takes on big ideas. Skim the surface.",
    color: "#10b981",
  },
  {
    id: "wading",
    icon: "🏊",
    label: "Wading In",
    sublabel: "10-min articles",
    description: "Full articles that explain the system piece by piece.",
    color: "#3b82f6",
  },
  {
    id: "deep",
    icon: "🤿",
    label: "Deep Dive",
    sublabel: "Full papers",
    description: "Academic research papers with citations and data.",
    color: "#8b5cf6",
  },
];

const depthMap: Record<string, Depth> = { stones: "stones", wading: "wading", deep: "deep" };

const CephasBasement = () => {
  const { depth: urlDepth } = useParams<{ depth?: string }>();
  const navigate = useNavigate();
  const [selectedDepth, setSelectedDepth] = useState<Depth | null>(
    urlDepth ? depthMap[urlDepth] || null : null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelectDepth = (d: Depth) => {
    setSelectedDepth(d);
    window.history.replaceState(null, "", `/library/${d}`);
  };

  const handleBack = () => {
    setSelectedDepth(null);
    window.history.replaceState(null, "", "/library");
  };

  if (selectedDepth) {
    const depthInfo = depths.find((d) => d.id === selectedDepth)!;
    return (
      <MuseumShell>
        <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cephas Library
          </button>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{depthInfo.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-white">{depthInfo.label}</h1>
              <p className="text-slate-400 text-sm">{depthInfo.description}</p>
            </div>
          </div>

          {/* Search within depth */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${depthInfo.label.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-500"
            />
          </div>

          {/* Placeholder content grid */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                className="p-4 rounded-xl border border-slate-700/40 bg-slate-900/50"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="h-3 w-2/3 rounded bg-slate-700/50 mb-2" />
                <div className="h-2 w-full rounded bg-slate-800/50 mb-1" />
                <div className="h-2 w-4/5 rounded bg-slate-800/50" />
              </motion.div>
            ))}
          </div>

          <p className="text-slate-500 text-xs text-center mt-6">
            Content loads from Cephas when connected to Supabase.
          </p>
        </div>
      </MuseumShell>
    );
  }

  return (
    <MuseumShell>
      <div className="min-h-screen flex flex-col px-4 py-6 pb-24 max-w-md mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">Cephas Library</h1>
          </div>
          <p className="text-slate-400 text-sm">455+ publications</p>
          <p className="text-slate-500 text-sm mt-1">How deep do you want to go?</p>
        </motion.div>

        {/* Three depth cards */}
        <div className="flex flex-col gap-3 mb-8">
          {depths.map((d, i) => (
            <motion.button
              key={d.id}
              onClick={() => handleSelectDepth(d.id)}
              className="w-full text-left p-5 rounded-xl border border-slate-700/60 bg-slate-900/80 hover:bg-slate-800/80 transition-colors active:scale-[0.98]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <div className="flex items-center gap-4">
                <span className="text-2xl">{d.icon}</span>
                <div className="flex-1">
                  <div className="text-white font-semibold">{d.label}</div>
                  <div className="text-slate-400 text-sm">{d.sublabel}</div>
                </div>
                <span className="text-slate-600">→</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Utility links */}
        <div className="flex flex-col gap-2">
          <UtilityLink icon={Search} label="Search" onClick={() => handleSelectDepth("stones")} />
          <UtilityLink icon={Compass} label="Guided Tour" subtitle="252-item curated path" onClick={() => {}} />
          <UtilityLink icon={Grid3X3} label="Browse by topic" onClick={() => {}} />
        </div>

        {/* Back to museum */}
        <button
          onClick={() => navigate("/")}
          className="mt-8 text-sm text-slate-500 hover:text-slate-300 transition-colors text-center"
        >
          ← Back to the Museum
        </button>
      </div>
    </MuseumShell>
  );
};

function UtilityLink({ icon: Icon, label, subtitle, onClick }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subtitle?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-left"
    >
      <Icon className="w-4 h-4 text-slate-500" />
      <div>
        <span className="text-sm text-slate-300">{label}</span>
        {subtitle && <span className="text-xs text-slate-500 ml-2">{subtitle}</span>}
      </div>
    </button>
  );
}

export default CephasBasement;
