/**
 * GLOBAL WILDFIRE RUN CONTROLLER
 * ==============================
 * Renders the WildfireBeaconRun component globally when a run is active.
 * This component should be placed in App.tsx to persist across navigation.
 */

import { useWildfireRun } from "@/contexts/WildfireRunContext";
import { WildfireBeaconRun } from "@/components/WildfireBeaconRun";
import { useNavigate } from "react-router-dom";

export function GlobalWildfireRun() {
  const { activeRun, endRun } = useWildfireRun();
  const navigate = useNavigate();

  if (!activeRun) return null;

  return (
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
  );
}
