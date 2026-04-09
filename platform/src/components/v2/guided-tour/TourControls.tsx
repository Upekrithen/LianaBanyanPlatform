import { Button } from "@/components/ui/button";

type TourControlsProps = {
  canBack: boolean;
  isLast: boolean;
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  onEnd: () => void;
};

export function TourControls({
  canBack,
  isLast,
  onBack,
  onNext,
  onSkip,
  onEnd,
}: TourControlsProps) {
  return (
    <div className="mt-4 flex flex-wrap gap-2" data-xray-id="guided-tour-controls">
      <Button type="button" variant="ghost" onClick={onSkip}>
        Skip
      </Button>
      <Button type="button" variant="outline" onClick={onBack} disabled={!canBack}>
        Back
      </Button>
      {isLast ? (
        <Button type="button" onClick={onEnd}>
          End
        </Button>
      ) : (
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      )}
    </div>
  );
}
