import { useState } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { ContestCard } from "@/components/contest";
import { useContests } from "@/hooks/useContests";
import { Trophy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const portalFilters = [
  { label: "All", value: "all" },
  { label: "HexIsle", value: "hexisle" },
  { label: "Marketplace", value: "marketplace" },
];

export default function ContestDirectory() {
  const [portal, setPortal] = useState("all");
  const { data: contests, isLoading } = useContests(portal);

  const upcoming = (contests ?? []).filter(
    (c) => c.status === "upcoming" || new Date(c.submission_start) > new Date()
  );
  const active = (contests ?? []).filter(
    (c) =>
      c.status === "submissions_open" ||
      c.status === "voting_open" ||
      (new Date(c.submission_start) <= new Date() &&
        new Date(c.voting_end) > new Date())
  );
  const past = (contests ?? []).filter((c) => c.status === "complete");

  return (
    <PortalPageLayout
      title="Design Contests"
      subtitle="Compete, create, and earn. Winning designs enter production — you earn from every unit sold."
      maxWidth="2xl"
      xrayId="contest-directory"
    >
      <div className="space-y-8 pb-12">
        {/* Portal filter */}
        <div className="flex items-center gap-2">
          {portalFilters.map((f) => (
            <Button
              key={f.value}
              size="sm"
              variant={portal === f.value ? "default" : "outline"}
              onClick={() => setPortal(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Active contests */}
            {active.length > 0 && (
              <section>
                <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                  <Trophy className="h-5 w-5 text-primary" />
                  Active Contests
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {active.map((c) => (
                    <ContestCard key={c.id} contest={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Upcoming</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {upcoming.map((c) => (
                    <ContestCard key={c.id} contest={c} />
                  ))}
                </div>
              </section>
            )}

            {/* Past */}
            {past.length > 0 && (
              <section>
                <h2 className="mb-4 text-lg font-semibold">Past Contests</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {past.map((c) => (
                    <ContestCard key={c.id} contest={c} />
                  ))}
                </div>
              </section>
            )}

            {!active.length && !upcoming.length && !past.length && (
              <div className="rounded-lg border border-dashed py-16 text-center">
                <Trophy className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium mb-1">No contests yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  Design contests are how makers compete for production runs. The first contest is coming soon!
                </p>
                <Button size="sm" variant="outline" onClick={() => window.location.href = '/projects'}>
                  Browse Projects Instead
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PortalPageLayout>
  );
}
