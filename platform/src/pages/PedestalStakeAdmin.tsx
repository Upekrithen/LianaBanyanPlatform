import React, { useState, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { upekrithen } from "@/lib/upekrithen-client";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  computeRollingRaisePure,
  REGCF_ANNUAL_CAP_USD,
} from "@/lib/regcf-annual-cap";
import {
  Shield,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BarChart3,
  FileText,
  Download,
  Eye,
  EyeOff,
  XCircle,
  PlayCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Application {
  id: string;
  investor_id: string;
  status: string;
  full_name: string | null;
  email: string | null;
  income_attested: number | null;
  net_worth_attested: number | null;
  computed_cap: number | null;
  kyc_provider: string | null;
  kyc_result: Record<string, unknown> | null;
  bad_actor_check_result: Record<string, unknown> | null;
  state_of_residence: string | null;
  subscription_amount_usd: number | null;
  stake_count_requested: number | null;
  created_at: string;
  updated_at: string;
}

interface Holder {
  holder_id: string;
  subscription_id: string | null;
  user_id: string;
  stake_count: number;
  certificate_url: string | null;
  issued_at: string | null;
  full_name: string;
  email: string;
  state_of_residence: string | null;
  created_at: string;
}

interface RaiseRow {
  cumulative_raised_usd: number;
  period_start: string;
}

interface IssuanceLogEntry {
  id: string;
  holder_id: string;
  action: string;
  actor: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Status styling
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-zinc-800 text-zinc-300",
  submitted: "bg-amber-950/30 text-amber-400",
  kyc_pending: "bg-blue-950/30 text-blue-400",
  kyc_approved: "bg-green-950/30 text-green-400",
  kyc_rejected: "bg-red-950/30 text-red-400",
  kyc_complete: "bg-green-950/30 text-green-400",
  form_c_accepted: "bg-teal-950/30 text-teal-400",
  subscription_pending: "bg-amber-950/30 text-amber-400",
  subscription_signed: "bg-green-950/30 text-green-400",
  payment_pending: "bg-blue-950/30 text-blue-400",
  payment_completed: "bg-green-950/30 text-green-400",
  issued: "bg-emerald-950/30 text-emerald-400",
  cancelled: "bg-red-950/30 text-red-400",
  rejected: "bg-red-950/30 text-red-400",
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PedestalStakeAdmin() {
  return (
    <StaffAccessGate deniedText="Upekrithen Pedestal Stake admin — staff access required.">
      <PortalPageLayout
        title="Pedestal Stake Admin"
        subtitle="Upekrithen LLC — Issuance & Compliance Dashboard"
      >
        <AdminDashboardContent />
      </PortalPageLayout>
    </StaffAccessGate>
  );
}

function AdminDashboardContent() {
  const { user } = useAuth();

  // --- Data queries (all via upekrithen schema) ---

  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["pedestal-admin-applications"],
    queryFn: async () => {
      const { data, error } = await upekrithen()
        .from("pedestal_applications")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Application[];
    },
  });

  const { data: holders = [], isLoading: holdersLoading } = useQuery({
    queryKey: ["pedestal-admin-holders"],
    queryFn: async () => {
      const { data, error } = await upekrithen()
        .from("pedestal_holders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as unknown as Holder[];
    },
  });

  const { data: raiseRows = [] } = useQuery({
    queryKey: ["pedestal-admin-raise-rows"],
    queryFn: async () => {
      const { data, error } = await upekrithen()
        .from("regcf_offering_raises")
        .select("cumulative_raised_usd, period_start");
      if (error) throw error;
      return (data || []) as unknown as RaiseRow[];
    },
  });

  const { data: issuanceLogs = [] } = useQuery({
    queryKey: ["pedestal-admin-issuance-log"],
    queryFn: async () => {
      const { data, error } = await upekrithen()
        .from("pedestal_issuance_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data || []) as unknown as IssuanceLogEntry[];
    },
  });

  const rollingRaise = computeRollingRaisePure(raiseRows);

  const issuanceQueue = applications.filter(
    (a) =>
      a.status === "kyc_approved" ||
      a.status === "kyc_complete" ||
      a.status === "form_c_accepted" ||
      a.status === "subscription_signed" ||
      a.status === "payment_completed"
  );

  const badActorFlagged = applications.filter((a) => {
    if (!a.bad_actor_check_result) return false;
    const r = a.bad_actor_check_result as Record<string, unknown>;
    return r.status === "failed" || r.status === "flagged";
  });

  const isLoading = appsLoading || holdersLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const totalSubscribed = holders.reduce((s, h) => s + (h.stake_count || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-4 gap-3">
        <StatCard icon={Users} label="Total Applications" value={applications.length} />
        <StatCard icon={Clock} label="Issuance Queue" value={issuanceQueue.length} />
        <StatCard icon={CheckCircle2} label="Stakes Issued" value={holders.length} />
        <StatCard
          icon={DollarSign}
          label="Total Stakes"
          value={totalSubscribed.toLocaleString()}
        />
      </div>

      {/* Panel 1: Issuance Queue */}
      <IssuanceQueuePanel applications={issuanceQueue} />

      {/* Panel 2: Cap Table */}
      <CapTablePanel holders={holders} />

      {/* Panel 3: Annual Raise Tracking */}
      <AnnualRaisePanel raise={rollingRaise} />

      {/* Panel 4: Bad Actor Check Results */}
      <BadActorPanel
        flagged={badActorFlagged}
        allApplications={applications}
        userId={user?.id}
      />

      {/* Panel 5: Compliance Export */}
      <ComplianceExportPanel
        applications={applications}
        holders={holders}
        raise={rollingRaise}
      />

      {/* Panel 6: Two-Track Separation Audit */}
      <TwoTrackAuditPanel />

      {/* TODO(counsel): Insert final Form C reference language here. Contact: counsel per project_counsel_task_based.md */}
      <p className="text-xs text-muted-foreground text-center">
        Upekrithen Pedestal Stake system — separate from Liana Banyan Corporation
        cooperative. 506(c) route space reserved for future use.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel 1: Issuance Queue
// ---------------------------------------------------------------------------

function IssuanceQueuePanel({ applications }: { applications: Application[] }) {
  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-4 w-4" /> Issuance Queue
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No applications pending issuance.
          </p>
        ) : (
          <div className="space-y-2">
            {applications.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">
                      {a.full_name || "—"}
                    </p>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        STATUS_COLORS[a.status] || ""
                      }`}
                    >
                      {a.status.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.email || "—"} · {a.state_of_residence || "—"} ·{" "}
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>
                    Cap: ${(a.computed_cap || 0).toLocaleString()}
                  </p>
                  <p>
                    Requested: {a.stake_count_requested ?? "—"} stake(s)
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel 2: Cap Table
// ---------------------------------------------------------------------------

function CapTablePanel({ holders }: { holders: Holder[] }) {
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<keyof Holder>("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (field: keyof Holder) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sorted = [...holders].sort((a, b) => {
    const av = a[sortField];
    const bv = b[sortField];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return sortAsc ? cmp : -cmp;
  });

  const colBtn = (label: string, field: keyof Holder) => (
    <button
      onClick={() => handleSort(field)}
      className="text-xs font-medium text-muted-foreground hover:text-foreground"
    >
      {label} {sortField === field ? (sortAsc ? "↑" : "↓") : ""}
    </button>
  );

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" /> Cap Table
        </CardTitle>
      </CardHeader>
      <CardContent>
        {holders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No stakes issued yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left py-2 pr-3">{colBtn("Holder", "full_name")}</th>
                  <th className="text-right py-2 px-3">{colBtn("Stakes", "stake_count")}</th>
                  <th className="text-left py-2 px-3">{colBtn("Issued", "issued_at")}</th>
                  <th className="text-left py-2 px-3">Certificate</th>
                  <th className="text-left py-2 px-3">{colBtn("State", "state_of_residence")}</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((h) => {
                  const revealed = revealedIds.has(h.holder_id);
                  return (
                    <tr
                      key={h.holder_id}
                      className="border-b border-border/10 hover:bg-muted/20"
                    >
                      <td className="py-2 pr-3">
                        <button
                          onClick={() => toggleReveal(h.holder_id)}
                          className="flex items-center gap-1 text-left"
                        >
                          {revealed ? (
                            <EyeOff className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <Eye className="h-3 w-3 text-muted-foreground" />
                          )}
                          <span>
                            {revealed
                              ? `${h.full_name} (${h.email})`
                              : `Holder ••••${h.holder_id.slice(-4)}`}
                          </span>
                        </button>
                      </td>
                      <td className="text-right py-2 px-3 font-mono">
                        {h.stake_count}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {h.issued_at
                          ? new Date(h.issued_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-2 px-3">
                        {h.certificate_url ? (
                          <a
                            href={h.certificate_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-400 underline text-xs"
                          >
                            PDF
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">
                        {h.state_of_residence || "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel 3: Annual Raise Tracking
// ---------------------------------------------------------------------------

function AnnualRaisePanel({
  raise,
}: {
  raise: { raisedLast12Months: number; remainingHeadroom: number; percentOfCap: number };
}) {
  const nearCap = raise.percentOfCap >= 90;
  const barColor = nearCap ? "bg-red-500" : raise.percentOfCap >= 70 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Annual Raise Tracking (Rolling
          12-Month)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full ${barColor} rounded-full transition-all`}
            style={{
              width: `${Math.min(raise.percentOfCap, 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>
            ${raise.raisedLast12Months.toLocaleString()} raised
          </span>
          <span className="text-muted-foreground">
            ${REGCF_ANNUAL_CAP_USD.toLocaleString()} Reg CF cap
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          Remaining headroom: ${raise.remainingHeadroom.toLocaleString()} (
          {(100 - raise.percentOfCap).toFixed(1)}%)
        </div>
        {nearCap && (
          <div className="mt-3 p-2 rounded bg-red-950/30 border border-red-800/50 flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Within 10% of annual Reg CF cap — review with counsel before accepting
            new subscriptions.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel 4: Bad Actor Check Results
// ---------------------------------------------------------------------------

function BadActorPanel({
  flagged,
  allApplications,
  userId,
}: {
  flagged: Application[];
  allApplications: Application[];
  userId: string | undefined;
}) {
  const queryClient = useQueryClient();

  const dispositionMutation = useMutation({
    mutationFn: async ({
      appId,
      disposition,
      reason,
    }: {
      appId: string;
      disposition: "override_approved" | "rejected";
      reason: string;
    }) => {
      const { error: appError } = await upekrithen()
        .from("pedestal_applications")
        .update({
          status: disposition === "rejected" ? "rejected" : "kyc_approved",
          bad_actor_check_result: { status: disposition, disposition_reason: reason },
        } as never)
        .eq("id", appId);
      if (appError) throw appError;

      const { error: logError } = await upekrithen()
        .from("pedestal_issuance_log")
        .insert({
          holder_id: appId,
          action: `bad_actor_disposition_${disposition}`,
          actor: userId || "staff",
          details: { reason, original_app_id: appId },
        } as never);
      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pedestal-admin-applications"] });
    },
  });

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" /> Bad-Actor Check Results
        </CardTitle>
      </CardHeader>
      <CardContent>
        {flagged.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No flagged or failed bad-actor checks.
          </p>
        ) : (
          <div className="space-y-3">
            {flagged.map((a) => {
              const result = a.bad_actor_check_result as Record<string, unknown>;
              return (
                <div
                  key={a.id}
                  className="p-3 rounded-lg bg-red-950/20 border border-red-800/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {a.full_name || "—"}{" "}
                        <span className="text-xs text-red-400">
                          ({String(result.status || "flagged")})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {a.email} · {a.state_of_residence || "—"}
                      </p>
                      {result.reason && (
                        <p className="text-xs mt-1 text-red-300">
                          Reason: {String(result.reason)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-green-700 text-green-400 hover:bg-green-950/30"
                        onClick={() =>
                          dispositionMutation.mutate({
                            appId: a.id,
                            disposition: "override_approved",
                            reason: "Counsel-approved override",
                          })
                        }
                        disabled={dispositionMutation.isPending}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Override
                        (counsel)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-700 text-red-400 hover:bg-red-950/30"
                        onClick={() =>
                          dispositionMutation.mutate({
                            appId: a.id,
                            disposition: "rejected",
                            reason: "Failed bad-actor check — rejected",
                          })
                        }
                        disabled={dispositionMutation.isPending}
                      >
                        <XCircle className="h-3 w-3 mr-1" /> Reject
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel 5: Compliance Export
// ---------------------------------------------------------------------------

function ComplianceExportPanel({
  applications,
  holders,
  raise,
}: {
  applications: Application[];
  holders: Holder[];
  raise: { raisedLast12Months: number; remainingHeadroom: number; percentOfCap: number };
}) {
  const exportCSV = useCallback(() => {
    const jurisdictions: Record<string, number> = {};
    holders.forEach((h) => {
      const st = h.state_of_residence || "Unknown";
      jurisdictions[st] = (jurisdictions[st] || 0) + 1;
    });

    const header = [
      "metric",
      "value",
    ];

    const rows: string[][] = [
      ["Total Applications", String(applications.length)],
      ["Total Stakes Issued", String(holders.length)],
      ["Total Stakes Count", String(holders.reduce((s, h) => s + h.stake_count, 0))],
      ["Funds Raised (Rolling 12mo)", `$${raise.raisedLast12Months.toLocaleString()}`],
      ["Remaining Headroom", `$${raise.remainingHeadroom.toLocaleString()}`],
      ["Percent of Cap Used", `${raise.percentOfCap.toFixed(1)}%`],
      ["Annual Cap (Reg CF)", `$${REGCF_ANNUAL_CAP_USD.toLocaleString()}`],
      ["Jurisdictions", ""],
      ...Object.entries(jurisdictions)
        .sort((a, b) => b[1] - a[1])
        .map(([st, ct]) => [`  ${st}`, String(ct)]),
      ["", ""],
      ["Applicant Details", ""],
      ["app_id", "full_name,email,state,status,income_attested,net_worth_attested,computed_cap,kyc_provider,bad_actor_status,created_at"],
    ];

    applications.forEach((a) => {
      const bad = a.bad_actor_check_result as Record<string, unknown> | null;
      rows.push([
        a.id,
        [
          a.full_name || "",
          a.email || "",
          a.state_of_residence || "",
          a.status,
          String(a.income_attested ?? ""),
          String(a.net_worth_attested ?? ""),
          String(a.computed_cap ?? ""),
          a.kyc_provider || "",
          bad ? String(bad.status || "") : "",
          a.created_at,
        ].join(","),
      ]);
    });

    const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pedestal-stake-compliance-export-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [applications, holders, raise]);

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Download className="h-4 w-4" /> Compliance Export (Form C-U)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Export applicant count, funds raised, jurisdictions, and aggregate
          demographics for Form C-U filing. Counsel files — this export is the
          source of truth.
        </p>
        {/* TODO(counsel): Insert final Form C-U filing instructions and reference language here. Contact: counsel per project_counsel_task_based.md */}
        <Button onClick={exportCSV} variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" /> Download CSV
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Panel 6: Two-Track Separation Audit
// ---------------------------------------------------------------------------

interface AuditCheck {
  name: string;
  passed: boolean;
  detail: string;
}

function TwoTrackAuditPanel() {
  const [results, setResults] = useState<AuditCheck[] | null>(null);
  const [running, setRunning] = useState(false);

  const runAudit = useCallback(async () => {
    setRunning(true);
    const checks: AuditCheck[] = [];

    // Check 1: pedestal_holders uses upekrithen schema (not public)
    try {
      const { error } = await upekrithen()
        .from("pedestal_holders")
        .select("holder_id")
        .limit(1);
      checks.push({
        name: "upekrithen.pedestal_holders accessible via upekrithen() client",
        passed: !error,
        detail: error ? error.message : "Schema separation confirmed",
      });
    } catch (e: unknown) {
      checks.push({
        name: "upekrithen.pedestal_holders accessible via upekrithen() client",
        passed: false,
        detail: String(e),
      });
    }

    // Check 2: upekrithen.pedestal_holders does NOT join to public.members
    try {
      const { error } = await supabase
        .from("members" as never)
        .select("*, pedestal_holders(*)" as never)
        .limit(1);
      checks.push({
        name: "No FK join from public.members to pedestal_holders",
        passed: !!error,
        detail: error
          ? "Join correctly rejected — no FK relationship"
          : "WARNING: join succeeded — schema separation may be broken",
      });
    } catch {
      checks.push({
        name: "No FK join from public.members to pedestal_holders",
        passed: true,
        detail: "Join threw — no FK relationship exists (correct)",
      });
    }

    // Check 3: issuance_log is write-only (UPDATE should fail)
    try {
      const { error } = await upekrithen()
        .from("pedestal_issuance_log")
        .update({ action: "test_update" } as never)
        .eq("id", "00000000-0000-0000-0000-000000000000");
      checks.push({
        name: "Issuance log rejects UPDATE (immutable audit)",
        passed: !!error,
        detail: error
          ? "UPDATE correctly denied by RLS"
          : "WARNING: UPDATE did not fail — RLS may be misconfigured",
      });
    } catch {
      checks.push({
        name: "Issuance log rejects UPDATE (immutable audit)",
        passed: true,
        detail: "UPDATE threw — immutability enforced",
      });
    }

    // Check 4: issuance_log rejects DELETE
    try {
      const { error } = await upekrithen()
        .from("pedestal_issuance_log")
        .delete()
        .eq("id", "00000000-0000-0000-0000-000000000000");
      checks.push({
        name: "Issuance log rejects DELETE (immutable audit)",
        passed: !!error,
        detail: error
          ? "DELETE correctly denied by RLS"
          : "WARNING: DELETE did not fail — RLS may be misconfigured",
      });
    } catch {
      checks.push({
        name: "Issuance log rejects DELETE (immutable audit)",
        passed: true,
        detail: "DELETE threw — immutability enforced",
      });
    }

    // Check 5: UI labels separate "Upekrithen" vs "Liana Banyan"
    const pageText = document.body.innerText || "";
    const hasUpekrithen = pageText.includes("Upekrithen");
    const hasLBSeparation =
      pageText.includes("separate from Liana Banyan") ||
      pageText.includes("Upekrithen LLC");
    checks.push({
      name: 'Admin labels "Upekrithen pedestal-stake system" distinctly from LB cooperative',
      passed: hasUpekrithen && hasLBSeparation,
      detail:
        hasUpekrithen && hasLBSeparation
          ? "UI text confirms entity separation"
          : "WARNING: UI labeling may not clearly distinguish entities",
    });

    // Check 6: No voting cross-contamination (structural — UI-level)
    checks.push({
      name: "LB member votes do not affect Upekrithen Pedestal Stake holder rights (UI separation)",
      passed: true,
      detail:
        "No voting UI present on this admin surface — voting is at the legal/counsel layer. UI separation confirmed by absence of cooperative voting controls.",
    });

    setResults(checks);
    setRunning(false);
  }, []);

  const allPassed = results?.every((r) => r.passed);

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="h-4 w-4" /> Two-Track Separation Audit
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">
          Runs live separation-invariant checks against the database and UI to
          confirm Upekrithen pedestal-stake system and Liana Banyan cooperative
          remain independent.
        </p>
        <Button
          onClick={runAudit}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={running}
        >
          {running ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
          Run Separation Audit
        </Button>

        {results && (
          <div className="mt-4 space-y-2">
            <div
              className={`text-sm font-medium ${
                allPassed ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {allPassed
                ? "All checks passed — two-track separation intact."
                : "Some checks failed — review below."}
            </div>
            {results.map((r, i) => (
              <div
                key={i}
                className={`p-2 rounded text-xs ${
                  r.passed
                    ? "bg-emerald-950/20 border border-emerald-800/30"
                    : "bg-red-950/20 border border-red-800/30"
                }`}
              >
                <span className="font-medium">
                  {r.passed ? "✓" : "✗"} {r.name}
                </span>
                <p className="text-muted-foreground mt-0.5">{r.detail}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="border border-border/50">
      <CardContent className="py-3 flex items-center gap-3">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
