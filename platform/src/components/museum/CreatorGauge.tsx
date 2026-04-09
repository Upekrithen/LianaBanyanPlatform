/**
 * CreatorGauge — Interactive price slider showing the 83.3% creator retention.
 * Slide the price, see what you keep in real-time.
 * Math: Creator gets price × 0.833333... Platform takes Cost + 20%.
 */
import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface CreatorGaugeProps {
  /** Initial sale price. Default $500. */
  initialPrice?: number;
  /** Min price on slider. */
  min?: number;
  /** Max price on slider. */
  max?: number;
}

export function CreatorGauge({ initialPrice = 500, min = 10, max = 2000 }: CreatorGaugeProps) {
  const [price, setPrice] = useState(initialPrice);

  const creatorKeeps = price * (5 / 6); // 83.333...%
  const platformTakes = price - creatorKeeps;
  const percentage = ((creatorKeeps / price) * 100).toFixed(1);

  return (
    <div className="w-full max-w-sm mx-auto p-5 rounded-xl border border-emerald-500/20 bg-slate-900/80">
      <div className="text-emerald-400/60 text-xs tracking-[0.15em] uppercase mb-4">
        Creator Gauge
      </div>

      <div className="flex items-baseline justify-between mb-1">
        <span className="text-slate-400 text-sm">If you sell:</span>
        <span className="text-white text-2xl font-bold tabular-nums">
          ${price.toLocaleString()}
        </span>
      </div>

      <Slider
        value={[price]}
        onValueChange={([v]) => setPrice(v)}
        min={min}
        max={max}
        step={10}
        className="my-4"
      />

      <div className="flex items-baseline justify-between mb-2">
        <span className="text-slate-400 text-sm">You keep:</span>
        <span className="text-emerald-400 text-2xl font-bold tabular-nums">
          ${creatorKeeps.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>

      {/* Retention bar */}
      <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden mb-3">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-slate-500">
        <span>{percentage}% yours</span>
        <span>
          ${platformTakes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} platform (Cost + 20%)
        </span>
      </div>
    </div>
  );
}

export default CreatorGauge;
