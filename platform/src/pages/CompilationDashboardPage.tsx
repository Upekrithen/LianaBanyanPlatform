import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, FileStack } from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "all" | "pending" | "in_progress" | "compiled" | "skipped" | "needs_review";

interface CompilationStatusRow {
  id: string;
  family_name: string;
  section: string | null;
  variant_count: number;
  status: "pending" | "in_progress" | "compiled" | "skipped" | "needs_review";
  compiled_document_id: string | null;
  assigned_to: string | null;
  notes: string | null;
  updated_at: string | null;
}

interface CompiledDocumentRow {
  id: string;
  title: string;
  compiled_markdown: string | null;
  family_name: string;
}

export default function CompilationDashboardPage() {
  const queryClient = useQueryClient();
  const [sectionFilter, setSectionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedFamilies, setSelectedFamilies] = useState<Set<string>>(new Set());
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  const { data: compilationRows = [], isLoading: statusLoading } = useQuery({
    queryKey: ["compilation-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compilation_status" as never)
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CompilationStatusRow[];
    },
  });

  const { data: compiledDocs = [], isLoading: docsLoading } = useQuery({
    queryKey: ["compiled-documents-preview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("id,title,compiled_markdown,family_name")
        .order("compiled_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as CompiledDocumentRow[];
    },
  });

  const queueAutoCompile = useMutation({
    mutationFn: async (families: string[]) => {
      if (families.length === 0) return;

      const { error } = await supabase
        .from("compilation_status" as never)
        .update({
          status: "in_progress",
          assigned_to: "auto",
          notes: "Queued from dashboard for auto-compile script execution.",
          updated_at: new Date().toISOString(),
        } as never)
        .in("family_name", families);

      if (error) throw error;
    },
    onSuccess: async (_, families) => {
      queryClient.invalidateQueries({ queryKey: ["compilation-status"] });
      const command = `npx tsx scripts/auto-compile.ts --families=${families.join(",")}`;

      try {
        await navigator.clipboard.writeText(command);
        toast.success("Families queued. Auto-compile command copied to clipboard.");
      } catch {
        toast.success("Families queued for auto-compile.");
      }
    },
    onError: () => {
      toast.error("Failed to queue families for auto-compile.");
    },
  });

  const summary = useMemo(() => {
    const counts = {
      total: compilationRows.length,
      compiled: 0,
      pending: 0,
      in_progress: 0,
      skipped: 0,
      needs_review: 0,
    };

    for (const row of compilationRows) {
      counts[row.status] += 1;
    }
    return counts;
  }, [compilationRows]);

  const sectionOptions = useMemo(() => {
    const options = new Set<string>(["all"]);
    for (const row of compilationRows) {
      options.add(row.section ?? "misc");
    }
    return [...options].sort((a, b) => a.localeCompare(b));
  }, [compilationRows]);

  const filteredRows = useMemo(
    () =>
      compilationRows.filter((row) => {
        const section = row.section ?? "misc";
        const sectionOk = sectionFilter === "all" || section === sectionFilter;
        const statusOk = statusFilter === "all" || row.status === statusFilter;
        return sectionOk && statusOk;
      }),
    [compilationRows, sectionFilter, statusFilter],
  );

  const compiledById = useMemo(() => new Map(compiledDocs.map((doc) => [doc.id, doc])), [compiledDocs]);

  const activeDoc = activeDocumentId ? compiledById.get(activeDocumentId) ?? null : null;

  const isLoading = statusLoading || docsLoading;

  const toggleFamilySelection = (familyName: string) => {
    setSelectedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(familyName)) next.delete(familyName);
      else next.add(familyName);
      return next;
    });
  };

  const runAutoCompile = () => {
    const selected = [...selectedFamilies];
    const families = selected.length > 0 ? selected : filteredRows.map((row) => row.family_name);
    if (families.length === 0) {
      toast.error("No families selected for auto-compile.");
      return;
    }
    queueAutoCompile.mutate(families);
  };

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6" data-xray-id="compilation-dashboard">
      <div className="flex items-center gap-3">
        <FileStack className="w-8 h-8 text-sky-400" />
        <div>
          <h1 className="text-2xl font-bold">Compilation Dashboard</h1>
          <p className="text-sm text-muted-foreground">Family-level compilation workflow and automation status</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{summary.total}</p>
            <p className="text-xs text-muted-foreground">Total Families</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{summary.compiled}</p>
            <p className="text-xs text-muted-foreground">Compiled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{summary.pending + summary.in_progress}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold">{summary.needs_review}</p>
            <p className="text-xs text-muted-foreground">Needs Review</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters & Actions</CardTitle>
          <CardDescription>
            Select families manually or run on current filtered view when nothing is selected.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Section</label>
            <select
              className="bg-background border rounded px-2 py-1 text-sm"
              value={sectionFilter}
              onChange={(event) => setSectionFilter(event.target.value)}
            >
              {sectionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              className="bg-background border rounded px-2 py-1 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            >
              <option value="all">all</option>
              <option value="pending">pending</option>
              <option value="in_progress">in_progress</option>
              <option value="compiled">compiled</option>
              <option value="needs_review">needs_review</option>
              <option value="skipped">skipped</option>
            </select>
          </div>

          <Button onClick={runAutoCompile} disabled={queueAutoCompile.isPending}>
            {queueAutoCompile.isPending ? "Queuing..." : "Auto-Compile"}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && filteredRows.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No families match the current filters.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {filteredRows.map((row) => {
          const compiledDoc = row.compiled_document_id ? compiledById.get(row.compiled_document_id) : null;
          return (
            <Card key={row.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{row.family_name}</CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{row.section ?? "misc"}</Badge>
                      <Badge>{row.status}</Badge>
                      <span>{row.variant_count} variants</span>
                      {row.assigned_to && <span>assigned: {row.assigned_to}</span>}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFamilies.has(row.family_name)}
                        onChange={() => toggleFamilySelection(row.family_name)}
                      />
                      Select
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!compiledDoc}
                      onClick={() => {
                        if (!compiledDoc) {
                          toast.error("No linked compiled document found.");
                          return;
                        }
                        setActiveDocumentId(compiledDoc.id);
                      }}
                    >
                      View Compiled
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {row.notes && (
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">{row.notes}</p>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {activeDoc && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{activeDoc.title}</CardTitle>
            <CardDescription>{activeDoc.family_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <article className="prose prose-invert max-w-none text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeDoc.compiled_markdown ?? ""}</ReactMarkdown>
            </article>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
