/**
 * PLEDGE FLOW — Steward pledges Marks to a project (Tri-Source Funding)
 * Shows funding needed, current breakdown, pledge amount (capped by capacity), confirmation.
 * SEC: pledge Marks, service value; no investment/return.
 * data-xray-id: pledge-flow
 */

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Coins, Shield, TrendingUp, Building2 } from "lucide-react";
import { toast } from "sonner";

export interface PledgeFlowProps {
  projectId: string;
  projectType: string;
  projectName: string;
  totalFundingNeeded: number;
  currentStewardPledged?: number;
  currentBandwagonBacked?: number;
  currentLBAllocation?: number;
}

export function PledgeFlow({
  projectId,
  projectType,
  projectName,
  totalFundingNeeded,
  currentStewardPledged = 0,
  currentBandwagonBacked = 0,
  currentLBAllocation = 0,
}: PledgeFlowProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const totalCurrent = currentStewardPledged + currentBandwagonBacked + currentLBAllocation;
  const gapRemaining = Math.max(0, totalFundingNeeded - totalCurrent);

  const { data: profile } = useQuery({
    queryKey: ["steward-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("steward_profiles")
        .select("max_pledge_limit")
        .eq("user_id", user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: myActivePledges } = useQuery({
    queryKey: ["steward-pledges", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("pledged_marks_escrow")
        .select("amount_pledged")
        .eq("pledger_id", user.id)
        .eq("status", "held");
      return data || [];
    },
    enabled: !!user,
  });

  const totalHeld = myActivePledges?.reduce((s, p) => s + Number(p.amount_pledged || 0), 0) ?? 0;
  const maxPledge = Number(profile?.max_pledge_limit ?? 500);
  const availableCapacity = Math.max(0, maxPledge - totalHeld);
  const amountNum = Math.min(availableCapacity, Math.max(0, parseFloat(amount) || 0));
  const stewardPct = totalFundingNeeded > 0 ? (currentStewardPledged / totalFundingNeeded) * 100 : 0;
  const bandwagonPct = totalFundingNeeded > 0 ? (currentBandwagonBacked / totalFundingNeeded) * 100 : 0;
  const lbPct = totalFundingNeeded > 0 ? (currentLBAllocation / totalFundingNeeded) * 100 : 0;
  const newStewardTotal = currentStewardPledged + amountNum;
  const newStewardPct = totalFundingNeeded > 0 ? (newStewardTotal / totalFundingNeeded) * 100 : 0;
  const remainingAfterPledge = totalFundingNeeded - newStewardTotal - currentBandwagonBacked - currentLBAllocation;
  const lbCoversPct = totalFundingNeeded > 0 ? (Math.max(0, remainingAfterPledge) / totalFundingNeeded) * 100 : 0;

  const pledgeMutation = useMutation({
    mutationFn: async () => {
      if (!user || amountNum <= 0) throw new Error("Invalid pledge");
      const { error: insertErr } = await supabase.from("pledged_marks_escrow").insert({
        pledger_id: user.id,
        project_id: projectId,
        project_type: projectType,
        amount_pledged: amountNum,
        status: "held",
      });
      if (insertErr) throw insertErr;
      const { data: prof } = await supabase
        .from("steward_profiles")
        .select("total_pledged")
        .eq("user_id", user.id)
        .single();
      const newTotal = Number(prof?.total_pledged ?? 0) + amountNum;
      const { error: updateErr } = await supabase
        .from("steward_profiles")
        .update({ total_pledged: newTotal, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (updateErr) throw updateErr;
    },
    onSuccess: () => {
      toast.success("Pledge recorded. As you wish.");
      queryClient.invalidateQueries({ queryKey: ["steward-profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["steward-pledges", user?.id] });
      setAmount("");
      setConfirmed(false);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Pledge failed"),
  });

  if (!user) {
    return (
      <Card data-xray-id="pledge-flow">
        <CardContent className="py-6 text-center text-muted-foreground">
          Sign in to pledge Marks to this project.
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card data-xray-id="pledge-flow">
        <CardContent className="py-6 text-center text-muted-foreground">
          Become a Steward to pledge Marks. <a href="/steward/apply" className="text-primary underline">Apply here</a>.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20" data-xray-id="pledge-flow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Tri-Source Funding
        </CardTitle>
        <CardDescription>Project: {projectName}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Total needed: {totalFundingNeeded.toFixed(0)} Marks</p>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-amber-500" />
                Steward Pledged: {currentStewardPledged.toFixed(0)} ({stewardPct.toFixed(0)}%)
              </span>
              <Progress value={stewardPct} className="w-24 h-2" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                BandWagon Backed: {currentBandwagonBacked.toFixed(0)} ({bandwagonPct.toFixed(0)}%)
              </span>
              <Progress value={bandwagonPct} className="w-24 h-2" />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1">
                <Building2 className="w-4 h-4 text-blue-500" />
                LB Allocation: {currentLBAllocation.toFixed(0)} ({lbPct.toFixed(0)}%)
              </span>
              <Progress value={lbPct} className="w-24 h-2" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Gap remaining: {gapRemaining.toFixed(0)} Marks</p>
        </div>

        <div>
          <Label htmlFor="pledge-amount">Your pledge (Marks)</Label>
          <Input
            id="pledge-amount"
            type="number"
            min={0}
            max={availableCapacity}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max ${availableCapacity.toFixed(0)}`}
            className="mt-1 max-w-[200px]"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Available capacity: {availableCapacity.toFixed(0)} Marks
          </p>
        </div>

        {amountNum > 0 && (
          <>
            <p className="text-sm">
              You&apos;re pledging <strong>{amountNum.toFixed(0)} Marks</strong> ({(amountNum / totalFundingNeeded * 100).toFixed(1)}% of project need).
              {remainingAfterPledge > 0 && (
                <span className="block text-muted-foreground mt-1">
                  LB covers the remaining {remainingAfterPledge.toFixed(0)} Marks ({lbCoversPct.toFixed(0)}%).
                </span>
              )}
            </p>
            {!confirmed ? (
              <Button onClick={() => setConfirmed(true)}>Continue to confirm</Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Confirm your pledge. As you wish.</p>
                <Button
                  onClick={() => pledgeMutation.mutate()}
                  disabled={pledgeMutation.isPending}
                >
                  {pledgeMutation.isPending ? "Pledging…" : "As You Wish"}
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
