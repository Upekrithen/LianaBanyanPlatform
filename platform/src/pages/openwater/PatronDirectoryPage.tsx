/**
 * PatronDirectoryPage — /openwater/patrons
 * ==========================================
 * Public directory of registered Patrons. Filter by Level and industry.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { useState } from "react";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { PatronRegistrationCard } from "@/components/PatronRegistrationCard";
import { usePatronDirectory } from "@/hooks/usePatronRegistration";
import { Users, Filter } from "lucide-react";
import { OpenWaterCueCardBanner } from "@/components/OpenWaterCueCardBanner";

const LEVELS = [0, 1, 2, 3, 4, 5, 6] as const;
const VESSEL_NAMES: Record<number, string> = {
  0: "Dinghy", 1: "Rowboat", 2: "Canoe", 3: "Skiff",
  4: "Sailboat", 5: "Ship", 6: "Yacht",
};

export default function PatronDirectoryPage() {
  const [levelFilter, setLevelFilter] = useState<number | undefined>();
  const [tagFilter, setTagFilter] = useState<string | undefined>();
  const { patrons, loading } = usePatronDirectory({
    level: levelFilter,
    tag: tagFilter,
  });

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-emerald-500" />
            <h1
              className="text-xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              Patron Directory
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            We need what you&rsquo;re good at. Every Patron walks with lived experience.
          </p>

          <OpenWaterCueCardBanner cardId="we-need-what-youre-good-at" className="mb-4" />

          <SummonMascot
            mascotId="goat"
            topic="What a Patron is"
            startClosed
            message={
              <>
                A Patron is someone one or two steps ahead of you on the ladder. Not credentials,
                not prestige. Lived competence at a specific thing. They volunteer freely and earn
                Service Allocation Authority &mdash; governance influence, not money &mdash; based
                on your demonstrated growth.
              </>
            }
            className="mb-6"
          />

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap items-center">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={levelFilter ?? "all"}
              onChange={(e) => setLevelFilter(e.target.value === "all" ? undefined : Number(e.target.value))}
              className="bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="all">All Levels</option>
              {LEVELS.map((l) => (
                <option key={l} value={l}>L{l} {VESSEL_NAMES[l]}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Filter by tag..."
              value={tagFilter ?? ""}
              onChange={(e) => setTagFilter(e.target.value || undefined)}
              className="bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600"
            />
          </div>

          {/* Counter */}
          <div className="text-xs text-slate-500 mb-3">
            {loading ? "Loading..." : `${patrons.length} registered Patron${patrons.length !== 1 ? "s" : ""}`}
          </div>

          {/* Patron list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: "#0a1628" }}>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700" />
                    <div className="flex-1">
                      <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
                      <div className="h-3 w-32 bg-slate-800 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : patrons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No Patrons match your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {patrons.map((p) => (
                <PatronRegistrationCard key={p.patron_id} patron={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </MuseumShell>
  );
}
