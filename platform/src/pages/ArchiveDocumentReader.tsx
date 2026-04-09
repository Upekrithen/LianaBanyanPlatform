/**
 * Cephas Archive Document Reader — renders a single compiled_document by slug
 * with linked innovations, puddings, and papers.
 */
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText, Lightbulb, BookOpen, GraduationCap } from "lucide-react";

type CompiledDocRow = {
  id: string;
  slug: string;
  title: string;
  family_name: string;
  section: string | null;
  category: string | null;
  compiled_markdown: string | null;
  content_size_bytes: number | null;
  source_count: number | null;
  source_files: unknown;
  unique_variants: number | null;
  compilation_notes: string | null;
  compiled_by: string | null;
  compiled_at: string | null;
  status: string | null;
};

type InnovationRow = {
  innovation_number: number;
  title: string;
  is_crown_jewel: boolean | null;
};

type PuddingRow = {
  pudding_number: number;
  title: string | null;
  slug: string | null;
};

type PaperRow = {
  slug: string;
  title: string;
  category: string | null;
};

function categoryLabel(cat: string | null): string {
  if (!cat) return "Document";
  return cat
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ArchiveDocumentReader() {
  const { slug } = useParams<{ slug: string }>();

  // --- 1. Fetch the compiled document ---
  const { data: doc, isLoading, isError } = useQuery({
    queryKey: ["archive-doc", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data as CompiledDocRow;
    },
    enabled: !!slug,
    retry: false,
  });

  // --- 2. Innovations sourced from this document ---
  // Search content_source_links where source_path contains the slug
  const { data: linkedInnovationIds = [] } = useQuery({
    queryKey: ["archive-source-innovation-ids", slug],
    queryFn: async () => {
      if (!slug) return [];
      const { data, error } = await supabase
        .from("content_source_links" as never)
        .select("target_id")
        .eq("target_type", "innovation")
        .like("source_path", `%${slug}%`);
      if (error) throw error;
      const ids = (data ?? [])
        .map((row: any) => Number(row.target_id))
        .filter((n: number) => Number.isFinite(n));
      return Array.from(new Set(ids)).sort((a, b) => a - b);
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  const { data: linkedInnovations = [] } = useQuery({
    queryKey: ["archive-innovations", linkedInnovationIds.join(",")],
    queryFn: async () => {
      if (linkedInnovationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("innovation_log" as never)
        .select("innovation_number, title, is_crown_jewel")
        .in("innovation_number", linkedInnovationIds)
        .order("innovation_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as InnovationRow[];
    },
    enabled: linkedInnovationIds.length > 0,
    staleTime: 60_000,
  });

  // --- 3. Related Puddings via innovations_referenced ---
  const { data: relatedPuddings = [] } = useQuery({
    queryKey: ["archive-puddings", linkedInnovationIds.join(",")],
    queryFn: async () => {
      if (linkedInnovationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("cephas_puddings" as never)
        .select("pudding_number, title, slug")
        .overlaps("innovations_referenced", linkedInnovationIds)
        .order("pudding_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as PuddingRow[];
    },
    enabled: linkedInnovationIds.length > 0,
    staleTime: 60_000,
  });

  // --- 4. Related Papers ---
  const { data: relatedPapers = [] } = useQuery({
    queryKey: ["archive-papers", slug],
    queryFn: async () => {
      if (!doc?.family_name) return [];
      // Find papers in the same family or linked by source
      const { data, error } = await supabase
        .from("cephas_content_registry" as never)
        .select("slug, title, category")
        .eq("category", "academic_paper")
        .order("title", { ascending: true })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as PaperRow[];
    },
    enabled: !!doc?.family_name,
    staleTime: 60_000,
  });

  if (!slug) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-archive-reader">
        <p className="text-muted-foreground">Missing document slug.</p>
      </PortalPageLayout>
    );
  }

  if (isLoading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-archive-reader">
        <div className="text-muted-foreground animate-pulse">Loading document...</div>
      </PortalPageLayout>
    );
  }

  if (isError || !doc) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-archive-reader">
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl"><FileText className="w-10 h-10 mx-auto text-muted-foreground" /></div>
          <h2 className="text-xl font-bold">Document Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This archive document could not be found. It may still be in preparation.
          </p>
          <Link to="/cephas/archive" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Archive
          </Link>
        </div>
      </PortalPageLayout>
    );
  }

  return (
    <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-archive-reader">
      <div className="space-y-6">
        {/* Back link */}
        <Link to="/cephas/archive" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>

        {/* Metadata header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{doc.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{categoryLabel(doc.category)}</Badge>
            <Badge variant="outline">{doc.family_name}</Badge>
            {doc.section ? <Badge variant="outline">{doc.section}</Badge> : null}
            {doc.status && doc.status !== "draft" ? <Badge>{doc.status}</Badge> : null}
          </div>
          {doc.compiled_at ? (
            <p className="text-xs text-muted-foreground">
              Compiled {new Date(doc.compiled_at).toLocaleDateString()}
              {doc.compiled_by ? ` by ${doc.compiled_by}` : ""}
              {doc.source_count ? ` from ${doc.source_count} source${doc.source_count !== 1 ? "s" : ""}` : ""}
            </p>
          ) : null}
        </div>

        {/* Document content */}
        {doc.compiled_markdown ? (
          <article className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {doc.compiled_markdown}
            </ReactMarkdown>
          </article>
        ) : (
          <div className="text-muted-foreground italic py-6">
            Content is being prepared and will be available soon.
          </div>
        )}

        {/* Innovations Sourced from This Document */}
        {linkedInnovations.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Innovations Sourced from This Document ({linkedInnovations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {linkedInnovations.map((item) => (
                  <Link
                    key={item.innovation_number}
                    to={`/cephas/innovations?search=%23${item.innovation_number}`}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted transition-colors"
                  >
                    #{item.innovation_number} {item.title}
                    {item.is_crown_jewel ? (
                      <Badge className="bg-amber-500 text-black text-[10px] px-1 py-0 ml-1">CJ</Badge>
                    ) : null}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Related Puddings */}
        {relatedPuddings.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                Related Puddings ({relatedPuddings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {relatedPuddings.map((p) =>
                  p.slug ? (
                    <Link key={p.pudding_number} to={`/cephas/pudding/${p.slug}`}>
                      <Badge variant="secondary">#{p.pudding_number} {p.title ?? "Untitled"}</Badge>
                    </Link>
                  ) : (
                    <Badge key={p.pudding_number} variant="secondary">
                      #{p.pudding_number} {p.title ?? "Untitled"}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Related Papers */}
        {relatedPapers.length > 0 ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-rose-500" />
                Related Papers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {relatedPapers.map((paper) => (
                  <Link key={paper.slug} to={`/cephas/academic_paper/${paper.slug}`}>
                    <Badge variant="outline">{paper.title}</Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Compilation notes */}
        {doc.compilation_notes ? (
          <div className="rounded-md border bg-muted/20 p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Compilation Notes</p>
            <p className="text-sm">{doc.compilation_notes}</p>
          </div>
        ) : null}
      </div>
    </PortalPageLayout>
  );
}
