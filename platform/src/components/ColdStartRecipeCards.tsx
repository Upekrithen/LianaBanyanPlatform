/**
 * COLD START RECIPE CARDS
 * =======================
 * Browseable collection of step-by-step Cold Start strategy playbooks.
 * Users pick a strategy "recipe card" and follow the steps to launch.
 * Integrates with guild/community channels for support.
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronDown,
  CheckCircle,
  Circle,
  Clock,
  DollarSign,
  Users,
  Flame,
  Star,
} from "lucide-react";
import {
  type ColdStartStrategy,
  getStrategiesForInitiative,
  COLD_START_STRATEGIES,
} from "@/data/coldStartStrategies";

interface ColdStartRecipeCardsProps {
  initiative?: string; // Filter to specific initiative, or show all
  compact?: boolean; // Compact mode for embedding in registration pages
  onSelectStrategy?: (strategy: ColdStartStrategy) => void;
}

const DIFFICULTY_COLORS = {
  easy: "bg-green-500/20 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function ColdStartRecipeCards({
  initiative,
  compact = false,
  onSelectStrategy,
}: ColdStartRecipeCardsProps) {
  const strategies = initiative
    ? getStrategiesForInitiative(initiative)
    : COLD_START_STRATEGIES;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<string, number[]>>({});

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleStep = (strategyId: string, stepNum: number) => {
    setCompletedSteps((prev) => {
      const current = prev[strategyId] || [];
      if (current.includes(stepNum)) {
        return { ...prev, [strategyId]: current.filter((s) => s !== stepNum) };
      }
      return { ...prev, [strategyId]: [...current, stepNum] };
    });
  };

  const getProgress = (strategy: ColdStartStrategy) => {
    const done = (completedSteps[strategy.id] || []).length;
    return Math.round((done / strategy.steps.length) * 100);
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {!compact && (
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold flex items-center justify-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Cold Start Recipe Cards
          </h3>
          <p className="text-muted-foreground mt-1">
            Pick a strategy. Follow the steps. Scale when ready.
          </p>
        </div>
      )}

      <div className={compact ? "space-y-3" : "grid gap-4 md:grid-cols-2"}>
        {strategies.map((strategy) => {
          const isExpanded = expandedId === strategy.id;
          const progress = getProgress(strategy);
          const done = (completedSteps[strategy.id] || []).length;

          return (
            <Card
              key={strategy.id}
              className={`transition-all duration-300 cursor-pointer border-2 ${
                isExpanded
                  ? "border-primary/50 shadow-lg"
                  : "border-border hover:border-primary/30 hover:shadow-md"
              }`}
            >
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => toggleExpand(strategy.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{strategy.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{strategy.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {strategy.tagline}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge
                    variant="outline"
                    className={DIFFICULTY_COLORS[strategy.difficulty]}
                  >
                    {strategy.difficulty}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {strategy.timeToFirstWin}
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <DollarSign className="w-3 h-3" />
                    {strategy.capitalNeeded}
                  </Badge>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-2 space-y-4">
                  {/* Progress bar */}
                  {done > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          {done}/{strategy.steps.length} steps complete
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Steps */}
                  <div className="space-y-3">
                    {strategy.steps.map((step) => {
                      const isComplete = (
                        completedSteps[strategy.id] || []
                      ).includes(step.step);

                      return (
                        <div
                          key={step.step}
                          className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                            isComplete
                              ? "bg-green-500/10 border border-green-500/20"
                              : "bg-muted/30 border border-transparent"
                          }`}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStep(strategy.id, step.step);
                            }}
                            className="mt-0.5 flex-shrink-0"
                          >
                            {isComplete ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground hover:text-primary" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-muted-foreground">
                                STEP {step.step}
                              </span>
                              <span
                                className={`font-medium text-sm ${
                                  isComplete
                                    ? "text-green-400 line-through"
                                    : ""
                                }`}
                              >
                                {step.action}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.detail}
                            </p>
                            {step.metric && (
                              <div className="flex items-center gap-1 mt-1.5">
                                <Star className="w-3 h-3 text-amber-500" />
                                <span className="text-xs text-amber-500/80 font-medium">
                                  {step.metric}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Guild support callout */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="flex items-start gap-2">
                      <Users className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-primary">
                          Guild Support
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {strategy.guildSupport}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Success metric */}
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                      Success looks like
                    </p>
                    <p className="text-sm font-medium text-emerald-300 mt-1">
                      {strategy.successMetric}
                    </p>
                  </div>

                  {onSelectStrategy && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => onSelectStrategy(strategy)}
                    >
                      Use This Strategy
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
