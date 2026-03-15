/**
 * XPBoxDisplay — Box notation: every 10,000 XP = 1 box. Tier colors bronze → obsidian.
 * Session 18.
 */

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function xpToBoxNotation(totalXp: number): {
  boxes: number;
  remainder: number;
  tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "obsidian";
  isSolid: boolean;
} {
  const boxes = Math.floor(totalXp / 10000);
  const remainder = totalXp % 10000;
  const isSolid = boxes >= 10000;

  let tier: "bronze" | "silver" | "gold" | "platinum" | "diamond" | "obsidian";
  if (boxes === 0) tier = "bronze";
  else if (boxes <= 9) tier = "silver";
  else if (boxes <= 99) tier = "gold";
  else if (boxes <= 999) tier = "platinum";
  else if (boxes <= 9999) tier = "diamond";
  else tier = "obsidian";

  return { boxes, remainder, tier, isSolid };
}

const TIER_STYLES: Record<string, string> = {
  bronze: "bg-amber-700/20 text-amber-800 dark:text-amber-200 border-amber-500/30",
  silver: "bg-slate-200 text-slate-800 dark:bg-slate-600 dark:text-slate-100 border-slate-400/50 shadow-sm",
  gold: "bg-amber-400/30 text-amber-800 dark:text-amber-200 border-amber-500/50 shadow",
  platinum: "bg-slate-300/50 text-slate-900 dark:text-slate-100 border-slate-400",
  diamond: "bg-cyan-200/40 text-cyan-900 dark:text-cyan-100 border-cyan-400/50",
  obsidian: "bg-slate-900 text-slate-100 border-slate-600",
};

export interface XPBoxDisplayProps {
  totalXp: number;
  /** Show compact (e.g. for badges) or full line */
  variant?: "inline" | "compact";
  className?: string;
}

export function XPBoxDisplay({ totalXp, variant = "inline", className = "" }: XPBoxDisplayProps) {
  if (totalXp === 0) {
    return (
      <span className={className} data-xray-id="xp-box-display">
        0 XP
      </span>
    );
  }

  const { boxes, remainder, tier, isSolid } = xpToBoxNotation(totalXp);
  const rawLabel = totalXp.toLocaleString() + " XP";

  const boxBadge = (
    <span
      className={`inline-flex items-center justify-center font-bold border rounded px-1.5 py-0.5 text-sm ${TIER_STYLES[tier]}`}
      aria-hidden
    >
      {isSolid ? "◆" : `[${boxes}]`}
    </span>
  );

  const content =
    tier === "bronze" ? (
      <span className="tabular-nums">{totalXp.toLocaleString()} XP</span>
    ) : isSolid ? (
      <span className="flex items-center gap-1.5">
        {boxBadge}
        <span className="text-muted-foreground text-sm">cap</span>
      </span>
    ) : (
      <span className="flex items-center gap-2">
        {boxBadge}
        <span className="tabular-nums text-muted-foreground">
          {remainder.toLocaleString()} XP
        </span>
      </span>
    );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center ${className}`} data-xray-id="xp-box-display">
            {content}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-medium">{rawLabel}</p>
          <p className="text-xs text-muted-foreground">
            {tier !== "bronze" && !isSolid && `1 box = 10,000 XP · ${boxes} box(es) + ${remainder.toLocaleString()}`}
            {isSolid && "100M+ XP (display cap)"}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
