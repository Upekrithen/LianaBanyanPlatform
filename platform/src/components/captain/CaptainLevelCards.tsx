import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ArrowRight, Anchor, Ship, Crown, Compass } from "lucide-react";
import type { LevelRequirement } from "@/hooks/useCaptain";

interface Props {
  requirements: LevelRequirement[];
  currentLevel?: string;
}

const LEVEL_META: Record<string, { label: string; icon: typeof Anchor; color: string }> = {
  captain_10: { label: "Captain 10", icon: Anchor, color: "text-blue-400 border-blue-500/40 bg-blue-500/10" },
  captain_50: { label: "Captain 50", icon: Ship, color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10" },
  captain_100: { label: "Captain 100", icon: Compass, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
  captain_1000: { label: "Captain 1000", icon: Crown, color: "text-yellow-300 border-yellow-500/40 bg-yellow-500/10" },
};

export function CaptainLevelCards({ requirements, currentLevel }: Props) {
  const currentIdx = requirements.findIndex(r => r.level === currentLevel);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {requirements.map((req, idx) => {
        const meta = LEVEL_META[req.level] || LEVEL_META.captain_10;
        const Icon = meta.icon;
        const isCompleted = currentIdx >= idx;
        const isCurrent = currentLevel === req.level;

        return (
          <div key={req.level} className="relative">
            {idx < requirements.length - 1 && (
              <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-5 h-5 text-slate-600" />
            )}
            <Card className={`border ${isCurrent ? "ring-2 ring-blue-500 " : ""}${isCompleted ? meta.color : "border-slate-700 bg-slate-800/50"} transition-all`}>
              <CardHeader className="pb-2 flex flex-row items-center gap-2">
                <Icon className={`w-5 h-5 ${isCompleted ? "" : "text-slate-500"}`} />
                <CardTitle className="text-sm font-semibold">
                  {meta.label}
                </CardTitle>
                {isCurrent && (
                  <Badge variant="outline" className="ml-auto text-[10px] border-blue-500 text-blue-300">
                    YOU
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                <Requirement
                  label="Marks Staked"
                  value={`${req.min_marks_staked.toLocaleString()}+`}
                  met={isCompleted}
                />
                <Requirement
                  label="Orders Fulfilled"
                  value={`${req.min_orders_fulfilled}+`}
                  met={isCompleted}
                />
                <Requirement
                  label="Fulfillment Rate"
                  value={req.min_fulfillment_rate > 0 ? `${req.min_fulfillment_rate}%+` : "—"}
                  met={isCompleted}
                />
                <Requirement
                  label="Reputation"
                  value={`${req.min_reputation_score}+`}
                  met={isCompleted}
                />
                <div className="pt-1 text-slate-400">
                  Max {req.max_concurrent_orders} concurrent orders
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

function Requirement({ label, value, met }: { label: string; value: string; met: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      {met ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      ) : (
        <Circle className="w-3 h-3 text-slate-600 shrink-0" />
      )}
      <span className={met ? "text-slate-300" : "text-slate-500"}>
        {label}: <span className="font-medium">{value}</span>
      </span>
    </div>
  );
}
