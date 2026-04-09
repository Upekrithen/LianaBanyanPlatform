/**
 * WILDFIRE TOUR ENTRY — /wildfire-tour
 * Auto-activates tour mode and redirects to the welcome page.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWildfireRun } from "@/contexts/WildfireRunContext";

export default function WildfireTourEntry() {
  const { startTour, isTourMode } = useWildfireRun();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isTourMode) startTour();
    navigate("/welcome", { replace: true });
  }, [startTour, isTourMode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-orange-600 font-medium">Starting WildFire Tour...</div>
    </div>
  );
}
