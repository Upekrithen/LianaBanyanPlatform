import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute, CaptainRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const Guilds = lazy(() => import("@/pages/Guilds"));
const GuildDirectoryV2Page = lazy(() => import("@/pages/GuildDirectoryV2Page"));
const GuildHub = lazy(() => import("@/pages/GuildHub"));
const GuildDetail = lazy(() => import("@/pages/GuildDetail"));
const GuildFormationWizard = lazy(() => import("@/components/GuildFormationWizard"));
const Tribes = lazy(() => import("@/pages/Tribes"));
const TribeDetail = lazy(() => import("@/pages/TribeDetail"));
const TribeFormationWizard = lazy(() => import("@/components/TribeFormationWizard"));
const PeerContracts = lazy(() => import("@/pages/PeerContracts"));
const CrewNewPage = lazy(() => import("@/pages/CrewNewPage"));
const CrewDashboard = lazy(() => import("@/pages/CrewDashboard"));
const CrewInvite = lazy(() => import("@/pages/CrewInvite"));
const AmbassadorRegistration = lazy(() => import("@/pages/AmbassadorRegistration"));
const AmbassadorDashboard = lazy(() => import("@/pages/AmbassadorDashboard"));
const AmbassadorWalkthrough = lazy(() => import("@/pages/AmbassadorWalkthrough"));
const AmbassadorChainPage = lazy(() => import("@/pages/AmbassadorChainPage"));
const AmbassadorPortfolio = lazy(() => import("@/pages/AmbassadorPortfolio"));
const AmbassadorCertification = lazy(() => import("@/pages/AmbassadorCertification"));
const ReviewerApplication = lazy(() => import("@/pages/ReviewerApplication"));
const ReviewerDashboard = lazy(() => import("@/pages/ReviewerDashboard"));
const ReviewQueueItemPage = lazy(() => import("@/pages/ReviewQueueItemPage"));
const CoalitionDirectory = lazy(() => import("@/pages/CoalitionDirectory"));
const CoalitionManagementV2Page = lazy(() => import("@/pages/CoalitionManagementV2Page"));
const CoalitionCreate = lazy(() => import("@/pages/CoalitionCreate"));
const CoalitionDetail = lazy(() => import("@/pages/CoalitionDetail"));
const CoalitionsPage = lazy(() => import("@/pages/Coalitions"));
const ChainDashboard = lazy(() => import("@/pages/ChainDashboard"));
const ChainVoting = lazy(() => import("@/pages/ChainVoting"));
const VouchSystem = lazy(() => import("@/pages/VouchSystem"));
const SocialImportPage = lazy(() => import("@/pages/SocialImportPage"));
const FamilyPage = lazy(() => import("@/pages/FamilyPage"));
const FamilyDetailPage = lazy(() => import("@/pages/FamilyDetailPage"));
const TribeDirectoryV2Page = lazy(() => import("@/pages/TribeDirectoryV2Page"));
const DesignCrewPage = lazy(() => import("@/pages/DesignCrewPage"));
const CrewTablesPage = lazy(() => import("@/pages/CrewTables"));
const RoundTableHall = lazy(() => import("@/pages/RoundTableHall"));
const CoverageMinutesDashboard = lazy(() => import("@/pages/CoverageMinutesDashboard"));
const PedestalBrowser = lazy(() => import("@/pages/PedestalBrowser"));
const PhaseMimicTrunkManager = lazy(() => import("@/pages/PhaseMimicTrunkManager"));
const RealWorldPuzzles = lazy(() => import("@/pages/RealWorldPuzzles"));
const GuildPhaseManager = lazy(() => import("@/pages/GuildPhaseManager"));
const ConcentricCircles = lazy(() => import("@/pages/ConcentricCircles"));
const CrewmanDashboardPage = lazy(() => import("@/pages/CrewmanDashboardPage"));
const RolodexPage = lazy(() => import("@/pages/RolodexPage"));
const AffiliationBadgesPage = lazy(() => import("@/pages/AffiliationBadgesPage"));
const PioneerProposalsPage = lazy(() => import("@/pages/PioneerProposalsPage"));
// The Roll — BP044 W1 cooperative-class peer-mesh ratification (supersedes /council/)
const RollPage = lazy(() => import("@/pages/RollPage"));
const RollNominatePage = lazy(() => import("@/pages/RollNominatePage"));

export const socialRoutes = (
  <>
    <Route path="/guilds" element={<ProtectedRoute><LazyPage><GuildDirectoryV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/guilds/legacy" element={<ProtectedRoute><LazyPage><Guilds /></LazyPage></ProtectedRoute>} />
    <Route path="/guilds/create" element={<ProtectedRoute><LazyPage><GuildFormationWizard /></LazyPage></ProtectedRoute>} />
    <Route path="/guilds/hub" element={<ExplorerRoute><LazyPage><GuildHub /></LazyPage></ExplorerRoute>} />
    <Route path="/guilds/:slug" element={<ExplorerRoute><LazyPage><GuildDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/tribes" element={<ProtectedRoute><LazyPage><TribeDirectoryV2Page /></LazyPage></ProtectedRoute>} />
    <Route path="/tribes/legacy" element={<ProtectedRoute><LazyPage><Tribes /></LazyPage></ProtectedRoute>} />
    <Route path="/tribes/create" element={<ProtectedRoute><LazyPage><TribeFormationWizard /></LazyPage></ProtectedRoute>} />
    <Route path="/tribes/:slug" element={<ExplorerRoute><LazyPage><TribeDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/clans" element={<ProtectedRoute><LazyPage><Tribes /></LazyPage></ProtectedRoute>} />
    <Route path="/peer-contracts" element={<ProtectedRoute><LazyPage><PeerContracts /></LazyPage></ProtectedRoute>} />
    <Route path="/crew/new" element={<ExplorerRoute><LazyPage><CrewNewPage /></LazyPage></ExplorerRoute>} />
    <Route path="/crew/:crewId" element={<ProtectedRoute><LazyPage><CrewDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/crew/:crewId/invite" element={<LazyPage><CrewInvite /></LazyPage>} />
    <Route path="/crew/design" element={<LazyPage><DesignCrewPage /></LazyPage>} />
    <Route path="/ambassador/register" element={<ProtectedRoute><LazyPage><AmbassadorRegistration /></LazyPage></ProtectedRoute>} />
    <Route path="/ambassador/dashboard" element={<ProtectedRoute><LazyPage><AmbassadorDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/ambassador/walkthrough" element={<ProtectedRoute><LazyPage><AmbassadorWalkthrough /></LazyPage></ProtectedRoute>} />
    <Route path="/ambassador/chain" element={<LazyPage><AmbassadorChainPage /></LazyPage>} />
    <Route path="/ambassador/portfolio/:ambassadorId" element={<LazyPage><AmbassadorPortfolio /></LazyPage>} />
    <Route path="/ambassador/certify" element={<ProtectedRoute><LazyPage><AmbassadorCertification /></LazyPage></ProtectedRoute>} />
    <Route path="/reviewer/apply" element={<ProtectedRoute><LazyPage><ReviewerApplication /></LazyPage></ProtectedRoute>} />
    <Route path="/reviewer/dashboard" element={<ProtectedRoute><LazyPage><ReviewerDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/reviewer/queue/:id" element={<ProtectedRoute><LazyPage><ReviewQueueItemPage /></LazyPage></ProtectedRoute>} />
    <Route path="/coalitions" element={<CaptainRoute><LazyPage><CoalitionManagementV2Page /></LazyPage></CaptainRoute>} />
    <Route path="/coalitions/legacy" element={<ExplorerRoute><LazyPage><CoalitionDirectory /></LazyPage></ExplorerRoute>} />
    <Route path="/coalitions/create" element={<ProtectedRoute><LazyPage><CoalitionCreate /></LazyPage></ProtectedRoute>} />
    <Route path="/coalitions/:slug" element={<ExplorerRoute><LazyPage><CoalitionDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/chain" element={<ExplorerRoute><LazyPage><ChainDashboard /></LazyPage></ExplorerRoute>} />
    <Route path="/chain-voting" element={<LazyPage><ChainVoting /></LazyPage>} />
    <Route path="/vouch" element={<ProtectedRoute><LazyPage><VouchSystem /></LazyPage></ProtectedRoute>} />
    <Route path="/import" element={<ProtectedRoute><LazyPage><SocialImportPage /></LazyPage></ProtectedRoute>} />
    <Route path="/family" element={<ExplorerRoute><LazyPage><FamilyPage /></LazyPage></ExplorerRoute>} />
    <Route path="/family/:familyId" element={<ProtectedRoute><LazyPage><FamilyDetailPage /></LazyPage></ProtectedRoute>} />
    <Route path="/family/:familyId/gifts" element={<ProtectedRoute><LazyPage><FamilyDetailPage /></LazyPage></ProtectedRoute>} />
    <Route path="/family/:familyId/calendar" element={<ProtectedRoute><LazyPage><FamilyDetailPage /></LazyPage></ProtectedRoute>} />
    <Route path="/crew-tables" element={<ExplorerRoute><LazyPage><CrewTablesPage /></LazyPage></ExplorerRoute>} />
    <Route path="/round-tables" element={<LazyPage><RoundTableHall /></LazyPage>} />
    <Route path="/coverage-minutes" element={<LazyPage><CoverageMinutesDashboard /></LazyPage>} />
    <Route path="/pedestals" element={<LazyPage><PedestalBrowser /></LazyPage>} />
    <Route path="/phase-mimictrunks" element={<LazyPage><PhaseMimicTrunkManager /></LazyPage>} />
    <Route path="/real-world-puzzles" element={<LazyPage><RealWorldPuzzles /></LazyPage>} />
    <Route path="/guild-phases" element={<LazyPage><GuildPhaseManager /></LazyPage>} />
    <Route path="/testing/circles" element={<ProtectedRoute><LazyPage><ConcentricCircles /></LazyPage></ProtectedRoute>} />
    <Route path="/crewman/dashboard" element={<ProtectedRoute><LazyPage><CrewmanDashboardPage /></LazyPage></ProtectedRoute>} />
    <Route path="/rolodex" element={<ProtectedRoute><LazyPage><RolodexPage /></LazyPage></ProtectedRoute>} />
    <Route path="/badges" element={<ProtectedRoute><LazyPage><AffiliationBadgesPage /></LazyPage></ProtectedRoute>} />
    <Route path="/pioneer" element={<ProtectedRoute><LazyPage><PioneerProposalsPage /></LazyPage></ProtectedRoute>} />
    {/* The Roll — BP044 W1 cooperative-class peer-mesh ratification */}
    <Route path="/roll" element={<LazyPage><RollPage /></LazyPage>} />
    <Route path="/roll/nominate" element={<ProtectedRoute><LazyPage><RollNominatePage /></LazyPage></ProtectedRoute>} />
    {/* Legacy /council/ redirect to /roll/ */}
    <Route path="/council" element={<Navigate to="/roll" replace />} />
  </>
);
