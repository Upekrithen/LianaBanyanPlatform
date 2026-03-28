import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const CueCardDeckPage = lazy(() => import("@/pages/CueCardDeckPage"));
const DeckCardStudio = lazy(() => import("@/pages/DeckCardStudio"));
const DeckCollection = lazy(() => import("@/pages/DeckCollection"));
const ScrollForgePage = lazy(() => import("@/pages/ScrollForgePage"));
const TheHelm = lazy(() => import("@/pages/TheHelm"));
const HelmPage = lazy(() => import("@/pages/HelmPage"));
const BeaconExplainer = lazy(() => import("@/pages/BeaconExplainer"));
const WildfireRunsPage = lazy(() => import("@/pages/WildfireRunsPage"));
const TreasureMap = lazy(() => import("@/pages/TreasureMap"));
const CraftTreasureMapPage = lazy(() => import("@/pages/CraftTreasureMapPage"));
const TreasureMaps = lazy(() => import("@/pages/TreasureMaps"));
const TreasureMapGuide = lazy(() => import("@/pages/TreasureMapGuide"));
const TreasureMapGame = lazy(() => import("@/pages/TreasureMapGame"));
const TreasureMapCreator = lazy(() => import("@/pages/TreasureMapCreator"));
const BeaconRunCreator = lazy(() => import("@/pages/BeaconRunCreator"));
const GoldenKeyQuest = lazy(() => import("@/pages/GoldenKeyQuest"));
const CrowsNest = lazy(() => import("@/pages/CrowsNest"));
const LookingGlass = lazy(() => import("@/pages/LookingGlass"));
const DMKeepSystem = lazy(() => import("@/pages/DMKeepSystem"));
const CueCardShare = lazy(() => import("@/pages/CueCardShare"));
const CueCardLanding = lazy(() => import("@/pages/CueCardLanding"));
const CueCardCampaignLibrary = lazy(() => import("@/pages/CueCardCampaignLibrary"));
const CueCardCampaignDetailPage = lazy(() => import("@/pages/CueCardCampaignDetailPage"));
const BifrostCardBuilder = lazy(() => import("@/pages/BifrostCardBuilder"));
const StorefrontBuilder = lazy(() => import("@/pages/tools/StorefrontBuilder"));
const CueCardGenerator = lazy(() => import("@/pages/tools/CueCardGenerator"));
const CueCardGeneratorV2 = lazy(() => import("@/pages/tools/CueCardGeneratorV2"));
const ContingencyOperatorsPage = lazy(() => import("@/pages/ContingencyOperatorsPage"));
const CrankIt = lazy(() => import("@/pages/CrankIt"));
const ThoughtExperiment = lazy(() => import("@/pages/ThoughtExperiment"));
const BusinessPlanGenerator = lazy(() => import("@/pages/BusinessPlanGenerator"));
const BusinessPlan = lazy(() => import("@/pages/BusinessPlan"));
const PiggybackSubmitPage = lazy(() => import("@/pages/PiggybackSubmitPage"));
const Simulator = lazy(() => import("@/pages/Simulator"));

// Cue card landing pages
const TowerOfPeace = lazy(() => import("@/pages/cue-cards/TowerOfPeace"));
const CueCardSponsorPortal = lazy(() => import("@/pages/cue-cards/SponsorPortal"));
const CueCardDurinsDoor = lazy(() => import("@/pages/cue-cards/DurinsDoor"));
const Canada40K = lazy(() => import("@/pages/cue-cards/Canada40K"));
const WildfireBeaconRun = lazy(() => import("@/pages/cue-cards/WildfireBeaconRun"));
const HallOfRecords = lazy(() => import("@/pages/cue-cards/HallOfRecords"));
const MainlandHub = lazy(() => import("@/pages/cue-cards/MainlandHub"));
const CodeBreakersHub = lazy(() => import("@/pages/cue-cards/CodeBreakersHub"));
const BusinessCardPortal = lazy(() => import("@/pages/cue-cards/BusinessCardPortal"));

export const toolsRoutes = (
  <>
    <Route path="/cue-cards" element={<ExplorerRoute><LazyPage><CueCardDeckPage /></LazyPage></ExplorerRoute>} />
    <Route path="/deck-card-studio" element={<ExplorerRoute><LazyPage><DeckCardStudio /></LazyPage></ExplorerRoute>} />
    <Route path="/hofund" element={<ExplorerRoute><LazyPage><DeckCardStudio /></LazyPage></ExplorerRoute>} />
    <Route path="/cue-cards/campaigns" element={<ExplorerRoute><LazyPage><CueCardCampaignLibrary /></LazyPage></ExplorerRoute>} />
    <Route path="/cue-cards/campaigns/:slug" element={<ExplorerRoute><LazyPage><CueCardCampaignDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cue-cards/:cardType" element={<LazyPage><CueCardShare /></LazyPage>} />
    <Route path="/cue/:cardId" element={<LazyPage><CueCardLanding /></LazyPage>} />
    <Route path="/feathers" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/deck" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/cards" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/forge" element={<ExplorerRoute><LazyPage><ScrollForgePage /></LazyPage></ExplorerRoute>} />
    <Route path="/scroll-forge" element={<ExplorerRoute><LazyPage><ScrollForgePage /></LazyPage></ExplorerRoute>} />
    <Route path="/the-helm" element={<ExplorerRoute><LazyPage><TheHelm /></LazyPage></ExplorerRoute>} />
    <Route path="/helm" element={<ExplorerRoute><LazyPage><TheHelm /></LazyPage></ExplorerRoute>} />
    <Route path="/beacons" element={<LazyPage><TheHelm /></LazyPage>} />
    <Route path="/beacon-explainer" element={<LazyPage><BeaconExplainer /></LazyPage>} />
    <Route path="/journey-map" element={<ExplorerRoute><LazyPage><HelmPage /></LazyPage></ExplorerRoute>} />
    <Route path="/beacon-runs" element={<ExplorerRoute><LazyPage><HelmPage /></LazyPage></ExplorerRoute>} />
    <Route path="/beacon-run/:slug" element={<ExplorerRoute><LazyPage><HelmPage /></LazyPage></ExplorerRoute>} />
    <Route path="/wildfire-runs" element={<ExplorerRoute><LazyPage><WildfireRunsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/wildfire-run/:slug" element={<ExplorerRoute><LazyPage><WildfireRunsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/magic-carpet" element={<ExplorerRoute><LazyPage><WildfireRunsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/treasure-map" element={<LazyPage><TreasureMap /></LazyPage>} />
    <Route path="/treasure-map/:slug" element={<LazyPage><CraftTreasureMapPage /></LazyPage>} />
    <Route path="/treasure-maps" element={<LazyPage><TreasureMaps /></LazyPage>} />
    <Route path="/treasure-maps/:mapId" element={<LazyPage><TreasureMapGuide /></LazyPage>} />
    <Route path="/treasure-map-game" element={<LazyPage><TreasureMapGame /></LazyPage>} />
    <Route path="/52-cards" element={<LazyPage><TreasureMapGame /></LazyPage>} />
    <Route path="/card-hunt" element={<LazyPage><TreasureMapGame /></LazyPage>} />
    <Route path="/treasure-map/create" element={<LazyPage><TreasureMapCreator /></LazyPage>} />
    <Route path="/beacon-run/create" element={<ProtectedRoute><LazyPage><BeaconRunCreator /></LazyPage></ProtectedRoute>} />
    <Route path="/create-beacon-run" element={<ProtectedRoute><LazyPage><BeaconRunCreator /></LazyPage></ProtectedRoute>} />
    <Route path="/golden-key" element={<LazyPage><GoldenKeyQuest /></LazyPage>} />
    <Route path="/treasure-hunt" element={<LazyPage><GoldenKeyQuest /></LazyPage>} />
    <Route path="/crows-nest" element={<LazyPage><CrowsNest /></LazyPage>} />
    <Route path="/lookout" element={<Navigate to="/crows-nest" replace />} />
    <Route path="/flyover" element={<Navigate to="/crows-nest" replace />} />
    <Route path="/looking-glass" element={<LazyPage><LookingGlass /></LazyPage>} />
    <Route path="/glass" element={<LazyPage><LookingGlass /></LazyPage>} />
    <Route path="/gas-tracking" element={<ProtectedRoute><LazyPage><LookingGlass /></LazyPage></ProtectedRoute>} />
    <Route path="/dm-keep" element={<ExplorerRoute><LazyPage><DMKeepSystem /></LazyPage></ExplorerRoute>} />
    <Route path="/bifrost" element={<ProtectedRoute><LazyPage><BifrostCardBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/card-builder" element={<ProtectedRoute><LazyPage><BifrostCardBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/tools/storefront-builder" element={<ProtectedRoute><LazyPage><StorefrontBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/tools/cue-card-generator" element={<ProtectedRoute><LazyPage><CueCardGenerator /></LazyPage></ProtectedRoute>} />
    <Route path="/tools/card-generator" element={<ProtectedRoute><LazyPage><CueCardGeneratorV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/contingency-operators" element={<ProtectedRoute><LazyPage><ContingencyOperatorsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/thought-experiments" element={<ProtectedRoute><LazyPage><ContingencyOperatorsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/co" element={<ProtectedRoute><LazyPage><ContingencyOperatorsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/crank-it" element={<LazyPage><CrankIt /></LazyPage>} />
    <Route path="/cold-start" element={<LazyPage><CrankIt /></LazyPage>} />
    <Route path="/thought-experiment" element={<LazyPage><ThoughtExperiment /></LazyPage>} />
    <Route path="/what-if" element={<LazyPage><ThoughtExperiment /></LazyPage>} />
    <Route path="/business-plan-generator" element={<ProtectedRoute><LazyPage><BusinessPlanGenerator /></LazyPage></ProtectedRoute>} />
    <Route path="/business-plan" element={<ProtectedRoute><LazyPage><BusinessPlan /></LazyPage></ProtectedRoute>} />
    <Route path="/docs/business-plan" element={<ProtectedRoute><LazyPage><BusinessPlan /></LazyPage></ProtectedRoute>} />
    <Route path="/piggyback" element={<ProtectedRoute><LazyPage><PiggybackSubmitPage /></LazyPage></ProtectedRoute>} />
    <Route path="/simulator" element={<ProtectedRoute><LazyPage><Simulator /></LazyPage></ProtectedRoute>} />

    {/* Cue card landing pages */}
    <Route path="/tower-of-peace" element={<LazyPage><TowerOfPeace /></LazyPage>} />
    <Route path="/cue/sponsor" element={<LazyPage><CueCardSponsorPortal /></LazyPage>} />
    <Route path="/cue/durins-door" element={<LazyPage><CueCardDurinsDoor /></LazyPage>} />
    <Route path="/canada40k" element={<LazyPage><Canada40K /></LazyPage>} />
    <Route path="/beacon" element={<LazyPage><WildfireBeaconRun /></LazyPage>} />
    <Route path="/hall-of-records" element={<LazyPage><HallOfRecords /></LazyPage>} />
    <Route path="/mainland" element={<LazyPage><MainlandHub /></LazyPage>} />
    <Route path="/bounties" element={<LazyPage><CodeBreakersHub /></LazyPage>} />
    <Route path="/business-cards" element={<LazyPage><BusinessCardPortal /></LazyPage>} />
  </>
);
