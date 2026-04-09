import { AdaptPillar } from "./types";

type PillarRowProps = {
  pillar: AdaptPillar;
};

export function PillarRow({ pillar }: PillarRowProps) {
  const clamped = Math.max(0, Math.min(100, pillar.score));

  return (
    <div className="space-y-2 rounded-lg border p-3" data-xray-id={`adapt-pillar-${pillar.key}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">
          <span className="mr-1" aria-hidden>{pillar.icon}</span>
          {pillar.label}
        </p>
        <p className="text-sm font-semibold">{Math.round(clamped)}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-amber-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500"
          style={{ width: `${clamped}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{pillar.driver}</p>
    </div>
  );
}
