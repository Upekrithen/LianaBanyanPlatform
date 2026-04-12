/**
 * OpenWaterCueCardBanner — inline cue card display for Open Water pages.
 * Renders a compact, visually distinct banner with the cue card body text
 * and an optional Level 0 variant. Links to the full cue card landing page.
 *
 * K408 / B097.
 */
import { Link } from "react-router-dom";
import { OPEN_WATER_CUE_CARDS, type OpenWaterCueCard } from "@/data/openWaterCueCards";
import { ArrowRight } from "lucide-react";

interface Props {
  cardId: keyof typeof OPEN_WATER_CUE_CARDS;
  showLevel0?: boolean;
  className?: string;
}

export function OpenWaterCueCardBanner({ cardId, showLevel0 = false, className = "" }: Props) {
  const card: OpenWaterCueCard | undefined = OPEN_WATER_CUE_CARDS[cardId];
  if (!card) return null;

  return (
    <div
      className={`rounded-xl border overflow-hidden ${className}`}
      style={{
        background: "linear-gradient(135deg, rgba(20,184,166,0.08) 0%, rgba(16,185,129,0.04) 100%)",
        borderColor: "rgba(20,184,166,0.2)",
      }}
    >
      <div className="px-4 py-3">
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: "#5eead4", fontFamily: "'Crimson Pro', Georgia, serif" }}
        >
          &ldquo;{card.title}&rdquo;
        </h3>
        <p className="text-[11px] leading-relaxed text-slate-400 italic">
          {showLevel0 ? card.level0Variant : card.bodyText}
        </p>
      </div>
      <Link
        to={`/cue/${card.id}`}
        className="flex items-center justify-between px-4 py-2 text-[10px] font-medium transition-colors hover:bg-white/5"
        style={{ borderTop: "1px solid rgba(20,184,166,0.1)", color: "#5eead4" }}
      >
        <span>{card.tagline}</span>
        <ArrowRight className="w-3 h-3 flex-shrink-0 ml-2" />
      </Link>
    </div>
  );
}
