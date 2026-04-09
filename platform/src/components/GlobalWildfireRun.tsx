/**
 * GLOBAL WILDFIRE RUN CONTROLLER
 * ==============================
 * Renders the WildfireBeaconRun component globally when a run is active.
 * B088: Also renders SpotlightOverlay when a spotlight tour is active.
 * This component should be placed in App.tsx to persist across navigation.
 */

import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { WildfireBeaconRun } from "@/components/WildfireBeaconRun";
import { SpotlightOverlay } from "@/components/SpotlightOverlay";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function GlobalWildfireRun() {
  const { activeRun, endRun, spotlight, endSpotlightTour } = useWildfireRun();
  const navigate = useNavigate();

  return (
    <>
      {/* Classic beacon run (floating card with timer) */}
      {activeRun && (
        <WildfireBeaconRun
          run={activeRun}
          onComplete={(elapsedSeconds) => {
            const isOnboarding = activeRun.category === "onboarding";
            endRun();
            navigate(isOnboarding ? "/join" : "/wildfire-runs");
          }}
          onNodeVisit={(node, index) => {
          }}
        />
      )}

      {/* B088: Spotlight tour (LRH-guided tooltip overlay) */}
      {spotlight.isActive && (
        <SpotlightOverlay
          tourName={spotlight.tourName}
          stops={spotlight.stops}
          onComplete={() => {
            endSpotlightTour();
            toast.success('Tour complete! The Little Red Hen is proud of you.');
            navigate('/wildfire-runs');
          }}
          onExit={() => {
            endSpotlightTour();
          }}
        />
      )}
    </>
  );
}
