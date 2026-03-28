import { Suspense, useMemo } from "react";
import { Routes } from "react-router-dom";
import { detectPortal } from "@/utils/portalDetector";
import { isGroupAllowed } from "./routes/portalConfig";
import {
  publicRoutes,
  onboardingRoutes,
  dashboardRoutes,
  productionRoutes,
  initiativeRoutes,
  hexisleRoutes,
  socialRoutes,
  commerceRoutes,
  cephasRoutes,
  toolsRoutes,
  adminRoutes,
  captainRoutes,
  defenseRoutes,
  miscRoutes,
} from "./routes";

export function AppRouter() {
  const portal = useMemo(() => detectPortal(), []);
  const g = (group: Parameters<typeof isGroupAllowed>[1]) =>
    isGroupAllowed(portal, group);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-foreground">Loading...</div>
        </div>
      }
    >
      <Routes>
        {/* Universal — always rendered */}
        {publicRoutes}
        {onboardingRoutes}

        {/* Portal-gated route groups */}
        {g("dashboard") && dashboardRoutes}
        {g("production") && productionRoutes}
        {g("initiatives") && initiativeRoutes}
        {g("hexisle") && hexisleRoutes}
        {g("social") && socialRoutes}
        {g("commerce") && commerceRoutes}
        {g("cephas") && cephasRoutes}
        {g("tools") && toolsRoutes}
        {g("admin") && adminRoutes}
        {g("captain") && captainRoutes}
        {g("defense") && defenseRoutes}

        {/* Misc (404, redirects, legal) — always last */}
        {miscRoutes}
      </Routes>
    </Suspense>
  );
}
