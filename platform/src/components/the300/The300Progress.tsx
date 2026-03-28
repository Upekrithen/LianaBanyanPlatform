import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, Sword, Users } from "lucide-react";
import type { LeadershipPedestal } from "@/hooks/usePedestals";

interface Props {
  pedestals: LeadershipPedestal[];
}

const TARGET = 300;

const TIERS = [
  { key: "shield", label: "Shield", icon: Shield, color: "text-blue-400", bg: "bg-blue-500" },
  { key: "spear", label: "Spear", icon: Sword, color: "text-amber-400", bg: "bg-amber-500" },
  { key: "phalanx", label: "Phalanx", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500" },
];

export function The300Progress({ pedestals }: Props) {
  const total = pedestals.length;
  const pct = Math.min(100, Math.round((total / TARGET) * 100));

  return (
    <div className="space-y-4 p-4 rounded-lg border border-slate-700 bg-slate-800/30">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Progress to 300</h3>
        <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
          {total} / {TARGET}
        </Badge>
      </div>

      <Progress value={pct} className="h-3" />
      <p className="text-xs text-slate-500 text-center">{pct}% identified</p>

      <div className="grid grid-cols-3 gap-3">
        {TIERS.map(tier => {
          const Icon = tier.icon;
          const count = pedestals.filter(p => p.tier === tier.key).length;
          return (
            <div key={tier.key} className="text-center space-y-1">
              <Icon className={`w-5 h-5 mx-auto ${tier.color}`} />
              <div className="text-lg font-bold text-slate-200">{count}</div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider">{tier.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
