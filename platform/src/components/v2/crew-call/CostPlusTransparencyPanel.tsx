import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

const STORAGE_KEY = "crew-call-cost-plus-open";

export function CostPlusTransparencyPanel() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === "false") setOpen(false);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(open));
    } catch {
      // no-op
    }
  }, [open]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Cost+20% transparency</CardTitle>
      </CardHeader>
      <CardContent>
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between px-0">
              <span>How crew rates are shown</span>
              {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 text-sm text-muted-foreground">
            <p>Rates describe real service cost plus the fixed 20% platform margin.</p>
            <p>ADAPT visibility helps you compare service reliability without leaderboard pressure.</p>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
