/**
 * CharacterTurnRenderer -- Narrator dialogue bubble for explainer corpus.
 *
 * NARRATOR RULE (gate-resolved):
 *   Skipping Stones + Wading In = active Province HOST
 *     LRH (Southern) or Denken (Northern / Founder persona)
 *   Deep Dive = summoned domain specialist
 *     Host gives metaphor, then says summonLine, specialist speaks.
 *
 * Usage:
 *   <CharacterTurnRenderer
 *     turn={depthContent.narrator}
 *     hostMascotId="lrh"
 *     depth="deep-dive"
 *   />
 */

import { MASCOTS } from "@/data/mascots";
import type { CharacterTurn, DepthLayer } from "@/data/explainerCorpus";
import { DEPTH_LABELS } from "@/data/explainerCorpus";
import { cn } from "@/lib/utils";

interface CharacterTurnRendererProps {
  turn: CharacterTurn;
  /** The host for this subsystem (lrh or denken). Used to show the summon intro. */
  hostMascotId: "lrh" | "denken";
  depth: DepthLayer;
  className?: string;
}

export function CharacterTurnRenderer({
  turn,
  hostMascotId,
  depth,
  className,
}: CharacterTurnRendererProps) {
  const mascot = MASCOTS[turn.mascotId];
  const hostMascot = MASCOTS[hostMascotId];

  if (!mascot) return null;

  const isDeepDive = depth === "deep-dive";
  const isSpecialist = turn.role === "specialist";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* Deep Dive: show host summon line before specialist speaks */}
      {isDeepDive && isSpecialist && turn.summonLine && hostMascot && (
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <img
              src={hostMascot.visual.hover}
              alt={hostMascot.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-amber-300 bg-amber-50"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = "/images/lrh-default.png";
              }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-xs font-semibold text-amber-700 truncate">
                {hostMascot.name}
              </span>
              <span className="text-xs text-muted-foreground">(summons specialist)</span>
            </div>
            <p className="text-sm text-muted-foreground italic leading-snug">
              {turn.summonLine}
            </p>
          </div>
        </div>
      )}

      {/* Main narrator bubble */}
      <div
        className={cn(
          "flex items-start gap-3 rounded-xl p-3",
          isSpecialist
            ? "bg-blue-50 border border-blue-100"
            : "bg-amber-50 border border-amber-100"
        )}
        data-xray-id={`narrator-turn-${turn.mascotId}-${depth}`}
      >
        <div className="flex-shrink-0">
          <img
            src={isDeepDive ? mascot.visual.xray : mascot.visual.hover}
            alt={mascot.name}
            className={cn(
              "w-12 h-12 rounded-full object-cover border-2",
              isSpecialist
                ? "border-blue-300 bg-blue-50"
                : "border-amber-300 bg-amber-50"
            )}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = mascot.visual.default;
            }}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={cn(
                "text-xs font-bold tracking-wide uppercase",
                isSpecialist ? "text-blue-700" : "text-amber-700"
              )}
            >
              {mascot.name}
            </span>
            <span
              className={cn(
                "text-xs px-1.5 py-0.5 rounded-full font-medium",
                isSpecialist
                  ? "bg-blue-100 text-blue-600"
                  : "bg-amber-100 text-amber-600"
              )}
            >
              {isSpecialist ? mascot.title : `${DEPTH_LABELS[depth]} Guide`}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground">{turn.text}</p>
          {isSpecialist && (
            <p className="text-xs text-muted-foreground mt-1 italic">
              {mascot.exitLine}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
