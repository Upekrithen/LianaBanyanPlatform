/**
 * BriefDirectoryPage — /openwater/briefs
 * ========================================
 * Patron-facing directory of open briefs. Filter by Level and industry.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { useState, useCallback } from "react";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { SummonMascot } from "@/components/museum/SummonMascot";
import { OpenWaterBriefCard } from "@/components/OpenWaterBriefCard";
import { useOpenWaterBriefs } from "@/hooks/useOpenWaterBrief";
import { useAuth } from "@/contexts/AuthContext";
import { useMyPatronRegistration } from "@/hooks/usePatronRegistration";
import { supabase } from "@/integrations/supabase/client";
import { Anchor, Filter } from "lucide-react";
import { OpenWaterCueCardBanner } from "@/components/OpenWaterCueCardBanner";

const LEVELS = [0, 1, 2, 3, 4, 5, 6] as const;
const PATHWAYS = ["food", "manufacturing", "service", "local_business", "guild", "tribe"] as const;

export default function BriefDirectoryPage() {
  const { user } = useAuth();
  const { registration } = useMyPatronRegistration(user?.id);
  const [levelFilter, setLevelFilter] = useState<number | undefined>();
  const [pathwayFilter, setPathwayFilter] = useState<string | undefined>();
  const { briefs, loading } = useOpenWaterBriefs({
    status: "open",
    level: levelFilter,
    pathway: pathwayFilter,
  });

  const handleVolunteer = useCallback(
    async (briefId: string) => {
      if (!registration) return;
      await supabase.from("patron_volunteers").insert({
        brief_id: briefId,
        patron_id: registration.patron_id,
      });
    },
    [registration],
  );

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <Anchor className="w-5 h-5 text-emerald-500" />
            <h1
              className="text-xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              Open Water Briefs
            </h1>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Members seeking growth. Volunteer on any brief that matches your expertise.
          </p>

          <OpenWaterCueCardBanner cardId="we-need-what-youre-good-at" className="mb-4" />

          <SummonMascot
            mascotId="goat"
            topic="What Open Water briefs are"
            startClosed
            message={
              <>
                Every brief is a real person asking a real question about growing their work.
                You don&rsquo;t need credentials. You need lived experience one or two steps
                ahead of where they are. Volunteer freely &mdash; it costs nothing and creates
                no obligation until both sides agree.
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
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
            <select
              value={pathwayFilter ?? "all"}
              onChange={(e) => setPathwayFilter(e.target.value === "all" ? undefined : e.target.value)}
              className="bg-slate-800/60 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-300"
            >
              <option value="all">All Pathways</option>
              {PATHWAYS.map((p) => (
                <option key={p} value={p} className="capitalize">{p.replace("_", " ")}</option>
              ))}
            </select>
          </div>

          {/* Brief list */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: "#0a1628" }}>
                  <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-full bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : briefs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">No open briefs match your filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {briefs.map((b) => (
                <OpenWaterBriefCard
                  key={b.brief_id}
                  brief={b}
                  onVolunteer={registration ? () => handleVolunteer(b.brief_id) : undefined}
                  showActions={!!registration}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MuseumShell>
  );
}
