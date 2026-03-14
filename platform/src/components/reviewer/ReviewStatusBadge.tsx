/**
 * REVIEW STATUS BADGE — Pending / In Review / Approved / Rejected / Needs Revision
 * data-xray-id: review-status-badge
 */

import { cn } from "@/lib/utils";

export type ReviewStatus =
  | "pending"
  | "assigned"
  | "approved"
  | "rejected"
  | "needs_revision"
  | "escalated"
  | "auto_flagged";

const STATUS_CONFIG: Record<
  ReviewStatus,
  { icon: string; label: string; className: string }
> = {
  pending: { icon: "🟡", label: "Pending Review", className: "text-yellow-600" },
  assigned: { icon: "🔵", label: "In Review", className: "text-blue-600" },
  approved: { icon: "🟢", label: "Approved", className: "text-green-600" },
  rejected: { icon: "🔴", label: "Rejected", className: "text-red-600" },
  needs_revision: { icon: "🟠", label: "Needs Revision", className: "text-orange-600" },
  escalated: { icon: "⬆️", label: "Escalated", className: "text-purple-600" },
  auto_flagged: { icon: "⚠️", label: "Auto-flagged", className: "text-amber-600" },
};

export interface ReviewStatusBadgeProps {
  status: ReviewStatus;
  className?: string;
}

export function ReviewStatusBadge({ status, className }: ReviewStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={cn("inline-flex items-center gap-1 text-sm", config.className, className)}
      data-xray-id="review-status-badge"
    >
      <span aria-hidden>{config.icon}</span>
      {config.label}
    </span>
  );
}
