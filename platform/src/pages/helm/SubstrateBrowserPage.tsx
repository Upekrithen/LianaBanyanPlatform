import { useState } from "react";
import { useSubstrateLedger, SubstrateLedgerEntry } from "@/hooks/useSubstrateLedger";
import { useSubstrateHealth } from "@/hooks/useSubstrateHealth";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Database, Search, Filter, FolderOpen, FileText, CheckCircle2,
  AlertTriangle, Clock, ShieldCheck, Layers, HardDrive,
} from "lucide-react";

const COHORT_COLORS: Record<string, string> = {
  lone_wolf: "bg-slate-100 text-slate-700 border-slate-300",
  pied_piper: "bg-blue-100 text-blue-700 border-blue-300",
  federation: "bg-emerald-100 text-emerald-700 border-emerald-300",
  excalibur: "bg-amber-100 text-amber-700 border-amber-300",
};

const COHORT_LABELS: Record<string, string> = {
  lone_wolf: "Lone Wolf",
  pied_piper: "Pied Piper",
  federation: "Federation",
  excalibur: "Excalibur",
};

const BUSHEL_COLORS: Record<string, string> = {
  canon: "bg-violet-50 border-violet-200",
  bushel_1: "bg-blue-50 border-blue-200",
  bushel_2: "bg-cyan-50 border-cyan-200",
  bushel_7: "bg-amber-50 border-amber-200",
  bushel_8: "bg-emerald-50 border-emerald-200",
};

function EntryCard({ entry }: { entry: SubstrateLedgerEntry }) {
  const bushelColor = BUSHEL_COLORS[entry.bushelId] ?? "bg-slate-50 border-slate-200";
  const fileName = entry.path.split("/").pop() ?? entry.path;

  return (
    <Card className={`border ${bushelColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {fileName.endsWith(".jsonl") ? (
              <FileText className="h-5 w-5 text-slate-500 mt-0.5 shrink-0" />
            ) : fileName.endsWith(".json") ? (
              <FileText className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
            ) : (
              <FolderOpen className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{entry.label}</p>
              <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{entry.path}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs shrink-0 capitalize">
            {entry.bushelId.replace("_", " ")}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {entry.acl.can_read_codex && (
            <Badge variant="secondary" className="text-xs gap-1">
              <ShieldCheck className="h-3 w-3" /> Codex
            </Badge>
          )}
          {entry.acl.can_read_bushel_reports && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Layers className="h-3 w-3" /> Reports
            </Badge>
          )}
          {entry.acl.can_read_substrate_health && (
            <Badge variant="secondary" className="text-xs gap-1">
              <HardDrive className="h-3 w-3" /> Health
            </Badge>
          )}
          {entry.acl.can_read_recovery_pane && (
            <Badge variant="secondary" className="text-xs gap-1">
              <CheckCircle2 className="h-3 w-3" /> Recovery
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BushelPane({ bushelId, entries }: { bushelId: string; entries: SubstrateLedgerEntry[] }) {
  if (entries.length === 0) return null;
  const bushelColor = BUSHEL_COLORS[bushelId] ?? "bg-slate-50 border-slate-200";

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <span className={`inline-block w-2 h-2 rounded-full ${bushelId === "canon" ? "bg-violet-400" : bushelId === "bushel_8" ? "bg-emerald-400" : "bg-blue-400"}`} />
        {bushelId.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        <span className="text-xs font-normal normal-case">({entries.length} {entries.length === 1 ? "entry" : "entries"})</span>
      </h3>
      <div className="grid gap-2 md:grid-cols-2">
        {entries.map((entry) => (
          <EntryCard key={entry.path} entry={entry} />
        ))}
      </div>
    </div>
  );
}

export default function SubstrateBrowserPage() {
  const { data: ledger, isLoading, error } = useSubstrateLedger();
  const { data: health } = useSubstrateHealth();
  const [search, setSearch] = useState("");
  const [filterBushel, setFilterBushel] = useState<string>("all");

  const entries = ledger?.entries ?? [];

  const filtered = entries.filter((e) => {
    const matchSearch =
      !search ||
      e.label.toLowerCase().includes(search.toLowerCase()) ||
      e.path.toLowerCase().includes(search.toLowerCase());
    const matchBushel = filterBushel === "all" || e.bushelId === filterBushel;
    return matchSearch && matchBushel;
  });

  const sorted = [...filtered].sort((a, b) => a.bushelId.localeCompare(b.bushelId));

  const bushelIds = Array.from(new Set(entries.map((e) => e.bushelId)));

  const groupedByBushel: Record<string, SubstrateLedgerEntry[]> = {};
  sorted.forEach((e) => {
    if (!groupedByBushel[e.bushelId]) groupedByBushel[e.bushelId] = [];
    groupedByBushel[e.bushelId].push(e);
  });

  const cohortClass = ledger?.cohortClass ?? "lone_wolf";

  return (
    <PortalPageLayout>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Database className="h-6 w-6 text-violet-500" />
              <h1 className="text-2xl font-bold text-foreground">Substrate Browser</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Immutable AI work-product ledger. What you see depends on your cohort class.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`text-sm px-3 py-1 ${COHORT_COLORS[cohortClass] ?? ""}`}
            >
              {COHORT_LABELS[cohortClass] ?? cohortClass}
            </Badge>
            {health && (
              <Badge
                variant="outline"
                className={`text-sm gap-1.5 ${
                  health.overallStatus === "healthy"
                    ? "text-emerald-700 border-emerald-300"
                    : health.overallStatus === "drift"
                    ? "text-amber-700 border-amber-300"
                    : "text-red-700 border-red-300"
                }`}
              >
                {health.overallStatus === "healthy" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                Substrate {health.overallStatus}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats row */}
        {ledger && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Visible Entries", value: ledger.entryCount, icon: <FileText className="h-4 w-4 text-blue-500" /> },
              { label: "Bushels Accessible", value: bushelIds.length, icon: <Layers className="h-4 w-4 text-violet-500" /> },
              { label: "Healthy Paths", value: health?.healthyCount ?? "—", icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" /> },
              { label: "Drift Detected", value: health?.driftCount ?? 0, icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
            ].map(({ label, value, icon }) => (
              <Card key={label} className="bg-muted/40">
                <CardContent className="p-3 flex items-center gap-2">
                  {icon}
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-lg font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search paths or labels..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterBushel} onValueChange={setFilterBushel}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Filter by Bushel" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Bushels</SelectItem>
              {bushelIds.map((id) => (
                <SelectItem key={id} value={id}>
                  {id.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="font-medium text-sm">Failed to load substrate ledger</p>
                <p className="text-xs text-muted-foreground">{String(error)}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {Object.entries(groupedByBushel).map(([bushelId, bushEntries]) => (
              <BushelPane key={bushelId} bushelId={bushelId} entries={bushEntries} />
            ))}

            {sorted.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">
                  {search || filterBushel !== "all"
                    ? "No entries match your filter."
                    : "No substrate entries visible at your cohort class."}
                </p>
                {cohortClass === "lone_wolf" && (
                  <p className="text-xs mt-2 max-w-xs mx-auto">
                    Send a Cue Card to upgrade to Pied Piper and unlock additional substrate paths.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Last updated */}
        {health && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-4">
            <Clock className="h-3.5 w-3.5" />
            <span>Last rebuild session: {health.lastRebuildSession}</span>
            <span className="mx-1">·</span>
            <span>Generated: {new Date(health.generatedAt).toLocaleString()}</span>
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
