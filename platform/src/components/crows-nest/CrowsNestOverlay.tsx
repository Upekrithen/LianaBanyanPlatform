/**
 * CrowsNestOverlay — Responsive Sheet/Drawer wrapper
 * ====================================================
 * Desktop (≥768px): Sheet from the right side, 420px wide.
 * Mobile (<768px): Drawer from the bottom, 85vh max.
 *
 * Contains: Section filter, search, card list, inline expansion,
 * and tabs to switch between Browse / Queue / To-Go.
 *
 * "Open Full Page" link navigates to /crows-nest.
 */

import { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Telescope, ExternalLink } from "lucide-react";
import { useCrowsNest } from "@/contexts/CrowsNestContext";
import {
  ALL_CROWS_NEST_ITEMS,
  searchCrowsNestItems,
  getItemsForSection,
} from "@/data/crowsNestItems";
import type { CrowsNestItem } from "@/data/crowsNestItems";
import { FlyoverCard } from "./FlyoverCard";
import { FlyoverExpander } from "./FlyoverExpander";
import { FlyoverSearch } from "./FlyoverSearch";
import { FlyoverQueue } from "./FlyoverQueue";
import { FlyoverToGo } from "./FlyoverToGo";

export function CrowsNestOverlay() {
  const {
    isOverlayOpen,
    closeOverlay,
    overlayMode,
    setOverlayMode,
    activeSection,
    searchQuery,
    expandedItemId,
    expandedDepth,
    queue,
    toGoBag,
  } = useCrowsNest();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Filter items
  const filteredItems = useMemo<CrowsNestItem[]>(() => {
    if (searchQuery.trim()) {
      let items = searchCrowsNestItems(searchQuery);
      if (activeSection) {
        items = items.filter((item) => item.sectionId === activeSection);
      }
      return items;
    }
    if (activeSection) {
      return getItemsForSection(activeSection);
    }
    return ALL_CROWS_NEST_ITEMS;
  }, [activeSection, searchQuery]);

  const expandedItem = useMemo(
    () => (expandedItemId ? filteredItems.find((i) => i.id === expandedItemId) : null),
    [expandedItemId, filteredItems]
  );

  const handleOpenFullPage = useCallback(() => {
    closeOverlay();
    navigate("/crows-nest");
  }, [closeOverlay, navigate]);

  // Shared content for both Sheet and Drawer
  const overlayContent = (
    <div className="flex flex-col h-full">
      {/* Mode tabs: Browse / Queue / To-Go */}
      <div className="px-4 pt-2 pb-3 border-b">
        <Tabs
          value={overlayMode}
          onValueChange={(val) => setOverlayMode(val as "browse" | "queue" | "to_go")}
        >
          <TabsList className="h-8 w-full">
            <TabsTrigger value="browse" className="text-xs h-7 flex-1">
              Browse
            </TabsTrigger>
            <TabsTrigger value="queue" className="text-xs h-7 flex-1 gap-1">
              Queue
              {queue.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1 h-3.5 min-w-[14px]">
                  {queue.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="to_go" className="text-xs h-7 flex-1 gap-1">
              To-Go
              {toGoBag.length > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1 h-3.5 min-w-[14px]">
                  {toGoBag.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Browse panel */}
          <TabsContent value="browse" className="mt-0">
            <div className="py-3">
              <FlyoverSearch filteredCount={filteredItems.length} />
            </div>
          </TabsContent>
          <TabsContent value="queue" className="mt-0" />
          <TabsContent value="to_go" className="mt-0" />
        </Tabs>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {overlayMode === "browse" && (
          <div className="space-y-3">
            {filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <Telescope className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No items match your search.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id}>
                  <FlyoverCard item={item} isExpanded={expandedItemId === item.id} />
                  {expandedItemId === item.id && expandedItem && (
                    <div className="mt-2">
                      <FlyoverExpander item={expandedItem} currentDepth={expandedDepth} />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {overlayMode === "queue" && <FlyoverQueue />}
        {overlayMode === "to_go" && <FlyoverToGo />}
      </div>

      {/* Footer with "Open Full Page" */}
      <div className="border-t px-4 py-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-8 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={handleOpenFullPage}
        >
          <ExternalLink className="h-3 w-3" />
          Open Full Page
        </Button>
      </div>
    </div>
  );

  // Desktop: Sheet (right side)
  if (!isMobile) {
    return (
      <Sheet open={isOverlayOpen} onOpenChange={(open) => !open && closeOverlay()}>
        <SheetContent
          side="right"
          className="w-[420px] max-w-[90vw] p-0 flex flex-col"
        >
          <SheetHeader className="px-4 pt-4 pb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Telescope className="h-4 w-4 text-primary" />
              <SheetTitle className="text-base">The Crow's Nest</SheetTitle>
            </div>
            <SheetDescription className="text-xs">
              Survey the horizon — discover everything the platform offers
            </SheetDescription>
          </SheetHeader>
          {overlayContent}
        </SheetContent>
      </Sheet>
    );
  }

  // Mobile: Drawer (bottom)
  return (
    <Drawer open={isOverlayOpen} onOpenChange={(open) => !open && closeOverlay()}>
      <DrawerContent className="max-h-[85vh] flex flex-col">
        <DrawerHeader className="px-4 pt-2 pb-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Telescope className="h-4 w-4 text-primary" />
            <DrawerTitle className="text-base">The Crow's Nest</DrawerTitle>
          </div>
          <DrawerDescription className="text-xs">
            Survey the horizon — discover everything the platform offers
          </DrawerDescription>
        </DrawerHeader>
        {overlayContent}
      </DrawerContent>
    </Drawer>
  );
}
