type AdaptArcVisualizationProps = {
  score: number;
};

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-600";
  if (score >= 70) return "text-blue-600";
  if (score >= 55) return "text-amber-600";
  return "text-slate-600";
}

export function AdaptArcVisualization({ score }: AdaptArcVisualizationProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const progress = clamped / 100;
  const radius = 26;
  const circumference = Math.PI * radius;
  const strokeDasharray = `${circumference}`;
  const strokeDashoffset = `${circumference * (1 - progress)}`;

  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 64 40" className="h-10 w-16" aria-label={`ADAPT ${clamped}`}>
        <path
          d="M 6 32 A 26 26 0 0 1 58 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/50"
          strokeLinecap="round"
        />
        <path
          d="M 6 32 A 26 26 0 0 1 58 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className={scoreTone(clamped)}
          strokeLinecap="round"
          style={{ strokeDasharray, strokeDashoffset }}
        />
      </svg>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">ADAPT</p>
        <p className={`text-sm font-semibold ${scoreTone(clamped)}`}>{clamped}</p>
      </div>
    </div>
  );
}
