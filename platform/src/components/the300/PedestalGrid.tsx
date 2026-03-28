import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PedestalCard } from "./PedestalCard";
import type { LeadershipPedestal } from "@/hooks/usePedestals";
import { Crown, Building2, Star, Shield, Users } from "lucide-react";

interface Props {
  pedestals: LeadershipPedestal[];
  onSupport?: (id: string) => void;
}

const CATEGORIES = [
  { key: "all", label: "All Seats", icon: Crown },
  { key: "crown", label: "Crown", icon: Crown },
  { key: "board", label: "Board", icon: Building2 },
  { key: "advisory", label: "Advisory", icon: Star },
  { key: "ambassador", label: "Ambassador", icon: Shield },
  { key: "captain_regional", label: "Regional Captain", icon: Users },
];

export function PedestalGrid({ pedestals, onSupport }: Props) {
  return (
    <Tabs defaultValue="all">
      <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
        {CATEGORIES.map(cat => {
          const count = cat.key === "all"
            ? pedestals.length
            : pedestals.filter(p => p.seat_type === cat.key).length;
          if (count === 0 && cat.key !== "all") return null;
          const Icon = cat.icon;
          return (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="data-[state=active]:bg-slate-700 text-xs gap-1"
            >
              <Icon className="w-3 h-3" />
              {cat.label} ({count})
            </TabsTrigger>
          );
        })}
      </TabsList>

      {CATEGORIES.map(cat => (
        <TabsContent key={cat.key} value={cat.key} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(cat.key === "all"
              ? pedestals
              : pedestals.filter(p => p.seat_type === cat.key)
            ).map(ped => (
              <PedestalCard key={ped.id} pedestal={ped} onSupport={onSupport} />
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
