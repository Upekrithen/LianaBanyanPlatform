import { Button } from "@/components/ui/button";

export function HexIsleFooter() {
  return (
    <footer className="rounded-xl border bg-muted/20 p-6">
      <h2 className="text-xl font-semibold tracking-tight">About the cooperative behind HexIsle</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        HexIsle is developed within the broader Liana Banyan cooperative platform, where game
        engagement, production pathways, and community participation can connect over time.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <a href="/membership">Membership context</a>
        </Button>
        <Button asChild>
          <a href="/hexisle/world-map">Enter the Island Gate</a>
        </Button>
      </div>
    </footer>
  );
}
