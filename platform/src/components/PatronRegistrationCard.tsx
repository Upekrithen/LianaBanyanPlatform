/**
 * PatronRegistrationCard — Shared card for Patron directory display.
 * K404 (Open Water) / B097. Innovation #2240.
 */
import { User, Shield, MapPin } from "lucide-react";
import type { PatronRegistration } from "@/hooks/usePatronRegistration";

const VESSEL_NAMES: Record<number, string> = {
  0: "Dinghy", 1: "Rowboat", 2: "Canoe", 3: "Skiff",
  4: "Sailboat", 5: "Ship", 6: "Yacht",
};

interface Props {
  patron: PatronRegistration;
  onView?: () => void;
}

export function PatronRegistrationCard({ patron, onView }: Props) {
  const availableLevels = patron.registered_levels
    .map((l) => `L${l} ${VESSEL_NAMES[l] ?? "?"}`)
    .join(", ");

  const totalCapacity = Object.values(patron.max_concurrent_engagements).reduce((a, b) => a + (b as number), 0);
  const totalCurrent = Object.values(patron.current_concurrent_engagements).reduce((a, b) => a + (b as number), 0);

  return (
    <div
      className="rounded-xl p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
      style={{ background: "#0a1628", border: "1px solid rgba(56,161,105,0.15)" }}
      onClick={onView}
    >
      <div className="flex items-start gap-3">
        {/* Avatar placeholder */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(56,161,105,0.15)", border: "1px solid rgba(56,161,105,0.3)" }}
        >
          <User className="w-5 h-5 text-emerald-500/60" />
        </div>

        <div className="flex-1 min-w-0">
          {/* Bio */}
          {patron.bio_summary && (
            <p
              className="text-sm font-medium mb-1 line-clamp-2"
              style={{ color: "#faf5eb", fontFamily: "'Crimson Pro', Georgia, serif" }}
            >
              {patron.bio_summary}
            </p>
          )}

          {/* Levels */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] text-slate-400">{availableLevels}</span>
          </div>

          {/* Industry tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {patron.industry_tags.slice(0, 6).map((tag) => (
              <span
                key={tag}
                className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                style={{ background: "rgba(56,161,105,0.1)", border: "1px solid rgba(56,161,105,0.2)", color: "#6ee7b7" }}
              >
                {tag.replace(/_/g, " ")}
              </span>
            ))}
            {patron.industry_tags.length > 6 && (
              <span className="text-[9px] text-slate-500">+{patron.industry_tags.length - 6}</span>
            )}
          </div>

          {/* Capacity */}
          <div className="text-[9px] text-slate-600">
            {totalCurrent}/{totalCapacity} active engagements
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatronRegistrationCard;
