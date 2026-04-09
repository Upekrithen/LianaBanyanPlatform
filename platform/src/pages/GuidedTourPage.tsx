/**
 * GuidedTourPage — Three-mode content consumption engine
 * ======================================================
 * Mode 1: Topic Focus — curated sequential chains
 * Mode 2: Category Browse — all items in a category
 * Mode 3: Guided Tour — auto-advance through everything
 *
 * Detail levels: Skipping Stones / Wading In / Deep Dive
 * Return Beacons: save position and resume later
 *
 * K194 / Bishop B051 / Innovations #2115-#2116
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { buildTemplateVars, interpolateContent } from "@/lib/cephasTemplateEngine";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Compass, BookOpen, Layers, Map, Anchor, Waves, CircleDot,
  ChevronLeft, ChevronRight, SkipForward, Bookmark, LogOut,
  Clock, Eye, FileText, Heart, GraduationCap, Crown, Mail,
  Globe, Lightbulb, Hexagon, Archive, Building, Ticket,
  Star, PartyPopper, CheckCircle2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTourPackages, useTourPackageProgress, type TourPackage } from "@/hooks/useTourPackages";

// ── Types ────────────────────────────────────────────────────────────
type TourMode = "topic" | "category" | "guided_tour";
type DetailLevel = "skipping_stones" | "wading_in" | "deep_dive";
type ViewState = "landing" | "playing";

interface TourTopic {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  category: string;
  item_slugs: string[];
  estimated_minutes: number | null;
  icon: string;
  is_featured: boolean;
  sort_order: number;
}

interface TourCategory {
  id: string;
  category: string;
  display_name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  item_count: number;
}

interface ContentItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  content_markdown: string | null;
  technical_summary: string | null;
  subcategory: string | null;
}

interface ReturnBeacon {
  id: string;
  item_slug: string;
  item_title: string;
  category: string;
  detail_level: string;
  note: string | null;
  created_at: string;
}

// ── Icon map ─────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ElementType> = {
  FileText, Building, Heart, GraduationCap, Crown, Mail,
  Globe, Lightbulb, Hexagon, Archive, BookOpen, Compass,
  Map, Layers,
};

function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || BookOpen;
  return <Icon className={className} />;
}

// ── Detail Level Config ──────────────────────────────────────────────
const DETAIL_LEVELS: { key: DetailLevel; label: string; icon: React.ElementType; desc: string }[] = [
  { key: "skipping_stones", label: "Skipping Stones", icon: CircleDot, desc: "Key points only (~40 sec)" },
  { key: "wading_in", label: "Wading In", icon: Waves ?? BookOpen, desc: "Full context (~2 min)" },
  { key: "deep_dive", label: "Deep Dive", icon: Anchor ?? Layers, desc: "Everything + actions (~8 min)" },
];

// ── Content renderer by detail level ─────────────────────────────────
function sanitizeTourContent(text: string): string {
  // Strip HTML comments (<!-- ... -->)
  let cleaned = text.replace(/<!--[\s\S]*?-->/g, '');
  // Strip fenced code blocks (``` ... ```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  // Strip inline code that looks like deploy paths or file refs
  cleaned = cleaned.replace(/`[^`]*(?:deploy|\.md|\.tsx?|\.jsx?|\/src\/|cephas-hugo)[^`]*`/gi, '');
  // Collapse multiple blank lines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  return cleaned.trim();
}

function renderContentAtLevel(
  item: ContentItem,
  level: DetailLevel,
  templateVars: Record<string, string>
): string {
  const raw = item.content_markdown || item.technical_summary || "*No content available.*";
  const content = sanitizeTourContent(interpolateContent(raw, templateVars));

  if (level === "skipping_stones") {
    // First 2 paragraphs only
    const paragraphs = content.split(/\n\n+/).filter(Boolean);
    return paragraphs.slice(0, 2).join("\n\n");
  }
  if (level === "wading_in") {
    // First 8 paragraphs
    const paragraphs = content.split(/\n\n+/).filter(Boolean);
    return paragraphs.slice(0, 8).join("\n\n");
  }
  // deep_dive — full content
  return content;
}

// ── Main Component ───────────────────────────────────────────────────
export default function GuidedTourPage() {
  const stats = useCanonicalStats();
  const templateVars = useMemo(() => buildTemplateVars(stats), [stats]);
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageSlug = searchParams.get("package");

  // ── Package Mode hooks ────────────────────────────────────────────
  const { data: allPackages = [] } = useTourPackages();
  const { progress: pkgProgress, startPackage, advanceStop, completePackage } = useTourPackageProgress();

  const activePackage = useMemo<TourPackage | null>(
    () => (packageSlug ? allPackages.find((p) => p.slug === packageSlug) ?? null : null),
    [packageSlug, allPackages]
  );

  const activeProgress = packageSlug ? pkgProgress[packageSlug] : undefined;
  const [pkgStopIndex, setPkgStopIndex] = useState(0);
  const [pkgCompleted, setPkgCompleted] = useState(false);

  useEffect(() => {
    if (activeProgress?.current_stop_index) {
      setPkgStopIndex(Math.min(activeProgress.current_stop_index, (activePackage?.stop_slugs.length ?? 1) - 1));
    }
  }, [activeProgress?.current_stop_index, activePackage?.stop_slugs.length]);

  useEffect(() => {
    if (packageSlug && activePackage && !activeProgress) {
      startPackage.mutate(packageSlug);
    }
  }, [packageSlug, activePackage, activeProgress]);

  const { data: pkgItems = [] } = useQuery<ContentItem[]>({
    queryKey: ["tour-package-items", packageSlug],
    queryFn: async () => {
      if (!activePackage) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, content_markdown, technical_summary, subcategory")
        .in("slug", activePackage.stop_slugs);
      if (error) throw error;
      const slugOrder = new Map(activePackage.stop_slugs.map((s, i) => [s, i]));
      return (data || []).sort((a, b) => (slugOrder.get(a.slug) ?? 99) - (slugOrder.get(b.slug) ?? 99));
    },
    enabled: !!activePackage && activePackage.stop_slugs.length > 0,
  });

  const pkgCurrentItem = pkgItems[pkgStopIndex] || null;
  const pkgTotalStops = activePackage?.stop_slugs.length ?? 0;

  const pkgGoNext = useCallback(() => {
    if (!activePackage || !pkgCurrentItem) return;
    advanceStop.mutate({
      packageSlug: activePackage.slug,
      stopSlug: pkgCurrentItem.slug,
      stopIndex: pkgStopIndex,
    });
    if (pkgStopIndex < pkgTotalStops - 1) {
      setPkgStopIndex((i) => i + 1);
    } else {
      completePackage.mutate({
        packageSlug: activePackage.slug,
        marksReward: activePackage.marks_reward,
      });
      setPkgCompleted(true);
    }
  }, [activePackage, pkgCurrentItem, pkgStopIndex, pkgTotalStops, advanceStop, completePackage]);

  const pkgGoPrev = useCallback(() => {
    if (pkgStopIndex > 0) setPkgStopIndex((i) => i - 1);
  }, [pkgStopIndex]);

  // ── State ──────────────────────────────────────────────────────────
  const [mode, setMode] = useState<TourMode>("guided_tour");
  const [viewState, setViewState] = useState<ViewState>("landing");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>(() => {
    const saved = localStorage.getItem("tour_detail_level");
    return (saved as DetailLevel) || "wading_in";
  });
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showBeacons, setShowBeacons] = useState(false);
  const [itemsViewed, setItemsViewed] = useState(0);

  // Persist detail level
  useEffect(() => {
    localStorage.setItem("tour_detail_level", detailLevel);
  }, [detailLevel]);

  // ── Queries ────────────────────────────────────────────────────────
  const { data: topics = [] } = useQuery<TourTopic[]>({
    queryKey: ["tour-topics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_topics")
        .select("*")
        .eq("is_featured", true)
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: categories = [] } = useQuery<TourCategory[]>({
    queryKey: ["tour-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_category_order")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: beacons = [], refetch: refetchBeacons } = useQuery<ReturnBeacon[]>({
    queryKey: ["tour-beacons"],
    queryFn: async () => {
      // Try DB first, fall back to localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("tour_return_beacons")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
      // Anonymous: localStorage
      const stored = localStorage.getItem("tour_beacons");
      return stored ? JSON.parse(stored) : [];
    },
  });

  // ── Content loading based on mode ──────────────────────────────────

  // For Topic mode: load items by slug array
  const selectedTopic = topics.find((t) => t.slug === selectedTopicSlug);
  const topicSlugs = selectedTopic?.item_slugs || [];

  const { data: topicItems = [] } = useQuery<ContentItem[]>({
    queryKey: ["tour-topic-items", selectedTopicSlug],
    queryFn: async () => {
      if (!topicSlugs.length) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, content_markdown, technical_summary, subcategory")
        .in("slug", topicSlugs);
      if (error) throw error;
      // Sort by the order in item_slugs
      const slugOrder = new Map(topicSlugs.map((s, i) => [s, i]));
      return (data || []).sort((a, b) => (slugOrder.get(a.slug) ?? 99) - (slugOrder.get(b.slug) ?? 99));
    },
    enabled: mode === "topic" && topicSlugs.length > 0,
  });

  // For Category mode: load items by category
  const { data: categoryItems = [] } = useQuery<ContentItem[]>({
    queryKey: ["tour-category-items", selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, content_markdown, technical_summary, subcategory")
        .eq("category", selectedCategory)
        .order("title");
      if (error) throw error;
      return data || [];
    },
    enabled: mode === "category" && !!selectedCategory,
  });

  // For Guided Tour mode: load items for current category
  const guidedCategory = categories[currentCategoryIndex];
  const { data: guidedItems = [] } = useQuery<ContentItem[]>({
    queryKey: ["tour-guided-items", guidedCategory?.category],
    queryFn: async () => {
      if (!guidedCategory) return [];
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id, slug, title, category, content_markdown, technical_summary, subcategory")
        .eq("category", guidedCategory.category)
        .order("title");
      if (error) throw error;
      return data || [];
    },
    enabled: mode === "guided_tour" && !!guidedCategory,
  });

  // ── Current items array based on mode ──────────────────────────────
  const currentItems: ContentItem[] =
    mode === "topic" ? topicItems :
    mode === "category" ? categoryItems :
    guidedItems;

  const currentItem = currentItems[currentItemIndex] || null;

  // ── Navigation ─────────────────────────────────────────────────────
  const canGoPrev = currentItemIndex > 0;
  const canGoNext = currentItemIndex < currentItems.length - 1;
  const canSkipCategory = mode === "guided_tour" && currentCategoryIndex < categories.length - 1;

  const goNext = useCallback(() => {
    if (canGoNext) {
      setCurrentItemIndex((i) => i + 1);
      setItemsViewed((v) => v + 1);
    } else if (canSkipCategory) {
      // Auto-advance to next category
      setCurrentCategoryIndex((i) => i + 1);
      setCurrentItemIndex(0);
      setItemsViewed((v) => v + 1);
    }
  }, [canGoNext, canSkipCategory]);

  const goPrev = useCallback(() => {
    if (canGoPrev) setCurrentItemIndex((i) => i - 1);
  }, [canGoPrev]);

  const skipToNextCategory = useCallback(() => {
    if (canSkipCategory) {
      setCurrentCategoryIndex((i) => i + 1);
      setCurrentItemIndex(0);
    }
  }, [canSkipCategory]);

  const exitTour = useCallback(() => {
    setViewState("landing");
    setCurrentItemIndex(0);
    setCurrentCategoryIndex(0);
    setSelectedTopicSlug(null);
    setSelectedCategory(null);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    if (viewState !== "playing") return;
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) return;
      if (e.key === "ArrowRight" || e.key === "j") goNext();
      if (e.key === "ArrowLeft" || e.key === "k") goPrev();
      if (e.key === "s") skipToNextCategory();
      if (e.key === "Escape") exitTour();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [viewState, goNext, goPrev, skipToNextCategory, exitTour]);

  // ── Beacon saving ──────────────────────────────────────────────────
  const placeBeacon = async () => {
    if (!currentItem) return;
    const beacon = {
      id: crypto.randomUUID(),
      item_slug: currentItem.slug,
      item_title: currentItem.title,
      category: currentItem.category,
      detail_level: detailLevel,
      note: null,
      created_at: new Date().toISOString(),
    };

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("tour_return_beacons").insert({
        user_id: user.id,
        item_slug: beacon.item_slug,
        item_title: beacon.item_title,
        category: beacon.category,
        detail_level: beacon.detail_level,
      });
    } else {
      const existing = JSON.parse(localStorage.getItem("tour_beacons") || "[]");
      existing.unshift(beacon);
      localStorage.setItem("tour_beacons", JSON.stringify(existing.slice(0, 50)));
    }
    refetchBeacons();
  };

  // ── Progress calculation ───────────────────────────────────────────
  const totalItemsInTour = categories.reduce((sum, c) => sum + c.item_count, 0);
  const overallProgress = totalItemsInTour > 0
    ? Math.round((itemsViewed / totalItemsInTour) * 100)
    : 0;

  // ── Start functions ────────────────────────────────────────────────
  const startTopic = (slug: string) => {
    setMode("topic");
    setSelectedTopicSlug(slug);
    setCurrentItemIndex(0);
    setViewState("playing");
  };

  const startCategory = (cat: string) => {
    setMode("category");
    setSelectedCategory(cat);
    setCurrentItemIndex(0);
    setViewState("playing");
  };

  const startGuidedTour = () => {
    setMode("guided_tour");
    setCurrentCategoryIndex(0);
    setCurrentItemIndex(0);
    setViewState("playing");
  };

  const jumpToBeacon = (beacon: ReturnBeacon) => {
    // Find the category and item
    const catIdx = categories.findIndex((c) => c.category === beacon.category);
    if (catIdx >= 0) {
      setMode("guided_tour");
      setCurrentCategoryIndex(catIdx);
      setCurrentItemIndex(0); // Will need to find item after load
      setDetailLevel(beacon.detail_level as DetailLevel);
      setViewState("playing");
    }
    setShowBeacons(false);
  };

  // ══════════════════════════════════════════════════════════════════
  // RENDER — Package Mode
  // ══════════════════════════════════════════════════════════════════
  if (activePackage) {
    const pkgPct = pkgTotalStops > 0 ? Math.round(((activeProgress?.completed_stops?.length ?? 0) / pkgTotalStops) * 100) : 0;

    if (pkgCompleted || activeProgress?.completed_at) {
      return (
        <PortalPageLayout maxWidth="lg" xrayId="tour-package-complete">
          <Card className="border-emerald-300 dark:border-emerald-700 text-center">
            <CardContent className="pt-10 pb-8 space-y-5">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-bold">Package Complete!</h2>
              <p className="text-lg text-muted-foreground">
                You finished <strong>{activePackage.title}</strong>
              </p>
              <Badge className="text-lg px-4 py-2 gap-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                <Star className="w-5 h-5" /> +{activePackage.marks_reward} Marks earned
              </Badge>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate("/tour/packages")} className="gap-2">
                  <Ticket className="w-4 h-4" /> Choose Another Tour
                </Button>
                <Button variant="outline" onClick={() => navigate("/crows-nest")} className="gap-2">
                  <Compass className="w-4 h-4" /> View Trail Map
                </Button>
              </div>
            </CardContent>
          </Card>
        </PortalPageLayout>
      );
    }

    return (
      <PortalPageLayout maxWidth="lg" xrayId="tour-package-playing">
        {/* Package header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate("/tour/packages")}>
              <ChevronLeft className="w-4 h-4 mr-1" /> All Packages
            </Button>
            <Badge variant="outline" className="gap-1">
              <span className="text-lg leading-none">{activePackage.icon}</span>
              {activePackage.title}
            </Badge>
          </div>
          <Badge variant="secondary">
            Stop {pkgStopIndex + 1} of {pkgTotalStops}
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="space-y-1">
          <Progress value={pkgPct} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{activeProgress?.completed_stops?.length ?? 0} of {pkgTotalStops} stops visited</span>
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500" /> Earn {activePackage.marks_reward} Marks
            </span>
          </div>
        </div>

        {/* Content */}
        {pkgCurrentItem ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">{pkgCurrentItem.title}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{pkgCurrentItem.category}</Badge>
                {pkgCurrentItem.subcategory && (
                  <Badge variant="secondary">{pkgCurrentItem.subcategory}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {renderContentAtLevel(pkgCurrentItem, detailLevel, templateVars)}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              {pkgItems.length === 0 ? "Loading package content..." : "No content for this stop."}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-2 sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={pkgGoPrev} disabled={pkgStopIndex === 0}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button variant="default" size="sm" onClick={pkgGoNext}>
              {pkgStopIndex < pkgTotalStops - 1 ? (
                <>Next <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Complete <CheckCircle2 className="w-4 h-4" /></>
              )}
            </Button>
          </div>
          <div className="flex gap-2">
            {/* Detail level toggle for package mode */}
            {DETAIL_LEVELS.map((dl) => {
              const Icon = dl.icon;
              return (
                <Button
                  key={dl.key}
                  variant={detailLevel === dl.key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setDetailLevel(dl.key)}
                  title={dl.desc}
                  className="gap-1 h-8"
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline text-xs">{dl.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </PortalPageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER — Landing
  // ══════════════════════════════════════════════════════════════════
  if (viewState === "landing") {
    return (
      <PortalPageLayout maxWidth="lg" xrayId="guided-tour-page">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Compass className="w-8 h-8 text-primary" />
            Guided Tour
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn everything about Liana Banyan at your own pace. Choose a topic, browse by category, or take the full guided tour.
          </p>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => navigate("/tour/packages")}
          >
            <Ticket className="w-4 h-4" /> Tour Packages — Earn Marks
          </Button>
        </div>

        {/* Mode selector */}
        <Tabs
          value={mode}
          onValueChange={(v) => setMode(v as TourMode)}
          className="w-full max-w-lg mx-auto"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="topic" className="gap-1">
              <Map className="w-4 h-4" /> Topics
            </TabsTrigger>
            <TabsTrigger value="category" className="gap-1">
              <Layers className="w-4 h-4" /> Categories
            </TabsTrigger>
            <TabsTrigger value="guided_tour" className="gap-1">
              <Compass className="w-4 h-4" /> Full Tour
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Detail level selector */}
        <div className="flex justify-center gap-2">
          {DETAIL_LEVELS.map((dl) => {
            const Icon = dl.icon;
            return (
              <Button
                key={dl.key}
                variant={detailLevel === dl.key ? "default" : "outline"}
                size="sm"
                onClick={() => setDetailLevel(dl.key)}
                className="gap-1"
              >
                <Icon className="w-4 h-4" />
                {dl.label}
              </Button>
            );
          })}
        </div>

        {/* Beacons bar */}
        {beacons.length > 0 && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Bookmark className="w-4 h-4 text-amber-600" />
                  {beacons.length} Return Beacon{beacons.length > 1 ? "s" : ""} saved
                </span>
                <Button variant="ghost" size="sm" onClick={() => setShowBeacons(!showBeacons)}>
                  {showBeacons ? "Hide" : "Show"}
                </Button>
              </div>
              {showBeacons && (
                <div className="mt-2 space-y-1">
                  {beacons.slice(0, 10).map((b) => (
                    <button
                      key={b.id}
                      onClick={() => jumpToBeacon(b)}
                      className="w-full text-left text-sm px-2 py-1 rounded hover:bg-amber-100 dark:hover:bg-amber-900/30 transition"
                    >
                      <span className="font-medium">{b.item_title}</span>
                      <span className="text-muted-foreground ml-2">({b.category})</span>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Mode-specific content */}
        {mode === "topic" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <Card
                key={topic.slug}
                className="cursor-pointer hover:shadow-md transition group"
                onClick={() => startTopic(topic.slug)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition">
                    <CategoryIcon name={topic.icon} className="w-5 h-5" />
                    {topic.title}
                  </CardTitle>
                  {topic.subtitle && (
                    <CardDescription>{topic.subtitle}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{topic.item_slugs.length} items</span>
                    {topic.estimated_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> ~{topic.estimated_minutes} min
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {mode === "category" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => (
              <Card
                key={cat.category}
                className="cursor-pointer hover:shadow-md transition group"
                onClick={() => startCategory(cat.category)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base group-hover:text-primary transition">
                    <CategoryIcon name={cat.icon} className="w-5 h-5" />
                    {cat.display_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cat.description}</p>
                  <Badge variant="secondary" className="mt-2">{cat.item_count} items</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {mode === "guided_tour" && (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              The full guided tour walks through every category — {categories.length} sections,
              {" "}{totalItemsInTour}+ items. Skip forward, save beacons, exit anytime.
            </p>
            <Button size="lg" onClick={startGuidedTour} className="gap-2">
              <Compass className="w-5 h-5" />
              Start Guided Tour
            </Button>
            <p className="text-xs text-muted-foreground">
              Keyboard: ←/→ navigate, S skip category, Esc exit
            </p>
          </div>
        )}
      </PortalPageLayout>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // RENDER — Playing (content view)
  // ══════════════════════════════════════════════════════════════════
  const modeLabel =
    mode === "topic" ? selectedTopic?.title || "Topic" :
    mode === "category" ? categories.find((c) => c.category === selectedCategory)?.display_name || "Category" :
    guidedCategory?.display_name || "Guided Tour";

  return (
    <PortalPageLayout maxWidth="lg" xrayId="guided-tour-playing">
      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={exitTour}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Badge variant="outline">{modeLabel}</Badge>
          {mode === "guided_tour" && (
            <Badge variant="secondary">
              Category {currentCategoryIndex + 1}/{categories.length}
            </Badge>
          )}
        </div>

        {/* Detail level toggle */}
        <div className="flex gap-1">
          {DETAIL_LEVELS.map((dl) => {
            const Icon = dl.icon;
            return (
              <Button
                key={dl.key}
                variant={detailLevel === dl.key ? "default" : "ghost"}
                size="sm"
                onClick={() => setDetailLevel(dl.key)}
                title={dl.desc}
                className="gap-1 h-8"
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline text-xs">{dl.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      {mode === "guided_tour" && (
        <div className="space-y-1">
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Item {currentItemIndex + 1}/{currentItems.length}</span>
            <span>{overallProgress}% overall</span>
          </div>
        </div>
      )}

      {/* Category interstitial */}
      {mode === "guided_tour" && currentItemIndex === 0 && guidedCategory && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 text-center">
            <CategoryIcon name={guidedCategory.icon} className="w-8 h-8 mx-auto text-primary mb-2" />
            <h2 className="text-xl font-bold">{guidedCategory.display_name}</h2>
            <p className="text-muted-foreground text-sm mt-1">{guidedCategory.description}</p>
            <Badge variant="secondary" className="mt-2">
              {currentItems.length} items in this section
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Content area */}
      {currentItem ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentItem.title}</CardTitle>
            <div className="flex gap-2">
              <a href={`/cephas/${currentItem.category}/${currentItem.slug}`}>
                <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">
                  {currentItem.category}
                </Badge>
              </a>
              {currentItem.subcategory && (
                <Badge variant="secondary">{currentItem.subcategory}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>
                {renderContentAtLevel(currentItem, detailLevel, templateVars)}
              </ReactMarkdown>
            </div>

            {/* Full page link — always visible, not just deep dive */}
            <div className="mt-6 flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" asChild>
                <a href={`/cephas/${currentItem.category}/${currentItem.slug}`}>
                  View Full Page
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            {currentItems.length === 0
              ? "No content available in this section yet."
              : "Loading..."}
          </CardContent>
        </Card>
      )}

      {mode === "guided_tour" && !canGoNext && !canSkipCategory ? (
        <Card className="border-indigo-300 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/20">
          <CardContent className="pt-5 pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="font-semibold">Guided Tour complete.</p>
              <p className="text-sm text-muted-foreground">
                Next recommended step: enter the Alcove Hallway for the 18-stop mastery path.
              </p>
            </div>
            <Button onClick={() => navigate("/learn")} className="gap-2">
              <BookOpen className="w-4 h-4" />
              Enter Alcove Hallway
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {/* Navigation bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goPrev}
            disabled={!canGoPrev}
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={goNext}
            disabled={!canGoNext && !canSkipCategory}
          >
            Next <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          {mode === "guided_tour" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={skipToNextCategory}
              disabled={!canSkipCategory}
              className="gap-1"
            >
              <SkipForward className="w-4 h-4" /> Skip Section
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={placeBeacon}
            className="gap-1"
          >
            <Bookmark className="w-4 h-4" /> Beacon
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exitTour}
            className="gap-1"
          >
            <LogOut className="w-4 h-4" /> Exit
          </Button>
        </div>
      </div>
    </PortalPageLayout>
  );
}
