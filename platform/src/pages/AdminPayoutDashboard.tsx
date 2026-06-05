/**
 * AdminPayoutDashboard -- Wave 11 / S11
 * ========================================
 * Staff/Founder payout queue management.
 * Shows pending Marks allocation queue items for manual approval.
 * Approve = awards Marks + logs to shadow_marks_ledger.
 * Reject = marks item rejected (no Marks awarded).
 *
 * GATE: Only accessible to staff/service_role.
 * PAYOUT GATE: Manual approval mode until MARKS_AUTO_PAYOUT_ENABLED=true.
 *
 * SECURITIES-CLEAN: Marks = participation credits. NOT financial instruments.
 * HELD: Marks rates pending Founder ratification.
 * BP073-W11 / S11
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Lock,
  Zap,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  usePendingPayoutQueue,
  usePayoutQueueAction,
  usePayoutGateStatus,
  type PayoutQueueItem,
} from "@/hooks/usePayoutQueue";

// ─── Gate status panel ────────────────────────────────────────────────────────

function GateStatusPanel() {
  const { data: gate, isLoading } = usePayoutGateStatus();

  if (isLoading) return <Skeleton className="h-16 rounded-lg" />;

  const isLive = gate?.auto_payout_enabled;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 ${
        isLive
          ? "border-green-500/30 bg-green-500/8 text-green-700"
          : "border-amber-500/30 bg-amber-500/8 text-amber-700"
      }`}
    >
      <div className="mt-0.5 shrink-0">
        {isLive ? (
          <Zap className="h-5 w-5 text-green-600" />
        ) : (
          <Lock className="h-5 w-5 text-amber-600" />
        )}
      </div>
      <div>
        <p className="text-sm font-bold">
          {isLive ? "Auto-Payout LIVE" : "Manual Approval Mode (Gate Held)"}
        </p>
        <p className="text-xs mt-0.5 opacity-80">
          {isLive
            ? "MARKS_AUTO_PAYOUT_ENABLED=true. Marks allocated automatically on verified events."
            : "Marks allocations are staged for Founder manual approval. " +
              "Gate opens when Founder sets marks_auto_payout_enabled=true in platform_canonical. " +
              "Rates HELD pending 15-language ratification."}
        </p>
        {gate && (
          <p className="text-xs mt-1 font-mono opacity-60">
            join={gate.join_marks_units} | renewal={gate.renewal_marks_units} | checked {new Date(gate.checked_at).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Queue item card ──────────────────────────────────────────────────────────

function QueueItemCard({
  item,
  staffId,
  onAction,
  processing,
}: {
  item: PayoutQueueItem;
  staffId: string;
  onAction: (queueId: string, action: "approve" | "reject") => void;
  processing: boolean;
}) {
  const REASON_LABELS: Record<string, string> = {
    membership_join: "Membership Join",
    membership_renewal: "Membership Renewal",
    bounty_completion: "Bounty Completion",
    mesh_participation: "Mesh Participation",
    referral_credit: "Referral Credit",
    governance_vote: "Governance Vote",
    content_contribution: "Content Contribution",
  };

  return (
    <Card className="flex flex-col gap-3">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-sm">
              {REASON_LABELS[item.reason] ?? item.reason}
            </CardTitle>
            <CardDescription className="text-xs font-mono mt-0.5">
              Member: {item.member_id.slice(0, 12)}...
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs shrink-0">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold">{item.marks_units} Marks</span>
          </div>
          <Badge variant="outline" className="text-[10px]">{item.phase}</Badge>
        </div>

        {item.note && (
          <p className="text-xs text-muted-foreground italic">{item.note}</p>
        )}

        {item.triggered_by && (
          <p className="text-xs text-muted-foreground font-mono">
            Ref: {item.triggered_by}
          </p>
        )}

        <p className="text-xs text-muted-foreground">
          Queued: {new Date(item.created_at).toLocaleString()}
        </p>

        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 gap-1.5"
            disabled={processing}
            onClick={() => onAction(item.id, "approve")}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5 text-destructive border-destructive/30"
            disabled={processing}
            onClick={() => onAction(item.id, "reject")}
          >
            <XCircle className="h-3.5 w-3.5" />
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPayoutDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { items, loading, error, refetch } = usePendingPayoutQueue();
  const actionMutation = usePayoutQueueAction();

  const handleAction = (queueId: string, action: "approve" | "reject") => {
    if (!user) return;
    setProcessingId(queueId);
    actionMutation.mutate(
      { queueId, action, staffId: user.id },
      {
        onSuccess: (result) => {
          if (result.ok) {
            toast({
              title: action === "approve" ? "Marks approved!" : "Item rejected",
              description:
                action === "approve"
                  ? "Marks allocated and logged to ledger."
                  : "Queue item rejected. No Marks awarded.",
            });
          } else {
            toast({
              title: "Action failed",
              description: result.error ?? "Unknown error",
              variant: "destructive",
            });
          }
          setProcessingId(null);
        },
        onError: () => {
          toast({ title: "Action failed", variant: "destructive" });
          setProcessingId(null);
        },
      },
    );
  };

  return (
    <PortalPageLayout maxWidth="xl" xrayId="admin-payout-dashboard">
      <GlobalBreadcrumbs />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-7 w-7 text-amber-500" />
              Marks Payout Dashboard
            </h1>
            <p className="mt-1 text-muted-foreground text-sm">
              Staff/Founder queue: manually approve pending Marks allocations.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Securities disclaimer */}
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <span className="font-semibold">ADMIN ONLY.</span> Marks are cooperative
            participation credits -- NOT equity, shares, or guaranteed financial return.
            Rate pending 15-language Founder ratification. Approving allocates
            participation units only.
          </p>
        </div>

        {/* Gate status */}
        <GateStatusPanel />

        {/* Queue items */}
        <div>
          <h2 className="text-base font-semibold mb-3 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Approvals ({loading ? "..." : items.length})
          </h2>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-lg" />
              ))}
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-8 text-center text-destructive text-sm">
                Error loading queue: {error}
              </CardContent>
            </Card>
          ) : items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500 opacity-60" />
                <p className="text-sm font-medium">Queue is empty</p>
                <p className="text-xs mt-1">No pending Marks allocations.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <QueueItemCard
                  key={item.id}
                  item={item}
                  staffId={user?.id ?? ""}
                  onAction={handleAction}
                  processing={processingId === item.id}
                />
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground border-t pt-4">
          Marks = cooperative participation credits. NOT equity, shares, or guaranteed financial return.
          Cost+20% architecture. 83.3% creator share. $5/year membership.
        </p>
      </div>
    </PortalPageLayout>
  );
}
