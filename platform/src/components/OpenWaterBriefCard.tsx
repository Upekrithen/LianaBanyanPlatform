/**
 * OpenWaterBriefCard — Shared card for brief display in directories.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { Anchor, ArrowRight, Clock } from "lucide-react";
import type { OpenWaterBrief } from "@/hooks/useOpenWaterBrief";

const VESSEL_NAMES: Record<number, string> = {
  0: "Dinghy", 1: "Rowboat", 2: "Canoe", 3: "Skiff",
  4: "Sailboat", 5: "Ship", 6: "Yacht",
};

const VESSEL_EMOJI: Record<number, string> = {
  0: "\u26F5", 1: "\uD83D\uDEA3", 2: "\uD83D\uDEF6", 3: "\u26F5",
  4: "\u26F5", 5: "\uD83D\uDEA2", 6: "\uD83D\uDEF3\uFE0F",
};

const STATUS_COLORS: Record<string, string> = {
  open: "#22c55e",
  matched: "#3b82f6",
  in_progress: "#f59e0b",
  resolved: "#6b7280",
  terminated: "#ef4444",
};

interface Props {
  brief: OpenWaterBrief;
  onVolunteer?: () => void;
  onView?: () => void;
  showActions?: boolean;
}

export function OpenWaterBriefCard({ brief, onVolunteer, onView, showActions = true }: Props) {
  const fromVessel = VESSEL_NAMES[brief.current_level] ?? "?";
  const toVessel = VESSEL_NAMES[brief.target_level] ?? "?";
  const statusColor = STATUS_COLORS[brief.status] ?? "#6b7280";

  return (
    <div
      className="rounded-xl p-4 hover:bg-slate-800/30 transition-colors"
      style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
    >
      {/* Header: Level transition + status */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{VESSEL_EMOJI[brief.current_level]}</span>
          <span className="text-xs font-medium text-slate-300">
            L{brief.current_level} {fromVessel}
          </span>
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <span className="text-xs font-medium text-emerald-400">
            L{brief.target_level} {toVessel}
          </span>
        </div>
        <span
          className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded-full"
          style={{ background: `${statusColor}20`, color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {brief.status.replace("_", " ")}
        </span>
      </div>

      {/* Industry pathway */}
      <div className="flex items-center gap-1.5 mb-2">
        <Anchor className="w-3 h-3 text-slate-500" />
        <span className="text-[10px] text-slate-500 capitalize">
          {brief.industry_pathway.replace("_", " ")}
          {brief.industry_subtag ? ` / ${brief.industry_subtag}` : ""}
        </span>
        {brief.preferred_engagement_length_days && (
          <span className="flex items-center gap-0.5 text-[10px] text-slate-600 ml-2">
            <Clock className="w-3 h-3" />
            {brief.preferred_engagement_length_days}d
          </span>
        )}
      </div>

      {/* Growth question */}
      <p
        className="text-sm leading-relaxed mb-3"
        style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
      >
        {brief.growth_question}
      </p>

      {/* Voucher budget (if any) */}
      {(brief.voucher_budget_credits > 0 || brief.voucher_budget_marks > 0 || brief.voucher_budget_joules > 0) && (
        <div className="flex gap-2 mb-3">
          {brief.voucher_budget_credits > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {brief.voucher_budget_credits} Credits
            </span>
          )}
          {brief.voucher_budget_marks > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {brief.voucher_budget_marks} Marks
            </span>
          )}
          {brief.voucher_budget_joules > 0 && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {brief.voucher_budget_joules} Joules
            </span>
          )}
        </div>
      )}

      {/* Actions */}
      {showActions && brief.status === "open" && (
        <div className="flex gap-2">
          {onVolunteer && (
            <button
              onClick={onVolunteer}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
            >
              Volunteer
            </button>
          )}
          {onView && (
            <button
              onClick={onView}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500 transition-colors"
            >
              View Brief
            </button>
          )}
        </div>
      )}

      {/* Published date */}
      <div className="text-[9px] text-slate-600 mt-2">
        Published {new Date(brief.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>
    </div>
  );
}

export default OpenWaterBriefCard;
