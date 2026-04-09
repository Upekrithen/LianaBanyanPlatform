type TourProgressIndicatorProps = {
  current: number;
  total: number;
};

export function TourProgressIndicator({ current, total }: TourProgressIndicatorProps) {
  return (
    <div className="text-xs text-muted-foreground" data-xray-id="guided-tour-progress">
      Step {Math.min(current + 1, total)} of {total}
    </div>
  );
}
