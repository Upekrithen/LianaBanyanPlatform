/**
 * GovernanceAuditPage -- /governance/audit
 * Wave 12 / Phase beta (W12 depth pass)
 *
 * Immutable append-only log of all governance actions.
 * W12: adds pagination (PAGE_SIZE=20), pulls from governance_audit_log
 * as first-class table in addition to multi-source aggregation.
 * Securities-clean and charitable-solicitation-clean language throughout.
 * Filter by action type: vote / appeal / election / letter-ratification.
 * Export capability.
 */
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Lock,
  Download,
  Search,
  Clock,
  Shield,
  Vote,
  Crown,
  Mail,
  Scale,
  Filter,
  CheckCircle,
  Link2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { usePageSEO } from "@/hooks/usePageSEO";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ActionType =
  | "all"
  | "vote"
  | "appeal"
  | "election"
  | "letter_ratification"
  | "governance_decision"
  | "ip_ledger";

interface AuditRow {
  id: string;
  action_type: ActionType | string;
  summary: string;
  actor: string | null;
  reference_id: string | null;
  created_at: string;
  source: "star_chamber" | "ip_ledger" | "council" | "outreach" | "vote";
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function actionIcon(type: string) {
  const map: Record<string, React.ElementType> = {
    vote: Vote,
    appeal: Scale,
    election: Crown,
    letter_ratification: Mail,
    governance_decision: Shield,
    ip_ledger: Link2,
    all: CheckCircle,
  };
  const Icon = map[type] ?? CheckCircle;
  return <Icon className="w-3.5 h-3.5" />;
}

function actionBadgeClass(type: string) {
  const map: Record<string, string> = {
    vote: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    appeal: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    election: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    letter_ratification: "bg-green-500/10 text-green-600 border-green-500/20",
    governance_decision: "bg-primary/10 text-primary border-primary/20",
    ip_ledger: "bg-slate-500/10 text-slate-500 border-slate-500/20",
  };
  return map[type] ?? "bg-slate-500/10 text-slate-500";
}

// ---------------------------------------------------------------------------
// Data fetching: combine multiple sources into unified audit log
// ---------------------------------------------------------------------------

function useAuditLog() {
  // W12: governance_audit_log as first-class append-only source
  const { data: auditLogEntries = [] } = useQuery({
    queryKey: ["audit-governance-log"],
    queryFn: async () => {
      const { data } = await supabase
        .from("governance_audit_log" as never)
        .select("id,action_type,summary,actor_id,reference_id,metadata,created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      return (data ?? []) as Array<{
        id: string;
        action_type: string;
        summary: string;
        actor_id: string | null;
        reference_id: string | null;
        metadata: Record<string, unknown>;
        created_at: string;
      }>;
    },
  });
  // Star Chamber cases
  const { data: starChamberCases = [] } = useQuery({
    queryKey: ["audit-star-chamber"],
    queryFn: async () => {
      const { data } = await supabase
        .from("star_chamber_cases")
        .select("id,title,status,case_type,created_at,resolved_at,final_action")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Council votes
  const { data: councilVotes = [] } = useQuery({
    queryKey: ["audit-council-votes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("council_votes")
        .select("id,vote_class,created_at,cycle_id")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Council voting cycles (elections)
  const { data: cycles = [] } = useQuery({
    queryKey: ["audit-council-cycles"],
    queryFn: async () => {
      const { data } = await supabase
        .from("council_voting_cycles")
        .select("id,cycle_name,status,starts_at,ends_at")
        .order("starts_at", { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  // IP Ledger governance entries
  const { data: ipEntries = [] } = useQuery({
    queryKey: ["audit-ip-ledger"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ip_ledger")
        .select("id,sequence_number,entry_type,entry_data,created_at")
        .in("entry_type", [
          "governance.decision",
          "branch.vote",
          "intent.beacon",
          "branch.merge",
          "branch.fork",
        ])
        .order("sequence_number", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Vote allocations (member votes on proposals)
  const { data: voteAllocations = [] } = useQuery({
    queryKey: ["audit-vote-allocations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("vote_allocations")
        .select("id,vote_class,created_at,votable_item_id")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Pedestal vote canon (letter ratifications)
  const { data: pedestalCanon = [] } = useQuery({
    queryKey: ["audit-pedestal-canon"],
    queryFn: async () => {
      const { data } = await supabase
        .from("pedestal_vote_canon")
        .select("id,recipient_name,vote_status,created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  // Combine into unified rows
  const rows: AuditRow[] = useMemo(() => {
    const combined: AuditRow[] = [];
    const seenIds = new Set<string>();

    // W12: governance_audit_log entries take priority (canonical source)
    (auditLogEntries as Array<Record<string, unknown>>).forEach((e) => {
      const uid = `gal-${e.id as string}`;
      if (!seenIds.has(uid)) {
        seenIds.add(uid);
        combined.push({
          id: uid,
          action_type: (e.action_type as ActionType) ?? "vote",
          summary: e.summary as string,
          actor: e.actor_id as string | null,
          reference_id: e.reference_id as string | null,
          created_at: e.created_at as string,
          source: "vote",
        });
      }
    });

    // Star Chamber cases
    (starChamberCases as Array<Record<string, string>>).forEach((c) => {
      combined.push({
        id: `sc-${c.id}`,
        action_type: c.case_type === "appeal" ? "appeal" : "governance_decision",
        summary: c.resolved_at
          ? `Case resolved: ${c.title} -- ${c.final_action ?? c.status}`
          : `Case filed: ${c.title}`,
        actor: null,
        reference_id: c.id,
        created_at: c.resolved_at ?? c.created_at,
        source: "star_chamber",
      });
    });

    // Council elections
    (cycles as Array<Record<string, string>>).forEach((cy) => {
      combined.push({
        id: `cy-${cy.id}`,
        action_type: "election",
        summary: `Council election: ${cy.cycle_name} (${cy.status})`,
        actor: null,
        reference_id: cy.id,
        created_at: cy.starts_at,
        source: "council",
      });
    });

    // Council votes
    (councilVotes as Array<Record<string, string>>).forEach((v) => {
      combined.push({
        id: `cv-${v.id}`,
        action_type: "election",
        summary: `Council vote cast: ${v.vote_class}`,
        actor: null,
        reference_id: v.cycle_id,
        created_at: v.created_at,
        source: "council",
      });
    });

    // Vote allocations
    (voteAllocations as Array<Record<string, string>>).forEach((v) => {
      combined.push({
        id: `va-${v.id}`,
        action_type: "vote",
        summary: `Governance vote: ${v.vote_class}`,
        actor: null,
        reference_id: v.votable_item_id,
        created_at: v.created_at,
        source: "vote",
      });
    });

    // Pedestal canon
    (pedestalCanon as Array<Record<string, string>>).forEach((p) => {
      combined.push({
        id: `pc-${p.id}`,
        action_type: "letter_ratification",
        summary: `Pedestal: ${p.recipient_name} -- ${p.vote_status.replace(/_/g, " ")}`,
        actor: null,
        reference_id: p.id,
        created_at: p.created_at,
        source: "outreach",
      });
    });

    // IP Ledger
    (ipEntries as Array<Record<string, unknown>>).forEach((e) => {
      const ed = (e.entry_data as Record<string, unknown>) ?? {};
      const desc =
        (ed.description as string) ??
        (ed.action as string) ??
        (e.entry_type as string);
      combined.push({
        id: `ip-${e.id as string}`,
        action_type: "ip_ledger",
        summary: `IP Ledger #${e.sequence_number as number}: ${e.entry_type as string} -- ${desc}`,
        actor: null,
        reference_id: e.id as string,
        created_at: e.created_at as string,
        source: "ip_ledger",
      });
    });

    return combined.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [
    auditLogEntries,
    starChamberCases,
    councilVotes,
    cycles,
    ipEntries,
    voteAllocations,
    pedestalCanon,
  ]);

  return rows;
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function GovernanceAuditPage() {
  usePageSEO({
    title: "Governance Audit | Liana Banyan",
    description: "Immutable, public log of all governance actions on the Liana Banyan platform. Votes, appeals, elections, and ratifications.",
    canonical: "https://lianabanyan.com/governance/audit",
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<ActionType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  const allRows = useAuditLog();

  const filteredRows = useMemo(() => {
    let rows = allRows;
    if (filter !== "all") {
      rows = rows.filter((r) => r.action_type === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.summary.toLowerCase().includes(q));
    }
    return rows;
  }, [allRows, filter, search]);

  // Reset to page 0 when filter/search changes
  const pagedRows = useMemo(() => {
    return filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }, [filteredRows, page]);

  function handleExport() {
    const csv = [
      ["id", "action_type", "summary", "created_at", "source"].join(","),
      ...filteredRows.map((r) =>
        [
          r.id,
          r.action_type,
          `"${r.summary.replace(/"/g, '""')}"`,
          r.created_at,
          r.source,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `governance-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Audit log exported");
  }

  const counts: Record<string, number> = {};
  allRows.forEach((r) => {
    counts[r.action_type] = (counts[r.action_type] ?? 0) + 1;
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId="governance-audit">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/governance")}
            className="gap-2 -ml-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Governance
          </Button>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Lock className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Governance Audit Trail</h1>
                <p className="text-muted-foreground">
                  Immutable, append-only log of all governance actions.
                  Records cannot be edited or deleted.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2 shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Immutability notice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-4">
            <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">
                Immutable audit trail:{" "}
              </span>
              All governance actions -- votes, appeals, elections, letter
              ratifications -- are recorded here when they occur. Entries are
              append-only. No entry may be modified or removed. This log is
              maintained for cooperative transparency and regulatory compliance.
              It contains no financial transaction data and does not constitute
              a securities record.
            </p>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              { type: "vote", label: "Votes", icon: Vote },
              { type: "appeal", label: "Appeals", icon: Scale },
              { type: "election", label: "Elections", icon: Crown },
              {
                type: "letter_ratification",
                label: "Ratifications",
                icon: Mail,
              },
              { type: "ip_ledger", label: "Ledger", icon: Link2 },
            ] as const
          ).map(({ type, label, icon: Icon }) => (
            <Card
              key={type}
              className="cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => setFilter(type)}
            >
              <CardContent className="pt-4 text-center">
                <Icon className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
                <div className="text-xl font-bold">{counts[type] ?? 0}</div>
                <div className="text-xs text-muted-foreground">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filter}
            onValueChange={(v) => setFilter(v as ActionType)}
          >
            <SelectTrigger className="w-48">
              <Filter className="w-3.5 h-3.5 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All action types</SelectItem>
              <SelectItem value="vote">Votes</SelectItem>
              <SelectItem value="appeal">Appeals</SelectItem>
              <SelectItem value="election">Elections</SelectItem>
              <SelectItem value="letter_ratification">
                Letter Ratifications
              </SelectItem>
              <SelectItem value="governance_decision">
                Governance Decisions
              </SelectItem>
              <SelectItem value="ip_ledger">IP Ledger</SelectItem>
            </SelectContent>
          </Select>
          {(filter !== "all" || search) && (
            <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilter("all");
            setSearch("");
            setPage(0);
          }}
            >
              Clear
            </Button>
          )}
        </div>

        {/* Results count + pagination info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filteredRows.length} of {allRows.length} entries
            {filteredRows.length > PAGE_SIZE && (
              <span className="ml-1">
                (page {page + 1} of {Math.ceil(filteredRows.length / PAGE_SIZE)})
              </span>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" />
            Append-only
          </span>
        </div>

        {/* Audit log table */}
        {pagedRows.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              <Lock className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No entries match the current filter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {pagedRows.map((row) => (
              <Card key={row.id} className="hover:border-primary/20 transition-colors">
                <CardContent className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="mt-0.5 shrink-0 text-muted-foreground">
                        {actionIcon(row.action_type)}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <p className="text-sm leading-snug">{row.summary}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            className={`text-xs capitalize ${actionBadgeClass(row.action_type)}`}
                          >
                            {row.action_type.replace(/_/g, " ")}
                          </Badge>
                          <span className="text-xs text-muted-foreground capitalize">
                            {row.source}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {formatDate(row.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination controls */}
        {filteredRows.length > PAGE_SIZE && (
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, filteredRows.length)} of {filteredRows.length}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * PAGE_SIZE >= filteredRows.length}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}

        {/* Footer disclaimer */}
        <p className="text-xs text-muted-foreground border-t pt-4">
          This audit trail is maintained for cooperative governance transparency.
          All recorded actions are governance participation events. No entry
          constitutes a financial transaction, investment, or solicitation of
          funds. This log is not a securities record. Access is restricted to
          authorized staff and designated governance reviewers.
        </p>
      </div>
    </PortalPageLayout>
  );
}
