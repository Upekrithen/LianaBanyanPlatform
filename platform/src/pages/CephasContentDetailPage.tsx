/**
 * Cephas content detail — single document by slug (Session 20). Renders clean academic or pudding style.
 */
import { useParams, Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, PenLine } from "lucide-react";
import { AcademicRenderer, MemberRenderer } from "@/components/cephas";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { useState, useMemo, useEffect } from "react";
import { useCanonicalStats } from "@/hooks/useCanonicalStats";
import { buildTemplateVars, interpolateContent } from "@/lib/cephasTemplateEngine";
import { useNotesOverlay } from "@/contexts/NotesOverlayContext";
import { useTourNotes } from "@/hooks/useTourNotes";
import { NoteIndicatorDot } from "@/components/tour/NotesOverlay";
import { Button } from "@/components/ui/button";
import { PuddingPepperRating } from "@/components/pudding";
import { SchedulingEntryBox } from "@/components/scheduling/SchedulingEntryBox";
import { ChapterUnlockProgress } from "@/components/cephas";
import { Library } from "lucide-react";

export default function CephasContentDetailPage() {
  const { category, slug } = useParams<{ category: string; slug: string }>();
  const location = useLocation();
  const readingLevel = "full_detail";
  const [viewMode, setViewMode] = useState<'member' | 'academic'>('member');
  const stats = useCanonicalStats();
  const templateVars = useMemo(() => buildTemplateVars(stats), [stats]);
  const { openNotes } = useNotesOverlay();
  const { hasNotes } = useTourNotes(slug || '');

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

  const { data: puddingMeta } = useQuery({
    queryKey: ["cephas-pudding-meta", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("cephas_puddings" as never)
        .select("pudding_number, title, view_count, rating_active, pepper_rating_avg, pepper_rating_count")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as {
        pudding_number: number;
        title: string | null;
        view_count: number | null;
        rating_active: boolean | null;
        pepper_rating_avg: number | null;
        pepper_rating_count: number | null;
      } | null;
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });

  const sourceLinkPath = puddingMeta?.pudding_number
    ? `cephas_puddings:${puddingMeta.pudding_number}`
    : `cephas_content_registry:${slug}`;

  const { data: linkedInnovationIds = [] } = useQuery({
    queryKey: ["content-source-links-innovation-ids", sourceLinkPath],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_source_links" as never)
        .select("target_id")
        .eq("source_path", sourceLinkPath)
        .eq("target_type", "innovation");
      if (error) throw error;
      const ids = (data ?? [])
        .map((row: any) => Number(row.target_id))
        .filter((n: number) => Number.isFinite(n));
      return Array.from(new Set(ids)).sort((a, b) => a - b);
    },
    enabled: Boolean(slug),
    staleTime: 60_000,
  });

  const { data: linkedInnovations = [] } = useQuery({
    queryKey: ["content-source-links-innovations", linkedInnovationIds.join(",")],
    queryFn: async () => {
      if (linkedInnovationIds.length === 0) return [];
      const { data, error } = await supabase
        .from("innovation_log" as never)
        .select("innovation_number, title")
        .in("innovation_number", linkedInnovationIds)
        .order("innovation_number", { ascending: true });
      if (error) throw error;
      return (data ?? []) as { innovation_number: number; title: string }[];
    },
    enabled: linkedInnovationIds.length > 0,
    staleTime: 60_000,
  });

  // Source archive documents — look for compiled_documents that might be sources for this content
  const { data: sourceArchiveDocs = [] } = useQuery({
    queryKey: ["cephas-source-archive-docs", slug],
    queryFn: async () => {
      if (!slug) return [];
      const { data, error } = await supabase
        .from("compiled_documents" as never)
        .select("slug, title, category, family_name")
        .like("slug", `%${slug.split("-").slice(0, 3).join("-")}%`)
        .neq("slug", slug)
        .limit(5);
      if (error) throw error;
      return (data ?? []) as { slug: string; title: string; category: string | null; family_name: string }[];
    },
    enabled: !!slug,
    staleTime: 60_000,
  });

  // N key → open notes overlay (must be AFTER row is declared — B053 fix)
  useEffect(() => {
    if (!slug) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'n' || e.key === 'N') {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        openNotes(slug, row?.title || slug, readingLevel);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [slug, row?.title, readingLevel, openNotes]);

  if (!slug) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-content-detail">
        <p className="text-muted-foreground">Missing slug.</p>
      </PortalPageLayout>
    );
  }

  if (isLoading) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-content-detail">
        <div className="text-muted-foreground">Loading…</div>
      </PortalPageLayout>
    );
  }
  if (isError || !row) {
    return (
      <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-content-detail">
        <div className="text-center py-12 space-y-4">
          <div className="text-4xl">📄</div>
          <h2 className="text-xl font-bold">Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            This document isn't available yet. It may still be in preparation.
            Explore other Cephas content in the meantime.
          </p>
          <Link to={category ? `/cephas/${category}` : "/cephas"} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to {category || "Cephas"}
          </Link>
        </div>
      </PortalPageLayout>
    );
  }

  const contentType = String((row as any).content_type ?? "").toLowerCase();
  const isAcademic = ["paper", "whitepaper", "academic"].includes(contentType) || row.style === "clean_academic";
  const modeOverrideRaw = new URLSearchParams(location.search).get("mode");
  const modeOverride = modeOverrideRaw === "academic" || modeOverrideRaw === "member" ? modeOverrideRaw : null;
  const defaultMode: "academic" | "member" = modeOverride || (isAcademic ? "academic" : "member");
  const backHref = category ? `/cephas/${category}` : "/cephas";
  const t = (s: string) => interpolateContent(s, templateVars);
  const chapterUnlockId = resolveUnlockChapterId(slug ?? null);

  useEffect(() => {
    setViewMode(defaultMode);
  }, [defaultMode, row.id]);

  return (
    <PortalPageLayout variant="stage" maxWidth="md" xrayId="cephas-content-detail">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to {category || "Cephas"}
          </Link>
          <div className="flex items-center gap-2">
            <SchedulingEntryBox
              contentType={toViewingContentType(String((row as any).content_type ?? ""))}
              contentId={slug}
              contentTitle={row.title}
              contentUrl={`/cephas/${category}/${slug}`}
              target="helm-calendar"
              triggerLabel="Schedule Viewing"
              buttonVariant="outline"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode((prev) => (prev === "academic" ? "member" : "academic"))}
              className="gap-1.5 text-xs"
            >
              {viewMode === "academic" ? "Member View" : "Academic View"}
            </Button>
            <button
              onClick={() => openNotes(slug!, row.title, readingLevel)}
              className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors px-2 py-1 rounded-md border border-amber-500/30 hover:border-amber-500/50 bg-amber-500/5"
              title="Add notes (N)"
            >
              <PenLine className="w-3.5 h-3.5" />
              Notes
              <NoteIndicatorDot hasNotes={hasNotes()} />
            </button>
          </div>
        </div>

        {viewMode === "academic" ? (
          <AcademicRenderer
            title={row.title}
            subtitle={(row as any).subtitle ?? null}
            markdown={t(row.content_markdown || "")}
            publishedAt={(row as any).published_at || row.updated_at}
            onSwitchToMember={() => setViewMode("member")}
          />
        ) : (
          <MemberRenderer
            title={row.title}
            markdown={t(row.content_markdown || "")}
            category={row.category}
            slug={slug}
            templateVars={templateVars}
          />
        )}

        {chapterUnlockId ? <ChapterUnlockProgress chapter_id={chapterUnlockId} /> : null}

        <div className="flex flex-wrap gap-2 pt-4 border-t">
          {(row as any).content_type ? <Badge variant="secondary">{String((row as any).content_type)}</Badge> : null}
          {row.implementation_status && <Badge variant="secondary">{row.implementation_status}</Badge>}
          {row.knight_session && <Badge variant="outline">Knight {row.knight_session}</Badge>}
          {row.bishop_session && <Badge variant="outline">Bishop {row.bishop_session}</Badge>}
        </div>

        {puddingMeta ? (
          <PuddingPepperRating
            puddingNumber={puddingMeta.pudding_number}
            title={puddingMeta.title ?? row.title}
            initialViewCount={Number(puddingMeta.view_count ?? 0)}
            initialRatingActive={Boolean(puddingMeta.rating_active)}
            initialRatingAvg={
              puddingMeta.pepper_rating_avg === null || typeof puddingMeta.pepper_rating_avg === "undefined"
                ? null
                : Number(puddingMeta.pepper_rating_avg)
            }
            initialRatingCount={Number(puddingMeta.pepper_rating_count ?? 0)}
          />
        ) : null}

        {linkedInnovations.length > 0 ? (
          <div className="rounded-md border p-4 space-y-2">
            <p className="text-sm font-semibold">Source Material</p>
            <p className="text-xs text-muted-foreground">
              This document is linked to the following innovation entries:
            </p>
            <div className="flex flex-wrap gap-2">
              {linkedInnovations.map((item) => (
                <Link
                  key={item.innovation_number}
                  to={`/cephas/innovations?search=%23${item.innovation_number}`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted"
                >
                  #{item.innovation_number} {item.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {sourceArchiveDocs.length > 0 ? (
          <div className="rounded-md border p-4 space-y-2">
            <p className="text-sm font-semibold flex items-center gap-1.5">
              <Library className="w-4 h-4 text-amber-500" />
              Source Archive Documents
            </p>
            <div className="flex flex-wrap gap-2">
              {sourceArchiveDocs.map((doc) => (
                <Link
                  key={doc.slug}
                  to={`/cephas/archive/${doc.slug}`}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border hover:bg-muted transition-colors"
                >
                  {doc.title}
                  {doc.category ? (
                    <Badge variant="secondary" className="text-[10px] px-1 py-0 ml-1">
                      {doc.category.replace(/[_-]+/g, " ")}
                    </Badge>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </PortalPageLayout>
  );
}

function resolveUnlockChapterId(slug: string | null) {
  if (!slug) return null;
  const map: Record<string, string> = {
    "lighthouse-ladder": "bst_ch_07_lighthouse_ladder",
    "invisible-temperament": "bst_ch_08_invisible_temperament",
    "self-funding-economics": "bst_ch_09_self_funding_economics",
    "portable-reputation": "bst_ch_10_portable_reputation",
    "contingency-operators": "bst_ch_11_contingency_operators",
    "temporal-content-architecture": "bst_ch_12_tca",
  };
  return map[slug] ?? null;
}

function toViewingContentType(value: string): "pudding" | "bst_episode" | "spoonful" | "skipping_stone" | "paper" {
  const contentType = value.toLowerCase();
  if (contentType === "bst_episode") return "bst_episode";
  if (contentType === "spoonful" || contentType === "spoonfuls") return "spoonful";
  if (contentType === "skipping_stone" || contentType === "skipping_stones") return "skipping_stone";
  if (contentType === "paper" || contentType === "whitepaper" || contentType === "academic") return "paper";
  return "pudding";
}
