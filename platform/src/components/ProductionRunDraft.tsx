/**
 * PRODUCTION RUN DRAFT — Fantasy Football for Maker Products
 * ===========================================================
 * Browse maker proposals, back production runs, track progress.
 * 500 pre-orders triggers production. First 100 get multiplier bonuses.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Factory,
  Users,
  TrendingUp,
  Zap,
  Star,
  Shield,
  ChevronRight,
  Filter,
} from "lucide-react";
import {
  type ProductionRun,
  type DraftFilter,
  SAMPLE_PRODUCTION_RUNS,
  filterRuns,
} from "@/data/productionRunDraft";
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface ProductionRunDraftProps {
  compact?: boolean;
  maxItems?: number;
}

const FILTER_OPTIONS: { value: DraftFilter; label: string; icon: string }[] = [
  { value: "all", label: "All Runs", icon: "🏭" },
  { value: "trending", label: "Most Backed", icon: "🔥" },
  { value: "almost-funded", label: "Almost Funded", icon: "⚡" },
  { value: "hexisle", label: "HexIsle", icon: "⬡" },
  { value: "new", label: "New Proposals", icon: "✨" },
];

export function ProductionRunDraft({ compact = false, maxItems }: ProductionRunDraftProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const [filter, setFilter] = useState<DraftFilter>("all");
  const [backedRuns, setBackedRuns] = useState<Set<string>>(new Set());

  const filteredRuns = filterRuns(SAMPLE_PRODUCTION_RUNS, filter);
  const displayRuns = maxItems ? filteredRuns.slice(0, maxItems) : filteredRuns;

  const handleBack = (run: ProductionRun) => {
    if (!user) {
      openOnboard({
        reason: `back the "${run.productName}" production run`,
        actionLabel: "Join to Back",
        membershipIncluded: true,
      });
      return;
    }
    setBackedRuns((prev) => new Set([...prev, run.id]));
    toast.success(`You backed "${run.productName}"! Your pre-order is locked in.`);
  };

  const getProgressPercent = (run: ProductionRun) =>
    Math.round((run.currentPreorders / run.targetUnits) * 100);

  const isFirst100 = (run: ProductionRun) => run.backers < 100;

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Factory className="w-6 h-6 text-primary" />
            Production Run Draft
          </h3>
          <p className="text-muted-foreground mt-1">
            Pick your players. Back production runs. Watch them ship.
          </p>
        </div>
      )}

      {/* Example Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 text-center">
        <p className="text-sm text-amber-200">
          <span className="font-semibold">✨ These are example runs</span> showing how Production Run Draft works.
          Real maker proposals coming soon — yours could be first.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 justify-center">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === opt.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* Production Run Cards */}
      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        {displayRuns.map((run) => {
          const progress = getProgressPercent(run);
          const isBacked = backedRuns.has(run.id);
          const first100 = isFirst100(run);

          return (
            <Card
              key={run.id}
              className={`transition-all hover:shadow-lg ${
                isBacked ? "border-green-500/50 bg-green-500/5" : "border-border"
              }`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-4xl">{run.imageEmoji}</span>
                    <div>
                      <CardTitle className="text-base">{run.productName}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        by{" "}
                        <span className="font-medium text-foreground">
                          {run.maker.handle}
                        </span>
                        {run.maker.verified && (
                          <Shield className="w-3 h-3 inline ml-1 text-blue-500" />
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{run.priceEstimate}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{run.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {run.category}
                  </Badge>
                  {run.hexIsleCompatible && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                    >
                      ⬡ {run.hexIsleCompatible}
                    </Badge>
                  )}
                  {first100 && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      First 100 Bonus
                    </Badge>
                  )}
                </div>

                {/* Progress toward 500 */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {run.backers} backers
                    </span>
                    <span className="font-medium">
                      {run.currentPreorders}/{run.targetUnits} pre-orders
                    </span>
                  </div>
                  <Progress
                    value={progress}
                    className={`h-2.5 ${progress >= 100 ? "[&>div]:bg-green-500" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{progress}% funded</span>
                    <span>{run.targetUnits - run.currentPreorders} to go</span>
                  </div>
                </div>

                {/* Back button */}
                {isBacked ? (
                  <div className="flex items-center justify-center gap-2 py-2 text-green-500 text-sm font-medium">
                    <Star className="w-4 h-4 fill-green-500" />
                    You backed this run!
                  </div>
                ) : (
                  <Button
                    className="w-full gap-2"
                    variant={progress >= 80 ? "default" : "outline"}
                    onClick={() => handleBack(run)}
                  >
                    <TrendingUp className="w-4 h-4" />
                    {progress >= 80 ? "Almost There — Back Now!" : "Back This Run"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {displayRuns.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Factory className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No production runs match this filter yet.</p>
        </div>
      )}
    </div>
  );
}
