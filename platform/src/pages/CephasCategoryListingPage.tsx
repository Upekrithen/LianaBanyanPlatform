/**
 * Cephas category listing — papers, letters, systems, initiatives, innovations, articles, vault (Session 20)
 */
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Mail, Wrench, Lightbulb, BookOpen, FolderArchive, Newspaper } from "lucide-react";
import { useState } from "react";

const CATEGORY_META: Record<string, { title: string; icon: React.ElementType; registryCategories: string[] }> = {
  papers: { title: "Academic Papers", icon: FileText, registryCategories: ["academic_paper"] },
  letters: { title: "Crown & Outreach Letters", icon: Mail, registryCategories: ["crown_letter", "outreach_letter", "open_letter"] },
  systems: { title: "System Design", icon: Wrench, registryCategories: ["system_design"] },
  initiatives: { title: "Initiatives", icon: Lightbulb, registryCategories: ["initiative"] },
  innovations: { title: "Innovation Registry", icon: BookOpen, registryCategories: ["innovation"] },
  articles: { title: "Articles & Thought Leadership", icon: Newspaper, registryCategories: ["article"] },
  vault: { title: "Vault Archives", icon: FolderArchive, registryCategories: ["vault_archive"] },
};

export default function CephasCategoryListingPage() {
  const { category } = useParams<{ category: string }>();
  const [search, setSearch] = useState("");
  const meta = category ? CATEGORY_META[category] : null;

  const { data: items, isLoading, isError } = useQuery({
    queryKey: ["cephas-category", category],
    queryFn: async () => {
      if (!category || !meta) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, style, technical_summary, implementation_status")
        .in("category", meta.registryCategories)
        .order("title");
      if (error) throw error;
      return data || [];
    },
    enabled: !!category && !!meta,
    retry: false,
  });

  const filtered = (items || []).filter(
    (i) =>
      !search ||
      (i.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (i.technical_summary || "").toLowerCase().includes(search.toLowerCase())
  );

  if (!category || !meta) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <p className="text-muted-foreground">Unknown category. Use: papers, letters, systems, initiatives, innovations, articles, vault.</p>
      </div>
    );
  }

  const Icon = meta.icon;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6" data-xray-id={`cephas-category-${category}`}>
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Icon className="w-8 h-8 text-primary" />
          {meta.title}
        </h1>
        <p className="text-muted-foreground mt-1">
          {category === "papers" && "Clean academic prose. Version toggle for Academic / TLDR / 6th Grade where available."}
          {category === "letters" && "Crown letters and outreach. Pudding-style interactive layout."}
          {category === "systems" && "System design and technical specs. Pudding styling."}
          {category === "initiatives" && "Sweet Sixteen initiative content. Links to platform initiative pages."}
          {category === "innovations" && "Searchable innovation registry with patent links."}
          {category === "articles" && "Articles and thought leadership. Pudding styling."}
          {category === "vault" && "Vault and archive documents."}
        </p>
      </div>

      <Input
        placeholder="Filter by title or summary..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      {isLoading && <div className="text-muted-foreground">Loading…</div>}
      {isError && <div className="text-destructive">Could not load registry. Run migration 000020 and ingestion script.</div>}
      {!isLoading && !isError && filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">No documents in this category yet.</CardContent>
        </Card>
      )}
      {!isLoading && !isError && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((row) => (
            <Link key={row.id} to={`/cephas/${category}/${row.slug}`}>
              <Card className="h-full hover:bg-muted/50 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{row.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{row.style === "clean_academic" ? "Academic" : "Pudding"}</Badge>
                    {row.implementation_status && <Badge variant="outline">{row.implementation_status}</Badge>}
                  </div>
                </CardHeader>
                {row.technical_summary && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2">{row.technical_summary}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
