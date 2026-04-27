/**
 * ConductorReceiptCard — Cost-Slasher Receipt Surface (#2272 closure)
 * K525 · Phase C.1 · Innovation #2272 + #2277
 *
 * The member-facing receipt that surfaces real-dollar Conductor savings and
 * lets the member opt in to publicly sharing those savings.
 *
 * Surface model:
 *   1. Personal receipt — always visible to the member themselves (private).
 *   2. Public share toggle — OPT-IN per B129 ratification. Default OFF; only
 *      members who explicitly opt in expose a public-shareable savings receipt
 *      (the "Cost-Slasher receipt" surface). Until Prov 14 trigger,
 *      `CONDUCTOR_RECEIPT_PUBLIC_SHARE` flag remains FALSE — so even opted-in
 *      members see "Public sharing locked until Prov 14." The toggle still
 *      works (so opt-in is recorded ahead of time), but the public URL is
 *      not yet generated.
 *
 * No PII in receipts. Only: month, total saved, vendor mix percentages,
 * member's first name + initial (or display name) if they opted in to be
 * named in their receipt; otherwise anonymized.
 *
 * The aggregate platform-wide receipt dashboard ($X saved across N members
 * this month) is BUILT but FLAG-GATED on `CONDUCTOR_RECEIPT_PUBLIC_SHARE` —
 * not displayed to anyone (including the Founder in dogfood) until Prov 14.
 */

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Receipt, Lock, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useFeatureFlag } from "@/hooks/useFeatureFlag";
import { getCostSummary } from "@/lib/conductor/telemetry";

const RECEIPT_WINDOW_HOURS = 24 * 30; // 30-day rolling

async function _readOptIn(userId: string): Promise<boolean> {
  try {
    const { data, error } = await (supabase as any)
      .from("members")
      .select("conductor_receipt_share_optin")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return false;
    return !!data.conductor_receipt_share_optin;
  } catch {
    return false;
  }
}

async function _writeOptIn(userId: string, value: boolean): Promise<boolean> {
  try {
    const { error } = await (supabase as any)
      .from("members")
      .update({ conductor_receipt_share_optin: value })
      .eq("id", userId);
    return !error;
  } catch {
    return false;
  }
}

export function ConductorReceiptCard() {
  const { user } = useAuth();
  const { enabled: publicShareEnabled } = useFeatureFlag(
    "CONDUCTOR_RECEIPT_PUBLIC_SHARE",
  );
  const [optIn, setOptIn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Read 30-day summary for the receipt
  const summary = getCostSummary(RECEIPT_WINDOW_HOURS);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    void _readOptIn(user.id).then((v) => {
      if (cancelled) return;
      setOptIn(v);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return null;

  const handleToggle = async (next: boolean) => {
    setOptIn(next); // optimistic
    const ok = await _writeOptIn(user.id, next);
    if (!ok) setOptIn(!next); // revert on failure
  };

  const showPublicShareSection = publicShareEnabled;

  return (
    <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          Cost-Slasher Receipt
          <Badge variant="outline" className="text-[10px] ml-auto">
            Last 30 days
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Personal receipt */}
        <div className="grid grid-cols-3 gap-2 text-center bg-background/60 rounded-md p-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Routed
            </p>
            <p className="text-base font-bold">{summary.count}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              You spent
            </p>
            <p className="text-base font-bold">
              ${summary.totalCostUsd.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              You saved
            </p>
            <p className="text-base font-bold text-green-600 dark:text-green-400">
              ${summary.totalSavingsUsd.toFixed(4)}
            </p>
          </div>
        </div>

        {summary.savingsPercent !== null && summary.savingsPercent > 0 && (
          <p className="text-xs text-muted-foreground">
            That's <strong className="text-foreground">{summary.savingsPercent}%</strong>{" "}
            below what a single-vendor (Opus 4.7-only) baseline would have cost over
            the same queries.
          </p>
        )}

        {/* Opt-in share toggle */}
        <div className="rounded-md border bg-background/60 p-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-start gap-2">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs font-medium">
                  Share my Cost-Slasher receipt publicly
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Default OFF. Per Founder direction (B129) only members who
                  explicitly opt in expose a public-shareable savings receipt.
                </p>
              </div>
            </div>
            {!loading && (
              <Switch
                checked={optIn}
                onCheckedChange={handleToggle}
                aria-label="Opt in to public Cost-Slasher receipt sharing"
              />
            )}
          </div>

          {optIn && !showPublicShareSection && (
            <div className="flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/70 dark:bg-amber-950/30 rounded px-2 py-1.5 mt-2">
              <Lock className="w-3 h-3 shrink-0" />
              <span>
                Public sharing is locked until Prov 14 trigger. Your opt-in is
                recorded — public URL will activate the moment platform-wide
                share goes live.
              </span>
            </div>
          )}

          {optIn && showPublicShareSection && (
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 rounded px-2 py-1.5 mt-2">
              Your public receipt URL is active. Other members and the public
              can view your aggregate Cost-Slasher savings (no query content
              ever shown — only totals and vendor mix percentages).
            </div>
          )}
        </div>

        <p className="text-[10px] text-muted-foreground">
          Receipts never expose query content. Only: month, total saved,
          vendor mix percentages. Aggregate platform-wide totals are visible
          only after the public-share flag flips.
        </p>
      </CardContent>
    </Card>
  );
}
