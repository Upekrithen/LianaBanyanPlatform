import { useState } from "react";
import { useCodexBindStatus } from "@/hooks/useCodexBindStatus";
import { useBushelScorecard } from "@/hooks/useBushelScorecard";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BookOpen, ShieldCheck, AlertTriangle, Clock, ChevronRight,
  Lock, ExternalLink, Layers, Hash, FileText, Link2,
} from "lucide-react";

// Known Codex registry with chapter structure
// In production this would come from Supabase codex_bindings table
interface CodexChapter {
  index: number;
  title: string;
  stratum: string;
  shadowId: number | null;
  type: "shard" | "manifest" | "receipt" | "meta";
  wordCount: number | null;
  pointers: string[];
}

interface CodexRecord {
  id: string;
  title: string;
  edition: string;
  session: string;
  hmac: string;
  chapters: CodexChapter[];
  crossPointers: string[];
  bushelId: string;
}

const CODEX_REGISTRY: CodexRecord[] = [
  {
    id: "LB-CODEX-0025",
    title: "Bushel 7 — 3-Layer Taxonomy Coverage Audit (BP021)",
    edition: "BP021-0.9",
    session: "BP021",
    hmac: "9cb23584e95922c7",
    bushelId: "bushel_7",
    crossPointers: ["LB-CODEX-0026"],
    chapters: [
      { index: 1, title: "Layer 1 Manifest — Candelabra Core", stratum: "bedrock", shadowId: 1, type: "shard", wordCount: 800, pointers: [] },
      { index: 2, title: "Layer 2 Shard — Innovation Classification", stratum: "granite", shadowId: 2, type: "shard", wordCount: 600, pointers: [] },
      { index: 3, title: "Layer 3 Shard — A&A Formal Coverage", stratum: "limestone", shadowId: 3, type: "shard", wordCount: 750, pointers: [] },
      { index: 4, title: "Layer 4 Shard — Pheromone Write Status", stratum: "sandstone", shadowId: 4, type: "shard", wordCount: 500, pointers: [] },
      { index: 5, title: "Layer 5 Shard — Code Coverage Delta", stratum: "sediment", shadowId: 5, type: "shard", wordCount: 400, pointers: [] },
      { index: 6, title: "Layer 6 Shard — Cross-Reference Gaps", stratum: "soil", shadowId: 6, type: "shard", wordCount: 450, pointers: [] },
      { index: 7, title: "Layer 7 Shard — Recurring Diagnostic Template", stratum: "sand", shadowId: 7, type: "shard", wordCount: 350, pointers: ["LB-CODEX-0026"] },
      { index: 8, title: "Aggregate Scorecard", stratum: "granite", shadowId: 8, type: "shard", wordCount: 300, pointers: [] },
      { index: 9, title: "Audit Methodology Corrigendum", stratum: "bedrock", shadowId: null, type: "manifest", wordCount: 250, pointers: ["LB-CODEX-0026"] },
      { index: 10, title: "Cost Receipt + Session Stats", stratum: "sand", shadowId: null, type: "receipt", wordCount: 150, pointers: [] },
    ],
  },
  {
    id: "LB-CODEX-0026",
    title: "Bushel 8 — LB Frame Substrate UI (BP021)",
    edition: "BP021-1.0",
    session: "BP021",
    hmac: "PENDING_BIND",
    bushelId: "bushel_8",
    crossPointers: ["LB-CODEX-0025"],
    chapters: [
      { index: 1, title: "Shadow 1 — Migration + ACL", stratum: "bedrock", shadowId: 1, type: "shard", wordCount: null, pointers: [] },
      { index: 2, title: "Shadow 2 — Edge Functions", stratum: "granite", shadowId: 2, type: "shard", wordCount: null, pointers: [] },
      { index: 3, title: "Shadow 3 — Hooks Layer", stratum: "limestone", shadowId: 3, type: "shard", wordCount: null, pointers: [] },
      { index: 4, title: "Shadow 4 — SubstrateBrowserPage", stratum: "sandstone", shadowId: 4, type: "shard", wordCount: null, pointers: [] },
      { index: 5, title: "Shadow 5 — SubstrateRecoveryPane", stratum: "sediment", shadowId: 5, type: "shard", wordCount: null, pointers: [] },
      { index: 6, title: "Shadow 6 — BushelDashboard", stratum: "soil", shadowId: 6, type: "shard", wordCount: null, pointers: [] },
      { index: 7, title: "Shadow 7 — CodexReader", stratum: "sand", shadowId: 7, type: "shard", wordCount: null, pointers: [] },
      { index: 8, title: "Shadow 8 — SubstrateHealth + Routes", stratum: "granite", shadowId: 8, type: "shard", wordCount: null, pointers: [] },
      { index: 9, title: "Build Manifest + Gate Results", stratum: "bedrock", shadowId: null, type: "manifest", wordCount: null, pointers: ["LB-CODEX-0025"] },
      { index: 10, title: "Cost Receipt + Session Stats", stratum: "sand", shadowId: null, type: "receipt", wordCount: null, pointers: [] },
    ],
  },
];

const STRATUM_COLORS: Record<string, string> = {
  bedrock: "bg-slate-800 text-white",
  granite: "bg-slate-600 text-white",
  limestone: "bg-slate-400 text-white",
  sandstone: "bg-amber-400 text-white",
  sediment: "bg-amber-300 text-slate-800",
  soil: "bg-amber-200 text-slate-700",
  sand: "bg-yellow-100 text-slate-600",
};

const CHAPTER_TYPE_ICONS: Record<string, React.ReactNode> = {
  shard: <Layers className="h-3.5 w-3.5" />,
  manifest: <FileText className="h-3.5 w-3.5" />,
  receipt: <Hash className="h-3.5 w-3.5" />,
  meta: <BookOpen className="h-3.5 w-3.5" />,
};

function ChapterRow({ chapter, index }: { chapter: CodexChapter; index: number }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-md border bg-muted/30 hover:bg-muted/50 transition-colors group">
      <span className="text-xs font-mono text-muted-foreground w-6 text-right shrink-0">
        {chapter.index}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {CHAPTER_TYPE_ICONS[chapter.type]}
          </span>
          <p className="text-sm font-medium truncate">{chapter.title}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge
            className={`text-xs px-1.5 py-0 h-4 ${STRATUM_COLORS[chapter.stratum] ?? "bg-slate-100 text-slate-700"}`}
          >
            {chapter.stratum}
          </Badge>
          {chapter.shadowId && (
            <span className="text-xs text-muted-foreground">Shadow {chapter.shadowId}</span>
          )}
          {chapter.wordCount && (
            <span className="text-xs text-muted-foreground">{chapter.wordCount.toLocaleString()} words</span>
          )}
          {chapter.pointers.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-blue-600">
              <Link2 className="h-3 w-3" />
              {chapter.pointers.join(", ")}
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
    </div>
  );
}

function HmacStatus({ codexId }: { codexId: string }) {
  const { data, isLoading } = useCodexBindStatus(codexId);

  if (isLoading) return <Badge variant="outline" className="text-xs">Verifying...</Badge>;
  if (!data) return null;

  if (data.status === "bound" || data.status === "verified") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-emerald-700 border-emerald-300 bg-emerald-50">
        <ShieldCheck className="h-3 w-3" />
        HMAC: {data.storedHmac?.slice(0, 8)}…
      </Badge>
    );
  }
  if (data.status === "pending") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-amber-700 border-amber-300">
        <Clock className="h-3 w-3" />
        Bind pending
      </Badge>
    );
  }
  if (data.status === "tampered") {
    return (
      <Badge variant="outline" className="text-xs gap-1 text-red-700 border-red-300 bg-red-50">
        <AlertTriangle className="h-3 w-3" />
        TAMPERED
      </Badge>
    );
  }
  return null;
}

export default function CodexReader() {
  const [selectedCodexId, setSelectedCodexId] = useState<string>("LB-CODEX-0026");

  const codex = CODEX_REGISTRY.find((c) => c.id === selectedCodexId);
  const isPending = codex?.hmac === "PENDING_BIND";

  return (
    <PortalPageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <BookOpen className="h-6 w-6 text-amber-500" />
              <h1 className="text-2xl font-bold text-foreground">Codex Reader</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              LB-CODEX HMAC-verified AI work-product archives. Pyramid-indexed. Immutable.
            </p>
          </div>
          <Select value={selectedCodexId} onValueChange={setSelectedCodexId}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Select Codex" />
            </SelectTrigger>
            <SelectContent>
              {CODEX_REGISTRY.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.id} — {c.bushelId.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Codex metadata card */}
        {codex && (
          <Card className={`border-2 ${isPending ? "border-amber-200 bg-amber-50/30" : "border-emerald-200 bg-emerald-50/20"}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="text-lg">{codex.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Edition {codex.edition} · Session {codex.session}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <HmacStatus codexId={codex.id} />
                  <Badge variant="outline" className="text-xs">
                    {codex.id}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold">{codex.chapters.length}</p>
                  <p className="text-xs text-muted-foreground">Chapters</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {codex.chapters.reduce((s, c) => s + (c.wordCount ?? 0), 0).toLocaleString() || "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Total words</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{codex.crossPointers.length}</p>
                  <p className="text-xs text-muted-foreground">Cross-pointers</p>
                </div>
              </div>

              {/* Cross-Codex pointers */}
              {codex.crossPointers.length > 0 && (
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Links to:</span>
                  {codex.crossPointers.map((ptr) => (
                    <button
                      key={ptr}
                      onClick={() => setSelectedCodexId(ptr)}
                      className="text-blue-600 hover:underline flex items-center gap-0.5"
                    >
                      {ptr} <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Chapter list */}
        {codex && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Chapters ({codex.chapters.length})
            </h2>
            <div className="space-y-2">
              {codex.chapters.map((chapter) => (
                <ChapterRow key={chapter.index} chapter={chapter} index={chapter.index} />
              ))}
            </div>
          </div>
        )}

        {/* Lock notice for pending bind */}
        {codex && isPending && (
          <Card className="border-amber-200 bg-amber-50/40">
            <CardContent className="p-4 flex items-start gap-3">
              <Lock className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Codex bind in progress</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {codex.id} will be HMAC-locked on Bushel 8 completion. Chapters are staged; bind finalizes after Gate G7 passes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalPageLayout>
  );
}
