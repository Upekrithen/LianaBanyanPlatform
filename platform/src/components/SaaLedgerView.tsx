/**
 * SaaLedgerView — user's SAA ledger view with cap status and history
 * K405 / Innovation #2241
 */
import { useSaaLedger, type SaaLedgerEntry } from "@/hooks/useSaaLedger";
import { TrendingUp, AlertTriangle, ArrowUpRight } from "lucide-react";

const CAP_AMOUNT = 10_000_000;

const SOURCE_LABELS: Record<string, string> = {
  open_water_patron: "Patron Engagement",
  open_water_ripple: "Ripple Backing",
  pedestal_stake: "Pedestal Stake",
  sponsor_pool: "Sponsor Pool",
  crown_position: "Crown Position",
  other: "Other",
};

function formatSaa(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export default function SaaLedgerView() {
  const { entries, capTracking, totalSaa, loading } = useSaaLedger();

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-20 rounded-xl" style={{ background: "#0a1628" }} />
        <div className="h-40 rounded-xl" style={{ background: "#0a1628" }} />
      </div>
    );
  }

  const capPercent = Math.min((totalSaa / CAP_AMOUNT) * 100, 100);
  const atCap = capTracking?.cap_reached ?? false;

  return (
    <div className="space-y-4">
      {/* Cap meter */}
      <div
        className="rounded-xl p-5"
        style={{ background: "#0a1628", border: "1px solid rgba(212,168,83,0.15)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span
              className="text-lg font-bold"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              {formatSaa(totalSaa)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            of {formatSaa(CAP_AMOUNT)} cap
          </span>
        </div>

        {/* Progress bar */}
        <div className="relative h-2.5 rounded-full overflow-hidden" style={{ background: "#1a2a44" }}>
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
            style={{
              width: `${capPercent}%`,
              background: atCap
                ? "linear-gradient(90deg, #f59e0b, #ef4444)"
                : "linear-gradient(90deg, #22c55e, #d4a853)",
            }}
          />
        </div>

        <div className="flex justify-between mt-2">
          <span className="text-[10px] text-slate-500">{capPercent.toFixed(2)}%</span>
          {atCap && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              Cap reached — overflow cascades to your network
            </span>
          )}
        </div>

        {capTracking && capTracking.overflow_cascaded > 0 && (
          <div
            className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]"
            style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}
          >
            <ArrowUpRight className="w-3 h-3 text-amber-500 flex-shrink-0" />
            <span className="text-amber-300">
              {formatSaa(Number(capTracking.overflow_cascaded))} cascaded to your network
            </span>
            {capTracking.last_cascade_at && (
              <span className="text-slate-600 ml-auto">
                Last: {new Date(capTracking.last_cascade_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ledger entries */}
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
          Accrual History ({entries.length})
        </h3>
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-600 text-xs">No SAA accruals yet</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {entries.map((entry) => (
              <LedgerRow key={entry.ledger_entry_id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LedgerRow({ entry }: { entry: SaaLedgerEntry }) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg px-3 py-2.5"
      style={{ background: "rgba(10,22,40,0.6)", border: "1px solid rgba(148,163,184,0.06)" }}
    >
      <div className="flex-1 min-w-0">
        <span className="text-xs text-slate-300">
          {SOURCE_LABELS[entry.source_type] ?? entry.source_type}
        </span>
        {entry.capped_and_reseeded && (
          <span className="ml-2 text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded">
            reseeded
          </span>
        )}
      </div>
      <span
        className="text-xs font-semibold tabular-nums"
        style={{ color: "#22c55e" }}
      >
        +{formatSaa(Number(entry.amount))}
      </span>
      <span className="text-[10px] text-slate-600 w-16 text-right flex-shrink-0">
        {new Date(entry.accrued_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </span>
    </div>
  );
}
