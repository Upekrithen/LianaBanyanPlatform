/**
 * TREASURE MAP QUESTION — Single- or multi-select question screen
 * Reusable for all 7 quiz steps. Back button, progress, and slide transition handled by parent.
 */

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { TreasureMapQuestionDef, QuestionOption } from "./treasureMapQuestions";
import type { Play } from "./treasureMapEngine";

interface TreasureMapQuestionProps {
  definition: TreasureMapQuestionDef;
  stepIndex: number;
  totalSteps: number;
  selectedIds: string[];
  onSelect: (optionId: string) => void;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  /** Preview plays shown progressively after answering a question */
  previewPlays?: Play[];
  /** Callback to jump directly to the full results view */
  onShowResults?: () => void;
  /** Whether this is the final question (triggers auto-show of results label) */
  isFinalQuestion?: boolean;
}

export function TreasureMapQuestion({
  definition,
  stepIndex,
  totalSteps,
  selectedIds,
  onSelect,
  onBack,
  onNext,
  canAdvance,
  previewPlays,
  onShowResults,
  isFinalQuestion,
}: TreasureMapQuestionProps) {
  const isMulti = definition.type === "multi";
  const maxSelections = definition.maxSelections ?? 999;

  const handleOptionClick = (optionId: string) => {
    if (isMulti) {
      const already = selectedIds.includes(optionId);
      if (already) {
        onSelect(optionId); // parent will toggle
        return;
      }
      if (selectedIds.length >= maxSelections) return;
    }
    onSelect(optionId);
  };

  const selectedSet = new Set(selectedIds);
  const countLabel = isMulti && maxSelections < 999 ? `${selectedIds.length}/${maxSelections} selected` : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-6 md:p-8">
      {/* Progress */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Step {stepIndex + 1} of {totalSteps}
        </p>
        <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden flex">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-full flex-1 transition-colors",
                i <= stepIndex ? "bg-green-500" : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Back */}
      <Button
        variant="ghost"
        size="sm"
        className="self-start -ml-2 mb-4 text-muted-foreground hover:text-foreground"
        onClick={onBack}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      {/* Question */}
      <h2 className="text-2xl md:text-3xl font-bold mb-2">{definition.question}</h2>
      {countLabel && (
        <p className="text-sm text-muted-foreground mb-4">{countLabel}</p>
      )}

      {/* Options — large tap targets */}
      <div className="flex-1 space-y-3 mt-4">
        {definition.options.map((opt) => {
          const isSelected = selectedSet.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleOptionClick(opt.id)}
              className={cn(
                "w-full text-left p-4 md:p-5 rounded-xl border-2 transition-all",
                "bg-card hover:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background",
                isSelected ? "border-green-500 bg-green-500/10" : "border-border"
              )}
            >
              <span className="font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {definition.microcopy && (
        <p className="text-sm text-muted-foreground mt-4 italic">{definition.microcopy}</p>
      )}

      {/* Next */}
      <div className="mt-8">
        <Button
          size="lg"
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={isFinalQuestion ? onShowResults : onNext}
          disabled={!canAdvance}
        >
          {isFinalQuestion ? "Show My Results" : "Next"}
        </Button>
      </div>

      {/* Progressive play preview — shown after answering at least 1 question */}
      {previewPlays && previewPlays.length > 0 && (
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            Based on your answers so far:
          </p>
          <div className="space-y-3">
            {previewPlays.map((play) => (
              <div
                key={play.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
              >
                <span className="text-2xl shrink-0" aria-hidden>{play.icon}</span>
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight">{play.title}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{play.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
          {onShowResults && !isFinalQuestion && (
            <button
              type="button"
              className="mt-4 text-green-500 hover:underline text-sm font-medium flex items-center gap-1"
              onClick={onShowResults}
            >
              These look good — show me the full details
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
