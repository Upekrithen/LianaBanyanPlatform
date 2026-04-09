/**
 * Cephas Archive Index — Browse compiled founding documents, journals, treatises, etc.
 * Groups by family_name with collapsible sections and category filter tabs.
 */
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
// Tabs replaced with compact filter pills + search
import {
  ChevronRight,
  FileText,
  BookOpen,
  Scale,
  Sparkles,
  GraduationCap,
  User,
  Wrench,
  Video,
  Library,
} from "lucide-react";

const ARCHIVE_CATEGORIES = [
  // K344 spec categories
  "founding_document", "journal", "economic_treatise", "creative_lore",
  "academic_document", "founder_lore", "technical_document", "video_script",
  // Actual DB categories from push-trunk-to-supabase.mjs
  "sacred-texts", "founders-journal", "founders-lore", "economic-philosophy",
  "hexisle-creative", "masters-academic", "game-development", "ordinary-worlds",
  "exile-ithaca", "family-heritage", "video-scripts",
  // K345 pipeline categories
  "system_design", "reference",
] as const;

type ArchiveCategory = (typeof ARCHIVE_CATEGORIES)[number];

type CompiledDoc = {
  id: string;
  slug: string;
  title: string;
  family_name: string;
  section: string | null;
  category: string | null;
  content_size_bytes: number | null;
  compiled_at: string | null;
  status: string | null;
};

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  founding_document: { label: "Founding Document", icon: FileText, color: "bg-amber-500/10 text-amber-600" },
  journal: { label: "Journal", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
  economic_treatise: { label: "Economic Treatise", icon: Scale, color: "bg-emerald-500/10 text-emerald-600" },
  creative_lore: { label: "Creative Lore", icon: Sparkles, color: "bg-purple-500/10 text-purple-600" },
  academic_document: { label: "Academic Document", icon: GraduationCap, color: "bg-rose-500/10 text-rose-600" },
  founder_lore: { label: "Founder Lore", icon: User, color: "bg-orange-500/10 text-orange-600" },
  technical_document: { label: "Technical Document", icon: Wrench, color: "bg-slate-500/10 text-slate-600" },
  video_script: { label: "Video Script", icon: Video, color: "bg-cyan-500/10 text-cyan-600" },
  // Actual DB categories from trunk ingestion
  "sacred-texts": { label: "Sacred Texts", icon: FileText, color: "bg-amber-500/10 text-amber-600" },
  "founders-journal": { label: "Founder's Journal", icon: BookOpen, color: "bg-blue-500/10 text-blue-600" },
  "founders-lore": { label: "Founder's Lore", icon: User, color: "bg-orange-500/10 text-orange-600" },
  "economic-philosophy": { label: "Economic Philosophy", icon: Scale, color: "bg-emerald-500/10 text-emerald-600" },
  "hexisle-creative": { label: "HexIsle Creative", icon: Sparkles, color: "bg-purple-500/10 text-purple-600" },
  "masters-academic": { label: "Academic", icon: GraduationCap, color: "bg-rose-500/10 text-rose-600" },
  "game-development": { label: "Game Development", icon: Wrench, color: "bg-slate-500/10 text-slate-600" },
  "ordinary-worlds": { label: "Creative Fiction", icon: BookOpen, color: "bg-indigo-500/10 text-indigo-600" },
  "exile-ithaca": { label: "Exile & Ithaca", icon: Sparkles, color: "bg-violet-500/10 text-violet-600" },
  "family-heritage": { label: "Family Heritage", icon: User, color: "bg-pink-500/10 text-pink-600" },
  "video-scripts": { label: "Video Scripts", icon: Video, color: "bg-cyan-500/10 text-cyan-600" },
  "system_design": { label: "System Design", icon: Wrench, color: "bg-slate-500/10 text-slate-600" },
  "reference": { label: "Reference", icon: Library, color: "bg-gray-500/10 text-gray-600" },
};

function estimateWordCount(sizeBytes: number | null): string {
  if (!sizeBytes || sizeBytes <= 0) return "---";
  // Rough estimate: ~5.5 chars per word in English markdown
  const words = Math.round(sizeBytes / 5.5);
  if (words < 1000) return `~${words} words`;
  return `~${(words / 1000).toFixed(1)}k words`;
}

function CategoryBadge({ category }: { category: string | null }) {
  const meta = CATEGORY_META[category ?? ""] ?? { label: category ?? "Unknown", icon: FileText, color: "bg-muted text-muted-foreground" };
  const Icon = meta.icon;
  return (
    <Badge variant="secondary" className={`gap-1 ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </Badge>
  );
}

export default function ArchiveIndex() {
  const [activeCategory, setActiveCategory] = useState<"all" | ArchiveCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["archive-index"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("id, slug, title, family_name, section, category, content_size_bytes, compiled_at, status")
        .in("category", ARCHIVE_CATEGORIES as unknown as string[])
        .order("family_name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as CompiledDoc[];
    },
    staleTime: 60_000,
  });

  const filtered = useMemo(() => {
    let result = documents;
    if (activeCategory !== "all") {
      result = result.filter((d) => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        (d.family_name || "").toLowerCase().includes(q) ||
        (d.section || "").toLowerCase().includes(q)
      );
    }
    return result;
  }, [documents, activeCategory, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, CompiledDoc[]>();
    for (const doc of filtered) {
      const key = doc.family_name || "Uncategorized";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(doc);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // Category counts for filter tabs
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const doc of documents) {
      const cat = doc.category ?? "unknown";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [documents]);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="lg" xrayId="cephas-archive-index">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Library className="w-6 h-6 text-amber-500" />
            Cephas Archive
          </h1>
          <p className="text-muted-foreground mt-1">
            Compiled founding documents, journals, treatises, and lore from the Liana Banyan archive.
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search archive by title, family, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          )}
        </div>

        {/* Category filters — top 6 visible, rest behind "More" */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              activeCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            All ({documents.length})
          </button>
          {(() => {
            const nonEmpty = ARCHIVE_CATEGORIES.filter(cat => (categoryCounts[cat] || 0) > 0);
            const sorted = [...nonEmpty].sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
            const visible = showAllCategories ? sorted : sorted.slice(0, 6);
            return (
              <>
                {visible.map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const count = categoryCounts[cat] || 0;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat as ArchiveCategory)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      }`}
                    >
                      {meta.label} ({count})
                    </button>
                  );
                })}
                {sorted.length > 6 && !showAllCategories && (
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-muted/50 hover:bg-muted text-muted-foreground"
                  >
                    +{sorted.length - 6} more...
                  </button>
                )}
              </>
            );
          })()}
        </div>

        {isLoading ? (
          <div className="text-muted-foreground animate-pulse">Loading archive...</div>
        ) : grouped.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No documents found{activeCategory !== "all" ? ` in category "${CATEGORY_META[activeCategory]?.label}"` : ""}.
          </div>
        ) : (
          <div className="space-y-3">
            {grouped.map(([familyName, docs]) => (
              <Collapsible
                key={familyName}
                open={openGroups.has(familyName)}
                onOpenChange={() => toggleGroup(familyName)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${openGroups.has(familyName) ? "rotate-90" : ""}`}
                          />
                          <CardTitle className="text-base">{familyName}</CardTitle>
                        </div>
                        <Badge variant="outline">{docs.length} document{docs.length !== 1 ? "s" : ""}</Badge>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-3">
                      <div className="divide-y">
                        {docs.map((doc) => (
                          <Link
                            key={doc.id}
                            to={`/cephas/archive/${doc.slug}`}
                            className="flex items-center justify-between py-2.5 px-1 hover:bg-muted/30 rounded-md transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                                {doc.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <CategoryBadge category={doc.category} />
                                {doc.section ? (
                                  <span className="text-xs text-muted-foreground truncate">{doc.section}</span>
                                ) : null}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground whitespace-nowrap ml-3">
                              {estimateWordCount(doc.content_size_bytes)}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        )}
      </div>
    </PortalPageLayout>
  );
}
