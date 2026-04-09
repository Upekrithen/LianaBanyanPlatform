import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DesignEntry } from "./types";

type DesignerAttributionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: DesignEntry | null;
};

export function DesignerAttributionDrawer({ open, onOpenChange, entry }: DesignerAttributionDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{entry?.designerName ?? "Designer details"}</SheetTitle>
          <SheetDescription>Designers keep 83.3% of revenue when designs move through production and ship.</SheetDescription>
        </SheetHeader>
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-muted-foreground">
            This panel shows attribution details and portfolio links for the selected designer.
          </p>
          {entry?.submissionUrl ? (
            <a href={entry.submissionUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
              Open submission portfolio
            </a>
          ) : (
            <p className="text-muted-foreground">No portfolio URL submitted for this entry.</p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
