import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

type SourceLinkRow = {
  source_type: string;
  source_path: string;
  source_section: string | null;
  link_type: string | null;
  confidence: string | null;
};

type PuddingMeta = {
  pudding_number: number;
  title: string | null;
  slug: string | null;
};

type PaperMeta = {
  slug: string;
  title: string;
};

type SourceDocument = {
  path: string;
  section?: string;
  type?: string;
};

interface InnovationSourceLinksProps {
  innovationNumber: number;
  enabled?: boolean;
}

function sourceLabel(path: string) {
  if (path.startsWith("cephas_puddings:")) return "Pudding";
  if (path.startsWith("cephas_content_registry:")) return "Paper";
  const bits = path.split("/");
  return bits[bits.length - 1] || path;
}

/** Convert a source file path to an archive slug (kebab-case of filename without extension). */
function pathToArchiveSlug(path: string): string | null {
  if (path.startsWith("cephas_puddings:") || path.startsWith("cephas_content_registry:")) return null;
  const bits = path.split("/");
  const filename = bits[bits.length - 1] || "";
  // Remove file extension
  const base = filename.replace(/\.[^.]+$/, "");
  if (!base) return null;
  // Convert to kebab-case
  return base
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function InnovationSourceLinks({ innovationNumber, enabled = true }: InnovationSourceLinksProps) {
  const innovationId = String(innovationNumber);

  const { data: links = [] } = useQuery({
    queryKey: ["innovation-source-links", innovationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_source_links" as never)
        .select("source_type, source_path, source_section, link_type, confidence")
        .eq("target_type", "innovation")
        .eq("target_id", innovationId)
        .order("source_path", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SourceLinkRow[];
    },
    enabled,
    staleTime: 60_000,
  });

  const { data: innovationMeta } = useQuery({
    queryKey: ["innovation-source-meta", innovationNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("innovation_log" as never)
        .select("is_crown_jewel, source_documents")
        .eq("innovation_number", innovationNumber)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as { is_crown_jewel?: boolean | null; source_documents?: SourceDocument[] | null } | null;
    },
    enabled,
    staleTime: 60_000,
  });

  const { data: puddingsByArray = [] } = useQuery({
    queryKey: ["innovation-puddings-by-array", innovationNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_puddings" as never)
        .select("pudding_number, title, slug")
        .contains("innovations_referenced", [innovationNumber])
        .order("pudding_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PuddingMeta[];
    },
    enabled,
    staleTime: 60_000,
  });

  const puddingNumbersFromLinks = useMemo(() => {
    const out = new Set<number>();
    for (const row of links) {
      if (!row.source_path.startsWith("cephas_puddings:")) continue;
      const raw = row.source_path.split(":")[1];
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) out.add(parsed);
    }
    return Array.from(out).sort((a, b) => a - b);
  }, [links]);

  const paperSlugsFromLinks = useMemo(() => {
    const out = new Set<string>();
    for (const row of links) {
      if (!row.source_path.startsWith("cephas_content_registry:")) continue;
      const slug = row.source_path.split(":")[1];
      if (slug) out.add(slug);
    }
    return Array.from(out).sort();
  }, [links]);

  const { data: puddingsFromLinks = [] } = useQuery({
    queryKey: ["innovation-puddings-from-links", innovationNumber, puddingNumbersFromLinks.join(",")],
    queryFn: async () => {
      if (puddingNumbersFromLinks.length === 0) return [];
      const { data, error } = await supabase
        .from("cephas_puddings" as never)
        .select("pudding_number, title, slug")
        .in("pudding_number", puddingNumbersFromLinks)
        .order("pudding_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PuddingMeta[];
    },
    enabled: enabled && puddingNumbersFromLinks.length > 0,
    staleTime: 60_000,
  });

  const { data: papers = [] } = useQuery({
    queryKey: ["innovation-papers-from-links", innovationNumber, paperSlugsFromLinks.join(",")],
    queryFn: async () => {
      if (paperSlugsFromLinks.length === 0) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry" as never)
        .select("slug, title")
        .in("slug", paperSlugsFromLinks)
        .order("title", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PaperMeta[];
    },
    enabled: enabled && paperSlugsFromLinks.length > 0,
    staleTime: 60_000,
  });

  const sourceDocs = useMemo(() => {
    const docs: SourceDocument[] = [];
    const seen = new Set<string>();

    for (const row of links) {
      if (row.source_path.startsWith("cephas_puddings:") || row.source_path.startsWith("cephas_content_registry:")) {
        continue;
      }
      const key = `${row.source_path}::${row.source_section ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      docs.push({
        path: row.source_path,
        section: row.source_section ?? undefined,
        type: row.source_type,
      });
    }

    for (const doc of innovationMeta?.source_documents ?? []) {
      const key = `${doc.path}::${doc.section ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      docs.push(doc);
    }

    return docs;
  }, [innovationMeta?.source_documents, links]);

  const puddings = useMemo(() => {
    const map = new Map<number, PuddingMeta>();
    for (const p of puddingsByArray) map.set(p.pudding_number, p);
    for (const p of puddingsFromLinks) map.set(p.pudding_number, p);
    return Array.from(map.values()).sort((a, b) => a.pudding_number - b.pudding_number);
  }, [puddingsByArray, puddingsFromLinks]);

  if (!enabled) return null;
  if (!innovationMeta && sourceDocs.length === 0 && puddings.length === 0 && papers.length === 0) return null;

  return (
    <div className="rounded-md border bg-muted/20 p-3 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Source Links</p>
        {innovationMeta?.is_crown_jewel ? <Badge className="bg-amber-500 text-black">Crown Jewel</Badge> : null}
      </div>

      {sourceDocs.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Source Documents</p>
          <div className="space-y-1.5">
            {sourceDocs.map((doc) => {
              const archiveSlug = pathToArchiveSlug(doc.path);
              return (
                <div key={`${doc.path}::${doc.section ?? ""}`} className="text-sm">
                  {archiveSlug ? (
                    <Link to={`/cephas/archive/${archiveSlug}`} className="font-medium break-all text-primary hover:underline">
                      {sourceLabel(doc.path)}
                    </Link>
                  ) : (
                    <div className="font-medium break-all">{sourceLabel(doc.path)}</div>
                  )}
                  <div className="text-xs text-muted-foreground break-all">{doc.path}</div>
                  {doc.section ? <div className="text-xs text-muted-foreground">Section: {doc.section}</div> : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {puddings.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Related Puddings</p>
          <div className="flex flex-wrap gap-2">
            {puddings.map((p) =>
              p.slug ? (
                <Link key={p.pudding_number} to={`/cephas/pudding/${p.slug}`}>
                  <Badge variant="secondary">#{p.pudding_number} {p.title ?? "Untitled"}</Badge>
                </Link>
              ) : (
                <Badge key={p.pudding_number} variant="secondary">#{p.pudding_number} {p.title ?? "Untitled"}</Badge>
              )
            )}
          </div>
        </div>
      ) : null}

      {papers.length > 0 ? (
        <div>
          <p className="text-xs text-muted-foreground mb-1">Related Papers</p>
          <div className="flex flex-wrap gap-2">
            {papers.map((paper) => (
              <Link key={paper.slug} to={`/cephas/pudding/${paper.slug}`}>
                <Badge variant="outline">{paper.title}</Badge>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
