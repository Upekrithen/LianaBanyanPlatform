/**
 * MyEngagementsPage — /openwater/my-engagements
 * ================================================
 * Member and Patron view of their active engagements.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { useState, useEffect } from "react";
import { MuseumShell } from "@/components/museum/MuseumShell";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Anchor, ArrowRight, Clock, CheckCircle, XCircle } from "lucide-react";

const VESSEL_NAMES: Record<number, string> = {
  0: "Dinghy", 1: "Rowboat", 2: "Canoe", 3: "Skiff",
  4: "Sailboat", 5: "Ship", 6: "Yacht",
};

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  active: { bg: "rgba(34,197,94,0.1)", text: "#22c55e" },
  resolved: { bg: "rgba(107,114,128,0.1)", text: "#6b7280" },
  terminated: { bg: "rgba(239,68,68,0.1)", text: "#ef4444" },
};

interface Engagement {
  engagement_id: string;
  brief_id: string;
  member_id: string;
  patron_id: string;
  level_at_start: number;
  target_level: number;
  started_at: string;
  status: string;
  resolved_at: string | null;
}

export default function MyEngagementsPage() {
  const { user } = useAuth();
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"member" | "patron">("member");

  useEffect(() => {
    if (!user) return;
    loadEngagements();
  }, [user, tab]);

  async function loadEngagements() {
    if (!user) return;
    setLoading(true);

    if (tab === "member") {
      const { data } = await supabase
        .from("patron_engagements")
        .select("*")
        .eq("member_id", user.id)
        .order("started_at", { ascending: false });
      setEngagements((data as Engagement[]) ?? []);
    } else {
      const { data: regs } = await supabase
        .from("patron_registrations")
        .select("patron_id")
        .eq("user_id", user.id);
      if (regs && regs.length > 0) {
        const { data } = await supabase
          .from("patron_engagements")
          .select("*")
          .eq("patron_id", regs[0].patron_id)
          .order("started_at", { ascending: false });
        setEngagements((data as Engagement[]) ?? []);
      } else {
        setEngagements([]);
      }
    }
    setLoading(false);
  }

  const active = engagements.filter((e) => e.status === "active");
  const completed = engagements.filter((e) => e.status !== "active");

  return (
    <MuseumShell>
      <div className="min-h-screen px-4 py-8 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Anchor className="w-5 h-5 text-emerald-500" />
            <h1
              className="text-xl font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              My Engagements
            </h1>
          </div>

          {/* Tab toggle */}
          <div className="flex gap-1 mb-6 mt-4">
            <button
              onClick={() => setTab("member")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === "member"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 border border-transparent hover:text-slate-200"
              }`}
            >
              As Member
            </button>
            <button
              onClick={() => setTab("patron")}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === "patron"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "text-slate-400 border border-transparent hover:text-slate-200"
              }`}
            >
              As Patron
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: "#0a1628" }}>
                  <div className="h-4 w-48 bg-slate-700 rounded mb-2" />
                  <div className="h-3 w-32 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
          ) : engagements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm">
                {tab === "member"
                  ? "No engagements yet. Publish a brief to get started."
                  : "No Patron engagements yet. Volunteer on a brief first."}
              </p>
            </div>
          ) : (
            <>
              {/* Active */}
              {active.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Active ({active.length})
                  </h2>
                  <div className="space-y-3">
                    {active.map((e) => (
                      <EngagementRow key={e.engagement_id} engagement={e} />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <div>
                  <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Past ({completed.length})
                  </h2>
                  <div className="space-y-3">
                    {completed.map((e) => (
                      <EngagementRow key={e.engagement_id} engagement={e} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MuseumShell>
  );
}

function EngagementRow({ engagement: e }: { engagement: Engagement }) {
  const style = STATUS_STYLES[e.status] ?? STATUS_STYLES.active;
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-300">
            L{e.level_at_start} {VESSEL_NAMES[e.level_at_start]}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-medium text-emerald-400">
            L{e.target_level} {VESSEL_NAMES[e.target_level]}
          </span>
        </div>
        <span
          className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ background: style.bg, color: style.text }}
        >
          {e.status === "active" && <Clock className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />}
          {e.status === "resolved" && <CheckCircle className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />}
          {e.status === "terminated" && <XCircle className="w-3 h-3 inline-block mr-0.5 -mt-0.5" />}
          {e.status}
        </span>
      </div>
      <div className="text-[10px] text-slate-500">
        Started {new Date(e.started_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        {e.resolved_at && (
          <> &middot; Resolved {new Date(e.resolved_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
        )}
      </div>
    </div>
  );
}
