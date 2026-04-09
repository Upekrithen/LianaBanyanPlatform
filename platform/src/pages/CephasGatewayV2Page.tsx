import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/shells";
import { Hero, StickyMobileCTA } from "@/components/v2";
import { useTourTarget } from "@/hooks/useTourTarget";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { supabase } from "@/integrations/supabase/client";
import { buildTemplateVars, interpolateContent } from "@/lib/cephasTemplateEngine";
import {
  CategoryRail,
  CephasFilters,
  CephasPublication,
  CephasSearchBar,
  ContentPipelineExplainer,
  PuddingTrilogyShelves,
  PublicationSearchWorkspace,
  PublicationTable,
  RecentlyUpdatedBand,
} from "@/components/v2/cephas";

type RegistryRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  subcategory: string | null;
  style: string;
  technical_summary: string | null;
  source_path: string;
  updated_at: string | null;
  created_at: string | null;
};

type SortKey = "title" | "updatedAt" | "topic" | "format";
type SortDir = "asc" | "desc";
type SavedSort = { id: string; label: string; key: SortKey; dir: SortDir };

const SORT_STORAGE_KEY = "cephas-v2-saved-sorts";

const DEFAULT_FILTERS: CephasFilters = {
  topic: "all",
  format: "all",
  stage: "all",
  readingLevel: "all",
};

function toTitleCase(value: string): string {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function inferFamily(row: RegistryRow): CephasPublication["family"] {
  // Check exact category first for unambiguous classification
  if (row.category === "article") return "articles";
  if (row.category === "pudding") return "puddings";
  // Then fall through to keyword-based inference for legacy entries
  const blob = `${row.category} ${row.subcategory ?? ""} ${row.style} ${row.title} ${row.source_path}`.toLowerCase();
  if (blob.includes("pudding")) return "puddings";
  if (blob.includes("a&a") || blob.includes("acknowledgment") || blob.includes("assignment") || blob.includes(" formal")) {
    return "aa_formals";
  }
  if (blob.includes("business-plan") || blob.includes("business plan")) return "business_plans";
  if (blob.includes("paper") || blob.includes("academic")) return "papers";
  if (blob.includes("standalone") || blob.includes("open letter") || blob.includes("founder")) return "standalones";
  return "articles";
}

function inferRouteCategory(row: RegistryRow, family: CephasPublication["family"]): string {
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
  if (map[row.category]) return map[row.category];
  if (family === "papers") return "papers";
  if (family === "business_plans") return "business-plan";
  if (family === "aa_formals") return "papers";
  return "articles";
}

function inferStage(row: RegistryRow): CephasPublication["stage"] {
  const blob = `${row.source_path} ${row.slug} ${row.category} ${row.subcategory ?? ""}`.toLowerCase();
  if (blob.includes("seed")) return "seed";
  if (blob.includes("tldr") || blob.includes("tl;dr")) return "tldr";
  if (blob.includes("blog")) return "blog";
  if (blob.includes("paper") || blob.includes("academic")) return "paper";
  return "article";
}

function inferReadingLevels(row: RegistryRow, family: CephasPublication["family"]) {
  const blob = `${row.category} ${row.subcategory ?? ""} ${row.style} ${row.title}`.toLowerCase();
  return {
    atAGlance: true,
    fullRead: true,
    academic: family === "papers" || family === "aa_formals" || family === "business_plans" || blob.includes("academic"),
  };
}

export default function CephasGatewayV2Page() {
  const tourTarget = useTourTarget("cephas");
  const stats = useCanonicalStats();

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CephasFilters>(DEFAULT_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [savedSorts, setSavedSorts] = useState<SavedSort[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SORT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SavedSort[];
      setSavedSorts(parsed.slice(0, 6));
    } catch {
      setSavedSorts([]);
    }
  }, []);

  const publicationsQuery = useQuery({
    queryKey: ["cephas-gateway-v2-publications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cephas_content_registry")
        .select("id,slug,title,category,subcategory,style,technical_summary,source_path,updated_at,created_at")
        .order("updated_at", { ascending: false })
        .limit(300);
      if (error) throw error;
      return (data ?? []) as RegistryRow[];
    },
  });

  const publications: CephasPublication[] = useMemo(() => {
    return (publicationsQuery.data ?? []).map((row) => {
      const family = inferFamily(row);
      const stage = inferStage(row);
      const topic = toTitleCase(row.subcategory || row.category || "General");
      const format =
        family === "papers"
          ? "Paper"
          : family === "puddings"
            ? "Pudding"
            : family === "standalones"
              ? "Standalone"
              : family === "business_plans"
                ? "Business plan"
                : family === "aa_formals"
                  ? "A&A formal"
                  : "Article";

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        summary: row.technical_summary ?? "Publication summary available in full view.",
        family,
        topic,
        format,
        stage,
        updatedAt: row.updated_at ?? row.created_at ?? new Date(0).toISOString(),
        routeCategory: inferRouteCategory(row, family),
        readingLevels: inferReadingLevels(row, family),
      };
    });
  }, [publicationsQuery.data]);

  const counts = useMemo(
    () =>
      publications.reduce(
        (acc, publication) => {
          acc[publication.family] += 1;
          return acc;
        },
        {
          papers: 0,
          puddings: 0,
          articles: 0,
          standalones: 0,
          business_plans: 0,
          aa_formals: 0,
        },
      ),
    [publications],
  );

  const templateVars = useMemo(
    () => ({
      ...buildTemplateVars(stats),
      publicationCount: String(publications.length),
      papersCount: String(counts.papers),
      puddingsCount: String(counts.puddings),
      articlesCount: String(counts.articles),
      standalonesCount: String(counts.standalones),
      businessPlansCount: String(counts.business_plans),
      aaFormalsCount: String(counts.aa_formals),
    }),
    [counts.aa_formals, counts.articles, counts.business_plans, counts.papers, counts.puddings, counts.standalones, publications.length, stats],
  );

  const proofStrip = useMemo(
    () => [
      interpolateContent("~{{publicationCount}} publications", templateVars),
      "6 content categories",
      "3 reading levels",
      "live stat templates",
    ],
    [templateVars],
  );

  const filtered = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return publications.filter((publication) => {
      if (searchValue.length > 0) {
        const blob = `${publication.title} ${publication.summary} ${publication.topic} ${publication.format}`.toLowerCase();
        if (!blob.includes(searchValue)) return false;
      }

      if (filters.topic !== "all" && publication.topic !== filters.topic) return false;
      if (filters.format !== "all" && publication.format !== filters.format) return false;
      if (filters.stage !== "all" && publication.stage !== filters.stage) return false;
      if (filters.readingLevel === "academic" && !publication.readingLevels.academic) return false;
      if (filters.readingLevel === "full-read" && !publication.readingLevels.fullRead) return false;
      if (filters.readingLevel === "at-a-glance" && !publication.readingLevels.atAGlance) return false;
      return true;
    });
  }, [filters.format, filters.readingLevel, filters.stage, filters.topic, publications, search]);

  const startWithPudding = useMemo(() => filtered.filter((publication) => publication.family === "puddings").slice(0, 10), [filtered]);
  const notPudding = useMemo(
    () => filtered.filter((publication) => publication.family === "articles" || publication.family === "standalones").slice(0, 10),
    [filtered],
  );
  const proofInPudding = useMemo(
    () =>
      filtered
        .filter(
          (publication) =>
            publication.family === "papers" || publication.family === "aa_formals" || publication.family === "business_plans",
        )
        .slice(0, 10),
    [filtered],
  );

  const topics = useMemo(() => [...new Set(publications.map((publication) => publication.topic))].sort(), [publications]);
  const formats = useMemo(() => [...new Set(publications.map((publication) => publication.format))].sort(), [publications]);

  const recentlyUpdated = useMemo(() => [...filtered].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6), [filtered]);
  const curated = useMemo(() => {
    const picks: CephasPublication[] = [];
    for (const family of ["puddings", "articles", "papers", "business_plans", "aa_formals", "standalones"] as const) {
      const match = filtered.find((publication) => publication.family === family);
      if (match) picks.push(match);
      if (picks.length >= 6) break;
    }
    return picks;
  }, [filtered]);

  const countLabels = useMemo(
    () => ({
      papers: interpolateContent("{{papersCount}} publications", templateVars),
      puddings: interpolateContent("{{puddingsCount}} publications", templateVars),
      articles: interpolateContent("{{articlesCount}} publications", templateVars),
      standalones: interpolateContent("{{standalonesCount}} publications", templateVars),
      business_plans: interpolateContent("{{businessPlansCount}} publications", templateVars),
      aa_formals: interpolateContent("{{aaFormalsCount}} publications", templateVars),
    }),
    [templateVars],
  );

  const handleSortChange = (next: SortKey) => {
    if (next === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(next);
    setSortDir("asc");
  };

  const handleSaveSort = () => {
    const next: SavedSort = {
      id: `${Date.now()}`,
      label: `${sortKey} (${sortDir})`,
      key: sortKey,
      dir: sortDir,
    };
    const merged = [next, ...savedSorts].slice(0, 6);
    setSavedSorts(merged);
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(merged));
  };

  const handleApplySavedSort = (id: string) => {
    const selected = savedSorts.find((item) => item.id === id);
    if (!selected) return;
    setSortKey(selected.key);
    setSortDir(selected.dir);
  };

  return (
    <AppShell
      xrayBase="cephas"
      pageTitle="Cephas"
      breadcrumbs="Cephas"
      hero={
        <div className="space-y-4" {...tourTarget}>
          <Hero
            variant="app"
            eyebrow="Cephas Knowledge System"
            headline="Find the right depth before you read the full thing."
            body="Cephas is the platform's living library: academic papers, Pudding explainers, deep articles, standalone writing, business plans, and A&A formals, all organized so members can move from quick orientation to full detail."
            primaryCTA={{ label: "Browse by category", href: "#cephas-categories" }}
            secondaryCTA={{ label: "Start learning in Alcove", href: "/learn" }}
            proofStrip={proofStrip}
          />
          <CephasSearchBar value={search} onChange={setSearch} />
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
            Publication cards default to <strong>At a Glance</strong> and can switch to <strong>Full Read</strong> or{" "}
            <strong>Academic</strong> when available.
          </div>
        </div>
      }
    >
      <div className="space-y-6 pb-24">
        <section id="cephas-categories">
          <CategoryRail counts={counts} countLabels={countLabels} />
        </section>

        <PuddingTrilogyShelves
          startWithPudding={startWithPudding}
          notPudding={notPudding}
          proofInPudding={proofInPudding}
        />

        <section id="cephas-search-workspace">
          <PublicationSearchWorkspace filters={filters} topics={topics} formats={formats} onChange={setFilters} />
        </section>

        <PublicationTable
          rows={filtered}
          sortKey={sortKey}
          sortDir={sortDir}
          onSortChange={handleSortChange}
          savedSorts={savedSorts}
          onSaveSort={handleSaveSort}
          onApplySavedSort={handleApplySavedSort}
        />

        <ContentPipelineExplainer />

        <RecentlyUpdatedBand recentlyUpdated={recentlyUpdated} curated={curated} />

        <StickyMobileCTA primary={{ label: "Browse by category", href: "#cephas-categories" }} />
      </div>
    </AppShell>
  );
}
