import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const DefenseKlausPage = lazy(() => import("@/pages/DefenseKlausPage"));
const DefenseClawsPage = lazy(() => import("@/pages/DefenseClawsPage"));
const DefenseKlausSubmarineDoor = lazy(() => import("@/pages/DefenseKlausSubmarineDoor"));
const HouseholdConciergePage = lazy(() => import("@/pages/HouseholdConciergePage"));
const HealthAccordsPage = lazy(() => import("@/pages/HealthAccordsPage"));
const MSAPage = lazy(() => import("@/pages/MSAPage"));
const LifeLineMedicationsPage = lazy(() => import("@/pages/LifeLineMedicationsPage"));
const HousingPage = lazy(() => import("@/pages/Housing"));

export const defenseRoutes = (
  <>
    <Route path="/initiatives/defense-klaus" element={<ExplorerRoute><LazyPage><DefenseKlausPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/defense-claws" element={<ExplorerRoute><LazyPage><DefenseClawsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/household-concierge" element={<ExplorerRoute><LazyPage><HouseholdConciergePage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/health-accords" element={<ExplorerRoute><LazyPage><HealthAccordsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/msa" element={<ExplorerRoute><LazyPage><MSAPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/lifeline-medications" element={<ExplorerRoute><LazyPage><LifeLineMedicationsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/initiatives/tatiana-schlossburg-health-accords" element={<ExplorerRoute><LazyPage><LifeLineMedicationsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/defense-klaus" element={<LazyPage><DefenseKlausSubmarineDoor /></LazyPage>} />
    <Route path="/defense-klaus/gift/:referralCode" element={<LazyPage><DefenseKlausSubmarineDoor /></LazyPage>} />
    <Route path="/housing" element={<ExplorerRoute><LazyPage><HousingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/shelter" element={<Navigate to="/housing" replace />} />
    <Route path="/mission-two" element={<Navigate to="/housing" replace />} />
  </>
);
