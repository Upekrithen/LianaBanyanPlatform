import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type StepperProps = {
  steps: string[];
  currentStep: number;
  onSelectStep?: (step: number) => void;
};

export function Stepper({ steps, currentStep, onSelectStep }: StepperProps) {
  return (
    <ol className="space-y-2">
      {steps.map((label, index) => {
        const step = index + 1;
        const isComplete = step < currentStep;
        const isCurrent = step === currentStep;

        return (
          <li key={label}>
            <button
              type="button"
              onClick={() => onSelectStep?.(step)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                isCurrent && "border-primary bg-primary/10",
                isComplete && "border-emerald-500/40 bg-emerald-500/10",
                !isCurrent && !isComplete && "border-border bg-card/40 hover:bg-card/70",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold",
                  isCurrent && "bg-primary text-primary-foreground",
                  isComplete && "bg-emerald-600 text-white",
                  !isCurrent && !isComplete && "bg-muted text-muted-foreground",
                )}
              >
                {isComplete ? <Check className="h-4 w-4" /> : step}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
