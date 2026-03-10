/**
 * CrowsNestFloat — Floating button on every page
 * =================================================
 * Magnifying glass / telescope icon, bottom-right corner.
 * Badge shows queue count. Click opens the overlay.
 * Hidden on /crows-nest (redundant — full page already visible).
 * Respects prefers-reduced-motion.
 */

import { useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Telescope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCrowsNest } from "@/contexts/CrowsNestContext";

export function CrowsNestFloat() {
  const { queue, openOverlay, isOverlayOpen } = useCrowsNest();
  const location = useLocation();

  const handleClick = useCallback(() => {
    openOverlay("browse");
  }, [openOverlay]);

  // Hide on the full Crow's Nest page (redundant) and when overlay is already open
  if (location.pathname === "/crows-nest" || isOverlayOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50" role="complementary" aria-label="Crow's Nest discovery">
      <Button
        size="lg"
        className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow p-0 relative"
        onClick={handleClick}
        aria-label={`Open Crow's Nest${queue.length > 0 ? ` (${queue.length} queued)` : ""}`}
      >
        <Telescope className="h-5 w-5" />
        {queue.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 text-[10px] px-1 h-4 min-w-[16px] flex items-center justify-center"
          >
            {queue.length}
          </Badge>
        )}
      </Button>
    </div>
  );
}
