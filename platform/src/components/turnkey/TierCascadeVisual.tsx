import { Check, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const TIER_META: Record<string, { label: string; target: string }> = {
  prototype: { label: 'Prototype', target: '1' },
  early_adopter: { label: 'Early Adopter', target: '50' },
  tier2_500: { label: 'Tier 2', target: '500' },
  tier3_5k: { label: 'Tier 3', target: '5K' },
  tier4_mass: { label: 'Tier 4', target: '50K' },
};

const TIER_ORDER = ['prototype', 'early_adopter', 'tier2_500', 'tier3_5k', 'tier4_mass'];

interface TierCascadeVisualProps {
  currentTier: string;
  earlyAdopterFilled?: number;
  earlyAdopterSlots?: number;
}

export function TierCascadeVisual({ currentTier, earlyAdopterFilled = 0, earlyAdopterSlots = 50 }: TierCascadeVisualProps) {
  const currentIdx = TIER_ORDER.indexOf(currentTier);

  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-2">
      {TIER_ORDER.map((tier, idx) => {
        const meta = TIER_META[tier];
        const isComplete = idx < currentIdx;
        const isCurrent = idx === currentIdx;
        const isLocked = idx > currentIdx;
        const fillPct = isCurrent && tier === 'early_adopter'
          ? Math.min((earlyAdopterFilled / earlyAdopterSlots) * 100, 100)
          : isCurrent ? 50 : 0;

        return (
          <div key={tier} className="flex items-center">
            <div className={`relative flex flex-col items-center px-3 py-2 rounded-lg border text-xs min-w-[80px] transition-colors ${
              isComplete ? 'bg-emerald-50 border-emerald-300 text-emerald-700' :
              isCurrent ? 'bg-blue-50 border-blue-400 text-blue-700 ring-2 ring-blue-200' :
              'bg-muted/50 border-muted text-muted-foreground'
            }`}>
              {isComplete && <Check className="w-4 h-4 text-emerald-500 mb-0.5" />}
              {isLocked && <Lock className="w-3 h-3 mb-0.5 opacity-50" />}
              <span className="font-medium">{meta.label}</span>
              <span className="text-[10px] opacity-70">{meta.target} units</span>
              {isCurrent && (
                <div className="w-full mt-1">
                  <Progress value={fillPct} className="h-1.5 [&>div]:bg-blue-500" />
                </div>
              )}
            </div>
            {idx < TIER_ORDER.length - 1 && (
              <span className={`mx-0.5 text-sm ${idx < currentIdx ? 'text-emerald-400' : 'text-muted-foreground/30'}`}>→</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
