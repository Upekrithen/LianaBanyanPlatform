/**
 * WALKTHROUGH SEQUENCE — Step-by-step card deck for live onboarding (Session 5 V1).
 * One card at a time, prev/next, flag feedback. data-xray-id: walkthrough-sequence
 */

import { useState } from "react";
import { WalkthroughCard } from "./WalkthroughCard";
import { WalkthroughFeedback } from "./WalkthroughFeedback";
import type { WalkthroughStepRow } from "./WalkthroughCard";

export interface WalkthroughSequenceProps {
  steps: WalkthroughStepRow[];
  ambassadorId: string;
  recruitId: string | null;
  onComplete?: () => void;
  className?: string;
}

export function WalkthroughSequence({
  steps,
  ambassadorId,
  recruitId,
  onComplete,
  className,
}: WalkthroughSequenceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!steps.length) {
    return (
      <div className="text-muted-foreground text-center p-8" data-xray-id="walkthrough-sequence">
        <p>No walkthrough steps loaded. Add steps to the default sequence in the database.</p>
      </div>
    );
  }

  const step = steps[currentIndex];
  const isLast = currentIndex >= steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete?.();
      return;
    }
    setCurrentIndex((i) => i + 1);
  };

  const handleFlagSubmitted = () => {
    setShowFeedback(false);
    handleNext();
  };

  return (
    <div className={className} data-xray-id="walkthrough-sequence">
      {showFeedback ? (
        <WalkthroughFeedback
          stepId={step.id}
          ambassadorId={ambassadorId}
          recruitId={recruitId}
          onSubmitted={handleFlagSubmitted}
          onCancel={() => setShowFeedback(false)}
        />
      ) : (
        <WalkthroughCard
          step={step}
          current={currentIndex + 1}
          total={steps.length}
          onNext={handleNext}
          onPrev={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          onFlag={() => setShowFeedback(true)}
          isLastStep={isLast}
        />
      )}
    </div>
  );
}
