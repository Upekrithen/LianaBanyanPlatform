import { cn } from '@/lib/utils';

interface SOPPipelineProps {
  counts: Record<string, number>;
  onStageClick?: (status: string) => void;
}

const MAIN_FLOW = [
  { key: 'proposed', label: 'Proposed' },
  { key: 'constitutional_check', label: 'Const. Check' },
  { key: 'initiative_check', label: 'Init. Check' },
  { key: 'approved', label: 'Approved' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'promoted', label: 'Promoted' },
];

const BRANCH_FROM: Record<string, { key: string; label: string }> = {
  constitutional_check: { key: 'rejected', label: 'Rejected' },
  initiative_check: { key: 'rejected', label: 'Rejected' },
  monitoring: { key: 'rolled_back', label: 'Rolled Back' },
};

export function SOPPipeline({ counts, onStageClick }: SOPPipelineProps) {
  const getCount = (k: string) => counts[k] ?? 0;

  return (
    <div className="w-full overflow-x-auto py-4" data-xray-id="sop-pipeline">
      {/* Main flow */}
      <div className="flex items-center gap-1 flex-wrap justify-center">
        {MAIN_FLOW.map((stage, idx) => {
          const count = getCount(stage.key);
          const active = count > 0;
          const branch = BRANCH_FROM[stage.key];

          return (
            <div key={stage.key} className="flex items-center gap-1">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStageClick?.(stage.key)}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-muted-foreground/30'
                  )}
                >
                  {count}
                </button>
                <span className="text-[10px] text-muted-foreground mt-1 text-center max-w-[60px] leading-tight">
                  {stage.label}
                </span>

                {branch && (
                  <div className="flex flex-col items-center mt-1">
                    <div className="w-px h-3 bg-muted-foreground/40" />
                    <button
                      onClick={() => onStageClick?.(branch.key)}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                        getCount(branch.key) > 0
                          ? 'bg-red-500 text-white border-red-500'
                          : 'bg-muted text-muted-foreground border-muted-foreground/30'
                      )}
                    >
                      {getCount(branch.key)}
                    </button>
                    <span className="text-[9px] text-muted-foreground mt-0.5">
                      {branch.label}
                    </span>
                  </div>
                )}
              </div>

              {idx < MAIN_FLOW.length - 1 && (
                <div className="w-6 h-px bg-muted-foreground/40 self-start mt-5" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
