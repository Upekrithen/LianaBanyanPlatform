import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Target,
  Store,
  Users,
  DollarSign,
  Megaphone,
  MapPin,
  CreditCard,
  Info,
} from "lucide-react";
import { useDemandSignals, type DemandSignal } from "@/hooks/useDemandSignals";

const CATEGORY_EMOJI: Record<string, string> = {
  grocery: "🏪",
  restaurant: "🍽️",
  auto_service: "🚗",
  salon: "💇",
  barber: "💈",
  bakery: "🧁",
  gym: "💪",
  pet_service: "🐾",
  retail: "🛍️",
};

export function CaptainIntelligence() {
  const { data: signals = [], isLoading } = useDemandSignals("unassigned");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  const hasSignals = signals.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          Walking Billboard Intelligence
        </h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Businesses where LB members already spend but haven't been onboarded
        </p>
      </div>

      {!hasSignals ? (
        <Card className="border-slate-700 bg-slate-800/30">
          <CardContent className="p-8 text-center space-y-4">
            <CreditCard className="w-12 h-12 mx-auto text-slate-600" />
            <div className="space-y-2">
              <p className="text-slate-400 font-medium">
                Intelligence data will appear once LB Card transactions begin.
              </p>
              <p className="text-sm text-slate-600">
                Start by creating campaigns manually from your Territory tab.
                Once members start spending with LB Cards, aggregated demand signals
                will surface here — showing exactly where members already shop.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-600 pt-2">
              <Info className="w-3 h-3" />
              Data is aggregated and anonymized. No individual spending data is shown.
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center gap-2 px-1 text-xs text-slate-500 border-b border-slate-700/50 pb-2">
            <Target className="w-3 h-3 text-amber-400" />
            <span className="uppercase tracking-wider font-semibold">
              Ripe for Pitch ({signals.length})
            </span>
          </div>

          <div className="space-y-3">
            {signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 px-1 pt-2 border-t border-slate-700/50">
            <Info className="w-3 h-3 shrink-0" />
            <span>
              Data: Aggregated, anonymized LB Card spending.
              Members opt in at card signup. No individual data shown.
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function SignalCard({ signal }: { signal: DemandSignal }) {
  const emoji = CATEGORY_EMOJI[signal.merchant_category ?? ""] ?? "🏪";

  return (
    <Card className="border-slate-700 bg-slate-800/30 hover:border-slate-600 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span>{emoji}</span>
            {signal.merchant_name}
          </CardTitle>
          <Badge variant="outline" className="border-amber-500/30 text-amber-300 text-[10px]">
            NOT onboarded
          </Badge>
        </div>
        <CardDescription className="text-xs flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {signal.unique_cardholders} LB members
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            ~${signal.monthly_spend_estimate.toLocaleString()}/mo spending
          </span>
          {signal.approximate_location && (
            <>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {signal.approximate_location}
              </span>
            </>
          )}
          {signal.merchant_category && (
            <>
              <span className="text-slate-600">·</span>
              <span className="flex items-center gap-1">
                <Store className="w-3 h-3" />
                {signal.merchant_category.replace(/_/g, " ")}
              </span>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-emerald-500/30 text-emerald-300"
            asChild
          >
            <Link to="/campaigns/nominate">
              <Megaphone className="w-3 h-3 mr-1" />
              Start Campaign
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-blue-500/30 text-blue-300"
          >
            <MapPin className="w-3 h-3 mr-1" />
            Add to Corridor
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
