/**
 * /my/cathedral/:scribeId — Tablet view
 * =====================================
 * Paginated entries for one Scribe + append-new-entry form. Search by keyword
 * filters client-side over the current page (full-text search across all
 * entries lands in K438b alongside the member_consult_scribes MCP tool).
 */
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ScrollText, Share2, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import {
  useEnsureCathedral,
  useMemberScribe,
  useScribeEntries,
  useAppendEntry,
} from "./useCathedral";
import type { ShareLevel } from "@/lib/cathedral-client";

const PAGE_SIZE = 20;

const SHARE_LABEL: Record<ShareLevel, string> = {
  private: "Private",
  guild: "Guild",
  tribe: "Tribe",
  commons: "Commons",
};

function formatTs(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString();
}

export default function CathedralTablet() {
  useEnsureCathedral();
  const { scribeId } = useParams<{ scribeId: string }>();
  const { toast } = useToast();

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [observation, setObservation] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [canonicalRef, setCanonicalRef] = useState("");

  const { data: scribe, isLoading: scribeLoading } = useMemberScribe(scribeId);
  const { data: pageData, isLoading: entriesLoading } = useScribeEntries(scribeId, page, PAGE_SIZE);
  const append = useAppendEntry(scribeId ?? "");

  const filtered = useMemo(() => {
    const entries = pageData?.entries ?? [];
    if (!search.trim()) return entries;
    const q = search.toLowerCase();
    return entries.filter((e) =>
      e.observation.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)) ||
      (e.canonical_ref?.toLowerCase().includes(q) ?? false)
    );
  }, [pageData?.entries, search]);

  const totalPages = Math.max(1, Math.ceil((pageData?.total ?? 0) / PAGE_SIZE));

  const submit = async () => {
    if (!observation.trim()) {
      toast({ title: "Observation required", description: "Write what happened.", variant: "destructive" });
      return;
    }
    const tags = tagsRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    try {
      await append.mutateAsync({
        observation,
        tags,
        canonical_ref: canonicalRef.trim() || null,
      });
      setObservation("");
      setTagsRaw("");
      setCanonicalRef("");
      toast({ title: "Entry appended", description: "Your tablet grew." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not append entry.";
      toast({ title: "Append failed", description: msg, variant: "destructive" });
    }
  };

  if (scribeLoading) {
    return (
      <PortalPageLayout title="Loading Scribe…" backButton maxWidth="xl">
        <Skeleton className="h-32 w-full" />
      </PortalPageLayout>
    );
  }

  if (!scribe) {
    return (
      <PortalPageLayout title="Scribe not found" backButton maxWidth="md">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">
              That Scribe doesn't exist in your Cathedral, or you don't have access to it.
            </p>
            <Button asChild>
              <Link to="/my/cathedral">Back to your Cathedral</Link>
            </Button>
          </CardContent>
        </Card>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout
      title={scribe.name}
      subtitle={scribe.primary_field}
      backButton
      maxWidth="xl"
      xrayId="cathedral-tablet"
    >
      <div className="space-y-6">
        {/* Scribe metadata header */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={scribe.share_level === "commons" ? "default" : "secondary"}>
                  {SHARE_LABEL[scribe.share_level]}
                </Badge>
                {!scribe.active && <Badge variant="outline">queued</Badge>}
                <span className="text-xs text-muted-foreground">
                  {scribe.adjacents.length} adjacent {scribe.adjacents.length === 1 ? "field" : "fields"}
                  {" • "}{scribe.keywords.length} keyword{scribe.keywords.length === 1 ? "" : "s"}
                </span>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/my/cathedral/${scribe.scribe_id}/share`}>
                  <Share2 className="h-4 w-4 mr-1" /> Share settings
                </Link>
              </Button>
            </div>
            {scribe.adjacents.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {scribe.adjacents
                  .slice()
                  .sort((a, b) => a.level - b.level)
                  .map((a, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-normal">
                      L{a.level} · {a.field}
                    </Badge>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Append form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Plus className="h-4 w-4" /> Append a new entry
            </CardTitle>
            <CardDescription>
              Tablets are append-only. Once written, an entry cannot be edited or
              deleted — that's the durability substrate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="entry-obs">Observation</Label>
              <Textarea
                id="entry-obs"
                placeholder="What happened? What did you learn? Be specific."
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="entry-tags">Tags (comma-separated)</Label>
                <Input
                  id="entry-tags"
                  placeholder="harvest, bug-fix, idea"
                  value={tagsRaw}
                  onChange={(e) => setTagsRaw(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="entry-ref">Canonical ref (optional)</Label>
                <Input
                  id="entry-ref"
                  placeholder="e.g., commit 8b11811, doc URL, page #"
                  value={canonicalRef}
                  onChange={(e) => setCanonicalRef(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={submit} disabled={append.isPending}>
                {append.isPending ? "Appending…" : "Append entry"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Entries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ScrollText className="h-4 w-4" /> Tablet entries
                </CardTitle>
                <CardDescription>
                  {pageData?.total ?? 0} total{pageData?.total ? ` • showing ${PAGE_SIZE}/page` : ""}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search this page…"
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="space-y-2">
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                {search ? "No entries on this page match your search." : "No entries yet. Append your first one above."}
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {filtered.map((e) => (
                  <li key={e.entry_id} className="py-3">
                    <div className="text-sm text-foreground whitespace-pre-wrap">{e.observation}</div>
                    <div className="flex items-center gap-2 flex-wrap mt-2 text-xs text-muted-foreground">
                      <span>{formatTs(e.ts)}</span>
                      <span>· {e.source}</span>
                      {e.shared && <Badge variant="default" className="text-xs">{SHARE_LABEL[e.shared_level]}</Badge>}
                      {e.canonical_ref && <span>· {e.canonical_ref}</span>}
                      {e.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalPageLayout>
  );
}
