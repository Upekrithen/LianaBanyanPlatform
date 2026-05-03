import { useSubstrateHealth, SubstrateHealthEntry } from "@/hooks/useSubstrateHealth";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  HardDrive, CheckCircle2, AlertTriangle, Clock, RefreshCw,
  ShieldCheck, FileText, Layers, XCircle, Activity,
} from "lucide-react";

const STATUS_CONFIG: Record<
  SubstrateHealthEntry["status"],
  { label: string; icon: React.ReactNode; className: string; rowClass: string }
> = {
  healthy: {
    label: "Healthy",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: "text-emerald-700 border-emerald-300 bg-emerald-50",
    rowClass: "border-emerald-200 bg-emerald-50/20",
  },
  drift: {
    label: "Drift",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
    className: "text-amber-700 border-amber-300 bg-amber-50",
    rowClass: "border-amber-200 bg-amber-50/30",
  },
  stale: {
    label: "Stale",
    icon: <Clock className="h-3.5 w-3.5" />,
    className: "text-slate-600 border-slate-300 bg-slate-50",
    rowClass: "border-slate-200 bg-slate-50/30",
  },
  missing: {
    label: "Missing",
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: "text-red-700 border-red-300 bg-red-50",
    rowClass: "border-red-200 bg-red-50/20",
  },
};

function HealthRow({ entry }: { entry: SubstrateHealthEntry }) {
  const cfg = STATUS_CONFIG[entry.status];

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${cfg.rowClass} transition-colors`}>
      {/* Icon */}
      <div className="mt-0.5 shrink-0">
        {entry.status === "healthy" ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : entry.status === "drift" ? (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        ) : entry.status === "missing" ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className="h-5 w-5 text-slate-400" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="text-sm font-medium">{entry.label}</p>
          <div className="flex gap-1.5 shrink-0">
            <Badge variant="outline" className={`text-xs gap-1 ${cfg.className}`}>
              {cfg.icon}
              {cfg.label}
            </Badge>
            {entry.hmacValid ? (
              <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-300 bg-emerald-50">
                <ShieldCheck className="h-3 w-3" /> HMAC
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs gap-1 text-slate-500">
                No HMAC
              </Badge>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-mono truncate mt-0.5">{entry.path}</p>

        <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {entry.bushelId.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
          {entry.entryCount != null && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {entry.entryCount.toLocaleString()} entries
            </span>
          )}
          {entry.fileSizeKb != null && (
            <span>{entry.fileSizeKb >= 1000
              ? `${(entry.fileSizeKb / 1000).toFixed(1)} MB`
              : `${entry.fileSizeKb} KB`
            }</span>
          )}
          {entry.lastRebuildAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(entry.lastRebuildAt).toLocaleDateString("en-US", {
                month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}
            </span>
          )}
          {entry.driftCount > 0 && (
            <span className="text-amber-600">{entry.driftCount} drift events</span>
          )}
        </div>

        <div className="mt-1.5">
          <span className="text-xs font-mono text-muted-foreground">
            {entry.fingerprint}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function SubstrateHealthDashboard() {
  const { data: report, isLoading, refetch, isFetching } = useSubstrateHealth();

  const overallColor =
    report?.overallStatus === "healthy"
      ? "text-emerald-700 border-emerald-300 bg-emerald-50"
      : report?.overallStatus === "drift"
      ? "text-amber-700 border-amber-300 bg-amber-50"
      : "text-red-700 border-red-300 bg-red-50";

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <HardDrive className="h-6 w-6 text-slate-500" />
              <h1 className="text-2xl font-bold text-foreground">Substrate Health</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Drift detection, HMAC fingerprint verification, and rebuild status across all substrate paths.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {report && (
              <Badge variant="outline" className={`text-sm gap-1.5 ${overallColor}`}>
                {report.overallStatus === "healthy" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5" />
                )}
                {report.overallStatus}
              </Badge>
            )}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 text-xs text-muted-foreground border rounded px-2.5 py-1.5 hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        {report && (
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Healthy",
                value: report.healthyCount,
                icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
                className: "bg-emerald-50/50",
              },
              {
                label: "Drift",
                value: report.driftCount,
                icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
                className: "bg-amber-50/50",
              },
              {
                label: "Missing",
                value: report.missingCount,
                icon: <XCircle className="h-4 w-4 text-red-500" />,
                className: "bg-red-50/50",
              },
            ].map(({ label, value, icon, className }) => (
              <Card key={label} className={className}>
                <CardContent className="p-3 flex items-center gap-2">
                  {icon}
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Rebuild info */}
        {report && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 border rounded-md px-3 py-2">
            <Activity className="h-3.5 w-3.5 shrink-0" />
            <span>Last rebuild session: <strong>{report.lastRebuildSession}</strong></span>
            <span className="mx-1">·</span>
            <span>Report generated: {new Date(report.generatedAt).toLocaleString()}</span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        )}

        {/* Entries */}
        {report && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Substrate Paths ({report.entries.length})
            </h2>
            <div className="space-y-2">
              {report.entries.map((entry) => (
                <HealthRow key={entry.path} entry={entry} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
