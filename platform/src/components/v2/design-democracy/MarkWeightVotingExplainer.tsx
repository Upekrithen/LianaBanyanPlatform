import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "design-democracy-vote-explainer-seen-v1";

export function MarkWeightVotingExplainer() {
  const hasSeen = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  }, []);
  const [open, setOpen] = useState(!hasSeen);

  useEffect(() => {
    if (!open && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [open]);

  return (
    <Card data-xray-id="design-democracy-vote-explainer">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">How Credits-weighted voting works</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Collapse" : "Expand"}
          </Button>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Submitting a design is free. Voting uses Credits from your ledger balance.</p>
          <p>Each vote adds Credits weight to a design. We frame outcomes relatively: Leading, Strong contender, or Needs votes.</p>
          <p>Votes move winners through the 4-stage production pipeline to shipped goods.</p>
        </CardContent>
      )}
    </Card>
  );
}
