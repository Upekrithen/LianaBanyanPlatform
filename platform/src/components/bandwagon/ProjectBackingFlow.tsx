/**
 * Project Backing Flow — Back This Project with Backed Marks (BandWagon)
 * SEC language: sponsor/back, allocation budget, no investment/return
 * data-xray-id: project-backing-flow
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";

const FIRST_100 = 100;

export interface ProjectBackingFlowProps {
  projectId: string;
  projectType: string;
  projectTitle?: string;
  currentBackerCount?: number;
  /** If user followed a recommendation, pass the trust chain link id for attribution */
  trustChainLinkId?: string | null;
}

export function ProjectBackingFlow({
  projectId,
  projectType,
  projectTitle = "This project",
  currentBackerCount = 0,
  trustChainLinkId,
}: ProjectBackingFlowProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["taste-ranger-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("taste_ranger_profiles")
        .select("allocation_budget")
        .eq("user_id", user.id)
        .single();
      if (error && error.code !== "PGRST116") throw error;
      return data as { allocation_budget: number } | null;
    },
    enabled: !!user,
  });

  const allocationBudget = Number(profile?.allocation_budget ?? 0);
  const canBack = allocationBudget > 0;
  const amountNum = Math.max(0, Math.min(allocationBudget, parseFloat(amount) || 0));
  const wouldBeSequence = currentBackerCount + 1;
  const inFirst100 = wouldBeSequence <= FIRST_100;

  const backMutation = useMutation({
    mutationFn: async () => {
      if (!user || amountNum <= 0) throw new Error("Invalid back");
      const { data: backing, error: insertErr } = await supabase
        .from("project_backings")
        .insert({
          backer_id: user.id,
          project_id: projectId,
          project_type: projectType,
          amount_backed: amountNum,
          currency_type: "backed_marks",
          status: "active",
          backer_sequence: inFirst100 ? wouldBeSequence : null,
        })
        .select("id")
        .single();
      if (insertErr) throw insertErr;
      await supabase.from("backed_marks_ledger").insert({
        user_id: user.id,
        amount: amountNum,
        direction: "debit",
        source: "backing_spent",
        reference_id: backing?.id ?? null,
        description: `Backed ${projectType} ${projectId}`,
      });
      const { error: updateErr } = await supabase
        .from("taste_ranger_profiles")
        .update({ allocation_budget: allocationBudget - amountNum, updated_at: new Date().toISOString() })
        .eq("user_id", user.id);
      if (updateErr) throw updateErr;
      return backing;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taste-ranger-profile", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["project-backings"] });
      setAmount("");
      setConfirmOpen(false);
      toast.success("Backing recorded. As you wish.");
    },
    onError: (e: Error) => {
      toast.error(e.message ?? "Backing failed");
    },
  });

  if (!user) return null;

  if (!canBack) {
    return (
      <Card data-xray-id="project-backing-flow">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            You need an allocation budget (Backed Marks) to sponsor this project. Build your Service Allocation Authority by backing other projects or through the Fantasy Bridge.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-xray-id="project-backing-flow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Heart className="h-4 w-4" />
          Back this project
        </CardTitle>
        <CardDescription>
          Use your allocation budget to sponsor {projectTitle}. Cooperative-owned; you direct, not own.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="back-amount">Amount (Backed Marks)</Label>
          <Input
            id="back-amount"
            type="number"
            min={0}
            max={allocationBudget}
            step={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Max ${allocationBudget}`}
          />
          <p className="text-xs text-muted-foreground">
            Available: {allocationBudget.toFixed(0)} Backed Marks
          </p>
        </div>
        {inFirst100 && (
          <p className="text-sm text-muted-foreground">
            You'd be backer #{wouldBeSequence} of {FIRST_100} in the early pool (proportional attribution).
          </p>
        )}
        {trustChainLinkId && (
          <p className="text-xs text-muted-foreground">
            This backing will be attributed to the recommendation chain.
          </p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => setConfirmOpen(true)}
            disabled={amountNum <= 0 || backMutation.isPending}
          >
            {backMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Back this project"}
          </Button>
          {confirmOpen && (
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={backMutation.isPending}
            >
              Cancel
            </Button>
          )}
        </div>
        {confirmOpen && amountNum > 0 && (
          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-sm font-medium mb-2">Confirm</p>
            <p className="text-sm text-muted-foreground mb-2">
              Sponsor with {amountNum.toFixed(0)} Backed Marks?
            </p>
            <Button
              onClick={() => backMutation.mutate()}
              disabled={backMutation.isPending}
            >
              As you wish
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
