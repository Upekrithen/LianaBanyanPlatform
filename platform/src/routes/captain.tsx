import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute, CaptainRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const CaptainLanding = lazy(() => import("@/pages/CaptainLanding"));
const CaptainOnboardingPage = lazy(() => import("@/pages/CaptainOnboardingPage"));
const CaptainDashboardPage = lazy(() => import("@/pages/CaptainDashboardPage"));
const ShipMedallionPage = lazy(() => import("@/pages/ShipMedallionPage"));
const NodeCaptainPage = lazy(() => import("@/pages/NodeCaptain"));
const StarChamber = lazy(() => import("@/pages/StarChamber"));
const StarChamberV2Page = lazy(() => import("@/pages/StarChamberV2Page"));
const Castle = lazy(() => import("@/pages/Castle"));
const Governance = lazy(() => import("@/pages/Governance"));
const ProposalsListing = lazy(() => import("@/pages/ProposalsListing"));
const ProposalDetail = lazy(() => import("@/pages/ProposalDetail"));
const The300Page = lazy(() => import("@/pages/The300Page"));
const PedestalDetailPage = lazy(() => import("@/pages/PedestalDetailPage"));
// Wave 11 governance pages
const VotingPage = lazy(() => import("@/pages/VotingPage"));
const GovernanceStarChamberPage = lazy(() => import("@/pages/GovernanceStarChamberPage"));
const GovernancePedestalPage = lazy(() => import("@/pages/GovernancePedestalPage"));
const GovernanceAuditPage = lazy(() => import("@/pages/GovernanceAuditPage"));
const Senate = lazy(() => import("@/pages/Senate"));
const HallOfInnovations = lazy(() => import("@/pages/HallOfInnovations"));
const StewardDashboard = lazy(() => import("@/pages/StewardDashboard"));
const StewardApply = lazy(() => import("@/pages/StewardApply"));
const StewardLegalDashboard = lazy(() => import("@/pages/StewardLegalDashboard"));
const Petitions = lazy(() => import("@/pages/Petitions"));
const PoliticalExpeditionPage = lazy(() => import("@/pages/PoliticalExpedition"));
const PoliticalExpeditionV2Page = lazy(() => import("@/pages/PoliticalExpeditionV2Page"));
const ColdStartDashboard = lazy(() => import("@/pages/ColdStartDashboard"));
const BecomeCaptain = lazy(() => import("@/pages/BecomeCaptain"));
const TreasureMapBuilder = lazy(() => import("@/pages/TreasureMapBuilder"));
const IncumbentAdvantage = lazy(() => import("@/pages/IncumbentAdvantage"));

export const captainRoutes = (
  <>
    <Route path="/captain" element={<CaptainRoute><LazyPage><CaptainDashboardPage /></LazyPage></CaptainRoute>} />
    <Route path="/captain/landing" element={<LazyPage><CaptainLanding /></LazyPage>} />
    <Route path="/captain/become" element={<ProtectedRoute><LazyPage><CaptainOnboardingPage /></LazyPage></ProtectedRoute>} />
    <Route path="/captain/dashboard" element={<CaptainRoute><LazyPage><CaptainDashboardPage /></LazyPage></CaptainRoute>} />
    <Route path="/captain/medallion" element={<LazyPage><ShipMedallionPage /></LazyPage>} />
    <Route path="/node-captain" element={<ProtectedRoute><LazyPage><NodeCaptainPage /></LazyPage></ProtectedRoute>} />
    <Route path="/star-chamber" element={<ProtectedRoute><LazyPage><StarChamberV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/star-chamber/legacy" element={<ProtectedRoute><LazyPage><StarChamber /></LazyPage></ProtectedRoute>} />
    <Route path="/castle" element={<LazyPage><Castle /></LazyPage>} />
    <Route path="/governance" element={<LazyPage><Governance /></LazyPage>} />
    <Route path="/governance/proposals" element={<ExplorerRoute><LazyPage><ProposalsListing /></LazyPage></ExplorerRoute>} />
    <Route path="/governance/proposals/:id" element={<LazyPage><ProposalDetail /></LazyPage>} />
    {/* Wave 11 governance sub-pages */}
    <Route path="/governance/voting" element={<ProtectedRoute><LazyPage><VotingPage /></LazyPage></ProtectedRoute>} />
    <Route path="/governance/star-chamber" element={<ProtectedRoute><LazyPage><GovernanceStarChamberPage /></LazyPage></ProtectedRoute>} />
    <Route path="/governance/pedestal" element={<ProtectedRoute><LazyPage><GovernancePedestalPage /></LazyPage></ProtectedRoute>} />
    <Route path="/governance/audit" element={<ProtectedRoute><LazyPage><GovernanceAuditPage /></LazyPage></ProtectedRoute>} />
    <Route path="/the-300" element={<LazyPage><Governance /></LazyPage>} />
    <Route path="/star-chamber-legacy" element={<LazyPage><Governance /></LazyPage>} />
    <Route path="/the300" element={<LazyPage><The300Page /></LazyPage>} />
    <Route path="/the300/:pedestalId" element={<LazyPage><PedestalDetailPage /></LazyPage>} />
    <Route path="/senate" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/tower" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/tower/:level" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/records" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/innovations" element={<ExplorerRoute><LazyPage><HallOfInnovations /></LazyPage></ExplorerRoute>} />
    <Route path="/hall-of-innovations" element={<ExplorerRoute><LazyPage><HallOfInnovations /></LazyPage></ExplorerRoute>} />
    <Route path="/innovations" element={<ExplorerRoute><LazyPage><HallOfInnovations /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/projects" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/senate/saltmines" element={<ExplorerRoute><LazyPage><Senate /></LazyPage></ExplorerRoute>} />
    <Route path="/steward" element={<ProtectedRoute><LazyPage><StewardDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/steward/apply" element={<ProtectedRoute><LazyPage><StewardApply /></LazyPage></ProtectedRoute>} />
    <Route path="/steward/legal-formations" element={<ProtectedRoute><LazyPage><StewardLegalDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/petitions" element={<LazyPage><Petitions /></LazyPage>} />
    <Route path="/political-expedition" element={<ProtectedRoute><LazyPage><PoliticalExpeditionV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/political-expedition/legacy" element={<ExplorerRoute><LazyPage><PoliticalExpeditionPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cold-start-dashboard" element={<LazyPage><ColdStartDashboard /></LazyPage>} />
    <Route path="/become-captain/:initiativeId" element={<LazyPage><BecomeCaptain /></LazyPage>} />
    <Route path="/cold-start/:initiativeId" element={<LazyPage><ColdStartDashboard /></LazyPage>} />
    <Route path="/create-map" element={<LazyPage><TreasureMapBuilder /></LazyPage>} />
    <Route path="/incumbent-advantage" element={<LazyPage><IncumbentAdvantage /></LazyPage>} />
  </>
);
