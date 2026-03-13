/**
 * WALKTHROUGH CARD — Single step display for Ambassador live onboarding.
 * SAY / THEY SHOULD SEE / TIP / COMMON QUESTIONS. data-xray-id on key elements.
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface WalkthroughStepRow {
  id: string;
  step_number: number;
  title: string;
  instruction: string;
  screen_hint: string | null;
  tip: string | null;
  common_questions: string[] | null;
  estimated_seconds: number | null;
  requires_action: boolean;
  action_label: string | null;
}

export interface WalkthroughCardProps {
  step: WalkthroughStepRow;
  current: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onFlag: () => void;
  isLastStep?: boolean;
  className?: string;
}

export function WalkthroughCard({
  step,
  current,
  total,
  onNext,
  onPrev,
  onFlag,
  isLastStep,
  className,
}: WalkthroughCardProps) {
  const minutes = step.estimated_seconds != null ? Math.round(step.estimated_seconds / 60) : null;
  const questions = step.common_questions ?? [];

  return (
    <Card className={cn("border-2 border-border", className)} data-xray-id="walkthrough-card">
      <CardHeader className="pb-2">
        <p className="text-sm text-muted-foreground">
          Step {current} of {total}
        </p>
        <h2 className="text-xl font-semibold">📋 {step.title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Say</p>
          <p className="text-base leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
            {step.instruction}
          </p>
        </div>
        {step.screen_hint && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">👀 They should see</p>
            <p className="text-sm text-muted-foreground rounded-lg p-2 bg-muted/20">
              {step.screen_hint}
            </p>
          </div>
        )}
        {step.tip && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">💡 Tip</p>
            <p className="text-sm rounded-lg p-2 bg-amber-500/10 border border-amber-500/20 text-foreground">
              {step.tip}
            </p>
          </div>
        )}
        {questions.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">❓ Common questions</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </div>
        )}
        {minutes != null && (
          <p className="text-xs text-muted-foreground">⏱ ~{minutes} min</p>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onFlag} data-xray-id="walkthrough-flag-btn">
            ⚠ Flag this step
          </Button>
          <Button variant="outline" size="sm" onClick={onPrev} disabled={current <= 1}>
            ← Prev
          </Button>
          <Button size="sm" onClick={onNext} data-xray-id="walkthrough-next-btn">
            {isLastStep ? "Done →" : "Next step →"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
