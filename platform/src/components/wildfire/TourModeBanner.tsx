/**
 * WILDFIRE TOUR BANNER — reusable inline toggle + CTA for tour-mode pages.
 * Matches MSAPage orange pill toggle pattern.
 */

import { useNavigate } from "react-router-dom";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flame, ArrowRight } from "lucide-react";

interface TourModeBannerProps {
  pageName: string;
}

export function TourModeBanner({ pageName }: TourModeBannerProps) {
  const { isTourMode, startTour, endTour, trackTourPage } = useWildfireRun();
  const navigate = useNavigate();

  trackTourPage(pageName);

  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200 dark:border-orange-800 mb-4">
      <div className="flex items-center gap-2">
        <Badge className="bg-orange-500 text-white border-orange-600 gap-1">
          <Flame className="h-3 w-3" />
          WildFire Tour
        </Badge>
        <span className="text-xs text-muted-foreground">
          {isTourMode ? "Viewing demo data" : "See this page with demo data"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Tour Mode:</span>
          <button
            onClick={() => isTourMode ? endTour() : startTour()}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isTourMode ? 'bg-orange-500' : 'bg-muted'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isTourMode ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
        {isTourMode && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-orange-300 hover:bg-orange-100"
            onClick={() => navigate("/membership")}
          >
            Join for $5/year <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
}
