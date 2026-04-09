import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { buildTemplateVars, interpolateContent } from "@/lib/cephasTemplateEngine";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  FileText,
  Mail,
  Briefcase,
  Search,
  ArrowLeft,
  ChevronRight,
  GraduationCap,
  Newspaper,
  X,
} from "lucide-react";

type ContentFilter = "all" | "papers" | "articles" | "letters" | "plans";

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  style: string;
  content_markdown: string | null;
  technical_summary: string | null;
  created_at: string;
}

const FILTER_CONFIG: Record<
  ContentFilter,
  { label: string; icon: React.ReactNode; categories: string[] }
> = {
  all: { label: "All", icon: <BookOpen className="w-4 h-4" />, categories: [] },
  papers: {
    label: "Papers",
    icon: <GraduationCap className="w-4 h-4" />,
    categories: ["academic_paper", "academic"],
  },
  articles: {
    label: "Articles",
    icon: <Newspaper className="w-4 h-4" />,
    categories: ["article"],
  },
  letters: {
    label: "Letters",
    icon: <Mail className="w-4 h-4" />,
    categories: ["crown_letter", "outreach_letter", "open_letter"],
  },
  plans: {
    label: "Plans",
    icon: <Briefcase className="w-4 h-4" />,
    categories: ["under_the_hood", "founder"],
  },
};

function getCategoryBadge(category: string) {
  switch (category) {
    case "academic_paper":
    case "academic":
      return { label: "Paper", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case "article":
      return { label: "Article", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case "crown_letter":
      return { label: "Crown Letter", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case "outreach_letter":
    case "open_letter":
      return { label: "Letter", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" };
    case "under_the_hood":
    case "founder":
      return { label: "Founder", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
    default:
      return { label: category, color: "bg-muted text-muted-foreground" };
  }
}

function ContentReader({
  item,
  onBack,
}: {
  item: ContentItem;
  onBack: () => void;
}) {
  const badge = getCategoryBadge(item.category);
  const canonicalStats = useCanonicalStats();
  const templateVars = useMemo(() => buildTemplateVars(canonicalStats), [canonicalStats]);
  const rendered = useMemo(
    () => item.content_markdown ? interpolateContent(item.content_markdown, templateVars) : null,
    [item.content_markdown, templateVars],
  );

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-auto">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold truncate">{item.title}</h2>
            <Badge variant="outline" className={`text-[10px] ${badge.color}`}>
              {badge.label}
            </Badge>
          </div>
          <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <article className="max-w-2xl mx-auto px-5 py-8">
        <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
          {item.title}
        </h1>

        {item.technical_summary && (
          <p className="text-base text-muted-foreground mb-6 leading-relaxed border-l-2 border-primary/30 pl-4">
            {item.technical_summary}
          </p>
        )}

        {rendered ? (
          <div className="prose prose-lg dark:prose-invert max-w-none leading-relaxed text-[17px]">
            <div className="whitespace-pre-wrap">{rendered}</div>
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              Content not yet loaded into the registry.
            </p>
            <p className="text-sm text-muted-foreground/60 mt-1">
              Source: {item.slug}
            </p>
          </div>
        )}
      </article>
    </div>
  );
}

export function HelmContentLibrary() {
  const [filter, setFilter] = useState<ContentFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const { data: content = [], isLoading } = useQuery({
    queryKey: ["helm-content-library"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select(
          "id, slug, title, category, subcategory, style, content_markdown, technical_summary, created_at"
        )
        .in("category", [
          "academic_paper",
          "academic",
          "article",
          "crown_letter",
          "outreach_letter",
          "open_letter",
          "under_the_hood",
          "founder",
        ])
        .order("title");

      if (error) throw error;
      return (data ?? []) as ContentItem[];
    },
    staleTime: 5 * 60_000,
  });

  const filtered = useMemo(() => {
    let items = content;

    if (filter !== "all") {
      const cats = FILTER_CONFIG[filter].categories;
      items = items.filter((item) => cats.includes(item.category));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.technical_summary?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [content, filter, search]);

  const counts = useMemo(() => {
    const c: Record<ContentFilter, number> = {
      all: content.length,
      papers: 0,
      articles: 0,
      letters: 0,
      plans: 0,
    };
    for (const item of content) {
      if (FILTER_CONFIG.papers.categories.includes(item.category)) c.papers++;
      if (FILTER_CONFIG.articles.categories.includes(item.category)) c.articles++;
      if (FILTER_CONFIG.letters.categories.includes(item.category)) c.letters++;
      if (FILTER_CONFIG.plans.categories.includes(item.category)) c.plans++;
    }
    return c;
  }, [content]);

  if (selectedItem) {
    return <ContentReader item={selectedItem} onBack={() => setSelectedItem(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {(Object.keys(FILTER_CONFIG) as ContentFilter[]).map((key) => {
          const cfg = FILTER_CONFIG[key];
          const isActive = filter === key;
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cfg.icon}
              {cfg.label}
              <span className={`text-xs ${isActive ? "opacity-80" : "opacity-60"}`}>
                {counts[key]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">
              {search ? "No content matches your search." : "No content in this category yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const badge = getCategoryBadge(item.category);
            const hasContent = !!item.content_markdown;
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="w-full text-left p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] shrink-0 ${badge.color}`}
                      >
                        {badge.label}
                      </Badge>
                      {!hasContent && (
                        <Badge variant="outline" className="text-[10px] opacity-50">
                          Stub
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.technical_summary && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {item.technical_summary}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
