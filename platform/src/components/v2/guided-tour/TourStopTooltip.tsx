import { TourStop } from "@/hooks/useGuidedTour";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TourControls } from "./TourControls";
import { TourProgressIndicator } from "./TourProgressIndicator";

type TourStopTooltipProps = {
  stop: TourStop;
  currentIndex: number;
  total: number;
  targetRect: DOMRect | null;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onEnd: () => void;
};

export function TourStopTooltip({
  stop,
  currentIndex,
  total,
  targetRect,
  onBack,
  onNext,
  onSkip,
  onEnd,
}: TourStopTooltipProps) {
  const top = targetRect ? Math.min(window.innerHeight - 280, targetRect.bottom + 8) : 96;
  const left = targetRect ? Math.min(window.innerWidth - 360, Math.max(16, targetRect.left)) : 16;

  return (
    <div className="fixed inset-0 z-[260] pointer-events-none">
      <div
        className="absolute pointer-events-auto w-[min(360px,calc(100vw-2rem))]"
        style={{ top, left }}
        data-xray-id="guided-tour-tooltip"
      >
        <Card>
          <CardHeader className="pb-2">
            <TourProgressIndicator current={currentIndex} total={total} />
            <CardTitle className="text-base">{stop.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{stop.body}</p>
            {!targetRect ? (
              <p className="mt-2 text-xs text-muted-foreground">
                This stop is not visible for the current page or role. Continue to the next stop.
              </p>
            ) : null}
            <TourControls
              canBack={currentIndex > 0}
              isLast={currentIndex >= total - 1}
              onBack={onBack}
              onNext={onNext}
              onSkip={onSkip}
              onEnd={onEnd}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
