/**
 * MarksHistoryPanel -- Wave 11 / S12
 * =====================================
 * Paginated Marks ledger history for a member.
 * Shows credits (+) and debits (-) with reason labels.
 * CSV export via exportMarksStatementCSV.
 *
 * SECURITIES-CLEAN: All values labeled "participation units", never "earnings."
 * BP073-W11 / S12
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchMarksHistory,
  exportMarksStatementCSV,
  type MarksHistoryRow,
} from "@/hooks/useMarksBalance";

// ─── Reason label map ─────────────────────────────────────────────────────────

const REASON_LABELS: Record<string, string> = {
  bounty_completion: "Bounty Completed",
  membership_join: "Membership Join",
  membership_renewal: "Membership Renewal",
  mesh_participation: "Mesh Participation",
  referral_credit: "Referral Credit",
  governance_vote: "Governance Vote",
  content_contribution: "Content Contribution",
  marks_redeemed: "Redeemed for Credits",
  admin_adjustment: "Admin Adjustment",
};

// ─── Row component ────────────────────────────────────────────────────────────

function HistoryRow({ row }: { row: MarksHistoryRow }) {
  const isCredit = row.amount > 0;
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 gap-3">
      <div className="flex items-center gap-2 min-w-0">
        {isCredit ? (
          <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
        ) : (
          <TrendingDown className="h-4 w-4 text-amber-600 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">
            {REASON_LABELS[row.reason] ?? row.reason}
          </p>
          {row.note && (
            <p className="text-xs text-muted-foreground truncate">{row.note}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`text-sm font-bold tabular-nums ${
            isCredit ? "text-green-700" : "text-amber-700"
          }`}
        >
          {isCredit ? "+" : ""}{row.amount}
        </span>
        <Badge variant="outline" className="text-[10px] hidden sm:flex">
          {new Date(row.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </Badge>
      </div>
    </div>
  );
}

// ─── Panel ────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

interface MarksHistoryPanelProps {
  userId: string;
  userHandle?: string;
}

export function MarksHistoryPanel({ userId, userHandle }: MarksHistoryPanelProps) {
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: ["marks-history", userId, page],
    queryFn: () =>
      fetchMarksHistory({
        userId,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      }),
    enabled: !!userId,
    staleTime: 30_000,
  });

  const totalPages = data?.total ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const handleExport = () => {
    if (!data?.rows) return;
    const csv = exportMarksStatementCSV(data.rows, userHandle);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marks-statement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-500" />
            Marks History
            {data?.total != null && (
              <Badge variant="secondary" className="text-xs">{data.total} entries</Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
            onClick={handleExport}
            disabled={!data?.rows?.length}
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Cooperative participation units. NOT equity or financial return. Rate HELD FOR FOUNDER.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive text-center">
            Error loading Marks history.
          </div>
        ) : !data?.rows?.length ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            <Shield className="mx-auto mb-2 h-8 w-8 opacity-25" />
            <p>No Marks activity yet.</p>
            <p className="text-xs mt-1">Complete bounties to earn Marks.</p>
          </div>
        ) : (
          <>
            <div className="px-4 divide-y">
              {data.rows.map((row) => (
                <HistoryRow key={row.id} row={row} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
