import { Check, Circle, ArrowRight, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { TreasureMapStep as StepType } from '@/hooks/useCraftTreasureMaps';

interface Props {
  step: StepType;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onToggle: () => void;
  isAuthenticated: boolean;
}

export function TreasureMapStepCard({ step, isCompleted, isCurrent, isLocked, onToggle, isAuthenticated }: Props) {
  return (
    <div
      className={cn(
        'relative rounded-xl border-2 p-5 transition-all',
        isCompleted && 'border-emerald-300 bg-emerald-50/50',
        isCurrent && !isCompleted && 'border-amber-400 bg-amber-50/50 shadow-md',
        isLocked && !isCompleted && !isCurrent && 'border-gray-100 bg-gray-50/30 opacity-60',
        !isCompleted && !isCurrent && !isLocked && 'border-gray-200 bg-white',
      )}
    >
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          disabled={!isAuthenticated}
          className={cn(
            'mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all',
            isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-gray-300 hover:border-amber-400',
            !isAuthenticated && 'cursor-default',
          )}
          title={isAuthenticated ? (isCompleted ? 'Mark incomplete' : 'Mark complete') : 'Sign in to track progress'}
        >
          {isCompleted ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3 text-gray-300" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Step {step.order}</span>
            {isCurrent && !isCompleted && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Current</span>
            )}
          </div>
          <h3 className={cn('text-base font-semibold mb-1', isCompleted ? 'text-emerald-800 line-through decoration-2' : 'text-gray-900')}>
            {step.title}
          </h3>
          <p className="text-sm text-gray-600 mb-3">{step.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {step.time_estimate}</span>
            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {step.cost_estimate}</span>
          </div>

          {step.link && !isCompleted && (
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto text-amber-700 hover:text-amber-900"
              onClick={() => {
                if (step.link.startsWith('http')) {
                  window.open(step.link, '_blank', 'noopener');
                } else {
                  window.location.href = step.link;
                }
              }}
            >
              Go to this step <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
