import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const HexIsle = lazy(() => import("@/pages/HexIsle"));
const HexIsleLandingV2Page = lazy(() => import("@/pages/HexIsleLandingV2Page"));
const HexIsleProjects = lazy(() => import("@/pages/HexIsleProjects"));
const CompanyIsland = lazy(() => import("@/pages/CompanyIsland"));
const HarvestIsland = lazy(() => import("@/pages/HarvestIsland"));
const TreasureIsland = lazy(() => import("@/pages/TreasureIsland"));
const IslandAssignmentBoard = lazy(() => import("@/pages/IslandAssignmentBoard"));
const IslandBuilderPage = lazy(() => import("@/pages/IslandBuilderPage"));
const IslandCreator = lazy(() => import("@/pages/IslandCreator"));
const IslandDesignPortfolio = lazy(() => import("@/pages/IslandDesignPortfolio"));
const IslandDetail = lazy(() => import("@/pages/IslandDetail"));
const IslandWorldMap = lazy(() => import("@/pages/IslandWorldMap"));
const HexIsleWorld3D = lazy(() => import("@/pages/HexIsleWorld3D"));
const HexIsleOverworld = lazy(() => import("@/pages/HexIsleOverworld"));
const HexelSlottedTopDetail = lazy(() => import("@/pages/HexelSlottedTopDetail"));
const HexelWeeklyDetail = lazy(() => import("@/pages/HexelWeeklyDetail"));
const HexIsleDownloads = lazy(() => import("@/pages/HexIsleDownloads"));
const HexIsleVote = lazy(() => import("@/pages/HexIsleVote"));
const HexIsleBattlePhilosophy = lazy(() => import("@/pages/HexIsleBattlePhilosophy"));
const HexIsleCueCard = lazy(() => import("@/pages/cue-cards/HexIsleCueCard"));
const HexIsleCampaignsPage = lazy(() => import("@/pages/HexIsleCampaignsPage"));
const KickstarterCampaignPage = lazy(() => import("@/pages/KickstarterCampaignPage"));
const HexIsleEncyclopedia = lazy(() => import("@/pages/HexIsleEncyclopedia"));
const HexIsleIslandPage = lazy(() => import("@/pages/HexIsleIslandPage"));
const FoundingRunLanding = lazy(() => import("@/pages/FoundingRunLanding"));
const PreOrderFlow = lazy(() => import("@/pages/PreOrderFlow"));
const GhostWorldMap = lazy(() => import("@/pages/GhostWorldMap"));
const HexisleDashboard = lazy(() => import("@/pages/HexisleDashboard"));
const KeepsLobby = lazy(() => import("@/pages/cue-cards/KeepsLobby"));
const HexIsleWorldCard = lazy(() => import("@/pages/cue-cards/HexIsleWorldCard"));
const HexIsleZoomPage = lazy(() => import("@/pages/HexIsleZoomPage"));

export const hexisleRoutes = (
  <>
    <Route path="/hexisle" element={<LazyPage><HexIsleLandingV2Page /></LazyPage>} />
    <Route path="/hexisle-game" element={<LazyPage><HexIsle /></LazyPage>} />
    <Route path="/hexisle/projects" element={<LazyPage><HexIsleProjects /></LazyPage>} />
    <Route path="/projects/hexisle" element={<LazyPage><HexIsleProjects /></LazyPage>} />
    <Route path="/hexisle/company" element={<LazyPage><CompanyIsland /></LazyPage>} />
    <Route path="/hexisle/harvest" element={<LazyPage><HarvestIsland /></LazyPage>} />
    <Route path="/hexisle/treasure" element={<LazyPage><TreasureIsland /></LazyPage>} />
    <Route path="/hexisle/assignments" element={<LazyPage><IslandAssignmentBoard /></LazyPage>} />
    <Route path="/hexisle/builder" element={<LazyPage><IslandBuilderPage /></LazyPage>} />
    <Route path="/hexisle/creator" element={<LazyPage><IslandCreator /></LazyPage>} />
    <Route path="/hexisle/portfolio" element={<LazyPage><IslandDesignPortfolio /></LazyPage>} />
    <Route path="/hexisle/island/:id" element={<LazyPage><IslandDetail /></LazyPage>} />
    <Route path="/hexisle/world-map" element={<LazyPage><IslandWorldMap /></LazyPage>} />
    <Route path="/hexisle/world-3d" element={<LazyPage><HexIsleWorld3D /></LazyPage>} />
    <Route path="/hexisle/zoom" element={<LazyPage><HexIsleZoomPage /></LazyPage>} />
    <Route path="/hexisle/overworld" element={<LazyPage><HexIsleOverworld /></LazyPage>} />
    <Route path="/hexisle/hexels/slotted-top" element={<LazyPage><HexelSlottedTopDetail /></LazyPage>} />
    <Route path="/hexisle/hexels/:slug" element={<LazyPage><HexelWeeklyDetail /></LazyPage>} />
    <Route path="/hexisle/downloads" element={<ExplorerRoute><LazyPage><HexIsleDownloads /></LazyPage></ExplorerRoute>} />
    <Route path="/hexisle/vote" element={<ExplorerRoute><LazyPage><HexIsleVote /></LazyPage></ExplorerRoute>} />
    <Route path="/hexisle/battle-philosophy" element={<LazyPage><HexIsleBattlePhilosophy /></LazyPage>} />
    <Route path="/cue-cards/hexisle" element={<LazyPage><HexIsleCueCard /></LazyPage>} />
    <Route path="/hexisle/campaigns" element={<LazyPage><HexIsleCampaignsPage /></LazyPage>} />
    <Route path="/hexisle/campaign/:slug" element={<LazyPage><KickstarterCampaignPage /></LazyPage>} />
    <Route path="/hexisle/founding-run" element={<LazyPage><FoundingRunLanding /></LazyPage>} />
    <Route path="/hexisle/founding-run/order" element={<ProtectedRoute><LazyPage><PreOrderFlow /></LazyPage></ProtectedRoute>} />
    <Route path="/hexisle/encyclopedia" element={<ExplorerRoute><LazyPage><HexIsleEncyclopedia /></LazyPage></ExplorerRoute>} />
    <Route path="/hexisle/:islandName" element={<ExplorerRoute><LazyPage><HexIsleIslandPage /></LazyPage></ExplorerRoute>} />
    <Route path="/hexisle/explore" element={<LazyPage><GhostWorldMap /></LazyPage>} />
    <Route path="/ghost-world/map" element={<LazyPage><GhostWorldMap /></LazyPage>} />
    <Route path="/hexisle-dashboard" element={<ProtectedRoute><LazyPage><HexisleDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/hexisle/keeps" element={<LazyPage><KeepsLobby /></LazyPage>} />
    <Route path="/cue/hexisle-world" element={<LazyPage><HexIsleWorldCard /></LazyPage>} />
  </>
);
