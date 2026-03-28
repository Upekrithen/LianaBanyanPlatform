import { Progress } from '@/components/ui/progress';

interface EarlyAdopterMeterProps {
  filled: number;
  total: number;
}

export function EarlyAdopterMeter({ filled, total }: EarlyAdopterMeterProps) {
  const remaining = Math.max(total - filled, 0);
  const pct = total > 0 ? Math.min((filled / total) * 100, 100) : 0;
  const isUrgent = remaining <= 10 && remaining > 0;

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className="font-medium">Early Adopter Slots</span>
        <span className={isUrgent ? 'text-amber-600 font-bold animate-pulse' : 'text-muted-foreground'}>
          {remaining} of {total} remaining
        </span>
      </div>
      <Progress value={pct} className={`h-2.5 ${isUrgent ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500'}`} />
      <p className="text-[10px] text-muted-foreground">
        {filled}/{total} slots filled
      </p>
    </div>
  );
}
