/**
 * Cephas full-text search across all content (Session 20)
 */
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";

const CATEGORY_TO_SEGMENT: Record<string, string> = {
  academic_paper: "papers",
  crown_letter: "letters",
  outreach_letter: "letters",
  open_letter: "letters",
  system_design: "systems",
  initiative: "initiatives",
  innovation: "innovations",
  article: "articles",
  vault_archive: "vault",
  reference: "papers",
};

export default function CephasSearchPage() {
  const [query, setQuery] = useState("");
  const [submitted, setSubmitted] = useState("");

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["cephas-search", submitted],
    queryFn: async () => {
      if (!submitted.trim()) return [];
      const term = submitted.trim().replace(/%/g, "").replace(/_/g, "");
      const pattern = `%${term}%`;
      const { data: byTitle, error: e1 } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, style, technical_summary")
        .ilike("title", pattern);
      if (e1) throw e1;
      const { data: bySummary, error: e2 } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, style, technical_summary")
        .ilike("technical_summary", pattern);
      if (e2) throw e2;
      const seen = new Set<string>();
      const merged = [...(byTitle || []), ...(bySummary || [])].filter((r) => {
        if (seen.has(r.id)) return false;
        seen.add(r.id);
        return true;
      });
      return merged.slice(0, 50);
    },
    enabled: submitted.length > 0,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
  };

  return (
    <PortalPageLayout maxWidth="lg" xrayId="cephas-search">
      <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Search className="w-8 h-8 text-primary" />
          Search Cephas
        </h1>
        <p className="text-muted-foreground mt-1">Full-text search across papers, letters, systems, initiatives, and more.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
        <Input
          placeholder='e.g. "Marks", "Coverage Minutes", "BandWagon", "Steward"'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
          Search
        </button>
      </form>

      {submitted && (
        <>
          {isLoading && <div className="text-muted-foreground">Searching…</div>}
          {isError && <div className="text-destructive">Search failed. Ensure migration 000020 is applied.</div>}
          {!isLoading && !isError && Array.isArray(items) && items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">No results for &quot;{submitted}&quot;.</CardContent>
            </Card>
          )}
          {!isLoading && !isError && Array.isArray(items) && items.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{items.length} result(s)</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((row) => {
                  const segment = CATEGORY_TO_SEGMENT[row.category] || "papers";
                  return (
                    <Link key={row.id} to={`/cephas/${segment}/${row.slug}`}>
                      <Card className="h-full hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg line-clamp-2">{row.title}</CardTitle>
                          <Badge variant="secondary" className="mt-2 w-fit">{row.category.replace(/_/g, " ")}</Badge>
                        </CardHeader>
                        {row.technical_summary && (
                          <CardContent className="pt-0">
                            <p className="text-sm text-muted-foreground line-clamp-2">{row.technical_summary}</p>
                          </CardContent>
                        )}
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </PortalPageLayout>
  );
}
