/**
 * STAMPVerification — Client/sponsor sign-off on completed work before XP award.
 * Bounty, Product (price × volume × score/5), Production (points × volume × score/5). Cannot self-STAMP. Session 18: product/production + box notation.
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { XPBoxDisplay } from "@/components/reputation/XPBoxDisplay";

const SCORE_STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export type STAMPXpType = "bounty" | "product" | "production";

export interface STAMPVerificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerUserId: string;
  workerDisplayName: string;
  /** Default: bounty */
  xpType?: STAMPXpType;
  /** Bounty: task points */
  bountyPoints?: number;
  bountyId?: string | null;
  /** Product: unit price (Credits), preorder volume, run id; volume must be locked */
  unitPrice?: number;
  preorderVolume?: number;
  productionRunId?: string | null;
  volumeLockedAt?: string | null;
  /** Production: points per unit × units produced */
  bountyPointsPerUnit?: number;
  unitsProduced?: number;
  onSuccess?: () => void;
}

export function STAMPVerification({
  open,
  onOpenChange,
  workerUserId,
  workerDisplayName,
  xpType = "bounty",
  bountyPoints = 0,
  bountyId = null,
  unitPrice = 0,
  preorderVolume = 0,
  productionRunId = null,
  volumeLockedAt = null,
  bountyPointsPerUnit = 0,
  unitsProduced = 0,
  onSuccess,
}: STAMPVerificationProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [accomplishmentScore, setAccomplishmentScore] = useState(3);
  const [notes, setNotes] = useState("");

  const isSelf = user?.id === workerUserId;

  const xpEarned =
    xpType === "bounty"
      ? Math.round(bountyPoints * accomplishmentScore)
      : xpType === "product"
        ? Math.round(unitPrice * preorderVolume * (accomplishmentScore / 5))
        : Math.round((bountyPointsPerUnit ?? 0) * (unitsProduced ?? 0) * (accomplishmentScore / 5));

  const volumeLocked = !!volumeLockedAt;
  const productOrProductionBlocked = (xpType === "product" || xpType === "production") && !volumeLocked;
  const canStamp =
    !!user &&
    !isSelf &&
    (xpType === "bounty" ? bountyPoints > 0 : xpType === "product" ? unitPrice > 0 && preorderVolume > 0 && volumeLocked : (bountyPointsPerUnit ?? 0) > 0 && (unitsProduced ?? 0) > 0 && volumeLocked);

  const stampMutation = useMutation({
    mutationFn: async () => {
      if (!user || isSelf) throw new Error("Cannot stamp your own work");
      const payload: Record<string, unknown> = {
        user_id: workerUserId,
        xp_type: xpType,
        accomplishment_score: accomplishmentScore,
        xp_earned: xpEarned,
        stamped_by: user.id,
        stamp_timestamp: new Date().toISOString(),
        notes: notes.trim() || null,
      };
      if (xpType === "bounty") {
        payload.bounty_id = bountyId;
        payload.bounty_points = bountyPoints;
      } else {
        payload.production_run_id = productionRunId;
        payload.volume_locked_at = volumeLockedAt;
        payload.preorder_volume = xpType === "product" ? preorderVolume : unitsProduced;
        payload.unit_price = xpType === "product" ? unitPrice : null;
        payload.bounty_points = xpType === "production" ? (bountyPointsPerUnit ?? 0) * (unitsProduced ?? 0) : 0;
      }
      const { error } = await supabase.from("xp_transactions").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`Your STAMP awards ${xpEarned} XP to ${workerDisplayName}.`);
      queryClient.invalidateQueries({ queryKey: ["xp-score", workerUserId] });
      queryClient.invalidateQueries({ queryKey: ["xp-transactions", workerUserId] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to submit STAMP"),
  });

  const handleSignOff = () => {
    if (!canStamp) return;
    stampMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-xray-id="stamp-verification">
        <DialogHeader>
          <DialogTitle>STAMP verification</DialogTitle>
          <DialogDescription>
            Rate completed work. Your sign-off awards XP to the member. You cannot STAMP your own work.
          </DialogDescription>
        </DialogHeader>
        {isSelf ? (
          <p className="text-muted-foreground text-sm py-4">
            You cannot sign off on your own work. Ask the client or bounty sponsor to STAMP this completion.
          </p>
        ) : productOrProductionBlocked ? (
          <p className="text-muted-foreground text-sm py-4">
            Preorder volume must be locked at production start before a STAMP can be issued. Lock the run first.
          </p>
        ) : (
          <div className="space-y-6 py-2">
            {xpType === "bounty" && (
              <p className="text-sm">
                This bounty is worth <strong>{bountyPoints}</strong> points. At score{" "}
                <strong>{accomplishmentScore}</strong>, {workerDisplayName} earns{" "}
                <strong>{xpEarned} XP</strong>.
              </p>
            )}
            {xpType === "product" && (
              <p className="text-sm">
                At score <strong>{accomplishmentScore}</strong>, {workerDisplayName} earns{" "}
                <strong>{xpEarned.toLocaleString()} XP</strong> from {preorderVolume.toLocaleString()} units at ${unitPrice}.
                {xpEarned >= 10000 && (
                  <span className="block mt-1 text-muted-foreground">
                    That&apos;s <XPBoxDisplay totalXp={xpEarned} />!
                  </span>
                )}
              </p>
            )}
            {xpType === "production" && (
              <p className="text-sm">
                At score <strong>{accomplishmentScore}</strong>, {workerDisplayName} earns{" "}
                <strong>{xpEarned.toLocaleString()} XP</strong> from {(unitsProduced ?? 0).toLocaleString()} units.
                {xpEarned >= 10000 && (
                  <span className="block mt-1 text-muted-foreground">
                    That&apos;s <XPBoxDisplay totalXp={xpEarned} />!
                  </span>
                )}
              </p>
            )}
            <div>
              <Label>Accomplishment score (0.5 – 5.0)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Slider
                  min={0.5}
                  max={5}
                  step={0.5}
                  value={[accomplishmentScore]}
                  onValueChange={([v]) => setAccomplishmentScore(v)}
                  className="flex-1"
                />
                <span className="tabular-nums w-12">{accomplishmentScore}</span>
              </div>
              <div className="flex gap-1 mt-1">
                {SCORE_STEPS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setAccomplishmentScore(s)}
                    className={`p-1 rounded ${accomplishmentScore === s ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                    title={`${s}`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Notes (optional)</Label>
              <textarea
                className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quality feedback for the member"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSignOff} disabled={!canStamp || stampMutation.isPending || productOrProductionBlocked}>
                {stampMutation.isPending ? "Signing…" : "Sign off"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
