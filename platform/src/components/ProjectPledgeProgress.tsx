/**
 * PROJECT PLEDGE PROGRESS — Funding progress bar + backer count
 * ==============================================================
 * Shows real-time funding status for a project.
 * Displays progress bar, backer count, and "Back This Project" button.
 * SEC-safe language throughout.
 *
 * Innovation #1543 — Project Pledge Progress (Session 8A)
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Users, TrendingUp, Clock, Sparkles, CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getProjectFundingSummary,
  hasUserPledged,
  type ProjectFundingSummary,
} from "@/lib/pledgeService";
import { BackProjectDialog } from "@/components/BackProjectDialog";

interface ProjectPledgeProgressProps {
  projectId: string;
  projectName: string;
  projectDescription?: string;
  projectTagline?: string;
  fundingGoal?: number;
  currentFunding?: number;
  backerCount?: number;
  fundingDeadline?: string;
  medallionEligible?: boolean;
  compact?: boolean;
}

export function ProjectPledgeProgress({
  projectId,
  projectName,
  projectDescription,
  projectTagline,
  fundingGoal,
  currentFunding,
  backerCount,
  fundingDeadline,
  medallionEligible = false,
  compact = false,
}: ProjectPledgeProgressProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProjectFundingSummary | null>(null);
  const [userHasPledged, setUserHasPledged] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    const fundingData = await getProjectFundingSummary(projectId);
    setSummary(fundingData);

    if (user) {
      const pledged = await hasUserPledged(projectId);
      setUserHasPledged(pledged);
    }
  };

  const goal = fundingGoal || summary?.funding_goal || 0;
  const funded = currentFunding || summary?.total_pledged || 0;
  const backers = backerCount || summary?.unique_backers || 0;
  const pct = goal > 0 ? Math.min(100, (funded / goal) * 100) : 0;
  const deadline = fundingDeadline || summary?.funding_deadline;

  const daysRemaining = deadline
    ? Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  // ─── Compact Mode ─────────────────────────────────────────────
  if (compact) {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {funded.toLocaleString()} / {goal > 0 ? goal.toLocaleString() : "?"} Credits
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              {backers}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
          <Button
            size="sm"
            className="w-full gap-1"
            onClick={() => setDialogOpen(true)}
            disabled={!user}
          >
            {userHasPledged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Backed — Pledge More
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5" />
                Back This Project
              </>
            )}
          </Button>
        </div>

        <BackProjectDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          project={{
            id: projectId,
            name: projectName,
            description: projectDescription,
            tagline: projectTagline,
            funding_goal: goal,
            current_funding: funded,
            backer_count: backers,
            medallion_eligible: medallionEligible,
          }}
          fundingSummary={summary}
          onPledgeComplete={loadData}
        />
      </>
    );
  }

  // ─── Full Card ────────────────────────────────────────────────
  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* Header stats */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">
                  {funded.toLocaleString()}
                </span>
                <span className="text-sm text-muted-foreground">Credits pledged</span>
              </div>
              {goal > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  of {goal.toLocaleString()} Credit goal
                </p>
              )}
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-1 text-sm">
                <Users className="w-4 h-4" />
                <span className="font-medium">{backers}</span>
                <span className="text-muted-foreground">backers</span>
              </div>
              {daysRemaining !== null && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {daysRemaining > 0 ? `${daysRemaining} days left` : "Funding closed"}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <Progress value={pct} className="h-3" />
            <p className="text-xs text-muted-foreground text-right">
              {pct.toFixed(1)}% funded
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {medallionEligible && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Medallion Eligible
              </Badge>
            )}
            {userHasPledged && (
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="w-3 h-3" />
                You Backed This
              </Badge>
            )}
          </div>

          {/* Action Button */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => setDialogOpen(true)}
            disabled={!user}
          >
            {userHasPledged ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Backed — Increase Pledge
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                Back This Project
              </>
            )}
          </Button>

          {!user && (
            <p className="text-xs text-center text-muted-foreground">
              Sign in to back this project
            </p>
          )}
        </CardContent>
      </Card>

      <BackProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        project={{
          id: projectId,
          name: projectName,
          description: projectDescription,
          tagline: projectTagline,
          funding_goal: goal,
          current_funding: funded,
          backer_count: backers,
          medallion_eligible: medallionEligible,
        }}
        fundingSummary={summary}
        onPledgeComplete={loadData}
      />
    </>
  );
}
