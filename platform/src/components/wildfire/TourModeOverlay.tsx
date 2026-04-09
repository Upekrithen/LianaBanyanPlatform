/**
 * WILDFIRE TOUR MODE OVERLAY
 * Floating exit button + completion modal — visible on all pages during tour.
 * K358 / B086
 */

import { useNavigate } from "react-router-dom";
import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Flame, X, Sparkles, ArrowRight } from "lucide-react";

export function TourModeOverlay() {
  const { isTourMode, endTour, tourPagesVisited, showTourCompletion, dismissTourCompletion } = useWildfireRun();
  const navigate = useNavigate();

  if (!isTourMode) return null;

  return (
    <>
      {/* Floating Exit Button */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
        <Badge className="bg-orange-500 text-white border-orange-600 gap-1 shadow-lg">
          <Flame className="h-3 w-3" />
          WildFire Tour ({tourPagesVisited} pages)
        </Badge>
        <Button
          size="sm"
          variant="destructive"
          className="shadow-lg bg-orange-600 hover:bg-orange-700"
          onClick={endTour}
        >
          <X className="h-3 w-3 mr-1" />
          Exit Tour
        </Button>
      </div>

      {/* Tour Banner — top of viewport */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-center py-1 text-xs font-medium shadow-md">
        <Flame className="h-3 w-3 inline mr-1" />
        WildFire Tour Mode — Exploring with demo data. No account needed yet.
        <button className="ml-2 underline hover:no-underline" onClick={endTour}>Exit</button>
      </div>

      {/* Completion Modal */}
      <Dialog open={showTourCompletion} onOpenChange={(open) => { if (!open) dismissTourCompletion(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-orange-500" />
              You've explored the platform!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You've visited {tourPagesVisited} pages with demo data. Here's what you experienced:
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-blue-50 rounded p-2 text-center">
                <p className="font-bold text-blue-700">3</p>
                <p className="text-[10px] text-blue-600">Subscription channels</p>
              </div>
              <div className="bg-green-50 rounded p-2 text-center">
                <p className="font-bold text-green-700">1</p>
                <p className="text-[10px] text-green-600">Active crew</p>
              </div>
              <div className="bg-purple-50 rounded p-2 text-center">
                <p className="font-bold text-purple-700">3</p>
                <p className="text-[10px] text-purple-600">Products in your shop</p>
              </div>
              <div className="bg-amber-50 rounded p-2 text-center">
                <p className="font-bold text-amber-700">83.3%</p>
                <p className="text-[10px] text-amber-600">Creator keeps</p>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
              <p className="font-semibold text-orange-800 text-lg">$5/year — that's it.</p>
              <p className="text-xs text-orange-600 mt-1">
                Membership is a Structural Bylaw. It cannot be raised without supermajority governance approval.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={dismissTourCompletion} className="flex-1">
              Keep Exploring
            </Button>
            <Button
              className="flex-1 bg-orange-600 hover:bg-orange-700"
              onClick={() => { dismissTourCompletion(); endTour(); navigate("/membership"); }}
            >
              Join for $5/year <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
