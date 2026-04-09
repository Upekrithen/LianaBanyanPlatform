import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StaffPageLayout } from "@/components/staff/StaffPageLayout";
import { StaffPageHeader } from "@/components/staff/StaffPageHeader";
import { StaffAccessGate } from "@/components/staff/StaffAccessGate";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type TrackerStatus = "pending" | "in_progress" | "review" | "completed" | "blocked";

type TrackerRow = {
  id: string;
  page_name: string;
  page_route: string | null;
  pawn_batch: string | null;
  spec_file: string | null;
  status: TrackerStatus;
  assignee: string | null;
  dependencies: string[] | null;
  session_history: string[] | null;
  screenshot_urls: string[] | null;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  updated_at: string | null;
  unmet_dependencies: string[] | null;
  has_unmet_dependencies: boolean | null;
};

type CompilationSummary = {
  total: number;
  compiled: number;
};

type CompilationRow = {
  family_name: string;
  status: "pending" | "in_progress" | "compiled" | "skipped" | "needs_review";
};

const STATUS_OPTIONS: TrackerStatus[] = ["pending", "in_progress", "review", "completed", "blocked"];
const BATCH_OPTIONS = ["all", "B35_3A", "B36_3B", "B37_3C"] as const;

export default function V2RedesignTracker() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TrackerStatus | "all">("all");
  const [batchFilter, setBatchFilter] = useState<(typeof BATCH_OPTIONS)[number]>("all");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailNotes, setDetailNotes] = useState("");
  const [isDependencyGraphOpen, setIsDependencyGraphOpen] = useState(false);

  const trackerQuery = useQuery({
    queryKey: ["v2-redesign-tracker"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("v2_tracker_with_dependency_status" as never)
        .select(
          "id,page_name,page_route,pawn_batch,spec_file,status,assignee,dependencies,session_history,screenshot_urls,notes,started_at,completed_at,updated_at,unmet_dependencies,has_unmet_dependencies",
        )
        .order("pawn_batch", { ascending: true })
        .order("page_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as TrackerRow[];
    },
  });

  const compilationQuery = useQuery({
    queryKey: ["v2-tracker-compilation-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compilation_status" as never)
        .select("family_name,status");
      if (error) throw error;
      return (data ?? []) as CompilationRow[];
    },
  });

  const updateRowMutation = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<TrackerRow, "status" | "notes" | "assignee" | "started_at" | "completed_at">>;
    }) => {
      const payload = {
        ...patch,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("v2_redesign_tracker" as never)
        .update(payload as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["v2-redesign-tracker"] });
    },
    onError: () => {
      toast.error("Failed to update tracker row.");
    },
  });

  const rows = trackerQuery.data ?? [];
  const compilationRows = compilationQuery.data ?? [];
  const selectedRow = selectedId ? rows.find((row) => row.id === selectedId) ?? null : null;

  const compilation = useMemo(() => {
    const compiled = compilationRows.filter((row) => row.status === "compiled").length;
    return { total: compilationRows.length, compiled } as CompilationSummary;
  }, [compilationRows]);

  const familyStatusMap = useMemo(() => {
    const map = new Map<string, CompilationRow["status"]>();
    for (const row of compilationRows) map.set(row.family_name, row.status);
    return map;
  }, [compilationRows]);

  const summary = useMemo(() => {
    const counts: Record<TrackerStatus, number> = {
      pending: 0,
      in_progress: 0,
      review: 0,
      completed: 0,
      blocked: 0,
    };
    for (const row of rows) counts[row.status] += 1;
    return {
      total: rows.length,
      ...counts,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const assigneeNeedle = assigneeFilter.trim().toLowerCase();
    return rows.filter((row) => {
      const statusOk = statusFilter === "all" || row.status === statusFilter;
      const batchOk = batchFilter === "all" || row.pawn_batch === batchFilter;
      const assigneeOk =
        assigneeNeedle.length === 0 ||
        (row.assignee ?? "").toLowerCase().includes(assigneeNeedle);
      return statusOk && batchOk && assigneeOk;
    });
  }, [rows, statusFilter, batchFilter, assigneeFilter]);

  const blockedPages = useMemo(() => {
    return rows.filter((row) => {
      const unmet = row.unmet_dependencies ?? [];
      return unmet.length > 0 && !["completed", "review"].includes(row.status);
    });
  }, [rows]);

  const dependencyGraph = useMemo(() => {
    const pages = rows
      .filter((row) => (row.dependencies ?? []).length > 0)
      .sort((a, b) => a.page_name.localeCompare(b.page_name));

    const families = Array.from(
      new Set(pages.flatMap((row) => row.dependencies ?? [])),
    ).sort((a, b) => a.localeCompare(b));

    const rowHeight = 36;
    const topPad = 36;
    const bottomPad = 36;
    const height = Math.max(
      260,
      Math.max(pages.length, families.length) * rowHeight + topPad + bottomPad,
    );
    const width = 1100;
    const pageX = 70;
    const familyX = 700;

    const pageNodes = pages.map((page, idx) => ({
      ...page,
      y: topPad + idx * rowHeight,
    }));

    const familyNodes = families.map((family, idx) => ({
      family,
      y: topPad + idx * rowHeight,
      status: familyStatusMap.get(family) ?? "pending",
    }));

    const familyYByName = new Map(familyNodes.map((node) => [node.family, node.y]));
    const edges = pageNodes.flatMap((page) =>
      (page.dependencies ?? []).map((family) => ({
        pageId: page.id,
        pageY: page.y,
        family,
        familyY: familyYByName.get(family) ?? page.y,
        status: familyStatusMap.get(family) ?? "pending",
      })),
    );

    return { width, height, pageX, familyX, pageNodes, familyNodes, edges };
  }, [rows, familyStatusMap]);

  const setStatus = (row: TrackerRow, status: TrackerStatus) => {
    const nowIso = new Date().toISOString();
    const patch: Partial<Pick<TrackerRow, "status" | "started_at" | "completed_at">> = { status };
    if (status === "in_progress" && !row.started_at) patch.started_at = nowIso;
    if (status === "completed" && !row.completed_at) patch.completed_at = nowIso;
    if (status !== "completed") patch.completed_at = null;
    updateRowMutation.mutate({ id: row.id, patch });
  };

  const saveDetailNotes = () => {
    if (!selectedRow) return;
    updateRowMutation.mutate(
      { id: selectedRow.id, patch: { notes: detailNotes } },
      {
        onSuccess: () => {
          toast.success("Notes updated.");
          queryClient.invalidateQueries({ queryKey: ["v2-redesign-tracker"] });
        },
      },
    );
  };

  const startRedesignPrompt = async () => {
    if (!selectedRow) return;
    const template = [
      `# KNIGHT REDESIGN STARTER`,
      `Page: ${selectedRow.page_name}`,
      `Route: ${selectedRow.page_route ?? "(not set)"}`,
      `Pawn Batch: ${selectedRow.pawn_batch ?? "(not set)"}`,
      `Spec File: ${selectedRow.spec_file ?? "(not set)"}`,
      ``,
      `Dependencies: ${(selectedRow.dependencies ?? []).join(", ") || "none"}`,
      `Session History: ${(selectedRow.session_history ?? []).join(", ") || "none"}`,
      ``,
      `Implementation checklist:`,
      `- Load spec and capture shell + layout constraints`,
      `- Keep WildFire Tour mode separate from real data`,
      `- Build page updates only for this route`,
      `- Add tests/verification notes and request Founder review`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(template);
      toast.success("Knight prompt template copied.");
    } catch {
      toast.message("Prompt template generated. Clipboard copy was blocked.");
    }
  };

  const compilationTarget = 352;

  return (
    <StaffAccessGate>
      <StaffPageLayout maxWidth="xl" xrayId="staff-v2-redesign-tracker">
        <Card>
          <CardHeader>
            <StaffPageHeader
              title="V2 Redesign Tracker"
              description="Track implementation progress for Pawn-defined V2 page redesigns."
              actions={
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDependencyGraphOpen(true)}
                  >
                    View Dependencies
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link to="/admin/compilation">Open Compilation Dashboard</Link>
                  </Button>
                </>
              }
            />
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <SummaryStat label="Total Pages" value={summary.total} />
            <SummaryStat label="Completed" value={summary.completed} />
            <SummaryStat label="In Progress" value={summary.in_progress} />
            <SummaryStat label="Pending" value={summary.pending} />
            <SummaryStat label="Blocked" value={summary.blocked} />
            <SummaryStat
              label="Compilation"
              value={`${compilation.compiled}/${Math.max(compilation.total, compilationTarget)}`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Blocked Pages ({blockedPages.length})</CardTitle>
            <CardDescription>Pages waiting for compilation dependencies.</CardDescription>
          </CardHeader>
          <CardContent>
            {blockedPages.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No blockers. All dependency-tracked pages are ready to move forward.
              </p>
            ) : (
              <div className="space-y-3">
                {blockedPages.map((page) => (
                  <div key={page.id} className="rounded-md border p-3">
                    <p className="text-sm font-semibold">{page.page_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Waiting on: {(page.unmet_dependencies ?? []).join(", ")}
                    </p>
                    <Button asChild variant="outline" size="sm" className="mt-3">
                      <Link to="/admin/compilation">Go compile -&gt;</Link>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
            <CardDescription>Filter by status, Pawn batch, or assignee/session.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as TrackerStatus | "all")}
              >
                <option value="all">all</option>
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Pawn Batch</label>
              <select
                className="h-10 rounded-md border bg-background px-3 text-sm"
                value={batchFilter}
                onChange={(event) => setBatchFilter(event.target.value as (typeof BATCH_OPTIONS)[number])}
              >
                {BATCH_OPTIONS.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1 md:min-w-[220px]">
              <label className="text-xs text-muted-foreground">Assignee (e.g. K270)</label>
              <Input
                placeholder="K266"
                value={assigneeFilter}
                onChange={(event) => setAssigneeFilter(event.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pages</CardTitle>
            <CardDescription>{filteredRows.length} rows match current filters.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Pawn Batch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Route</TableHead>
                  <TableHead>Spec File</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={selectedId === row.id ? "bg-muted/50" : undefined}
                    onClick={() => {
                      setSelectedId(row.id);
                      setDetailNotes(row.notes ?? "");
                    }}
                  >
                    <TableCell className="font-medium">{row.page_name}</TableCell>
                    <TableCell>{row.pawn_batch ?? "-"}</TableCell>
                    <TableCell onClick={(event) => event.stopPropagation()}>
                      <select
                        className="h-8 rounded border bg-background px-2 text-xs"
                        value={row.status}
                        onChange={(event) => setStatus(row, event.target.value as TrackerStatus)}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-xs">{row.page_route ?? "-"}</TableCell>
                    <TableCell className="text-xs">{row.spec_file ?? "-"}</TableCell>
                    <TableCell className="text-xs">{row.assignee ?? "-"}</TableCell>
                    <TableCell className="text-xs max-w-[260px] truncate">{row.notes || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {selectedRow && (
          <Card>
            <CardHeader>
              <StaffPageHeader
                title={selectedRow.page_name}
                description="Spec path, dependencies, screenshots, and session history."
                actions={
                  <Button size="sm" variant="outline" onClick={startRedesignPrompt}>
                    Start Redesign
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{selectedRow.pawn_batch ?? "unbatched"}</Badge>
                <Badge>{selectedRow.status}</Badge>
                <span className="text-muted-foreground">Route: {selectedRow.page_route ?? "-"}</span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Spec File</p>
                <p className="text-sm">{selectedRow.spec_file ?? "-"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Dependencies</p>
                {(selectedRow.dependencies ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(selectedRow.dependencies ?? []).map((dep) => (
                      <Badge key={dep} variant="secondary">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No dependencies listed.</p>
                )}
              </div>

              <div className="space-y-1">
                <p className="text-xs font-medium uppercase text-muted-foreground">Knight Session History</p>
                {(selectedRow.session_history ?? []).length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {(selectedRow.session_history ?? []).map((session) => (
                      <Badge key={session} variant="outline">
                        {session}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No session history yet.</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Screenshots</p>
                {(selectedRow.screenshot_urls ?? []).length > 0 ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    {(selectedRow.screenshot_urls ?? []).map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="group">
                        <img
                          src={url}
                          alt={`${selectedRow.page_name} screenshot`}
                          className="w-full rounded-md border object-cover max-h-[220px]"
                        />
                        <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground">{url}</p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No screenshots attached yet.</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                <Textarea
                  value={detailNotes}
                  onChange={(event) => setDetailNotes(event.target.value)}
                  rows={4}
                />
                <Button size="sm" onClick={saveDetailNotes} disabled={updateRowMutation.isPending || !user}>
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={isDependencyGraphOpen} onOpenChange={setIsDependencyGraphOpen}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle>Tracker Dependency Graph</DialogTitle>
              <DialogDescription>
                Left: V2 tracker pages. Right: compilation families. Edge colors show family state.
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[72vh] overflow-auto rounded-md border">
              <svg width={dependencyGraph.width} height={dependencyGraph.height} className="bg-background">
                {dependencyGraph.edges.map((edge) => {
                  const color =
                    edge.status === "compiled"
                      ? "#16a34a"
                      : edge.status === "in_progress"
                        ? "#f59e0b"
                        : "#dc2626";
                  const startX = dependencyGraph.pageX + 300;
                  const startY = edge.pageY + 10;
                  const endX = dependencyGraph.familyX;
                  const endY = edge.familyY + 10;
                  const controlX = (startX + endX) / 2;
                  return (
                    <path
                      key={`${edge.pageId}-${edge.family}`}
                      d={`M ${startX} ${startY} Q ${controlX} ${startY}, ${endX} ${endY}`}
                      stroke={color}
                      strokeWidth={1.5}
                      fill="none"
                      opacity={0.8}
                    />
                  );
                })}

                {dependencyGraph.pageNodes.map((node) => (
                  <g key={node.id}>
                    <rect
                      x={dependencyGraph.pageX}
                      y={node.y}
                      width={300}
                      height={20}
                      rx={4}
                      fill="#1f2937"
                    />
                    <text
                      x={dependencyGraph.pageX + 8}
                      y={node.y + 14}
                      fill="#f8fafc"
                      fontSize="11"
                    >
                      {node.page_name}
                    </text>
                  </g>
                ))}

                {dependencyGraph.familyNodes.map((node) => {
                  const fill =
                    node.status === "compiled"
                      ? "#14532d"
                      : node.status === "in_progress"
                        ? "#78350f"
                        : "#7f1d1d";
                  return (
                    <g key={node.family}>
                      <rect
                        x={dependencyGraph.familyX}
                        y={node.y}
                        width={300}
                        height={20}
                        rx={4}
                        fill={fill}
                      />
                      <text
                        x={dependencyGraph.familyX + 8}
                        y={node.y + 14}
                        fill="#f8fafc"
                        fontSize="11"
                      >
                        {node.family} ({node.status})
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </DialogContent>
        </Dialog>
      </StaffPageLayout>
    </StaffAccessGate>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
