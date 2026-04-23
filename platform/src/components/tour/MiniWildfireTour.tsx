/**
 * MiniWildfireTour — Multi-mascot narrated tour component.
 * =========================================================
 * Renders a row (or column) of mascots. One mascot is "speaking" at a time
 * (summoned={true}); all others are muted (summoned={false}). The speaker
 * swaps as the tour advances.
 *
 * X-Ray mode is handled entirely by Mascot.tsx — summoned+xray → thermal,
 * summoned+normal → colored, not-summoned → muted. No special casing here.
 *
 * K454 / B119
 */
import { useState, useEffect, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import { Mascot } from "@/components/museum/Mascot";
import { MascotBubble } from "@/components/v2/mascot/MascotBubble";
import { getMascot } from "@/data/mascots";

export interface TourStep {
  /** Mascot id from the registry — this mascot speaks on this step. */
  speakerId: string;
  /** Short topic title displayed in the bubble header. */
  topic: string;
  /** The narration body — can include JSX. */
  message: ReactNode;
  /** Optional helper text below the main message. */
  helperMessage?: ReactNode;
  /** Auto-advance after N ms. If omitted, user must click Next. */
  durationMs?: number;
}

export interface MiniWildfireTourProps {
  /** Ordered narration sequence (2+ steps). */
  steps: TourStep[];
  /** All mascot ids visible across the tour (superset of speakerIds). */
  allMascots: string[];
  /** Start playing automatically. Default false — user presses Play. */
  autoPlay?: boolean;
  /** Called when the tour finishes or Skip is pressed. */
  onComplete?: () => void;
  /** Layout direction for the mascot row. Default horizontal. */
  layout?: "horizontal" | "vertical";
  /** Mascot image size in px. Default 80. */
  mascotSize?: number;
  /** Additional className on the outer wrapper. */
  className?: string;
}

export function MiniWildfireTour({
  steps,
  allMascots,
  autoPlay = false,
  onComplete,
  layout = "horizontal",
  mascotSize = 80,
  className = "",
}: MiniWildfireTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advance = useCallback(() => {
    clearTimer();
    if (currentStep >= steps.length - 1) {
      setPlaying(false);
      onComplete?.();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [clearTimer, currentStep, steps.length, onComplete]);

  const previous = useCallback(() => {
    clearTimer();
    setCurrentStep((s) => Math.max(0, s - 1));
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    setPlaying(false);
    onComplete?.();
  }, [clearTimer, onComplete]);

  const togglePlay = useCallback(() => {
    setPlaying((p) => !p);
  }, []);

  // Auto-advance when playing and the current step has a durationMs.
  useEffect(() => {
    clearTimer();
    if (playing && step.durationMs) {
      timerRef.current = setTimeout(advance, step.durationMs);
    }
    return clearTimer;
  }, [playing, currentStep, step.durationMs, advance, clearTimer]);

  const speakerMascot = getMascot(step.speakerId);
  const bubbleTitle = `${speakerMascot.name} — ${step.topic}`;

  const isHorizontal = layout === "horizontal";

  // Progress bar fill percentage
  const progressPct = ((currentStep + 1) / steps.length) * 100;

  return (
    <div
      className={`flex flex-col gap-4 ${className}`}
      style={{
        background: "rgba(10, 16, 30, 0.97)",
        border: "1.5px solid rgba(250, 245, 235, 0.12)",
        borderRadius: "16px",
        padding: "24px",
        maxWidth: isHorizontal ? "100%" : "420px",
      }}
    >
      {/* Step counter + progress */}
      <div className="flex items-center gap-3">
        <span
          className="text-[11px] font-mono tabular-nums"
          style={{ color: "rgba(250, 245, 235, 0.45)" }}
        >
          {currentStep + 1} of {steps.length}
        </span>
        <div
          className="flex-1 rounded-full overflow-hidden"
          style={{
            height: "3px",
            background: "rgba(250, 245, 235, 0.1)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progressPct}%`,
              background: "rgba(56, 161, 105, 0.7)",
            }}
          />
        </div>
      </div>

      {/* Mascot row + bubble */}
      <div
        className={`flex ${isHorizontal ? "flex-col items-start gap-4" : "flex-row items-start gap-4"}`}
      >
        {/* Mascot row/column */}
        <div
          className={`flex ${isHorizontal ? "flex-row" : "flex-col"} items-center gap-3 flex-shrink-0`}
        >
          {allMascots.map((id, idx) => (
            <Mascot
              key={id}
              id={id}
              size={mascotSize}
              summoned={id === step.speakerId}
              disableHover
              // Only the speaking mascot responds to X-Ray (goes thermal).
              // Non-speakers stay muted regardless — per Founder spec B119.
              respondToXRay={id === step.speakerId}
              hologramDelay={(idx % 6) as 0 | 1 | 2 | 3 | 4 | 5}
            />
          ))}
        </div>

        {/* Speaker bubble */}
        <div className="flex-1 min-w-0">
          <MascotBubble
            title={bubbleTitle}
            titleColor="#38a169"
            borderColor="rgba(56, 161, 105, 0.45)"
            message={step.message}
            helperMessage={step.helperMessage}
            showIcon={false}
            maxWidth={600}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-1">
        {/* Previous */}
        <button
          onClick={previous}
          disabled={isFirst}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: isFirst
              ? "rgba(250, 245, 235, 0.04)"
              : "rgba(250, 245, 235, 0.09)",
            color: isFirst
              ? "rgba(250, 245, 235, 0.25)"
              : "rgba(250, 245, 235, 0.65)",
            border: "1px solid rgba(250, 245, 235, 0.08)",
            cursor: isFirst ? "not-allowed" : "pointer",
          }}
        >
          ← Prev
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: playing
              ? "rgba(56, 161, 105, 0.18)"
              : "rgba(250, 245, 235, 0.09)",
            color: playing ? "#68d391" : "rgba(250, 245, 235, 0.65)",
            border: `1px solid ${playing ? "rgba(56, 161, 105, 0.35)" : "rgba(250, 245, 235, 0.08)"}`,
            cursor: "pointer",
          }}
        >
          {playing ? "⏸ Pause" : "▶ Play"}
        </button>

        {/* Next */}
        <button
          onClick={advance}
          className="px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: "rgba(56, 161, 105, 0.15)",
            color: "#68d391",
            border: "1px solid rgba(56, 161, 105, 0.3)",
            cursor: "pointer",
          }}
        >
          {isLast ? "Finish ✓" : "Next →"}
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Skip */}
        {!isLast && (
          <button
            onClick={skip}
            className="px-3 py-1.5 rounded-lg text-[11px] transition-all"
            style={{
              background: "transparent",
              color: "rgba(250, 245, 235, 0.3)",
              border: "1px solid rgba(250, 245, 235, 0.06)",
              cursor: "pointer",
            }}
          >
            Skip tour
          </button>
        )}
      </div>
    </div>
  );
}

export default MiniWildfireTour;
