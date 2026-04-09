/**
 * Cephas Gateway — Links to Cephas docs, Under the Hood, Fly on the Wall, category listings, search (Session 19/20)
 */

import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Wrench, Eye, ExternalLink, FileText, Search, Megaphone, Lightbulb, Compass } from "lucide-react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Badge } from "@/components/ui/badge";

const CEPHAS_BASE = "/cephas";

const CATEGORIES: { path: string; label: string }[] = [
  { path: "papers", label: "Academic Papers" },
  { path: "letters", label: "Crown & Outreach Letters" },
  { path: "systems", label: "System Design" },
  { path: "initiatives", label: "Initiatives" },
  { path: "innovations", label: "Innovation Registry" },
  { path: "articles", label: "Articles & Thought Leadership" },
  { path: "vault", label: "Vault Archives" },
  { path: "pitches", label: "Publication Pitches" },
  { path: "founder-proof", label: "The Founder" },
  { path: "business-plan", label: "Business Plan" },
];

function formatContentType(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function routeSegmentForCategory(category: string): string {
  const map: Record<string, string> = {
    academic_paper: "papers",
    crown_letter: "letters",
    outreach_letter: "letters",
    open_letter: "letters",
    article: "articles",
    initiative: "initiatives",
    innovation: "innovations",
    system_design: "systems",
    vault_archive: "vault",
    founder: "founder-proof",
    pitch: "pitches",
    "business-plan": "business-plan",
  };
  return map[category] || "articles";
}

export default function CephasGatewayPage() {
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const prioritizeAcademic =
    /letter|crown/i.test(searchParams.get("from") || "") ||
    /letter|crown/i.test(searchParams.get("source") || "") ||
    /letter|crown/i.test(searchParams.get("ref") || "");

  const { data: recentContent } = useQuery({
    queryKey: ["cephas-gateway-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data || [];
    },
    retry: false,
  });

  const curatedContent = useMemo(() => {
    const rows = [...(recentContent || [])];
    if (!prioritizeAcademic) return rows;
    return rows.sort((a: any, b: any) => {
      const aType = String(a.content_type || a.category || a.style || "").toLowerCase();
      const bType = String(b.content_type || b.category || b.style || "").toLowerCase();
      const aAcademic = aType.includes("paper") || aType.includes("academic") || a.style === "clean_academic";
      const bAcademic = bType.includes("paper") || bType.includes("academic") || b.style === "clean_academic";
      if (aAcademic === bAcademic) return String(a.title || "").localeCompare(String(b.title || ""));
      return aAcademic ? -1 : 1;
    });
  }, [recentContent, prioritizeAcademic]);

  return (
    <PortalPageLayout maxWidth="md" xrayId="cephas-gateway-page">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Cephas</h1>
        <p className="text-muted-foreground mt-2">
          Searchable document library — papers, letters, system design, initiatives. Clean prose for academic; pudding styles for the rest.
        </p>
      </div>

      {/* Guided Tour CTA */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            <div>
              <h3 className="font-semibold">Take the Guided Tour</h3>
              <p className="text-sm text-muted-foreground">
                Learn the entire platform at your own pace — topics, categories, or the full walkthrough.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0">
            <Link to="/tour" className="inline-flex items-center gap-2">
              <Compass className="w-4 h-4" /> Start Tour
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/search" className="inline-flex items-center gap-1">
            <Search className="w-4 h-4" /> Search
          </Link>
        </Button>
        {CATEGORIES.map((c) => (
          <Button key={c.path} asChild variant="outline" size="sm">
            <Link to={`/cephas/${c.path}`}>{c.label}</Link>
          </Button>
        ))}
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/innovation-pedestals" className="inline-flex items-center gap-1">
            <Lightbulb className="w-4 h-4" /> Innovation Pedestals
          </Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link to="/cephas/press-junket" className="inline-flex items-center gap-1">
            <Megaphone className="w-4 h-4" /> Press Junket
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Under the Hood
            </CardTitle>
            <CardDescription>Technical transparency — how things work.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cephas/under-the-hood">View index</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Fly on the Wall
            </CardTitle>
            <CardDescription>Public observation log — how decisions were made.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/cephas/fly-on-the-wall">View log</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fresh from Cephas</CardTitle>
          <CardDescription>
            {prioritizeAcademic
              ? "Academic papers prioritized for letter-driven visits."
              : "Recent publications across papers, articles, and pudding entries."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {curatedContent.map((item: any) => {
            const contentType = String(item.content_type || item.category || item.style || "article");
            const routeCategory = routeSegmentForCategory(String(item.category || ""));
            return (
              <Link
                key={item.id}
                to={`/cephas/${routeCategory}/${item.slug}`}
                className="flex items-start justify-between gap-3 rounded-md border p-3 transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-medium leading-snug">{item.title}</p>
                  {item.technical_summary ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.technical_summary}</p>
                  ) : null}
                </div>
                <Badge variant="outline" className="shrink-0">
                  {formatContentType(contentType)}
                </Badge>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Full Cephas site
          </CardTitle>
          <CardDescription>Academic papers (clean prose), crown letters, initiatives, and more at /cephas.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full sm:w-auto">
            <a href={CEPHAS_BASE} className="inline-flex items-center gap-2">
              Open Cephas
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>Platform papers directory (local):</p>
        <Button asChild variant="link" className="p-0 h-auto text-primary">
          <Link to="/papers" className="inline-flex items-center gap-1">
            <FileText className="w-4 h-4" />
            Academic Papers Directory
          </Link>
        </Button>
      </div>
    </PortalPageLayout>
  );
}
