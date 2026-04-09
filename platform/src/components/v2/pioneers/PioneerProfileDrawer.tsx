import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { PioneerPerson } from "./types";

type PioneerProfileDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  person: PioneerPerson | null;
};

export function PioneerProfileDrawer({ open, onOpenChange, person }: PioneerProfileDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl" data-xray-id="pioneers-profile-drawer">
        <SheetHeader>
          <SheetTitle>{person?.displayName ?? "Member profile"}</SheetTitle>
          <SheetDescription>{person?.tagline ?? "Narrative profile with contribution chapters."}</SheetDescription>
        </SheetHeader>
        {person ? (
          <div className="mt-4 space-y-4 text-sm">
            <div className="flex flex-wrap gap-1.5">
              {person.badges.map((badge) => (
                <Badge key={badge.id} variant="secondary">
                  {badge.label}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground">{person.story}</p>
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Contribution list</p>
              {person.contributions.map((item) => (
                <div key={item} className="rounded-md border bg-muted/20 px-3 py-2 text-xs">
                  {item}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
