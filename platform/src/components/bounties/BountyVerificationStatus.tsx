/**
 * BountyVerificationStatus — real-time Furnace verification status for a submission
 * KN088 / BP009. Polls bounty_submissions table for status progression.
 * data-xray-id: bounty-verification-status
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle, Trophy, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BountyVerificationStatusProps {
  submissionId: string;
  onAwardConfirmed?: (marksAwarded: number) => void;
}

type SubmissionStatus =
  | "pending"
  | "furnace_verifying"
  | "furnace_passed"
  | "furnace_failed"
  | "awarded"
  | "rejected";

interface SubmissionRow {
  status: SubmissionStatus;
  furnace_score: number | null;
  furnace_notes: string | null;
  marks_awarded: number | null;
  awarded_at: string | null;
}

const STATUS_CONFIG: Record<
  SubmissionStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; progress: number }
> = {
  pending:           { label: "Pending review",       icon: Clock,        color: "text-muted-foreground", progress: 10  },
  furnace_verifying: { label: "Furnace verifying…",   icon: Loader2,      color: "text-blue-500",         progress: 50  },
  furnace_passed:    { label: "Furnace passed",        icon: CheckCircle2, color: "text-emerald-500",      progress: 80  },
  furnace_failed:    { label: "Furnace failed",        icon: XCircle,      color: "text-red-500",          progress: 100 },
  awarded:           { label: "Marks awarded!",        icon: Trophy,       color: "text-amber-500",        progress: 100 },
  rejected:          { label: "Submission rejected",   icon: XCircle,      color: "text-muted-foreground", progress: 100 },
};

export function BountyVerificationStatus({
  submissionId,
  onAwardConfirmed,
}: BountyVerificationStatusProps) {
  const { data: submission, isLoading } = useQuery<SubmissionRow>({
    queryKey: ["bounty-submission-status", submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bounty_submissions")
        .select("status, furnace_score, furnace_notes, marks_awarded, awarded_at")
        .eq("id", submissionId)
        .single();
      if (error) throw error;
      if (data?.status === "awarded" && data.marks_awarded && onAwardConfirmed) {
        onAwardConfirmed(data.marks_awarded);
      }
      return data as SubmissionRow;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || status === "awarded" || status === "rejected" || status === "furnace_failed") {
        return false;
      }
      return 5000;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground" data-xray-id="bounty-verification-status">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading verification status…
      </div>
    );
  }

  if (!submission) return null;

  const config = STATUS_CONFIG[submission.status];
  const Icon = config.icon;

  return (
    <div className="space-y-3" data-xray-id="bounty-verification-status">
      <div className="flex items-center justify-between">
        <div className={cn("flex items-center gap-2 text-sm font-medium", config.color)}>
          <Icon className={cn("w-4 h-4", submission.status === "furnace_verifying" && "animate-spin")} />
          {config.label}
        </div>
        {submission.furnace_score != null && (
          <Badge variant="outline" className="text-xs">
            Furnace: {submission.furnace_score.toFixed(2)}
          </Badge>
        )}
      </div>

      <Progress value={config.progress} className="h-1.5" />

      {submission.furnace_notes && (
        <p className="text-xs text-muted-foreground bg-muted/40 rounded p-2">
          {submission.furnace_notes}
        </p>
      )}

      {submission.status === "awarded" && submission.marks_awarded && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-center">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">
            <Trophy className="w-4 h-4 inline mr-1" />
            {submission.marks_awarded.toLocaleString()} Marks credited to your account
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Closed-loop cooperative participation allocation. No fiat redemption.
          </p>
        </div>
      )}
    </div>
  );
}
