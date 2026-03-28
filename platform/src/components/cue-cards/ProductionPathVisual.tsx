interface ProductionPathVisualProps {
  path: string;
}

export function ProductionPathVisual({ path }: ProductionPathVisualProps) {
  const steps = path.split('→').map(s => s.trim());

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            {step}
          </span>
          {i < steps.length - 1 && (
            <span className="mx-1 text-muted-foreground">→</span>
          )}
        </div>
      ))}
    </div>
  );
}
