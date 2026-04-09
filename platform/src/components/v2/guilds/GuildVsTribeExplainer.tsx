import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GuildVsTribeExplainer() {
  return (
    <Card id="guild-vs-tribe-explainer" className="border-indigo-300/70 bg-indigo-50/40 dark:border-indigo-900 dark:bg-indigo-950/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Guild vs Tribe</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 text-sm">
        <div className="rounded-lg border p-3">
          <p className="font-semibold">Guild = professional</p>
          <p className="text-muted-foreground">
            Discipline bodies with charters, representation, thresholds, and staked Marks participation.
          </p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="font-semibold">Tribe = personal</p>
          <p className="text-muted-foreground">
            Neighborhood, family, hobby, and life-circle groups outside of professional governance pathways.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
