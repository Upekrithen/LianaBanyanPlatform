import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SpanishPortalCallout() {
  return (
    <section className="rounded-xl border bg-card p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold">¿Prefieres jugar en español?</p>
          <p className="text-sm text-muted-foreground">
            Hexislo is a sibling world with shared spirit and its own language-first play surface.
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="https://hexislo.com" target="_blank" rel="noreferrer">
            <Globe2 className="mr-2 h-4 w-4" />
            Go to hexislo.com
          </a>
        </Button>
      </div>
    </section>
  );
}
