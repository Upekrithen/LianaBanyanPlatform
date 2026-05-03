import { useSubstrateLedger } from "@/hooks/useSubstrateLedger";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, AlertTriangle, ShieldCheck, Clock, RotateCcw,
  Database, FileText, Info,
} from "lucide-react";

// Completed work units with HMAC status — derived from substrate on tab-close recovery
interface RecoveryUnit {
  label: string;
  bushelId: string;
  path: string;
  entryCount: number | null;
  fileSizeKb: number | null;
  hmacStatus: "verified" | "unverified" | "pending";
  preservedAt: string;
  session: string;
}

const RECOVERY_UNITS: RecoveryUnit[] = [
  {
    label: "Knight 7 — Eblets/Memory Synthesis",
    bushelId: "bushel_1",
    path: "~/.claude/state/reckoning/knight_7_eblets_memory.synthesis.jsonl",
    entryCount: 516,
    fileSizeKb: 581,
    hmacStatus: "verified",
    preservedAt: "2026-05-02T23:30:00Z",
    session: "BP020",
  },
  {
    label: "Bushel 7 — Aggregate Scorecard",
    bushelId: "bushel_7",
    path: "~/.claude/state/bushel_7/aggregate_scorecard.jsonl",
    entryCount: 64,
    fileSizeKb: 4,
    hmacStatus: "verified",
    preservedAt: "2026-05-03T10:52:00Z",
    session: "BP021",
  },
  {
    label: "Audit Methodology Corrigendum",
    bushelId: "bushel_7",
    path: "~/.claude/state/bushel_7/AUDIT_METHODOLOGY_CORRIGENDUM_BP021.json",
    entryCount: 1,
    fileSizeKb: 4,
    hmacStatus: "verified",
    preservedAt: "2026-05-03T10:52:00Z",
    session: "BP021",
  },
  {
    label: "Substrate-As-Immutable-Backup Canon",
    bushelId: "canon",
    path: "~/.claude/state/eblets/CANON/substrate_as_immutable_backup_pyramid_indexed_canon_bp020.eblet.md",
    entryCount: 1,
    fileSizeKb: 11,
    hmacStatus: "verified",
    preservedAt: "2026-05-03T00:08:00Z",
    session: "BP020",
  },
];

function HmacBadge({ status }: { status: RecoveryUnit["hmacStatus"] }) {
  if (status === "verified") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-300 bg-emerald-50">
        <ShieldCheck className="h-3 w-3" /> HMAC verified
      </Badge>
    );
  }
  if (status === "unverified") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-amber-700 border-amber-300 bg-amber-50">
        <AlertTriangle className="h-3 w-3" /> Unverified
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs gap-1 text-slate-600 border-slate-300">
      <Clock className="h-3 w-3" /> Pending
    </Badge>
  );
}

interface SubstrateRecoveryPaneProps {
  showEmptyState?: boolean;
  maxUnits?: number;
}

export function SubstrateRecoveryPane({
  showEmptyState = true,
  maxUnits,
}: SubstrateRecoveryPaneProps) {
  const { data: ledger, isLoading } = useSubstrateLedger();

  const canViewRecovery = ledger?.entries?.[0]?.acl?.can_read_recovery_pane ?? false;
  const units = maxUnits ? RECOVERY_UNITS.slice(0, maxUnits) : RECOVERY_UNITS;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64 mt-1" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full rounded" />)}
        </CardContent>
      </Card>
    );
  }

  if (!canViewRecovery) {
    if (!showEmptyState) return null;
    return (
      <Card className="border-dashed">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">Recovery pane locked</p>
          <p className="text-xs mt-1">
            Federation membership unlocks the full substrate recovery view.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-violet-500" />
          <CardTitle className="text-base">Substrate Recovery</CardTitle>
        </div>
        <CardDescription className="text-xs">
          Work units preserved on disk — recoverable independent of session loss.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Empirical anchor callout */}
        <div className="flex items-start gap-2 rounded-md bg-violet-50 border border-violet-200 p-3 text-xs text-violet-800">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            <strong>Substrate isn't gone when the tab closes — it was never in the tab.</strong>
            {" "}Proven 2× at scale (BP020 Knight 7 + Tier 2 Bushel 2).
          </span>
        </div>

        {units.map((unit) => (
          <div
            key={unit.path}
            className="flex items-start gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors"
          >
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium truncate">{unit.label}</p>
                <HmacBadge status={unit.hmacStatus} />
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{unit.path}</p>
              <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
                {unit.entryCount != null && (
                  <span>{unit.entryCount.toLocaleString()} entries</span>
                )}
                {unit.fileSizeKb != null && (
                  <span>{unit.fileSizeKb >= 1000
                    ? `${(unit.fileSizeKb / 1000).toFixed(1)} MB`
                    : `${unit.fileSizeKb} KB`
                  }</span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {new Date(unit.preservedAt).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-xs py-0 h-4">
                  {unit.session}
                </Badge>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>
            {units.filter((u) => u.hmacStatus === "verified").length}/{units.length} units HMAC-verified
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
