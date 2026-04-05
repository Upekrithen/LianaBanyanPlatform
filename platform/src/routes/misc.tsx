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
    <Route path="/public-ledger" element={<Navigate to="/transparent-ledger" replace />} />
    <Route path="/opportunities" element={<Navigate to="/positions/browse" replace />} />
    <Route path="/heroes" element={<Navigate to="/browse/marketplace" replace />} />
    <Route path="/the-bridge" element={<Navigate to="/durins-door" replace />} />
    <Route path="/bridge" element={<Navigate to="/durins-door" replace />} />
    <Route path="/pledges" element={<Navigate to="/my-pledges" replace />} />
    <Route path="/deck-cards" element={<Navigate to="/deck" replace />} />
    <Route path="/hofund-studio" element={<Navigate to="/hofund" replace />} />
    <Route path="/tasks" element={<Navigate to="/task-list" replace />} />
    <Route path="/alliances" element={<Navigate to="/coalitions" replace />} />
    <Route path="/rideshare" element={<Navigate to="/rideshare-routes" replace />} />
    <Route path="/fleet" element={<Navigate to="/local-wheels" replace />} />
    <Route path="/vehicle-sharing" element={<Navigate to="/lemon-lot" replace />} />
    <Route path="/adapt" element={<Navigate to="/adapt-score" replace />} />
    <Route path="/effectiveness" element={<Navigate to="/adapt-score" replace />} />

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

    {/* Legal pages */}
    <Route path="/terms" element={<LazyPage><TermsOfService /></LazyPage>} />
    <Route path="/terms/membership" element={<Navigate to="/member-agreement" replace />} />
    <Route path="/privacy" element={<LazyPage><PrivacyPolicy /></LazyPage>} />
    <Route path="/member-agreement" element={<LazyPage><MemberAgreement /></LazyPage>} />

    {/* Misc pages */}
    <Route path="/santa" element={<ProtectedRoute><LazyPage><SantaEverAfter /></LazyPage></ProtectedRoute>} />

    {/* Catch-all */}
    <Route path="*" element={<LazyPage><NotFound /></LazyPage>} />
  </>
);
