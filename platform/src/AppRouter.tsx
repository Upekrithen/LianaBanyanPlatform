import { Suspense } from "react";
import { Routes } from "react-router-dom";
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
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    }>
      <Routes>
        {publicRoutes}
        {onboardingRoutes}
        {dashboardRoutes}
        {productionRoutes}
        {initiativeRoutes}
        {hexisleRoutes}
        {socialRoutes}
        {commerceRoutes}
        {cephasRoutes}
        {toolsRoutes}
        {adminRoutes}
        {captainRoutes}
        {defenseRoutes}
        {miscRoutes}
      </Routes>
    </Suspense>
  );
}
