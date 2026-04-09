import { Badge } from "@/components/ui/badge";
import { CaseStatus } from "./types";

type CaseStatusBadgeProps = {
  status: CaseStatus;
};

const LABELS: Record<CaseStatus, string> = {
  submitted: "Submitted",
  automated_review: "Automated review",
  community_flags: "Community flags",
  steward_review: "Steward judgment",
  founder_override: "Founder override",
  resolved: "Resolved",
};

const CLASSES: Record<CaseStatus, string> = {
  submitted: "bg-muted text-foreground border-border",
  automated_review: "bg-blue-500/10 text-blue-700 border-blue-300",
  community_flags: "bg-purple-500/10 text-purple-700 border-purple-300",
  steward_review: "bg-amber-500/10 text-amber-700 border-amber-300",
  founder_override: "bg-indigo-500/10 text-indigo-700 border-indigo-300",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-300",
};

export function CaseStatusBadge({ status }: CaseStatusBadgeProps) {
  return (
    <Badge variant="outline" className={CLASSES[status]}>
      {LABELS[status]}
    </Badge>
  );
}
