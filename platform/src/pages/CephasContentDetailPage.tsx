/**
 * Cephas content detail — single document by slug (Session 20). Renders clean academic or pudding style.
 */
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { AcademicHeader, LetterHeader, InnovationCard } from "@/components/cephas";
import ReactMarkdown from "react-markdown";

export default function CephasContentDetailPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();

  const { data: row, isLoading, isError } = useQuery({
    queryKey: ["cephas-detail", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
    retry: false,
  });

  if (!slug) {
    return (
      <div className="container max-w-3xl mx-auto p-6">
        <p className="text-muted-foreground">Missing slug.</p>
      </div>
    );
  }

  if (isLoading) return <div className="container max-w-3xl mx-auto p-6 text-muted-foreground">Loading…</div>;
  if (isError || !row) return <div className="container max-w-3xl mx-auto p-6 text-destructive">Document not found.</div>;

  const isAcademic = row.style === "clean_academic";
  const backHref = category ? `/cephas/${category}` : "/cephas";

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-6" data-xray-id="cephas-content-detail">
      <Link to={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Back to {category || "Cephas"}
      </Link>

      {isAcademic ? (
        <>
          <AcademicHeader
            title={row.title}
            author={row.creation_context ? undefined : "Liana Banyan"}
            date={row.updated_at ? new Date(row.updated_at).toLocaleDateString() : undefined}
            innovationIds={row.innovation_ids || []}
          />
          {row.content_markdown && (
            <div className="cephas-academic-content prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{row.content_markdown}</ReactMarkdown>
            </div>
          )}
        </>
      ) : (
        <>
          {row.category && row.category.includes("letter") && (
            <LetterHeader
              recipientName={row.title}
              role={row.subcategory || undefined}
              initiative={row.system_components?.[0]}
            />
          )}
          {row.technical_summary && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{row.technical_summary}</p>
              </CardContent>
            </Card>
          )}
          {row.content_markdown && (
            <div className="cephas-pudding-content prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown>{row.content_markdown}</ReactMarkdown>
            </div>
          )}
          {(row.innovation_ids?.length > 0 || row.related_patents?.length > 0) && (
            <InnovationCard
              title="Related innovations & patents"
              innovationIds={row.innovation_ids || []}
              patentLink={row.related_patents?.[0] ? `https://patents.google.com/patent/${row.related_patents[0]}` : undefined}
              defaultExpanded
            />
          )}
        </>
      )}

      <div className="flex flex-wrap gap-2 pt-4 border-t">
        {row.implementation_status && <Badge variant="secondary">{row.implementation_status}</Badge>}
        {row.knight_session && <Badge variant="outline">Knight {row.knight_session}</Badge>}
        {row.bishop_session && <Badge variant="outline">Bishop {row.bishop_session}</Badge>}
      </div>
    </div>
  );
}
