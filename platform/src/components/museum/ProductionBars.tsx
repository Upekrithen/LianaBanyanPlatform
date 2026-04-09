/**
 * ProductionBars — 6-tier progress bars showing initiative health.
 * Each bar shows a label, current/target, and fill percentage.
 */

interface ProductionBar {
  label: string;
  current: number;
  target: number;
  unit?: string;
}

interface ProductionBarsProps {
  bars: ProductionBar[];
}

export function ProductionBars({ bars }: ProductionBarsProps) {
  return (
    <div className="space-y-3">
      {bars.map((bar) => {
        const pct = Math.min((bar.current / bar.target) * 100, 100);
        const display = bar.unit === "$"
          ? `$${bar.current.toLocaleString()}/$${bar.target.toLocaleString()}`
          : `${bar.current}/${bar.target}`;

        return (
          <div key={bar.label}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-400">{bar.label}</span>
              <span className="text-slate-500 tabular-nums">{display}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ProductionBars;
