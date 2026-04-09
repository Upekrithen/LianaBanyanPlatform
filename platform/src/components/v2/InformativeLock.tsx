import { Button } from "@/components/ui/button";

type InformativeLockProps = {
  action: string;
  joinHref?: string;
};

export function InformativeLock({ action, joinHref = "/membership" }: InformativeLockProps) {
  return (
    <section className="rounded-lg border bg-muted/30 p-4 sm:p-5">
      <p className="text-sm font-medium">Members can {action} here.</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Join for $5/year to access this workspace capability.
      </p>
      <div className="mt-3">
        <Button asChild size="sm">
          <a href={joinHref}>Become a member</a>
        </Button>
      </div>
    </section>
  );
}
