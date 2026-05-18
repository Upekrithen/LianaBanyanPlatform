import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

// Bushel 8 — LB Frame Substrate UI (BP021)
const SubstrateBrowserPage = lazy(() => import("@/pages/helm/SubstrateBrowserPage"));
const BushelDashboard = lazy(() => import("@/pages/helm/BushelDashboard"));
const SubstrateHealthDashboard = lazy(() => import("@/pages/helm/SubstrateHealthDashboard"));
const CodexReader = lazy(() => import("@/pages/museum/CodexReader"));
// Bushel 19 — Scales/Bouncer/Judge Member-Visible Verdict UX (BP021)
const MyVerdictHistoryPage = lazy(() => import("@/pages/helm/MyVerdictHistoryPage"));
const MyMinerGradingPage = lazy(() => import("@/pages/helm/MyMinerGradingPage"));
const ScalesRubricPage = lazy(() => import("@/pages/helm/ScalesRubricPage"));

// Bushel 27 — Red/Blue Team Competition + IP Ledger Stamp Surface (BP022)
const RedBlueLeaderboard = lazy(() => import("@/pages/helm/RedBlueLeaderboard"));
const RedBlueTeamDetail = lazy(() => import("@/pages/helm/RedBlueTeamDetail"));
const RedBlueMemberDetail = lazy(() => import("@/pages/helm/RedBlueMemberDetail"));

const CueCardDeckPage = lazy(() => import("@/pages/CueCardDeckPage"));
const DeckCardStudio = lazy(() => import("@/pages/DeckCardStudio"));
const DeckCollection = lazy(() => import("@/pages/DeckCollection"));
const ScrollForgePage = lazy(() => import("@/pages/ScrollForgePage"));
const TheHelm = lazy(() => import("@/pages/TheHelm"));
const HelmPage = lazy(() => import("@/pages/HelmPage"));
const BeaconWalletPage = lazy(() => import("@/pages/BeaconWalletPage"));
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
const CueCardShareLanding = lazy(() => import("@/pages/CueCardShareLanding"));
const CueCardCampaignLibrary = lazy(() => import("@/pages/CueCardCampaignLibrary"));
const CueCardCampaignDetailPage = lazy(() => import("@/pages/CueCardCampaignDetailPage"));
const BifrostCardBuilder = lazy(() => import("@/pages/BifrostCardBuilder"));
const StorefrontBuilder = lazy(() => import("@/pages/tools/StorefrontBuilderV2"));
const CueCardCreatorV2 = lazy(() => import("@/pages/tools/CueCardCreatorV2"));
const CueCardGenerator = lazy(() => import("@/pages/tools/CueCardGenerator"));
const CueCardGeneratorV2 = lazy(() => import("@/pages/tools/CueCardGeneratorV2"));
const DispatchComposeV2 = lazy(() => import("@/pages/tools/DispatchComposeV2"));
const TreasureMapBuilderV2 = lazy(() => import("@/pages/tools/TreasureMapBuilderV2"));
const BeaconRunCreatorV2 = lazy(() => import("@/pages/tools/BeaconRunCreatorV2"));
const DispatchQueuePage = lazy(() => import("@/pages/DispatchQueuePage"));
const ContingencyOperatorsPage = lazy(() => import("@/pages/ContingencyOperatorsPage"));
const CrankIt = lazy(() => import("@/pages/CrankIt"));
const ThoughtExperiment = lazy(() => import("@/pages/ThoughtExperiment"));
const BusinessPlanGenerator = lazy(() => import("@/pages/BusinessPlanGenerator"));
const BusinessPlan = lazy(() => import("@/pages/BusinessPlan"));
const PiggybackSubmitPage = lazy(() => import("@/pages/PiggybackSubmitPage"));
const Simulator = lazy(() => import("@/pages/Simulator"));
const PathFinderPage = lazy(() => import("@/pages/PathFinderPage"));
const ChallengePage = lazy(() => import("@/pages/ChallengePage"));
const ResourceBoardPage = lazy(() => import("@/pages/ResourceBoardPage"));
const HelmContentCenter = lazy(() => import("@/pages/HelmContentCenter"));
const SpiceEditorPage = lazy(() => import("@/pages/staff/SpiceEditorPage"));
const LaunchSchedulePage = lazy(() => import("@/pages/staff/LaunchSchedulePage"));
const SocialMediaDashboard = lazy(() => import("@/pages/staff/SocialMediaDashboard"));
const FounderContactDashboard = lazy(() => import("@/pages/staff/FounderContactDashboard"));
const ChapterEngagementInput = lazy(() => import("@/pages/staff/ChapterEngagementInput"));
const EngagementIngestionMonitor = lazy(() => import("@/pages/staff/EngagementIngestionMonitor"));
const V2RedesignTracker = lazy(() => import("@/pages/staff/V2RedesignTracker"));
const V2PrimitivesPage = lazy(() => import("@/pages/staff/V2PrimitivesPage"));
const PuddingAnalyticsPage = lazy(() => import("@/pages/staff/PuddingAnalyticsPage"));
const BatteryDispatchAccessAudit = lazy(() => import("@/pages/staff/BatteryDispatchAccessAudit"));
const FounderSavingsDashboard = lazy(() => import("@/pages/FounderSavingsDashboard"));

// SAGA 10 BP046B — Hub Source /hub/ai-models/
const AIModelsHubPage = lazy(() => import("@/pages/hub/AIModelsHubPage"));

// SAGA 15 BP046B — /gauntlet/variants/ category
const GauntletVariantsPage = lazy(() => import("@/pages/gauntlet/GauntletVariantsPage"));

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
    <Route path="/cue-cards/create" element={<ProtectedRoute><LazyPage><CueCardCreatorV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-cards/:cardType" element={<LazyPage><CueCardShare /></LazyPage>} />
    <Route path="/cue/:cardId" element={<LazyPage><CueCardLanding /></LazyPage>} />
    <Route path="/c/:shortCode" element={<LazyPage><CueCardShareLanding /></LazyPage>} />
    <Route path="/feathers" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/deck" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/cards" element={<ExplorerRoute><LazyPage><DeckCollection /></LazyPage></ExplorerRoute>} />
    <Route path="/forge" element={<ExplorerRoute><LazyPage><ScrollForgePage /></LazyPage></ExplorerRoute>} />
    <Route path="/scroll-forge" element={<ExplorerRoute><LazyPage><ScrollForgePage /></LazyPage></ExplorerRoute>} />
    <Route path="/the-helm" element={<ExplorerRoute><LazyPage><TheHelm /></LazyPage></ExplorerRoute>} />
    <Route path="/helm" element={<ExplorerRoute><LazyPage><TheHelm /></LazyPage></ExplorerRoute>} />
    <Route path="/helm/beacons" element={<ProtectedRoute><LazyPage><BeaconWalletPage /></LazyPage></ProtectedRoute>} />
    <Route path="/beacons" element={<LazyPage><TheHelm /></LazyPage>} />
    <Route path="/beacons/create" element={<ProtectedRoute><LazyPage><BeaconRunCreatorV2 /></LazyPage></ProtectedRoute>} />
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
    <Route path="/treasure-maps/builder" element={<ProtectedRoute><LazyPage><TreasureMapBuilderV2 /></LazyPage></ProtectedRoute>} />
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
    <Route path="/storefront/builder" element={<ProtectedRoute><LazyPage><StorefrontBuilder /></LazyPage></ProtectedRoute>} />
    <Route path="/tools/cue-card-generator" element={<ProtectedRoute><LazyPage><CueCardGenerator /></LazyPage></ProtectedRoute>} />
    <Route path="/tools/card-generator" element={<ProtectedRoute><LazyPage><CueCardGeneratorV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/dispatch/compose" element={<ProtectedRoute><LazyPage><DispatchComposeV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/dispatch/queue" element={<ProtectedRoute><LazyPage><DispatchQueuePage /></LazyPage></ProtectedRoute>} />
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
    <Route path="/pathfinder" element={<LazyPage><PathFinderPage /></LazyPage>} />
    <Route path="/challenge/:slug" element={<LazyPage><ChallengePage /></LazyPage>} />
    <Route path="/say-it-fast" element={<Navigate to="/challenge/say-it-fast" replace />} />
    <Route path="/bounty/photography" element={<Navigate to="/bounty-photography" replace />} />
    <Route path="/resource-board" element={<ExplorerRoute><LazyPage><ResourceBoardPage /></LazyPage></ExplorerRoute>} />
    <Route path="/pearl-diver" element={<ExplorerRoute><LazyPage><ResourceBoardPage /></LazyPage></ExplorerRoute>} />
    <Route path="/deals" element={<ExplorerRoute><LazyPage><ResourceBoardPage /></LazyPage></ExplorerRoute>} />
    <Route path="/helm/content" element={<ProtectedRoute><LazyPage><HelmContentCenter /></LazyPage></ProtectedRoute>} />
    {/* K-LB-Frame-Speak-Friend-BP010: /helm/library — extension "Open Library" Helm-path wiring */}
    <Route path="/helm/library" element={<ProtectedRoute><LazyPage><HelmContentCenter /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/spice-editor" element={<ProtectedRoute><LazyPage><SpiceEditorPage /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/launch-schedule" element={<ProtectedRoute><LazyPage><LaunchSchedulePage /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/social-media" element={<ProtectedRoute><LazyPage><SocialMediaDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/founder-contacts" element={<ProtectedRoute><LazyPage><FounderContactDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/chapter-engagement" element={<ProtectedRoute><LazyPage><ChapterEngagementInput /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/engagement-ingestion" element={<ProtectedRoute><LazyPage><EngagementIngestionMonitor /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/pudding-analytics" element={<ProtectedRoute><LazyPage><PuddingAnalyticsPage /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/v2-tracker" element={<ProtectedRoute><LazyPage><V2RedesignTracker /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/v2-primitives" element={<ProtectedRoute><LazyPage><V2PrimitivesPage /></LazyPage></ProtectedRoute>} />
    <Route path="/staff/battery-dispatch-access" element={<ProtectedRoute><LazyPage><BatteryDispatchAccessAudit /></LazyPage></ProtectedRoute>} />
    <Route path="/founder-savings" element={<ProtectedRoute><LazyPage><FounderSavingsDashboard /></LazyPage></ProtectedRoute>} />

    {/* Bushel 8 — LB Frame Substrate UI (BP021) */}
    <Route path="/helm/substrate" element={<ProtectedRoute><LazyPage><SubstrateBrowserPage /></LazyPage></ProtectedRoute>} />
    <Route path="/helm/substrate/browser" element={<ProtectedRoute><LazyPage><SubstrateBrowserPage /></LazyPage></ProtectedRoute>} />
    <Route path="/helm/bushels" element={<ProtectedRoute><LazyPage><BushelDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/helm/substrate/health" element={<ProtectedRoute><LazyPage><SubstrateHealthDashboard /></LazyPage></ProtectedRoute>} />
    <Route path="/codex" element={<ProtectedRoute><LazyPage><CodexReader /></LazyPage></ProtectedRoute>} />
    <Route path="/codex/:codexId" element={<ProtectedRoute><LazyPage><CodexReader /></LazyPage></ProtectedRoute>} />

    {/* Bushel 19 — Scales/Bouncer/Judge Member-Visible Verdict UX (BP021) */}
    <Route path="/helm/verdicts" element={<ProtectedRoute><LazyPage><MyVerdictHistoryPage /></LazyPage></ProtectedRoute>} />
    <Route path="/helm/miner-grading" element={<ProtectedRoute><LazyPage><MyMinerGradingPage /></LazyPage></ProtectedRoute>} />
    <Route path="/helm/scales-rubric" element={<ProtectedRoute><LazyPage><ScalesRubricPage /></LazyPage></ProtectedRoute>} />

    {/* Bushel 27 — Red/Blue Team Competition + IP Ledger Stamp Surface (BP022) */}
    <Route path="/helm/red-blue-leaderboard" element={<ExplorerRoute><LazyPage><RedBlueLeaderboard /></LazyPage></ExplorerRoute>} />
    <Route path="/helm/red-blue-leaderboard/red" element={<ExplorerRoute><LazyPage><RedBlueTeamDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/helm/red-blue-leaderboard/blue" element={<ExplorerRoute><LazyPage><RedBlueTeamDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/helm/red-blue-leaderboard/member/:member_id" element={<ExplorerRoute><LazyPage><RedBlueMemberDetail /></LazyPage></ExplorerRoute>} />

    {/* SAGA 10 BP046B — Hub Source AI Models */}
    <Route path="/hub" element={<ExplorerRoute><LazyPage><AIModelsHubPage /></LazyPage></ExplorerRoute>} />
    <Route path="/hub/ai-models" element={<ExplorerRoute><LazyPage><AIModelsHubPage /></LazyPage></ExplorerRoute>} />
    <Route path="/hub/ai-models/" element={<ExplorerRoute><LazyPage><AIModelsHubPage /></LazyPage></ExplorerRoute>} />

    {/* SAGA 15 BP046B — Gauntlet Variants */}
    <Route path="/gauntlet" element={<ExplorerRoute><LazyPage><GauntletVariantsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/gauntlet/variants" element={<ExplorerRoute><LazyPage><GauntletVariantsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/gauntlet/variants/" element={<ExplorerRoute><LazyPage><GauntletVariantsPage /></LazyPage></ExplorerRoute>} />

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
