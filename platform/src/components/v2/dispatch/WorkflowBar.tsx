import { DispatchWorkflowState } from "@/components/v2/dispatch/types";
import { cn } from "@/lib/utils";

type WorkflowBarProps = {
  activeState: DispatchWorkflowState;
};

const STATES: DispatchWorkflowState[] = ["Draft", "Review", "Scheduled", "Dispatched", "Archived"];

export function WorkflowBar({ activeState }: WorkflowBarProps) {
  const activeIndex = STATES.indexOf(activeState);

  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold">Workflow</h2>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {STATES.map((state, index) => (
          <div
            key={state}
            className={cn(
              "rounded-md border px-3 py-2 text-center text-sm",
              index < activeIndex && "border-emerald-500/50 bg-emerald-500/10",
              index === activeIndex && "border-primary bg-primary/10 font-medium",
              index > activeIndex && "border-border text-muted-foreground",
            )}
          >
            {state}
          </div>
        ))}
      </div>
    </section>
  );
}
