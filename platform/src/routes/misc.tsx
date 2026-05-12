import { lazy, useEffect } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";
import { KeepView } from "@/pages/Index";

const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const MemberAgreement = lazy(() => import("@/pages/MemberAgreement"));
const SantaEverAfter = lazy(() => import("@/pages/SantaEverAfter"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const SphinxPhase1 = lazy(() => import("@/pages/SphinxPhase1"));
const SkipEbletsDevPage = lazy(() => import("@/pages/dev/SkipEbletsDevPage"));
const CelPaneBenchmarkPage = lazy(() => import("@/pages/dev/CelPaneBenchmarkPage"));

const ExternalRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

export const miscRoutes = (
  <>
    {/* Convenience auth redirects */}
    <Route path="/login" element={<Navigate to="/auth" replace />} />
    <Route path="/signin" element={<Navigate to="/auth" replace />} />
    <Route path="/sign-in" element={<Navigate to="/auth" replace />} />
    <Route path="/signup" element={<Navigate to="/auth" replace />} />
    <Route path="/sign-up" element={<Navigate to="/auth" replace />} />
    <Route path="/begin" element={<Navigate to="/welcome" replace />} />
    <Route path="/onboarding" element={<Navigate to="/welcome" replace />} />
    <Route path="/philosophy" element={<Navigate to="/about/patriotic-interdependentalist" replace />} />

    {/* Convenience navigation redirects */}
    <Route path="/keep" element={<ProtectedRoute><KeepView /></ProtectedRoute>} />
    <Route path="/home" element={<Navigate to="/" replace />} />
    <Route path="/browse" element={<Navigate to="/browse/marketplace" replace />} />
    <Route path="/all-positions" element={<Navigate to="/positions/browse" replace />} />
    <Route path="/my-portfolio" element={<Navigate to="/portfolio" replace />} />
    <Route path="/my-reputation" element={<Navigate to="/dashboard" replace />} />
    <Route path="/start-a-project" element={<Navigate to="/start" replace />} />
    <Route path="/52-card-hunt" element={<Navigate to="/treasure-map-game" replace />} />
    <Route path="/contract-positions" element={<Navigate to="/positions/browse" replace />} />
    <Route path="/business-builder" element={<Navigate to="/build-a-business" replace />} />
    <Route path="/create-project" element={<Navigate to="/admin/project/create" replace />} />
    <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
    <Route path="/admin/project" element={<Navigate to="/admin-project" replace />} />
    <Route path="/public-ledger" element={<Navigate to="/ledger" replace />} />
    <Route path="/opportunities" element={<Navigate to="/positions/browse" replace />} />
    <Route path="/heroes" element={<Navigate to="/browse/marketplace" replace />} />
    <Route path="/the-bridge" element={<Navigate to="/durins-door" replace />} />
    <Route path="/bridge" element={<Navigate to="/durins-door" replace />} />
    <Route path="/pledges" element={<Navigate to="/my-pledges" replace />} />
    <Route path="/deck-cards" element={<Navigate to="/deck" replace />} />
    <Route path="/hofund-studio" element={<Navigate to="/hofund" replace />} />
    <Route path="/tasks" element={<Navigate to="/task-list" replace />} />
    <Route path="/alliances" element={<Navigate to="/coalitions" replace />} />
    <Route path="/rideshare" element={<Navigate to="/wheels" replace />} />
    <Route path="/fleet" element={<Navigate to="/wheels" replace />} />
    <Route path="/vehicle-sharing" element={<Navigate to="/wheels" replace />} />
    <Route path="/adapt-score-v1" element={<Navigate to="/adapt-score" replace />} />
    <Route path="/effectiveness" element={<Navigate to="/adapt" replace />} />

    {/* HexIsle alias redirects */}
    <Route path="/harvest-island" element={<Navigate to="/hexisle/harvest" replace />} />
    <Route path="/island-assignments" element={<Navigate to="/hexisle/assignments" replace />} />
    <Route path="/island-portfolio" element={<Navigate to="/hexisle/portfolio" replace />} />
    <Route path="/island-world-map" element={<Navigate to="/hexisle/world-map" replace />} />
    <Route path="/world-map" element={<Navigate to="/hexisle/world-map" replace />} />
    <Route path="/keeps" element={<Navigate to="/hexisle/keeps" replace />} />

    {/* Root-level initiative redirects */}
    <Route path="/rally-group" element={<Navigate to="/initiatives/rally-group" replace />} />
    <Route path="/jukebox" element={<Navigate to="/initiatives/jukebox" replace />} />
    <Route path="/household-concierge" element={<Navigate to="/initiatives/household-concierge" replace />} />
    <Route path="/defense-claws" element={<Navigate to="/initiatives/defense-claws" replace />} />
    <Route path="/harper-guild" element={<Navigate to="/initiatives/harper-guild" replace />} />
    <Route path="/vsl" element={<Navigate to="/initiatives/vsl" replace />} />
    <Route path="/bread" element={<Navigate to="/initiatives/bread" replace />} />
    <Route path="/lets-make-bread" element={<Navigate to="/initiatives/bread" replace />} />
    <Route path="/didasko" element={<Navigate to="/initiatives/didasko" replace />} />
    <Route path="/power-to-the-people" element={<Navigate to="/initiatives/power-to-the-people" replace />} />
    <Route path="/brass-tacks" element={<Navigate to="/initiatives/brass-tacks" replace />} />
    <Route path="/health-accords" element={<Navigate to="/initiatives/health-accords" replace />} />
    <Route path="/msa" element={<Navigate to="/initiatives/msa" replace />} />
    <Route path="/lets-make-dinner" element={<Navigate to="/initiatives/lets-make-dinner" replace />} />
    <Route path="/the-pantry" element={<Navigate to="/initiatives/the-pantry" replace />} />
    <Route path="/lets-go-shopping" element={<Navigate to="/initiatives/lets-go-shopping" replace />} />
    <Route path="/lets-get-groceries" element={<Navigate to="/initiatives/lets-get-groceries" replace />} />
    <Route path="/lifeline-medications" element={<Navigate to="/initiatives/lifeline-medications" replace />} />

    {/* Letter URL safety-net redirects (B088 Red Carpet Audit) */}
    <Route path="/vip" element={<Navigate to="/RedCarpet" replace />} />
    <Route path="/proof" element={<Navigate to="/cephas/under-the-hood" replace />} />
    <Route path="/santa/transparency" element={<Navigate to="/ledger" replace />} />
    <Route path="/santa/volunteer" element={<Navigate to="/help-wanted" replace />} />

    {/* Legal pages */}
    <Route path="/terms" element={<LazyPage><TermsOfService /></LazyPage>} />
    <Route path="/terms/membership" element={<Navigate to="/member-agreement" replace />} />
    <Route path="/privacy" element={<LazyPage><PrivacyPolicy /></LazyPage>} />
    <Route path="/member-agreement" element={<LazyPage><MemberAgreement /></LazyPage>} />

    {/* Misc pages */}
    <Route path="/santa" element={<ProtectedRoute><LazyPage><SantaEverAfter /></LazyPage></ProtectedRoute>} />

    {/* The Sphinx Project — Phase 1 (K520 / A&A #2295 Tier 5 / Sphinx Band-NA) */}
    <Route path="/sphinx" element={<LazyPage><SphinxPhase1 /></LazyPage>} />
    <Route path="/sphinx/phase-1" element={<LazyPage><SphinxPhase1 /></LazyPage>} />
    <Route path="/sphinx/docs" element={<Navigate to="/sphinx" replace />} />
    <Route path="/the-sphinx-project" element={<Navigate to="/sphinx" replace />} />
    <Route path="/majcom" element={<Navigate to="/sphinx" replace />} />

    {/* BP028 Skip-Eblets Phase 1+2 prototype */}
    <Route path="/dev/skip-eblets" element={<LazyPage><SkipEbletsDevPage /></LazyPage>} />

    {/* BP028+BP029 CelPane / SKEBLETS Wild Magic standalone benchmark (Bushel 48 anchor) */}
    <Route path="/dev/celpane-benchmark" element={<LazyPage><CelPaneBenchmarkPage /></LazyPage>} />

    {/* Catch-all */}
    <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
  </>
);
