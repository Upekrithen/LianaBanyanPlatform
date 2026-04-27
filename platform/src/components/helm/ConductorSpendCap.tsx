/**
 * ConductorSpendCap — Member-Facing Spend Cap Editor
 * K525 · Phase B.5 · Innovation #2277 + #2272
 *
 * Lets the member set/clear a monthly USD ceiling on Conductor-routed AI
 * spend. Reads + writes via `costCap.ts` against the `members` table.
 *
 * Why this lives in the Conductor tab (not a global settings page):
 *   - The cap is conceptually paired with the Cost Ticker right above it
 *   - Members editing their cap are already on the Conductor surface
 *   - Mid-tier complexity feature; lives in Nerd-Mode-adjacent territory
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkSpendCap,
  setSpendCap,
  type SpendCapCheck,
} from "@/lib/conductor/costCap";
import { Wallet, AlertTriangle } from "lucide-react";

export function ConductorSpendCap() {
  const { user } = useAuth();
  const [state, setState] = useState<SpendCapCheck | null>(null);
  const [draftCap, setDraftCap] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void checkSpendCap(user.id).then((s) => {
      if (cancelled) return;
      setState(s);
      setDraftCap(s.monthlyCapUsd != null ? String(s.monthlyCapUsd) : "");
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user || !state) {
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    const trimmed = draftCap.trim();
    const parsed = trimmed === "" ? null : Number.parseFloat(trimmed);
    if (parsed !== null && (Number.isNaN(parsed) || parsed < 0)) {
      setFeedback("Please enter a non-negative number, or leave blank to clear the cap.");
      setSaving(false);
      return;
    }
    const ok = await setSpendCap(user.id, parsed);
    if (ok) {
      setFeedback(parsed === null ? "Cap cleared." : `Cap set to $${parsed.toFixed(2)}/mo.`);
      const next = await checkSpendCap(user.id);
      setState(next);
    } else {
      setFeedback("Couldn't save the cap. Try again or check your connection.");
    }
    setSaving(false);
  };

  const exceeded = state.capExceeded;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Monthly Spend Cap
          {state.monthlyCapUsd != null && (
            <Badge variant="outline" className="text-[10px] ml-auto">
              ${state.monthlyTotalUsd.toFixed(4)} / ${state.monthlyCapUsd.toFixed(2)}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Optional monthly USD ceiling on Conductor-routed AI spend. When the
          cap is reached, the Conductor switches to manual mode so no new
          query incurs cost without your explicit pick. Leave blank for no cap.
        </p>

        {exceeded && (
          <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 p-2 text-xs dark:border-amber-700 dark:bg-amber-950/30">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <span>
              You've reached your cap for {state.periodStart.slice(0, 7)}. The
              Conductor is in manual mode until the next billing period or
              until you raise the cap.
            </span>
          </div>
        )}

        <div className="flex gap-2 items-center">
          <span className="text-sm">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={draftCap}
            placeholder="No cap"
            onChange={(e) => setDraftCap(e.target.value)}
            className="max-w-[150px]"
          />
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Saving…" : "Save Cap"}
          </Button>
        </div>

        {feedback && (
          <p className="text-xs text-muted-foreground">{feedback}</p>
        )}
      </CardContent>
    </Card>
  );
}
