import { cn } from '@/lib/utils';

interface Props {
  totalSteps: number;
  completedCount: number;
}

export function TreasureMapProgressBar({ totalSteps, completedCount }: Props) {
  const pct = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Progress</span>
        <span className="text-sm text-gray-500">
          {completedCount} of {totalSteps} steps &middot; {pct}%
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            pct === 100 ? 'bg-emerald-500' : 'bg-amber-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct === 100 && (
        <p className="text-sm font-semibold text-emerald-700 mt-2 text-center">
          All steps complete — you're on your way!
        </p>
      )}
    </div>
  );
}
