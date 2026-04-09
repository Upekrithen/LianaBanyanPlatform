/**
 * BACK PROJECT DIALOG — "As You Wish"
 * ====================================
 * The core action: user backs a project with Credits.
 * Shows project info, pledge amount input, credit balance,
 * wave selection (if applicable), and the "As You Wish" confirmation.
 *
 * SEC-safe: No speculative-finance, ownership-claim, or profit-promissory language.
 * Users are "sponsoring" or "backing" — receiving service credits and
 * participation, never financial returns.
 *
 * Innovation #1542 — BackProjectDialog (Session 8A)
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Heart, Coins, ArrowRight, ShieldCheck, CheckCircle2, Loader2,
  Sparkles, Users, TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { createPledge, type ProjectFundingSummary } from "@/lib/pledgeService";
import { toast } from "sonner";

interface BackProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string;
    tagline?: string;
    funding_goal?: number;
    current_funding?: number;
    backer_count?: number;
    medallion_eligible?: boolean;
  };
  fundingSummary?: ProjectFundingSummary | null;
  onPledgeComplete?: () => void;
}

const SUGGESTED_AMOUNTS = [5, 10, 25, 50, 100];

export function BackProjectDialog({
  open,
  onOpenChange,
  project,
  fundingSummary,
  onPledgeComplete,
}: BackProjectDialogProps) {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("10");
  const [availableCredits, setAvailableCredits] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadCredits();
      setIsComplete(false);
      setAmount("10");
    }
  }, [open, user]);

  const loadCredits = async () => {
    setLoadingCredits(true);
    try {
      const { data } = await supabase
        .from("user_credits")
        .select("total_credits, used_credits")
        .eq("user_id", user?.id)
        .single();

      if (data) {
        setAvailableCredits(
          (data.total_credits || 0) - (data.used_credits || 0)
        );
      }
    } catch {
      // Credits not loaded — will show 0
    }
    setLoadingCredits(false);
  };

  const numAmount = parseFloat(amount) || 0;
  const hasEnough = numAmount > 0 && numAmount <= availableCredits;
  const fundingGoal = project.funding_goal || fundingSummary?.funding_goal || 0;
  const currentFunding =
    project.current_funding || fundingSummary?.total_pledged || 0;
  const backerCount =
    project.backer_count || fundingSummary?.unique_backers || 0;
  const progressPct =
    fundingGoal > 0
      ? Math.min(100, ((currentFunding + numAmount) / fundingGoal) * 100)
      : 0;

  const handlePledge = async () => {
    if (!user || numAmount <= 0 || !hasEnough) return;

    setIsSubmitting(true);
    const result = await createPledge(project.id, numAmount);

    if (result.success) {
      setIsComplete(true);
      toast.success("As You Wish", {
        description: `You backed ${project.name} with ${numAmount} Credits!`,
      });
      onPledgeComplete?.();
    } else {
      toast.error("Pledge failed", {
        description: result.error || "Something went wrong. Please try again.",
      });
    }
    setIsSubmitting(false);
  };

  // ─── Success State ────────────────────────────────────────────
  if (isComplete) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-2xl">As You Wish</DialogTitle>
            <DialogDescription className="text-base">
              You backed <strong>{project.name}</strong> with{" "}
              <strong>{numAmount} Credits</strong>!
            </DialogDescription>
            {project.medallion_eligible && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Medallion Eligible
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              Your sponsorship helps bring this project to life. View your pledges
              from your dashboard anytime.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-2">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ─── Main Dialog ──────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            Back This Project
          </DialogTitle>
          <DialogDescription>
            Sponsor <strong>{project.name}</strong> with Credits.
            {project.tagline && (
              <span className="block mt-1 italic">{project.tagline}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Funding Progress */}
          {fundingGoal > 0 && (
            <Card>
              <CardContent className="pt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {currentFunding.toLocaleString()} / {fundingGoal.toLocaleString()} Credits
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{backerCount} backers</span>
                  </div>
                </div>
                <Progress value={progressPct} className="h-2" />
                <p className="text-[10px] text-muted-foreground text-right">
                  {progressPct.toFixed(1)}% funded
                  {numAmount > 0 && (
                    <span className="text-primary ml-1">
                      (+{numAmount} with your pledge)
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Credit Balance */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-sm">
              <Coins className="w-4 h-4" />
              <span>Your Balance</span>
            </div>
            <span className="font-bold">
              {loadingCredits ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                `${availableCredits.toLocaleString()} Credits`
              )}
            </span>
          </div>

          {/* Amount Selection */}
          <div className="space-y-2">
            <Label htmlFor="pledge-amount">Pledge Amount (Credits)</Label>
            <div className="flex gap-2 flex-wrap">
              {SUGGESTED_AMOUNTS.map((a) => (
                <Button
                  key={a}
                  variant={numAmount === a ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmount(String(a))}
                  disabled={a > availableCredits}
                >
                  {a}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Input
                id="pledge-amount"
                type="number"
                min={1}
                max={availableCredits}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Custom amount"
                className="max-w-[200px]"
              />
              <span className="text-sm text-muted-foreground">Credits</span>
            </div>
            {numAmount > availableCredits && (
              <p className="text-xs text-destructive">
                Insufficient credits. You have {availableCredits} available.
              </p>
            )}
          </div>

          {/* What You Get */}
          <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
            <p className="text-xs font-semibold text-primary uppercase">
              What Your Sponsorship Provides
            </p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              <li className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 shrink-0" />
                Direct support for this project
              </li>
              <li className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 shrink-0" />
                Backer recognition on the Transparent Ledger
              </li>
              {project.medallion_eligible && (
                <li className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 shrink-0" />
                  <span className="font-medium">
                    Medallion eligibility at funding milestones
                  </span>
                </li>
              )}
              <li className="flex items-center gap-1">
                <ArrowRight className="w-3 h-3 shrink-0" />
                Cancel anytime before fulfillment for full credit refund
              </li>
            </ul>
          </div>

          {/* SEC Compliance Disclaimer */}
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-[10px] text-amber-700 dark:text-amber-400">
              This is a service sponsorship, not a financial transaction.
              Credits are platform service tokens (1:1 USD value), not securities.
              No expectation of profit. No speculative value. Service access only.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePledge}
            disabled={!hasEnough || isSubmitting || numAmount <= 0}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Heart className="w-4 h-4" />
                As You Wish — Pledge {numAmount > 0 ? `${numAmount} Credits` : ""}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
