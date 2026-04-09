/**
 * THE CROW'S NEST — Trail Map + Discovery Hub
 * =============================================
 * /crows-nest — Your journey trail + browse everything the platform offers.
 * Two tabs: "My Trail" (visual treasure-map progress) and "Browse All" (existing flyover grid).
 *
 * K197: Rebuilt with vertical trail map and trail marker picker.
 */

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Telescope, ListOrdered, Package, Map, Compass } from "lucide-react";
import { CrowsNestProvider, useCrowsNest } from "@/contexts/CrowsNestContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  CROWS_NEST_SECTIONS,
  ALL_CROWS_NEST_ITEMS,
  getItemsForSection,
  searchCrowsNestItems,
} from "@/data/crowsNestItems";
import type { CrowsNestSection, CrowsNestItem } from "@/data/crowsNestItems";
import { FlyoverCard } from "@/components/crows-nest/FlyoverCard";
import { FlyoverExpander } from "@/components/crows-nest/FlyoverExpander";
import { FlyoverSearch } from "@/components/crows-nest/FlyoverSearch";
import { FlyoverQueue } from "@/components/crows-nest/FlyoverQueue";
import { FlyoverToGo } from "@/components/crows-nest/FlyoverToGo";
import { TrailMap } from "@/components/crows-nest/TrailMap";
import { TrailMarkerPicker } from "@/components/crows-nest/TrailMarkerPicker";
import type { TrailMarkerSlug } from "@/data/trailStops";

import {
  Star,
  Cog,
  Wrench,
  Globe,
} from "lucide-react";

const SECTION_ICONS: Record<CrowsNestSection, React.ElementType> = {
  getting_started: Compass,
  sweet_sixteen: Star,
  platform_mechanics: Cog,
  build_tools: Wrench,
  world: Globe,
};

// ── Trail data hook ──

function useTrailProgress() {
  const { user } = useAuth();
  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [trailMarker, setTrailMarker] = useState<string>("ghost");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompletedKeys(new Set(["has_account"]));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const keys = new Set<string>();
      keys.add("has_account");

      const [beaconRes, marksRes, pledgeRes, feedbackRes, guildRes, memberRes, prefRes, ghostRes, tourPkgRes] =
        await Promise.all([
          supabase.from("beacons").select("id").eq("user_id", user!.id).limit(1),
          supabase.from("mark_work_records").select("id").eq("user_id", user!.id).limit(1),
          supabase.from("campaign_pledges").select("id").eq("user_id", user!.id).limit(1),
          supabase.from("tour_notes_submitted").select("id").eq("user_id", user!.id).limit(1),
          supabase.from("guild_members").select("id").eq("user_id", user!.id).limit(1),
          supabase.from("member_subscriptions").select("id").eq("user_id", user!.id).eq("status", "active").limit(1),
          supabase.from("user_preferences").select("value").eq("user_id", user!.id).eq("key", "trail_marker_icon").single(),
          supabase.from("ghost_sessions").select("id").eq("user_id", user!.id).limit(3),
          supabase.from("tour_package_progress" as never).select("id").eq("user_id", user!.id).not("completed_at", "is", null).limit(1) as { data: { id: string }[] | null; error: unknown },
        ]);

      if (cancelled) return;

      if (beaconRes.data && beaconRes.data.length > 0) keys.add("has_beacon");
      if (marksRes.data && marksRes.data.length > 0) keys.add("has_marks");
      if (pledgeRes.data && pledgeRes.data.length > 0) keys.add("has_pledge");
      if (feedbackRes.data && feedbackRes.data.length > 0) keys.add("has_feedback");
      if (guildRes.data && guildRes.data.length > 0) keys.add("has_guild");
      if (memberRes.data && memberRes.data.length > 0) keys.add("has_membership");
      if (ghostRes.data && ghostRes.data.length >= 3) keys.add("explored_3_pages");
      if (tourPkgRes.data && tourPkgRes.data.length > 0) keys.add("completed_tour");

      if (prefRes.data?.value) {
        setTrailMarker(prefRes.data.value as string);
        keys.add("has_trail_marker");
      }

      // Marks ≥ 100 check
      const { data: marksTotal } = await supabase
        .from("mark_work_records")
        .select("marks_earned")
        .eq("user_id", user!.id);
      if (!cancelled && marksTotal) {
        const total = marksTotal.reduce((sum: number, r: any) => sum + (r.marks_earned || 0), 0);
        if (total >= 100) keys.add("marks_100");
      }

      if (!cancelled) {
        setCompletedKeys(keys);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user]);

  const saveTrailMarker = useCallback(
    async (slug: TrailMarkerSlug) => {
      setTrailMarker(slug);
      if (!user) return;
      await supabase.from("user_preferences").upsert(
        { user_id: user.id, key: "trail_marker_icon", value: slug, updated_at: new Date().toISOString() },
        { onConflict: "user_id,key" }
      );
      setCompletedKeys((prev) => new Set([...prev, "has_trail_marker"]));
    },
    [user]
  );

  return { completedKeys, trailMarker, saveTrailMarker, loading };
}

// ── Inner component (needs CrowsNestProvider) ──

function CrowsNestInner() {
  const {
    activeSection,
    setSection,
    searchQuery,
    expandedItemId,
    expandedDepth,
    queue,
    toGoBag,
    overlayMode,
    setOverlayMode,
  } = useCrowsNest();

  const { completedKeys, trailMarker, saveTrailMarker, loading } = useTrailProgress();
  const [topTab, setTopTab] = useState<"trail" | "browse">("trail");

  const filteredItems = useMemo<CrowsNestItem[]>(() => {
    let items: CrowsNestItem[];
    if (searchQuery.trim()) {
      items = searchCrowsNestItems(searchQuery);
      if (activeSection) {
        items = items.filter((item) => item.sectionId === activeSection);
      }
    } else if (activeSection) {
      items = getItemsForSection(activeSection);
    } else {
      items = ALL_CROWS_NEST_ITEMS;
    }
    return items;
  }, [activeSection, searchQuery]);

  const handleSectionChange = useCallback(
    (value: string) => {
      if (value === "all") {
        setSection(null);
      } else {
        setSection(value as CrowsNestSection);
      }
    },
    [setSection]
  );

  const expandedItem = useMemo(
    () => (expandedItemId ? filteredItems.find((i) => i.id === expandedItemId) : null),
    [expandedItemId, filteredItems]
  );

  const showBottomPanel = overlayMode === "queue" || overlayMode === "to_go";

  return (
    <PortalPageLayout variant="immersive" xrayId="crows-nest">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Telescope className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">The Crow's Nest</h1>
                <p className="text-xs text-muted-foreground">
                  Your trail & everything on the horizon
                </p>
              </div>
            </div>
            {topTab === "browse" && (
              <div className="w-64 hidden sm:block">
                <FlyoverSearch filteredCount={filteredItems.length} />
              </div>
            )}
          </div>

          {/* Top-level tabs: Trail vs Browse */}
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setTopTab("trail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                topTab === "trail"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Map className="h-3.5 w-3.5" />
              My Trail
            </button>
            <button
              onClick={() => setTopTab("browse")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                topTab === "browse"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              Browse All
              <Badge variant="secondary" className="text-[10px] px-1 h-4">
                {ALL_CROWS_NEST_ITEMS.length}
              </Badge>
            </button>
          </div>

          {/* Section tabs (only in Browse mode) */}
          {topTab === "browse" && (
            <>
              {/* Mobile search */}
              <div className="sm:hidden mb-3">
                <FlyoverSearch filteredCount={filteredItems.length} />
              </div>

              <Tabs
                value={activeSection || "all"}
                onValueChange={handleSectionChange}
              >
                <TabsList className="h-9 w-full justify-start overflow-x-auto flex-nowrap">
                  <TabsTrigger value="all" className="text-xs h-7 gap-1 flex-shrink-0">
                    All
                    <Badge variant="secondary" className="text-[10px] ml-0.5 px-1 h-4">
                      {ALL_CROWS_NEST_ITEMS.length}
                    </Badge>
                  </TabsTrigger>
                  {CROWS_NEST_SECTIONS.map((section) => {
                    const Icon = SECTION_ICONS[section.id];
                    const count = getItemsForSection(section.id).length;
                    return (
                      <TabsTrigger
                        key={section.id}
                        value={section.id}
                        className="text-xs h-7 gap-1 flex-shrink-0"
                      >
                        {Icon && <Icon className="h-3 w-3" />}
                        {section.title}
                        <Badge variant="secondary" className="text-[10px] ml-0.5 px-1 h-4">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                <TabsContent value="all" className="mt-0" />
                {CROWS_NEST_SECTIONS.map((s) => (
                  <TabsContent key={s.id} value={s.id} className="mt-0" />
                ))}
              </Tabs>
            </>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">

        {/* ═══ TRAIL TAB ═══ */}
        {topTab === "trail" && (
          <div className="space-y-8">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-pulse text-muted-foreground text-sm">Loading your trail...</div>
              </div>
            ) : (
              <>
                <TrailMap completedKeys={completedKeys} trailMarker={trailMarker} />
                <TrailMarkerPicker selected={trailMarker} onSelect={saveTrailMarker} />
              </>
            )}
          </div>
        )}

        {/* ═══ BROWSE TAB ═══ */}
        {topTab === "browse" && (
          <>
            {activeSection && (
              <div className="mb-4">
                {CROWS_NEST_SECTIONS.filter((s) => s.id === activeSection).map((s) => (
                  <p key={s.id} className="text-sm text-muted-foreground">
                    {s.subtitle}
                  </p>
                ))}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Telescope className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No items match your search.</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try a different search term or clear the filter.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => (
                <div key={item.id}>
                  <FlyoverCard
                    item={item}
                    isExpanded={expandedItemId === item.id}
                  />
                  {expandedItemId === item.id && expandedItem && (
                    <div className="mt-2">
                      <FlyoverExpander
                        item={expandedItem}
                        currentDepth={expandedDepth}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Bottom bar (browse mode only) */}
      {topTab === "browse" && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-20">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-2 py-2">
              <Button
                variant={overlayMode === "queue" && showBottomPanel ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() =>
                  setOverlayMode(
                    overlayMode === "queue" && showBottomPanel ? "browse" : "queue"
                  )
                }
                aria-label={`Queue: ${queue.length} items`}
                aria-expanded={overlayMode === "queue" && showBottomPanel}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                Queue
                {queue.length > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1 h-4 min-w-[16px]">
                    {queue.length}
                  </Badge>
                )}
              </Button>

              <Button
                variant={overlayMode === "to_go" && showBottomPanel ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs gap-1.5"
                onClick={() =>
                  setOverlayMode(
                    overlayMode === "to_go" && showBottomPanel ? "browse" : "to_go"
                  )
                }
                aria-label={`To-Go Bag: ${toGoBag.length} items`}
                aria-expanded={overlayMode === "to_go" && showBottomPanel}
              >
                <Package className="h-3.5 w-3.5" />
                To-Go
                {toGoBag.length > 0 && (
                  <Badge variant="destructive" className="text-[10px] px-1 h-4 min-w-[16px]">
                    {toGoBag.length}
                  </Badge>
                )}
              </Button>

              <span className="ml-auto text-xs text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>

            {showBottomPanel && (
              <div className="border-t py-3 max-h-[40vh] overflow-y-auto">
                {overlayMode === "queue" && <FlyoverQueue />}
                {overlayMode === "to_go" && <FlyoverToGo />}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom spacer (browse mode) */}
      {topTab === "browse" && <div className="h-14" />}
    </PortalPageLayout>
  );
}

// ── Page export (wraps with provider) ──

export default function CrowsNest() {
  return (
    <CrowsNestProvider>
      <CrowsNestInner />
    </CrowsNestProvider>
  );
}
