/**
 * THE CROW'S NEST — Full Page Route
 * ==================================
 * /crows-nest — Browse everything the platform offers.
 * Section tabs, search, responsive card grid, inline expansion,
 * and bottom bar with queue + to-go bag counts.
 *
 * "Climb up to survey the entire horizon."
 */

import { useMemo, useCallback } from "react";
import { PortalPageLayout } from "@/components/PortalPageLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Telescope, ListOrdered, Package } from "lucide-react";
import { CrowsNestProvider, useCrowsNest } from "@/contexts/CrowsNestContext";
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

// ── Section icon map (Lucide) ──

import {
  Compass,
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

  // Filter items by section and search
  const filteredItems = useMemo<CrowsNestItem[]>(() => {
    let items: CrowsNestItem[];

    if (searchQuery.trim()) {
      items = searchCrowsNestItems(searchQuery);
      // Further filter by section if one is active
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

  // Find expanded item
  const expandedItem = useMemo(
    () => (expandedItemId ? filteredItems.find((i) => i.id === expandedItemId) : null),
    [expandedItemId, filteredItems]
  );

  // Bottom panel mode
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
                  Survey everything on the horizon
                </p>
              </div>
            </div>
            <div className="w-64 hidden sm:block">
              <FlyoverSearch filteredCount={filteredItems.length} />
            </div>
          </div>

          {/* Mobile search */}
          <div className="sm:hidden mb-3">
            <FlyoverSearch filteredCount={filteredItems.length} />
          </div>

          {/* Section tabs */}
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

            {/* Tab content — just used for section switching, actual grid below */}
            <TabsContent value="all" className="mt-0" />
            {CROWS_NEST_SECTIONS.map((s) => (
              <TabsContent key={s.id} value={s.id} className="mt-0" />
            ))}
          </Tabs>
        </div>
      </div>

      {/* Main content area */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Active section description */}
        {activeSection && (
          <div className="mb-4">
            {CROWS_NEST_SECTIONS.filter((s) => s.id === activeSection).map((s) => (
              <p key={s.id} className="text-sm text-muted-foreground">
                {s.subtitle}
              </p>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Telescope className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">No items match your search.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Try a different search term or clear the filter.
            </p>
          </div>
        )}

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id}>
              <FlyoverCard
                item={item}
                isExpanded={expandedItemId === item.id}
              />
              {/* Inline expander below the expanded card */}
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
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Toggle buttons */}
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

          {/* Expandable bottom panel */}
          {showBottomPanel && (
            <div className="border-t py-3 max-h-[40vh] overflow-y-auto">
              {overlayMode === "queue" && <FlyoverQueue />}
              {overlayMode === "to_go" && <FlyoverToGo />}
            </div>
          )}
        </div>
      </div>

      {/* Bottom spacer so content isn't hidden behind fixed bar */}
      <div className="h-14" />
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
