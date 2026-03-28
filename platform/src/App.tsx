import { useEffect, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { PaidMemberRoute } from "@/components/PaidMemberRoute";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import MoneyPenny from "./pages/MoneyPenny";
import Academy from "./pages/Academy";
import Index, { KeepView } from "./pages/Index";
import Auth from "./pages/Auth";
import TikTokCallback from "./pages/TikTokCallback";
import Dashboard from "./pages/Dashboard";
import CreatorDashboard from "./pages/CreatorDashboard";
import Projects from "./pages/Projects";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import CreateProject from "./pages/CreateProject";
import Marketplace from "./pages/Marketplace";
import Simulator from "./pages/Simulator";
import TaskLog from "./pages/TaskLog";
import SampleDataXML from "./pages/SampleDataXML";
import ProjectView from "./pages/ProjectView";
import ProductDetail from "./pages/ProductDetail";
import IndustryPricing from "./pages/IndustryPricing";
import TemplateSetup from "./pages/TemplateSetup";
import ContributionExplainer from "./pages/ContributionExplainer";
const BlockchainExplorer = lazy(() => import("./pages/BlockchainExplorer"));
const MedallionViewer = lazy(() => import("./pages/MedallionViewer"));
import Withdraw from "./pages/Withdraw";
import ReputationProfile from "./pages/ReputationProfile";
import ProfileSettings from "./pages/ProfileSettings";
import PeerContracts from "./pages/PeerContracts";
import Guilds from "./pages/Guilds";
import Tribes from "./pages/Tribes";
import BusinessPlanGenerator from "./pages/BusinessPlanGenerator";
import BusinessPlan from "./pages/BusinessPlan";
import PositionCategories from "./pages/PositionCategories";
import LBInternalPositions from "./pages/LBInternalPositions";
import ProductionQueue from "./pages/ProductionQueue";
import TaskList from "./pages/TaskList";
import MembershipSuccess from "./pages/MembershipSuccess";
import GuildStakeSuccess from "./pages/GuildStakeSuccess";
import CreditPurchaseSuccess from "./pages/CreditPurchaseSuccess";
import PreOrderSuccess from "./pages/PreOrderSuccess";
import MembershipConfirm from "./pages/MembershipConfirm";
import RoleManagement from "./pages/RoleManagement";
import CompanyIndependenceManager from "./pages/CompanyIndependenceManager";
import ContractScaleManager from "./pages/ContractScaleManager";
import ExternalServices from "./pages/ExternalServices";
import AdminServiceReview from "./pages/AdminServiceReview";
import The2ndSecondPortal from "./pages/The2ndSecondPortal";
import TransparentLedger from "./pages/TransparentLedger";
import DeveloperPortal from "./pages/DeveloperPortal";
import MedallionSwap from "./pages/MedallionSwap";
import DMKeepSystem from "./pages/DMKeepSystem";
import DefenseKlausPage from "./pages/DefenseKlausPage";
import HouseholdConciergePage from "./pages/HouseholdConciergePage";
import HealthAccordsPage from "./pages/HealthAccordsPage";
import DurinsDoor from "./pages/DurinsDoor";
import FriendPage from "./pages/FriendPage";
import VideoScripts from "./pages/VideoScripts";
import PreBetaRecruits from "./pages/PreBetaRecruits";
import LBAssetLibrary from "./pages/LBAssetLibrary";
import PrototypingContracts from "./pages/PrototypingContracts";
import AllPositionsBrowse from "./pages/AllPositionsBrowse";
import { FailureQueueDashboard } from "@/components/FailureQueueDashboard";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { GlobalRecorderOverlay } from "@/components/GlobalRecorderOverlay";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WelcomeGate } from "@/components/WelcomeGate";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SeamlessOnboardProvider } from "@/components/SeamlessOnboardDialog";
import IPRegistration from "./pages/IPRegistration";
import AgentOnboarding from "./pages/AgentOnboarding";
import CrowdfundingIntegration from "./pages/CrowdfundingIntegration";
import MedallionManagement from "./pages/MedallionManagement";
import { useAuth } from "@/contexts/AuthContext";
// Business portal pages reused here
import ContractPositions from "./pages/ContractPositions";
import ManagePositions from "./pages/ManagePositions";
import MemberResources from "./pages/MemberResources";
import AdminProject from "./pages/AdminProject";
import SubdomainManager from "./pages/SubdomainManager";
import ClientAPIManager from "./pages/ClientAPIManager";
import CredentialManagement from "./pages/CredentialManagement";
import Workshop from "./pages/Workshop";
import CampaignProduction from "./pages/CampaignProduction";
import ProjectLanding from "./pages/ProjectLanding";
import LandingPageManager from "./pages/LandingPageManager";
import Briefcase from "./pages/Briefcase";
const HexisleDashboard = lazy(() => import("./pages/HexisleDashboard"));
const LetsMakeDinnerPage = lazy(() => import("./pages/LetsMakeDinnerPage"));
const LetsMakeDinnerLanding = lazy(() => import("./pages/LetsMakeDinnerLanding"));
const LMDReviewerDashboard = lazy(() => import("./pages/LMDReviewerDashboard"));
const LMDReviewSubmitPage = lazy(() => import("./pages/LMDReviewSubmitPage"));
const GroceryBoxPage = lazy(() => import("./pages/GroceryBoxPage"));
const GroupCookPage = lazy(() => import("./pages/GroupCookPage"));
const ChefMarketplacePage = lazy(() => import("./pages/ChefMarketplacePage"));
const PantryPage = lazy(() => import("./pages/PantryPage"));
const FamilyTablePage = lazy(() => import("./pages/FamilyTablePage"));
const RallyGroupPage = lazy(() => import("./pages/RallyGroupPage"));
const JukeboxInitiative = lazy(() => import("./pages/JukeboxInitiative"));
const HarperGuildPage = lazy(() => import("./pages/HarperGuildPage"));
const VSLPage = lazy(() => import("./pages/VSLPage"));
const LetsMakeBreadPage = lazy(() => import("./pages/LetsMakeBreadPage"));
const DidaskoPage = lazy(() => import("./pages/DidaskoPage"));
const PowerToThePeoplePage = lazy(() => import("./pages/PowerToThePeoplePage"));
const WhyNoAds = lazy(() => import("./pages/WhyNoAds"));
const WhyNoVC = lazy(() => import("./pages/WhyNoVC"));
const FAQ = lazy(() => import("./pages/FAQ"));
const BrassTacksPage = lazy(() => import("./pages/BrassTacksPage"));
const FamilyPage = lazy(() => import("./pages/FamilyPage"));
const FamilyDetailPage = lazy(() => import("./pages/FamilyDetailPage"));
const ProprietaryRecipesPage = lazy(() => import("./pages/ProprietaryRecipesPage"));
const TasteTesterDashboard = lazy(() => import("./pages/TasteTesterDashboard"));
const CottageLawPage = lazy(() => import("./pages/CottageLawPage"));
const DocumentationMarketplacePage = lazy(() => import("./pages/DocumentationMarketplacePage"));
const InitiativeProjectsPage = lazy(() => import("./pages/InitiativeProjectsPage"));
const StewardLegalDashboard = lazy(() => import("./pages/StewardLegalDashboard"));
const ThemeManagement = lazy(() => import("./pages/ThemeManagement"));
const DefenseClawsPage = lazy(() => import("./pages/DefenseClawsPage"));
const DefenseKlausSubmarineDoor = lazy(() => import("./pages/DefenseKlausSubmarineDoor"));
const HelpEachOtherPage = lazy(() => import("./pages/HelpEachOtherPage"));
const TheFurnace = lazy(() => import("./pages/TheFurnace"));
const StoreFrontAggregation = lazy(() => import("./pages/StoreFrontAggregation"));
const MainSquare = lazy(() => import("./pages/MainSquare"));
const GarageSalesPage = lazy(() => import("./pages/GarageSalesPage"));
const BizKaleidoscope = lazy(() => import("./pages/BizKaleidoscope"));
const MSAPage = lazy(() => import("./pages/MSAPage"));
const LifeLineMedicationsPage = lazy(() => import("./pages/LifeLineMedicationsPage"));
const LetsGoShoppingPage = lazy(() => import("./pages/LetsGoShoppingPage"));
const LetsGetGroceriesPage = lazy(() => import("./pages/LetsGetGroceriesPage"));
const ContingencyOperatorsPage = lazy(() => import("./pages/ContingencyOperatorsPage"));
const CrankIt = lazy(() => import("./pages/CrankIt"));
const ThoughtExperiment = lazy(() => import("./pages/ThoughtExperiment"));
const RedCarpet = lazy(() => import("./pages/RedCarpet"));
const DeckCardStudio = lazy(() => import("./pages/DeckCardStudio"));
const HeraldSubscription = lazy(() => import("./pages/HeraldSubscription"));
const GhostWorld = lazy(() => import("./pages/GhostWorld"));
const GoldenKeyQuest = lazy(() => import("./pages/GoldenKeyQuest"));
const SponsorPortal = lazy(() => import("./pages/SponsorPortal"));
const SponsorshipPage = lazy(() => import("./pages/SponsorshipPage"));
const HelpWanted = lazy(() => import("./pages/HelpWanted"));
const HexIsle = lazy(() => import("./pages/HexIsle"));
const HexIsleProjects = lazy(() => import("./pages/HexIsleProjects"));
const CompanyIsland = lazy(() => import("./pages/CompanyIsland"));
const HarvestIsland = lazy(() => import("./pages/HarvestIsland"));
const IslandAssignmentBoard = lazy(() => import("./pages/IslandAssignmentBoard"));
const IslandBuilderPage = lazy(() => import("./pages/IslandBuilderPage"));
const IslandCreator = lazy(() => import("./pages/IslandCreator"));
const IslandDesignPortfolio = lazy(() => import("./pages/IslandDesignPortfolio"));
const IslandDetail = lazy(() => import("./pages/IslandDetail"));
const IslandWorldMap = lazy(() => import("./pages/IslandWorldMap"));
const TreasureIsland = lazy(() => import("./pages/TreasureIsland"));
const FlyOnTheWall = lazy(() => import("./pages/FlyOnTheWall"));
const DeckCollection = lazy(() => import("./pages/DeckCollection"));
const ScrollForgePage = lazy(() => import("./pages/ScrollForgePage"));
const TheHelm = lazy(() => import("./pages/TheHelm"));
const InitiativePage = lazy(() => import("./pages/InitiativePage"));
const Governance = lazy(() => import("./pages/Governance"));
import { LanguageSwitcher } from "./components/LanguageSwitcher";
const MatchTrade = lazy(() => import("./pages/MatchTrade"));
const DesignBattleArena = lazy(() => import("./pages/DesignBattleArena"));
const EmporiumTemplates = lazy(() => import("./pages/EmporiumTemplates"));
import { DiscoveryBookshelf } from "./components/DiscoveryBookshelf";
import { DiscoveryGateProvider } from "./components/DiscoveryGate";
import { DiscoveryProvider } from "./hooks/useDiscovery";
import { HelmCompact } from "./components/HelmCompact";
import { useDiscoveryTracker } from "./hooks/useDiscoveryTracker";
import { NotificationBell } from "./components/notifications/NotificationBell";
import { GlobalSearch } from "./components/GlobalSearch";
const SearchResultsPage = lazy(() => import("./pages/SearchResultsPage"));
import { CreditBalanceHeader } from "./components/CreditBalanceHeader";
import HeraldSuccess from "./pages/HeraldSuccess";
import SponsorSuccess from "./pages/SponsorSuccess";
const ManufacturingStore = lazy(() => import("./pages/ManufacturingStore"));
const FactoryHub = lazy(() => import("./pages/FactoryHub"));
const CanisterConfigurator = lazy(() => import("./pages/CanisterConfigurator"));
const CanisterProductCatalog = lazy(() => import("./pages/CanisterProductCatalog"));
const CanisterBOMPage = lazy(() => import("./pages/CanisterBOMPage"));
const StarterKitPage = lazy(() => import("./pages/StarterKitPage"));
const NodeRegistration = lazy(() => import("./pages/NodeRegistration"));
const ServiceNodeRegistration = lazy(() => import("./pages/ServiceNodeRegistration"));
const LookingGlass = lazy(() => import("./pages/LookingGlass"));
const ProposalDetail = lazy(() => import("./pages/ProposalDetail"));
const ProposalsListing = lazy(() => import("./pages/ProposalsListing"));
const StewardDashboard = lazy(() => import("./pages/StewardDashboard"));
const StewardApply = lazy(() => import("./pages/StewardApply"));
const CreatorPitchPage = lazy(() => import("./pages/CreatorPitchPage"));
const CreatorShowcasePage = lazy(() => import("./pages/CreatorShowcasePage"));
const CreatorProfilePage = lazy(() => import("./pages/CreatorProfilePage"));
const LikeWhatPage = lazy(() => import("./pages/LikeWhatPage"));
const CrewCallPage = lazy(() => import("./pages/CrewCallPage"));
const CueCardDeckPage = lazy(() => import("./pages/CueCardDeckPage"));
const OnboardingStatusPage = lazy(() => import("./pages/OnboardingStatusPage"));
const CephasGatewayPage = lazy(() => import("./pages/CephasGatewayPage"));
const UnderTheHoodPage = lazy(() => import("./pages/UnderTheHoodPage"));
const FlyOnTheWallRegistryPage = lazy(() => import("./pages/FlyOnTheWallPage"));
const CephasCategoryListingPage = lazy(() => import("./pages/CephasCategoryListingPage"));
const CephasContentDetailPage = lazy(() => import("./pages/CephasContentDetailPage"));
const CephasSearchPage = lazy(() => import("./pages/CephasSearchPage"));
const CephasPressJunketPage = lazy(() => import("./pages/CephasPressJunketPage"));
const CephasInnovationPedestalsPage = lazy(() => import("./pages/CephasInnovationPedestalsPage"));
const TreasureMapGame = lazy(() => import("./pages/TreasureMapGame"));
const TreasureMapCreator = lazy(() => import("./pages/TreasureMapCreator"));
const BeaconRunCreator = lazy(() => import("./pages/BeaconRunCreator"));
const Discover = lazy(() => import("./pages/Discover"));
const PortalGateway = lazy(() => import("./pages/PortalGateway"));
const LaunchHub = lazy(() => import("./pages/LaunchHub"));
const RunANode = lazy(() => import("./pages/RunANode"));
const ProductionRuns = lazy(() => import("./pages/ProductionRuns"));
const GroceryNodeRegistration = lazy(() => import("./pages/GroceryNodeRegistration"));
const FoundingRunLanding = lazy(() => import("./pages/FoundingRunLanding"));
const PreOrderFlow = lazy(() => import("./pages/PreOrderFlow"));
const TreasureMap = lazy(() => import("./pages/TreasureMap"));
const CrewNewPage = lazy(() => import("./pages/CrewNewPage"));
const CrewDashboard = lazy(() => import("./pages/CrewDashboard"));
const CrewInvite = lazy(() => import("./pages/CrewInvite"));
const AmbassadorRegistration = lazy(() => import("./pages/AmbassadorRegistration"));
const AmbassadorDashboard = lazy(() => import("./pages/AmbassadorDashboard"));
const AmbassadorWalkthrough = lazy(() => import("./pages/AmbassadorWalkthrough"));
const AmbassadorChainPage = lazy(() => import("./pages/AmbassadorChainPage"));
const AmbassadorPortfolio = lazy(() => import("./pages/AmbassadorPortfolio"));
const AmbassadorCertification = lazy(() => import("./pages/AmbassadorCertification"));
const ReviewerApplication = lazy(() => import("./pages/ReviewerApplication"));
const ReviewerDashboard = lazy(() => import("./pages/ReviewerDashboard"));
const ReviewQueueItemPage = lazy(() => import("./pages/ReviewQueueItemPage"));
const Arenas = lazy(() => import("./pages/Arenas"));
const Petitions = lazy(() => import("./pages/Petitions"));
const BrowseMarketplace = lazy(() => import("./pages/BrowseMarketplace"));
const BrowseBusiness = lazy(() => import("./pages/BrowseBusiness"));
const BrowseNonprofit = lazy(() => import("./pages/BrowseNonprofit"));
const BrowseNetwork = lazy(() => import("./pages/BrowseNetwork"));
const Senate = lazy(() => import("./pages/Senate"));
const HallOfInnovations = lazy(() => import("./pages/HallOfInnovations"));
const OnboardingStart = lazy(() => import("./pages/OnboardingStart"));
const BusinessPathway = lazy(() => import("./pages/BusinessPathway"));
const CaptainLanding = lazy(() => import("./pages/CaptainLanding"));
const PatrioticInterdependentalist = lazy(() => import("./pages/PatrioticInterdependentalist"));
const PuddingDemo = lazy(() => import("./pages/PuddingDemo"));
const SaltMines = lazy(() => import("./pages/SaltMines"));
const BuildBusiness = lazy(() => import("./pages/BuildBusiness"));
const PlantSeeds = lazy(() => import("./pages/PlantSeeds"));
const CueCardLanding = lazy(() => import("./pages/CueCardLanding"));
const CueCardShare = lazy(() => import("./pages/CueCardShare"));
const NotLeftNotRightPage = lazy(() => import('./pages/cue-cards/NotLeftNotRightPage'));
const AcademicPapersDirectory = lazy(() => import('./pages/AcademicPapersDirectory'));
const CollegeOfHardKnocks = lazy(() => import('./pages/CollegeOfHardKnocks'));
const PatentPortfolio = lazy(() => import("./pages/PatentPortfolio"));
const IPPortfolioPage = lazy(() => import("./pages/IPPortfolioPage"));
const EconomicLaws = lazy(() => import("./pages/EconomicLaws"));
const SwoopPage = lazy(() => import("./pages/SwoopPage"));
const SwoopProjectPage = lazy(() => import("./pages/SwoopProjectPage"));
const SwoopAdminPage = lazy(() => import("./pages/SwoopAdminPage"));
import SocialMediaAdmin from "./components/SocialMediaAdmin";
import TheBattery from "./components/TheBattery";
const HeroProjectPage = lazy(() => import("./pages/HeroProjectPage"));
import UniversalDispatch from "./components/UniversalDispatch";
import PaperPage from "./pages/PaperPage";
const FinancialTransparencyPage = lazy(() => import("./pages/FinancialTransparencyPage"));
const HelmPage = lazy(() => import("./pages/HelmPage"));
const C20PilotDashboard = lazy(() => import("./pages/C20PilotDashboard"));
const C20Leaderboard = lazy(() => import("./pages/C20Leaderboard"));
const BeaconExplainer = lazy(() => import("./pages/BeaconExplainer"));
const WildfireRunsPage = lazy(() => import("./pages/WildfireRunsPage"));
const ATTILanding = lazy(() => import("./pages/ATTILanding"));
const SanAntonioLanding = lazy(() => import("./pages/SanAntonioLanding"));
const BifrostCardBuilder = lazy(() => import("./pages/BifrostCardBuilder"));
const SendLists = lazy(() => import("./pages/SendLists"));
const KnowledgeViewer = lazy(() => import("./pages/KnowledgeViewer"));
import { WildfireRunProvider } from "./contexts/WildfireRunContext";
import { MockDataProvider } from "./contexts/MockDataProvider";
import { PathwayProgressProvider } from "./contexts/PathwayProgressContext";
import { FeatureTipProvider } from "./components/FeatureTip";
import { GlobalWildfireRun } from "./components/GlobalWildfireRun";
// Removed per Founder directive — floating buttons cluttered the UI.
// Dedicated pages remain: /patent-portfolio and /ip-portfolio
// import { DevelopmentBadge } from "./components/DevelopmentBadge";
// import { PatentPortfolioTicker } from "./components/PatentPortfolioTicker";
const BrewsterBonusPage = lazy(() => import("./pages/BrewsterBonusPage"));
import { AlcoveHallway } from "./components/AlcoveHallway";
const CoasterMedallionProject = lazy(() => import("./pages/CoasterMedallionProject"));
const FarmerSupplyChainPage = lazy(() => import("./pages/FarmerSupplyChainPage"));
const HexIsleEncyclopedia = lazy(() => import("./pages/HexIsleEncyclopedia"));
const HexIsleIslandPage = lazy(() => import("./pages/HexIsleIslandPage"));
const ChainDashboard = lazy(() => import("./pages/ChainDashboard"));
const HexIsleCampaignsPage = lazy(() => import("./pages/HexIsleCampaignsPage"));
const KickstarterCampaignPage = lazy(() => import("./pages/KickstarterCampaignPage"));
const HexIsleDownloads = lazy(() => import("./pages/HexIsleDownloads"));
const DemandSignaling = lazy(() => import("./pages/DemandSignaling"));
const HexIsleVote = lazy(() => import("./pages/HexIsleVote"));
const HexIsleBattlePhilosophy = lazy(() => import("./pages/HexIsleBattlePhilosophy"));
const HexIsleCueCard = lazy(() => import("./pages/cue-cards/HexIsleCueCard"));
const LaunchTracker = lazy(() => import("./pages/LaunchTracker"));
const MoneypennyBriefing = lazy(() => import("./pages/MoneypennyBriefing"));
const MoneyPennyQA = lazy(() => import("./pages/MoneyPennyQA"));
const SpotlightManager = lazy(() => import("./pages/SpotlightManager"));
const BoiseBusinessCardsExample = lazy(() => import("./pages/BoiseBusinessCardsExample"));
const DailyNews = lazy(() => import("./pages/DailyNews"));
const BandWagon = lazy(() => import("./pages/BandWagon"));
const MoneyPennySocial = lazy(() => import("./pages/MoneyPennySocial"));
const ConcentricCircles = lazy(() => import("./pages/ConcentricCircles"));
const HelmActionsPage = lazy(() => import("./pages/HelmActionsPage"));
const OutOfBoundsPage = lazy(() => import("./pages/OutOfBoundsPage"));
const SocialAccountsPage = lazy(() => import("./pages/SocialAccountsPage"));
const PoliticalExpeditionPage = lazy(() => import("./pages/PoliticalExpedition"));
const CrewTablesPage = lazy(() => import("./pages/CrewTables"));
const HousingPage = lazy(() => import("./pages/Housing"));
const GuidedDiscovery = lazy(() => import("./pages/GuidedDiscovery"));
const MembershipGate = lazy(() => import("./pages/MembershipGate"));
const FirstSteps = lazy(() => import("./pages/FirstSteps"));
const MemberProfile = lazy(() => import("./pages/MemberProfile"));
const InviteGenerator = lazy(() => import("./pages/InviteGenerator"));
const PipelinePage = lazy(() => import("./pages/PipelinePage"));
const CoalitionsPage = lazy(() => import("./pages/Coalitions"));

// K107: Product Catalog + Makers + Production Pipeline
const ProductCatalog = lazy(() => import("./pages/ProductCatalog"));
const CatalogProductDetail = lazy(() => import("./pages/CatalogProductDetail"));
const MakerDirectory = lazy(() => import("./pages/MakerDirectory"));
const MakerProfile = lazy(() => import("./pages/MakerProfile"));
const MakerRegistration = lazy(() => import("./pages/MakerRegistration"));
const ProductionOrderFlow = lazy(() => import("./pages/ProductionOrderFlow"));

// K116: Turn-Key Project Templates + Cue Card Campaign System
const ProjectDirectory = lazy(() => import("./pages/ProjectDirectory"));
const TurnKeyCreatePage = lazy(() => import("./pages/TurnKeyCreatePage"));
const TurnKeyProjectDetailPage = lazy(() => import("./pages/TurnKeyProjectDetailPage"));
const CueCardCampaignLibrary = lazy(() => import("./pages/CueCardCampaignLibrary"));
const CueCardCampaignDetailPage = lazy(() => import("./pages/CueCardCampaignDetailPage"));

// K117: Red Carpet Showcase — demand-signal system for creator onboarding
const ShowcaseClaimPage = lazy(() => import("./pages/ShowcaseClaimPage"));
const ShowcaseAdminPage = lazy(() => import("./pages/ShowcaseAdminPage"));

// K118: Treasure Map Interactive Guides + "What Do You Want to Do?" Entry Flow
const WhatDoYouWantFlow = lazy(() => import("./pages/WhatDoYouWantFlow"));
const CraftTreasureMapPage = lazy(() => import("./pages/CraftTreasureMapPage"));

// K119: One-Click Social Import + Bridge-to-Local
const SocialImportPage = lazy(() => import("./pages/SocialImportPage"));
const ConnectedServicesPage = lazy(() => import("./pages/ConnectedServicesPage"));

// K120: Contest Infrastructure + Stripe Connect
const ContestDirectory = lazy(() => import("./pages/ContestDirectory"));
const ContestDetailPage = lazy(() => import("./pages/ContestDetailPage"));
const ContestEntryPage = lazy(() => import("./pages/ContestEntryPage"));
const BuyCreditsPage = lazy(() => import("./pages/BuyCreditsPage"));

// K121: Stripe Billing — Subscriptions, Credits, Payouts
const MembershipPage = lazy(() => import("./pages/MembershipPage"));
const MembershipDashboard = lazy(() => import("./pages/MembershipDashboard"));
const EarningsDashboard = lazy(() => import("./pages/EarningsDashboard"));

// K114: Subscription Engine + Coalition Formation + Hybrid Discount
const SubscribePage = lazy(() => import("./pages/SubscribePage"));
const CoalitionDirectory = lazy(() => import("./pages/CoalitionDirectory"));
const CoalitionCreate = lazy(() => import("./pages/CoalitionCreate"));
const CoalitionDetail = lazy(() => import("./pages/CoalitionDetail"));

// Content Controls & Progressive Disclosure (Session 6L)
const ContentControlsPage = lazy(() => import("./pages/ContentControlsPage"));
// Community Support via Stack Overflow (Session 6L)
const CommunitySupport = lazy(() => import("./pages/CommunitySupport"));
// HexIsle 3D World (Session 6L — React Three Fiber)
const HexIsleWorld3D = lazy(() => import("./pages/HexIsleWorld3D"));
// HexIsle 2D Overworld (Session 6M — Mario World-style overworld)
const HexIsleOverworld = lazy(() => import("./pages/HexIsleOverworld"));
// Hexel Part Detail Pages — Weekly Series (Session 8C)
const HexelSlottedTopDetail = lazy(() => import("./pages/HexelSlottedTopDetail"));
const HexelWeeklyDetail = lazy(() => import("./pages/HexelWeeklyDetail"));
const ContentPipelinePage = lazy(() => import("./pages/ContentPipelinePage"));
// Legal pages (TikTok Developer Portal compliance — Session 7D)
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CrownLetterUpdate = lazy(() => import("./pages/CrownLetterUpdate"));
const CrownLettersPage = lazy(() => import("./pages/CrownLettersPage"));
const BenefitsPage = lazy(() => import("./pages/BenefitsPage"));
// Guild Hub — NOIDs landing with Handshake Protocol (Session 8D)
const GuildHub = lazy(() => import("./pages/GuildHub"));
// K133 — Guild & Tribe System
const GuildDetail = lazy(() => import("./pages/GuildDetail"));
const TribeDetail = lazy(() => import("./pages/TribeDetail"));
const GuildFormationWizard = lazy(() => import("./components/GuildFormationWizard"));
const TribeFormationWizard = lazy(() => import("./components/TribeFormationWizard"));
// Muffled Rule / Coverage Minutes / Phase MimicTrunks (Session 6M)
const RoundTableHall = lazy(() => import("./pages/RoundTableHall"));
const CoverageMinutesDashboard = lazy(() => import("./pages/CoverageMinutesDashboard"));
const PedestalBrowser = lazy(() => import("./pages/PedestalBrowser"));
const PhaseMimicTrunkManager = lazy(() => import("./pages/PhaseMimicTrunkManager"));
const RealWorldPuzzles = lazy(() => import("./pages/RealWorldPuzzles"));
const GuildPhaseManager = lazy(() => import("./pages/GuildPhaseManager"));
// Pledge System (Session 8A)
const MyPledges = lazy(() => import("./pages/MyPledges"));
// Admin Analytics Dashboard (Session 8A)
const AdminAnalytics = lazy(() => import("./pages/AdminAnalytics"));
// Side Quests — Flexible Work System (Session 8B)
const SideQuests = lazy(() => import("./pages/SideQuests"));
// The Crow's Nest — Multi-Depth Guided Discovery (Session 8H)
const CrowsNest = lazy(() => import("./pages/CrowsNest"));
const XPLeaderboard = lazy(() => import("./pages/XPLeaderboard"));
const StoreTemplates = lazy(() => import("./pages/StoreTemplates"));
const ShowcasePromotion = lazy(() => import("./pages/ShowcasePromotion"));
const GhostWorldMall = lazy(() => import("./pages/GhostWorldMall"));
const MemberAgreement = lazy(() => import("./pages/MemberAgreement"));
const CreatorDraftPick = lazy(() => import("./pages/CreatorDraftPick"));
const TrickleOnboarding = lazy(() => import("./pages/TrickleOnboarding"));
const VouchSystem = lazy(() => import("./pages/VouchSystem"));
const Subscriptions = lazy(() => import("./pages/Subscriptions"));
const StorefrontBuilder = lazy(() => import("./pages/tools/StorefrontBuilder"));
const MenuPage = lazy(() => import("./pages/MenuPage"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const RunnerDashboard = lazy(() => import("./pages/RunnerDashboard"));
const CueCardGenerator = lazy(() => import("./pages/tools/CueCardGenerator"));
const TreasureMaps = lazy(() => import("./pages/TreasureMaps"));
const OnboarderDashboard = lazy(() => import("./pages/OnboarderDashboard"));
const CalendarPage = lazy(() => import("./pages/Calendar"));
const GhostWorldMap = lazy(() => import("./pages/GhostWorldMap"));
const TreasureMapGuide = lazy(() => import("./pages/TreasureMapGuide"));
const GleanersCorner = lazy(() => import("./pages/GleanersCorner"));
const ChainVoting = lazy(() => import("./pages/ChainVoting"));

// Vehicle Systems — Rally Group (Session 85)
const LemonLot = lazy(() => import("./pages/LemonLot"));
const LocalWheels = lazy(() => import("./pages/LocalWheels"));
const RideshareRoutesPage = lazy(() => import("./pages/RideshareRoutes"));

// ADAPT Score Dashboard (Session 92)
const AdaptScore = lazy(() => import("./pages/AdaptScore"));

// LB Card + War Chest (Session 76 — Two-Domain Architecture)
const LBCardPage = lazy(() => import("./pages/LBCardPage"));
const WarChestPage = lazy(() => import("./pages/WarChestPage"));
const PayoutsPage = lazy(() => import("./pages/PayoutsPage"));
const FounderFeatureFlags = lazy(() => import("./pages/FounderFeatureFlags"));

// LB Card Scheduled Funding (Session 136 — Innovations #2008-#2009)
const FundMyCard = lazy(() => import("./pages/FundMyCard"));

// Session 47-49 pages (Bishop 013)
const SantaEverAfter = lazy(() => import("./pages/SantaEverAfter"));
const NodeCaptainPage = lazy(() => import("./pages/NodeCaptain"));
const StarChamber = lazy(() => import("./pages/StarChamber"));
const Castle = lazy(() => import("./pages/Castle"));
const CPlus20Dashboard = lazy(() => import("./pages/CPlus20Dashboard"));
const TerenoCertificationPage = lazy(() => import("./pages/TerenoCertification"));
const ModularManufacturing = lazy(() => import("./pages/ModularManufacturing"));
const MakerSpotlightPage = lazy(() => import("./pages/MakerSpotlight"));
const ProteusAnchorPage = lazy(() => import("./pages/ProteusAnchor"));
const DesignedToBeBroken = lazy(() => import("./pages/DesignedToBeBroken"));
const AsYouWishCard = lazy(() => import("./pages/AsYouWishCard"));
const NoAtomo = lazy(() => import("./pages/NoAtomo"));
const MissionOnePage = lazy(() => import("./pages/MissionOnePage"));

// K124: Captain Onboarding + Leadership Pedestals
const CaptainOnboardingPage = lazy(() => import("./pages/CaptainOnboardingPage"));
const CaptainDashboardPage = lazy(() => import("./pages/CaptainDashboardPage"));
const ShipMedallionPage = lazy(() => import("./pages/ShipMedallionPage"));
const The300Page = lazy(() => import("./pages/The300Page"));
const PedestalDetailPage = lazy(() => import("./pages/PedestalDetailPage"));

// K127: Business Campaign Onboarding
const BusinessCampaignDirectory = lazy(() => import("./pages/BusinessCampaignDirectory"));
const BusinessCampaignDetail = lazy(() => import("./pages/BusinessCampaignDetail"));
const NominateBusinessPage = lazy(() => import("./pages/NominateBusinessPage"));
const PitchPacketPage = lazy(() => import("./pages/PitchPacketPage"));

// K130: Family Table Cookbook — Meal Planning + Restaurant Menus
const FamilyTableHub = lazy(() => import("./pages/FamilyTableHub"));
const CookbookPage = lazy(() => import("./pages/CookbookPage"));
const RestaurantDetailPage = lazy(() => import("./pages/RestaurantDetailPage"));
const MealPlanBuilder = lazy(() => import("./pages/MealPlanBuilder"));
const OrderManifestPage = lazy(() => import("./pages/OrderManifestPage"));

// K131: Programmable Card — Durin's Door, Sponsored Cards, Brand Bounties, Designer Marketplace
const WelcomeGatePage = lazy(() => import("./pages/WelcomeGatePage"));
const CueCardGeneratorV2 = lazy(() => import("./pages/tools/CueCardGeneratorV2"));
const DesignCrewPage = lazy(() => import("./pages/DesignCrewPage"));

// K134: MoneyPenny Gatekeeper — AI Receptionist for Inbound Contact Screening
const ContactPage = lazy(() => import("./pages/ContactPage"));
const GatekeeperInboxPage = lazy(() => import("./pages/GatekeeperInboxPage"));

// K135: Design Democracy — X-Ray Overlay + Community Theme System
const ThemeGallery = lazy(() => import("./pages/ThemeGallery"));
const ThemeEditorPage = lazy(() => import("./pages/ThemeEditor"));

// K141: X-Ray Bounty Arena — gamified error-hunting + design auctions (Innovations #2023-#2028)
const XRayBountyDashboard = lazy(() => import("./pages/XRayBountyDashboard"));
const DesignAuctionPage = lazy(() => import("./pages/DesignAuctionPage"));

// K147: Piggyback Improvement Pipeline — community improvement submissions + review
const PiggybackSubmitPage = lazy(() => import("./pages/PiggybackSubmitPage"));
const PiggybackReviewPage = lazy(() => import("./pages/PiggybackReviewPage"));
const MyPiggybackPage = lazy(() => import("./pages/MyPiggybackPage"));

// K142: Production Project Pages — Industry Backbone (Innovations #2029-#2030)
const ProjectsDirectoryPage = lazy(() => import("./pages/ProjectsDirectoryPage"));
const ProductionProjectPage = lazy(() => import("./pages/ProductionProjectPage"));

// K143: Manufacturing Escalation Ladder + 2nd Second Landing (Innovations #2031-#2033)
const SecondSecondLanding = lazy(() => import("./pages/SecondSecondLanding"));

// K128: Cold Start Cue Cards — Four Pathways to Captain
const ColdStartHub = lazy(() => import("./pages/ColdStartHub"));
const FoodNodeCueCard = lazy(() => import("./pages/FoodNodeCueCard"));
const ManufacturingNodeCueCard = lazy(() => import("./pages/ManufacturingNodeCueCard"));
const ServiceNodeCueCard = lazy(() => import("./pages/ServiceNodeCueCard"));
const LocalBusinessNodeCueCard = lazy(() => import("./pages/LocalBusinessNodeCueCard"));

const ExternalRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

// HardReload component REMOVED — unconditional reload = infinite loop risk

// Cue-card pages — lazy-loaded (not needed at startup)
const TowerOfPeace = lazy(() => import("./pages/cue-cards/TowerOfPeace"));
const CueCardSponsorPortal = lazy(() => import("./pages/cue-cards/SponsorPortal"));
const CueCardDurinsDoor = lazy(() => import("./pages/cue-cards/DurinsDoor"));
const Canada40K = lazy(() => import("./pages/cue-cards/Canada40K"));
const WildfireBeaconRun = lazy(() => import("./pages/cue-cards/WildfireBeaconRun"));
const HallOfRecords = lazy(() => import("./pages/cue-cards/HallOfRecords"));
const MainlandHub = lazy(() => import("./pages/cue-cards/MainlandHub"));
const CodeBreakersHub = lazy(() => import("./pages/cue-cards/CodeBreakersHub"));
const BusinessCardPortal = lazy(() => import("./pages/cue-cards/BusinessCardPortal"));
const KeepsLobby = lazy(() => import("./pages/cue-cards/KeepsLobby"));
const HexIsleWorldCard = lazy(() => import("./pages/cue-cards/HexIsleWorldCard"));
// Using the main RedCarpet page instead of the cue-card specific one
// import RedCarpet from "./pages/cue-cards/RedCarpet";

import { BuilderModeProvider } from "@/components/builder/BuilderModeContext";
import { LarkSidePanel } from "@/components/builder/LarkSidePanel";

// The Crow's Nest — global provider, float button, overlay (Session 8H)
import { CrowsNestProvider } from "@/contexts/CrowsNestContext";
// import { CrowsNestFloat } from "@/components/crows-nest/CrowsNestFloat"; // Replaced by DenkenMenu
import { CrowsNestOverlay } from "@/components/crows-nest/CrowsNestOverlay";

// Cold Start & Stewardship System (Milestone 2)
import ColdStartDashboard from "./pages/ColdStartDashboard";
import BecomeCaptain from "./pages/BecomeCaptain";
import TreasureMapBuilder from "./pages/TreasureMapBuilder";
import IncumbentAdvantage from "./pages/IncumbentAdvantage";

  const queryClient = new QueryClient();

function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  useDiscoveryTracker(); // Auto-discover cards as user navigates

  // Analytics page tracking (Session 8A)
  useEffect(() => {
    import("@/lib/analytics").then(({ trackPageView }) => {
      trackPageView(location.pathname);
    });
  }, [location.pathname]);

  const isLanding = location.pathname === '/';
  const showChrome = !!user && !isLanding;

  return (
    <DiscoveryProvider>
      <DiscoveryGateProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full overflow-x-hidden">
            {showChrome && <AppSidebar />}
            <div className="flex-1 flex flex-col min-w-0">
              {showChrome && (
                <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
                  <SidebarTrigger className="shrink-0" />
                  <div className="flex-1" />
                  <GlobalSearch />
                  <CreditBalanceHeader />
                  <NotificationBell />
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[140px]" title={user.email || ''}>
                    Signed in{user.email ? ` as ${user.email.split('@')[0]}` : ''}
                  </span>
                </div>
              )}
              <div className="flex flex-1 overflow-x-hidden">
                <main className="flex-1 overflow-x-hidden flex flex-col">
                  <div className="flex-1">{children}</div>
                  <PlatformFooter />
                </main>
                {showChrome && (
                  <aside className="hidden xl:block w-64 border-l bg-card/30 overflow-y-auto shrink-0">
                    <DiscoveryBookshelf />
                  </aside>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
        <GlobalRecorderOverlay />
        <HelmCompact />
        <PWAInstallPrompt />
        <LanguageSwitcher />
      </DiscoveryGateProvider>
    </DiscoveryProvider>
  );
}

// import { BuilderModeToggle } from "@/components/builder/BuilderModeToggle"; // Replaced by DenkenMenu
import { DenkenMenu } from "@/components/builder/DenkenMenu";
import { BeaconBiteNudge } from "@/components/BeaconBiteNudge";
import { XRayOverlay } from "@/components/builder/XRayOverlay";
import { CoinFlipAnimation } from "@/components/xray/CoinFlipAnimation";

/**
 * HomepageGateway — Route switcher for "/"
 * Session 25: Unauthenticated → PublicLandingView (HEOHO + Hero flip + Fable + keyhole)
 * First-time visitors see WelcomeGate (Fable only) before landing.
 * Authenticated: Original Index (discovery view with choice dialog)
 */
function HomepageGateway() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <WelcomeGate>
      <Index />
    </WelcomeGate>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BuilderModeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <SeamlessOnboardProvider>
          <FeatureTipProvider>
          <WildfireRunProvider>
          <MockDataProvider>
          <PathwayProgressProvider>
          <CrowsNestProvider>
            <RecordingProvider>
              <SubdomainRouter>
                <AppShell>
                  <GlobalWildfireRun />
                  <ScrollToTop />
                  <ErrorBoundary>
                  <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<HomepageGateway />} />
                        <Route path="/classic-landing" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/tiktok/callback" element={<TikTokCallback />} />
                        <Route path="/ghost" element={<GhostWorld />} />
                        <Route path="/ghost-world" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GhostWorldMap /></Suspense>} />
                        <Route path="/explore" element={<GhostWorld />} />
                        <Route path="/free-explore" element={<GhostWorld />} />

                        {/* Front Door: Guided Discovery → Membership → First Steps → Profile (K91) */}
                        <Route path="/welcome" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GuidedDiscovery /></Suspense>} />
                        <Route path="/discover" element={<Navigate to="/welcome" replace />} />
                        <Route path="/first-steps" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FirstSteps /></Suspense></ProtectedRoute>} />
                        <Route path="/member/:username" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MemberProfile /></Suspense>} />

                        {/* Red Carpet + Slingshot (K93) */}
                        <Route path="/invite" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><InviteGenerator /></Suspense></ProtectedRoute>} />
                        <Route path="/pipeline" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PipelinePage /></Suspense></ProtectedRoute>} />

                        {/* Convenience redirects — prevent 404s for common URL guesses */}
                        <Route path="/keep" element={<ProtectedRoute><KeepView /></ProtectedRoute>} />
                        <Route path="/login" element={<Navigate to="/auth" replace />} />
                        <Route path="/signin" element={<Navigate to="/auth" replace />} />
                        <Route path="/sign-in" element={<Navigate to="/auth" replace />} />
                        <Route path="/signup" element={<Navigate to="/auth" replace />} />
                        <Route path="/sign-up" element={<Navigate to="/auth" replace />} />
                        <Route path="/join" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MembershipGate /></Suspense>} />
                        <Route path="/join/creator" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CreatorPitchPage /></Suspense></ExplorerRoute>} />
                        <Route path="/creators" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CreatorShowcasePage /></Suspense></ExplorerRoute>} />
                        <Route path="/creators/:creatorId" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CreatorProfilePage /></Suspense></ExplorerRoute>} />
                        <Route path="/like-what" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LikeWhatPage /></Suspense>} />
                        <Route path="/crew-call" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrewCallPage /></Suspense></ProtectedRoute>} />
                        <Route path="/cue-cards" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CueCardDeckPage /></Suspense></ExplorerRoute>} />
                        <Route path="/onboarding/status" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><OnboardingStatusPage /></Suspense></ProtectedRoute>} />
                        {/* Catch stale /under-the-hood/ links — redirect to Cephas hub */}
                        <Route path="/under-the-hood/*" element={<Navigate to="/cephas/under-the-hood" replace />} />
                        <Route path="/home" element={<Navigate to="/" replace />} />
                        <Route path="/browse" element={<Navigate to="/browse/marketplace" replace />} />
                        <Route path="/all-positions" element={<Navigate to="/positions/browse" replace />} />
                        <Route path="/my-portfolio" element={<Navigate to="/portfolio" replace />} />
                        <Route path="/my-reputation" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/start-a-project" element={<Navigate to="/start" replace />} />
                        <Route path="/52-card-hunt" element={<Navigate to="/treasure-map-game" replace />} />
                        <Route path="/red-carpet" element={<Navigate to="/redcarpet" replace />} />
                        <Route path="/contract-positions" element={<Navigate to="/positions/browse" replace />} />
                        <Route path="/business-builder" element={<Navigate to="/build-a-business" replace />} />
                        <Route path="/create-project" element={<Navigate to="/admin/project/create" replace />} />
                        <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/admin/project" element={<Navigate to="/admin-project" replace />} />
                        <Route path="/public-ledger" element={<Navigate to="/transparent-ledger" replace />} />
                        <Route path="/opportunities" element={<Navigate to="/positions/browse" replace />} />

                        {/* HexIsle route aliases — old paths without /hexisle/ prefix */}
                        <Route path="/harvest-island" element={<Navigate to="/hexisle/harvest" replace />} />
                        <Route path="/island-assignments" element={<Navigate to="/hexisle/assignments" replace />} />
                        <Route path="/island-portfolio" element={<Navigate to="/hexisle/portfolio" replace />} />
                        <Route path="/island-world-map" element={<Navigate to="/hexisle/world-map" replace />} />
                        <Route path="/world-map" element={<Navigate to="/hexisle/world-map" replace />} />
                        <Route path="/keeps" element={<Navigate to="/hexisle/keeps" replace />} />

                        {/* Root-level aliases for initiatives — prevent 404s from external links */}
                        <Route path="/rally-group" element={<Navigate to="/initiatives/rally-group" replace />} />
                        <Route path="/jukebox" element={<Navigate to="/initiatives/jukebox" replace />} />
                        <Route path="/household-concierge" element={<Navigate to="/initiatives/household-concierge" replace />} />
                        <Route path="/defense-klaus" element={<Navigate to="/initiatives/defense-klaus" replace />} />
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
                        <Route path="/family-table" element={<ExplorerRoute><FamilyTableHub /></ExplorerRoute>} />
                        <Route path="/family-table/meal-plan" element={<ProtectedRoute><MealPlanBuilder /></ProtectedRoute>} />
                        <Route path="/cookbook" element={<ExplorerRoute><CookbookPage /></ExplorerRoute>} />
                        <Route path="/cookbook/:restaurantId" element={<ExplorerRoute><RestaurantDetailPage /></ExplorerRoute>} />
                        <Route path="/business/orders" element={<ProtectedRoute><OrderManifestPage /></ProtectedRoute>} />
                        <Route path="/lets-make-dinner" element={<Navigate to="/initiatives/lets-make-dinner" replace />} />
                        <Route path="/the-pantry" element={<Navigate to="/initiatives/the-pantry" replace />} />
                        <Route path="/lets-go-shopping" element={<Navigate to="/initiatives/lets-go-shopping" replace />} />
                        <Route path="/lets-get-groceries" element={<Navigate to="/initiatives/lets-get-groceries" replace />} />
                        <Route path="/lifeline-medications" element={<Navigate to="/initiatives/lifeline-medications" replace />} />

                        <Route path="/portal" element={<ExplorerRoute><PortalGateway /></ExplorerRoute>} />
                        <Route path="/enter" element={<ExplorerRoute><PortalGateway /></ExplorerRoute>} />
                        <Route path="/treasure-map" element={<TreasureMap />} />
                        <Route path="/treasure-map/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CraftTreasureMapPage /></Suspense>} />
                        <Route path="/sanantonio" element={<SanAntonioLanding />} />
                        <Route path="/crew/new" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrewNewPage /></Suspense></ExplorerRoute>} />
                        <Route path="/crew/:crewId" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrewDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/crew/:crewId/invite" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrewInvite /></Suspense>} />
                        <Route path="/ambassador/register" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorRegistration /></Suspense></ProtectedRoute>} />
                        <Route path="/ambassador/dashboard" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/ambassador/walkthrough" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorWalkthrough /></Suspense></ProtectedRoute>} />
                        <Route path="/ambassador/chain" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorChainPage /></Suspense>} />
                        <Route path="/ambassador/portfolio/:ambassadorId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorPortfolio /></Suspense>} />
                        <Route path="/ambassador/certify" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AmbassadorCertification /></Suspense></ProtectedRoute>} />
                        <Route path="/reviewer/apply" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ReviewerApplication /></Suspense></ProtectedRoute>} />
                        <Route path="/reviewer/dashboard" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ReviewerDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/reviewer/queue/:id" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ReviewQueueItemPage /></Suspense></ProtectedRoute>} />
                        <Route path="/launch" element={<LaunchHub />} />
                        <Route path="/launch/run-a-node" element={<RunANode />} />
                        <Route path="/launch-tracker" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LaunchTracker /></Suspense></ExplorerRoute>} />
                        <Route path="/production-runs" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProductionRuns /></Suspense></ExplorerRoute>} />
                        <Route path="/start" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><WhatDoYouWantFlow /></Suspense>} />
                        {/* K128: Cold Start — Four Pathways to Captain */}
                        <Route path="/start/cold-start" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ColdStartHub /></Suspense>} />
                        <Route path="/start/cold-start/food" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FoodNodeCueCard /></Suspense>} />
                        <Route path="/start/cold-start/manufacturing" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ManufacturingNodeCueCard /></Suspense>} />
                        <Route path="/start/cold-start/service" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ServiceNodeCueCard /></Suspense>} />
                        <Route path="/start/cold-start/local-business" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LocalBusinessNodeCueCard /></Suspense>} />
                        <Route path="/captain" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CaptainLanding /></Suspense>} />
                        <Route path="/captain/become" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CaptainOnboardingPage /></Suspense></ProtectedRoute>} />
                        <Route path="/captain/dashboard" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CaptainDashboardPage /></Suspense></ProtectedRoute>} />
                        <Route path="/captain/medallion" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ShipMedallionPage /></Suspense>} />
                        {/* K131: Programmable Card — Welcome Gate + Designer Marketplace */}
                        <Route path="/w/:medallionId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><WelcomeGatePage /></Suspense>} />
                        <Route path="/tools/card-generator" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CueCardGeneratorV2 /></Suspense></ProtectedRoute>} />
                        <Route path="/crew/design" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DesignCrewPage /></Suspense>} />
                        {/* K134: MoneyPenny Gatekeeper — Contact Form + Admin Inbox */}
                        <Route path="/contact" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ContactPage /></Suspense>} />
                        <Route path="/dashboard/gatekeeper" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GatekeeperInboxPage /></Suspense></ProtectedRoute>} />
                        <Route path="/begin" element={<Navigate to="/welcome" replace />} />
                        <Route path="/onboarding" element={<Navigate to="/welcome" replace />} />
                        <Route path="/pathway" element={<BusinessPathway />} />
                        <Route path="/business-pathway" element={<BusinessPathway />} />
                        <Route path="/about/patriotic-interdependentalist" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PatrioticInterdependentalist /></Suspense>} />
                        <Route path="/philosophy" element={<Navigate to="/about/patriotic-interdependentalist" replace />} />
                        <Route path="/pudding" element={<PuddingDemo />} />
                        <Route path="/components" element={<PuddingDemo />} />
                        
                        {/* The Crow's Nest — Multi-Depth Discovery (Session 8H) */}
                        <Route path="/crows-nest" element={<CrowsNest />} />
                        <Route path="/lookout" element={<Navigate to="/crows-nest" replace />} />
                        <Route path="/flyover" element={<Navigate to="/crows-nest" replace />} />

                        {/* Progressive Disclosure Paths */}
                        <Route path="/get-a-job" element={<SaltMines />} />
                        <Route path="/salt-mines" element={<SaltMines />} />
                        <Route path="/build-a-business" element={<BuildBusiness />} />
                        <Route path="/plant-seeds" element={<PlantSeeds />} />
                        <Route path="/cue/:cardId" element={<CueCardLanding />} />
                        <Route path="/forward" element={<NotLeftNotRightPage />} />
                        <Route path="/papers" element={<AcademicPapersDirectory />} />
                        <Route path="/cephas/search" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasSearchPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/press-junket" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasPressJunketPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/innovation-pedestals" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasInnovationPedestalsPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/under-the-hood" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><UnderTheHoodPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/fly-on-the-wall" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FlyOnTheWallRegistryPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/:category/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasContentDetailPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas/:category" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasCategoryListingPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cephas" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CephasGatewayPage /></Suspense></ExplorerRoute>} />
              <Route path="/hard-knocks" element={<CollegeOfHardKnocks />} />
                        <Route path="/RedCarpet" element={<RedCarpet />} />
                        <Route path="/RedCarpet/:slug" element={<RedCarpet />} />
                        <Route path="/redcarpet" element={<RedCarpet />} />
                        <Route path="/redcarpet/:slug" element={<RedCarpet />} />
                        
                        {/* Protected Marketplace Routes */}
                        <Route path="/marketplace" element={<ExplorerRoute><Marketplace /></ExplorerRoute>} />
                        <Route path="/projects" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ProjectDirectory /></Suspense></ExplorerRoute>} />
                        <Route path="/projects/create" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><TurnKeyCreatePage /></Suspense></ProtectedRoute>} />
                        <Route path="/projects/:slug/claim" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ShowcaseClaimPage /></Suspense></ProtectedRoute>} />
                        <Route path="/projects/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><TurnKeyProjectDetailPage /></Suspense></ExplorerRoute>} />
                        <Route path="/project/:projectSlug" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
                        <Route path="/project/:projectSlug/product/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                        <Route path="/sponsorship-guide" element={<ProtectedRoute><ContributionExplainer /></ProtectedRoute>} />
                        <Route path="/daily-news" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DailyNews /></Suspense>} />
                        <Route path="/bandwagon" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BandWagon /></Suspense>} />
                        <Route path="/gleaners-corner" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GleanersCorner /></Suspense>} />

                        {/* Protected Sponsor Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                        <Route path="/dashboard/legacy" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/search" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SearchResultsPage /></Suspense>} />
                        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                        <Route path="/blockchain/:projectId" element={<ProtectedRoute><BlockchainExplorer /></ProtectedRoute>} />
                        <Route path="/medallions" element={<ProtectedRoute><MedallionViewer /></ProtectedRoute>} />
                        <Route path="/withdraw" element={<PaidMemberRoute><Withdraw /></PaidMemberRoute>} />
                        <Route path="/reputation/:userId" element={<ReputationProfile />} />
                        <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                        <Route path="/content-controls" element={<ProtectedRoute><ContentControlsPage /></ProtectedRoute>} />
                        <Route path="/support" element={<ExplorerRoute><CommunitySupport /></ExplorerRoute>} />
                        <Route path="/community-support" element={<ExplorerRoute><CommunitySupport /></ExplorerRoute>} />
                        <Route path="/help" element={<ExplorerRoute><CommunitySupport /></ExplorerRoute>} />
                        <Route path="/peer-contracts" element={<ProtectedRoute><PeerContracts /></ProtectedRoute>} />
                        <Route path="/guilds" element={<ExplorerRoute><Guilds /></ExplorerRoute>} />
                        <Route path="/guilds/create" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GuildFormationWizard /></Suspense></ProtectedRoute>} />
                        <Route path="/guilds/hub" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GuildHub /></Suspense></ExplorerRoute>} />
                        <Route path="/guilds/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GuildDetail /></Suspense></ExplorerRoute>} />
                        <Route path="/tribes" element={<ExplorerRoute><Tribes /></ExplorerRoute>} />
                        <Route path="/tribes/create" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TribeFormationWizard /></Suspense></ProtectedRoute>} />
                        <Route path="/tribes/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TribeDetail /></Suspense></ExplorerRoute>} />
                        <Route path="/position-categories" element={<ProtectedRoute><PositionCategories /></ProtectedRoute>} />
                        <Route path="/lb-positions" element={<ProtectedRoute><LBInternalPositions /></ProtectedRoute>} />
                        <Route path="/production-queue" element={<ProtectedRoute><ProductionQueue /></ProtectedRoute>} />
                        <Route path="/ip/register" element={<ProtectedRoute><IPRegistration /></ProtectedRoute>} />
                        <Route path="/agent-onboarding" element={<ProtectedRoute><AgentOnboarding /></ProtectedRoute>} />
                        <Route path="/crowdfunding" element={<ProtectedRoute><CrowdfundingIntegration /></ProtectedRoute>} />
                        <Route path="/my-pledges" element={<ProtectedRoute><MyPledges /></ProtectedRoute>} />
                        <Route path="/pledges" element={<Navigate to="/my-pledges" replace />} />
                        <Route path="/deck-card-studio" element={<ExplorerRoute><DeckCardStudio /></ExplorerRoute>} />
                        <Route path="/cue-cards" element={<ExplorerRoute><DeckCardStudio /></ExplorerRoute>} />
                        <Route path="/cue-cards/campaigns" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><CueCardCampaignLibrary /></Suspense></ExplorerRoute>} />
                        <Route path="/cue-cards/campaigns/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><CueCardCampaignDetailPage /></Suspense></ExplorerRoute>} />
                        <Route path="/cue-cards/:cardType" element={<CueCardShare />} />
                        <Route path="/deck-cards" element={<Navigate to="/deck" replace />} />
                        <Route path="/hofund" element={<ExplorerRoute><DeckCardStudio /></ExplorerRoute>} />
                        <Route path="/hofund-studio" element={<Navigate to="/hofund" replace />} />
                        <Route path="/the-2nd-second" element={<ExplorerRoute><The2ndSecondPortal /></ExplorerRoute>} />

                        {/* K107: Product Catalog + Makers + Production Pipeline */}
                        <Route path="/products" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ProductCatalog /></Suspense></ExplorerRoute>} />
                        <Route path="/products/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><CatalogProductDetail /></Suspense></ExplorerRoute>} />
                        <Route path="/makers" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><MakerDirectory /></Suspense></ExplorerRoute>} />
                        <Route path="/makers/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><MakerProfile /></Suspense></ExplorerRoute>} />
                        <Route path="/register-maker" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><MakerRegistration /></Suspense></ProtectedRoute>} />
                        <Route path="/production/new" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ProductionOrderFlow /></Suspense></ProtectedRoute>} />
                        <Route path="/ledger" element={<ExplorerRoute><TransparentLedger /></ExplorerRoute>} />
                        <Route path="/transparent-ledger" element={<ExplorerRoute><TransparentLedger /></ExplorerRoute>} />
                        <Route path="/medallion-swap" element={<ExplorerRoute><MedallionSwap /></ExplorerRoute>} />
                        <Route path="/senior-pics" element={<ExplorerRoute><MedallionSwap /></ExplorerRoute>} />
                        <Route path="/dm-keep" element={<ExplorerRoute><DMKeepSystem /></ExplorerRoute>} />
                        <Route path="/initiatives/defense-klaus" element={<ExplorerRoute><DefenseKlausPage /></ExplorerRoute>} />
                        <Route path="/initiatives/household-concierge" element={<ExplorerRoute><HouseholdConciergePage /></ExplorerRoute>} />
                        <Route path="/initiatives/rally-group" element={<ExplorerRoute><RallyGroupPage /></ExplorerRoute>} />
                        <Route path="/initiatives/jukebox" element={<ExplorerRoute><JukeboxInitiative /></ExplorerRoute>} />
                        <Route path="/initiatives/harper-guild" element={<ExplorerRoute><HarperGuildPage /></ExplorerRoute>} />
                        <Route path="/initiatives/vsl" element={<ExplorerRoute><VSLPage /></ExplorerRoute>} />
                        <Route path="/initiatives/bread" element={<ExplorerRoute><LetsMakeBreadPage /></ExplorerRoute>} />
                        <Route path="/initiatives/didasko" element={<ExplorerRoute><DidaskoPage /></ExplorerRoute>} />
                        <Route path="/initiatives/power-to-the-people" element={<ExplorerRoute><PowerToThePeoplePage /></ExplorerRoute>} />
                        <Route path="/initiatives/brass-tacks" element={<ExplorerRoute><BrassTacksPage /></ExplorerRoute>} />
                        <Route path="/initiatives/health-accords" element={<ExplorerRoute><HealthAccordsPage /></ExplorerRoute>} />
                        <Route path="/mission-one" element={<ExplorerRoute><MissionOnePage /></ExplorerRoute>} />
                        <Route path="/durins-door" element={<ExplorerRoute><DurinsDoor /></ExplorerRoute>} />
                        <Route path="/international" element={<ExplorerRoute><DurinsDoor /></ExplorerRoute>} />
                        <Route path="/friend" element={<ExplorerRoute><FriendPage /></ExplorerRoute>} />
                        <Route path="/the-helm" element={<ExplorerRoute><TheHelm /></ExplorerRoute>} />
                        <Route path="/helm" element={<ExplorerRoute><TheHelm /></ExplorerRoute>} />
                        <Route path="/herald" element={<ProtectedRoute><HeraldSubscription /></ProtectedRoute>} />
                        <Route path="/herald-subscription" element={<ProtectedRoute><HeraldSubscription /></ProtectedRoute>} />
                        <Route path="/golden-key" element={<GoldenKeyQuest />} />
                        <Route path="/treasure-hunt" element={<GoldenKeyQuest />} />
                        <Route path="/sponsor" element={<SponsorPortal />} />
                        <Route path="/sponsorship" element={<ProtectedRoute><SponsorshipPage /></ProtectedRoute>} />
                        <Route path="/cascade" element={<ProtectedRoute><SponsorshipPage /></ProtectedRoute>} />
                        <Route path="/johnny-appleseed" element={<SponsorPortal />} />
                        <Route path="/swoop" element={<ExplorerRoute><SwoopPage /></ExplorerRoute>} />
                        <Route path="/swoop/:slug" element={<ExplorerRoute><SwoopProjectPage /></ExplorerRoute>} />
                        <Route path="/swoop/admin" element={<ProtectedRoute><SwoopAdminPage /></ProtectedRoute>} />
                        <Route path="/social-admin" element={<ProtectedRoute><div className="container mx-auto p-6 max-w-4xl"><SocialMediaAdmin /></div></ProtectedRoute>} />
                        <Route path="/the-battery" element={<ProtectedRoute><div className="container mx-auto p-6 max-w-4xl"><TheBattery /></div></ProtectedRoute>} />
                        <Route path="/dispatch" element={<ProtectedRoute><div className="container mx-auto p-6 max-w-4xl"><UniversalDispatch /></div></ProtectedRoute>} />
                        <Route path="/learn/brewster-bonus" element={<ExplorerRoute><BrewsterBonusPage /></ExplorerRoute>} />
                        <Route path="/learn" element={<ExplorerRoute><div className="container mx-auto p-6 max-w-4xl"><AlcoveHallway /></div></ExplorerRoute>} />
                        <Route path="/heroes/:slug" element={<ExplorerRoute><HeroProjectPage /></ExplorerRoute>} />
                        <Route path="/heroes" element={<Navigate to="/browse/marketplace" replace />} />
                        <Route path="/do-the-swoop" element={<ExplorerRoute><SwoopPage /></ExplorerRoute>} />
                        <Route path="/finances" element={<ExplorerRoute><FinancialTransparencyPage /></ExplorerRoute>} />
                        <Route path="/financial-transparency" element={<ExplorerRoute><FinancialTransparencyPage /></ExplorerRoute>} />
                        <Route path="/ledgers" element={<ExplorerRoute><FinancialTransparencyPage /></ExplorerRoute>} />
                        <Route path="/help-wanted" element={<HelpWanted />} />
                        <Route path="/marketplace/services" element={<HelpWanted />} />
                        <Route path="/the-furnace" element={<TheFurnace />} />
                        <Route path="/furnace" element={<TheFurnace />} />
                        <Route path="/storefront-aggregation" element={<StoreFrontAggregation />} />
                        <Route path="/biz-aggregation" element={<StoreFrontAggregation />} />
                        <Route path="/main-square" element={<MainSquare />} />
                        <Route path="/kaleidoscope" element={<BizKaleidoscope />} />
                        <Route path="/biz-directory" element={<BizKaleidoscope />} />
                        <Route path="/family-table/garage-sales" element={<GarageSalesPage />} />
                        <Route path="/garage-sales" element={<GarageSalesPage />} />
                        <Route path="/door" element={<DurinsDoor />} />
                        <Route path="/hexisle" element={<HexIsle />} />
                        <Route path="/hexisle-game" element={<HexIsle />} />
                        <Route path="/hexisle/projects" element={<HexIsleProjects />} />
                        <Route path="/projects/hexisle" element={<HexIsleProjects />} />
                        <Route path="/hexisle/company" element={<CompanyIsland />} />
                        <Route path="/hexisle/harvest" element={<HarvestIsland />} />
                        <Route path="/hexisle/treasure" element={<TreasureIsland />} />
                        <Route path="/hexisle/assignments" element={<IslandAssignmentBoard />} />
                        <Route path="/hexisle/builder" element={<IslandBuilderPage />} />
                        <Route path="/hexisle/creator" element={<IslandCreator />} />
                        <Route path="/hexisle/portfolio" element={<IslandDesignPortfolio />} />
                        <Route path="/hexisle/island/:id" element={<IslandDetail />} />
                        <Route path="/hexisle/world-map" element={<IslandWorldMap />} />
                        <Route path="/hexisle/world-3d" element={<HexIsleWorld3D />} />
                        <Route path="/hexisle/overworld" element={<HexIsleOverworld />} />
                        <Route path="/hexisle/hexels/slotted-top" element={<HexelSlottedTopDetail />} />
                        <Route path="/hexisle/hexels/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexelWeeklyDetail /></Suspense>} />
                        <Route path="/hexisle/downloads" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexIsleDownloads /></Suspense></ExplorerRoute>} />
                        <Route path="/hexisle/vote" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexIsleVote /></Suspense></ExplorerRoute>} />
                        <Route path="/hexisle/battle-philosophy" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexIsleBattlePhilosophy /></Suspense>} />
                        <Route path="/cue-cards/hexisle" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexIsleCueCard /></Suspense>} />
                        <Route path="/hexisle/campaigns" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HexIsleCampaignsPage /></Suspense>} />
                        <Route path="/hexisle/campaign/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><KickstarterCampaignPage /></Suspense>} />
                        <Route path="/chain" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ChainDashboard /></Suspense></ExplorerRoute>} />
                        <Route path="/demand" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DemandSignaling /></Suspense></ExplorerRoute>} />
                        <Route path="/worked-example" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BoiseBusinessCardsExample /></Suspense>} />
                        <Route path="/hexisle/founding-run" element={<FoundingRunLanding />} />
                        <Route path="/hexisle/founding-run/order" element={<ProtectedRoute><PreOrderFlow /></ProtectedRoute>} />
                        <Route path="/content-pipeline" element={<ContentPipelinePage />} />
                        {/* Legal pages — public, no auth required (TikTok compliance) */}
                        <Route path="/terms" element={<TermsOfService />} />
                        <Route path="/privacy" element={<PrivacyPolicy />} />
                        {/* Crown Letters — full inventory page */}
                        <Route path="/crown-letters" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrownLettersPage /></Suspense>} />
                        <Route path="/benefits" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BenefitsPage /></Suspense>} />
                        {/* Crown Letter Updates — public, dynamic slug */}
                        <Route path="/updates/crown/:slug" element={<CrownLetterUpdate />} />
                        {/* Developer Portal — public */}
                        <Route path="/developers" element={<DeveloperPortal />} />
                        <Route path="/dev" element={<DeveloperPortal />} />
                        <Route path="/round-tables" element={<RoundTableHall />} />
                        <Route path="/coverage-minutes" element={<CoverageMinutesDashboard />} />
                        <Route path="/pedestals" element={<PedestalBrowser />} />
                        <Route path="/phase-mimictrunks" element={<PhaseMimicTrunkManager />} />
                        <Route path="/real-world-puzzles" element={<RealWorldPuzzles />} />
                        <Route path="/guild-phases" element={<GuildPhaseManager />} />
                        <Route path="/fly-on-the-wall" element={<FlyOnTheWall />} />
                        <Route path="/transparency" element={<FlyOnTheWall />} />
                        <Route path="/why-no-ads" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><WhyNoAds /></Suspense></ExplorerRoute>} />
                        <Route path="/why-no-vc" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><WhyNoVC /></Suspense></ExplorerRoute>} />
                        <Route path="/faq" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FAQ /></Suspense>} />
                        <Route path="/create" element={<CreateProject />} />
                        <Route path="/feathers" element={<ExplorerRoute><DeckCollection /></ExplorerRoute>} />
                        <Route path="/the-bridge" element={<Navigate to="/durins-door" replace />} />
                        <Route path="/bridge" element={<Navigate to="/durins-door" replace />} />
                        <Route path="/deck" element={<ExplorerRoute><DeckCollection /></ExplorerRoute>} />
                        <Route path="/cards" element={<ExplorerRoute><DeckCollection /></ExplorerRoute>} />
                        <Route path="/forge" element={<ExplorerRoute><ScrollForgePage /></ExplorerRoute>} />
                        <Route path="/scroll-forge" element={<ExplorerRoute><ScrollForgePage /></ExplorerRoute>} />
                        <Route path="/beacons" element={<TheHelm />} />
                        <Route path="/beacon-explainer" element={<BeaconExplainer />} />
                        <Route path="/journey-map" element={<ExplorerRoute><HelmPage /></ExplorerRoute>} />
                        <Route path="/beacon-runs" element={<ExplorerRoute><HelmPage /></ExplorerRoute>} />
                        <Route path="/beacon-run/:slug" element={<ExplorerRoute><HelmPage /></ExplorerRoute>} />
                        <Route path="/wildfire-runs" element={<ExplorerRoute><WildfireRunsPage /></ExplorerRoute>} />
                        <Route path="/wildfire-run/:slug" element={<ExplorerRoute><WildfireRunsPage /></ExplorerRoute>} />
                        <Route path="/magic-carpet" element={<ExplorerRoute><WildfireRunsPage /></ExplorerRoute>} />
                        <Route path="/governance" element={<Governance />} />
                        <Route path="/governance/proposals" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProposalsListing /></Suspense></ExplorerRoute>} />
                        <Route path="/the-300" element={<Governance />} />
                        <Route path="/patent-portfolio" element={<PatentPortfolio />} />
                        <Route path="/ip-portfolio/:qrCode?" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><IPPortfolioPage /></Suspense>} />
                        <Route path="/economics" element={<EconomicLaws />} />
                        <Route path="/economics/:paperId" element={<PaperPage />} />
                        <Route path="/the300" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><The300Page /></Suspense>} />
                        <Route path="/the300/:pedestalId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PedestalDetailPage /></Suspense>} />
                        <Route path="/star-chamber-legacy" element={<Governance />} />
                        <Route path="/initiatives/:slug" element={<ExplorerRoute><InitiativePage /></ExplorerRoute>} />
                        <Route path="/matchtrade" element={<MatchTrade />} />
                        <Route path="/marks-for-marks" element={<MatchTrade />} />
                        <Route path="/arena" element={<ExplorerRoute><DesignBattleArena /></ExplorerRoute>} />
                        <Route path="/design-battle" element={<ExplorerRoute><DesignBattleArena /></ExplorerRoute>} />
                        <Route path="/battles" element={<ExplorerRoute><DesignBattleArena /></ExplorerRoute>} />
                        <Route path="/design/themes" element={<ExplorerRoute><ThemeGallery /></ExplorerRoute>} />
                        <Route path="/design/themes/create" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ThemeEditorPage /></Suspense></ProtectedRoute>} />
                        <Route path="/emporium/templates" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><EmporiumTemplates /></Suspense>} />
                        <Route path="/emporium/designs" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><EmporiumTemplates /></Suspense>} />
                        <Route path="/emporium" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><EmporiumTemplates /></Suspense>} />
                        <Route path="/medallion-management" element={<ProtectedRoute><MedallionManagement /></ProtectedRoute>} />
                        
                        {/* C+20 Pilot Program Routes */}
                        <Route path="/c20" element={<ProtectedRoute><C20PilotDashboard /></ProtectedRoute>} />
                        <Route path="/c20-pilot" element={<ProtectedRoute><C20PilotDashboard /></ProtectedRoute>} />
                        <Route path="/toe-dipping" element={<ProtectedRoute><C20PilotDashboard /></ProtectedRoute>} />
                        <Route path="/c20/leaderboard" element={<C20Leaderboard />} />
                        <Route path="/reciprocity-leaderboard" element={<C20Leaderboard />} />
                        <Route path="/xp-leaderboard" element={<XPLeaderboard />} />

                        {/* Sessions 40-45 routes */}
                        <Route path="/store-templates" element={<ExplorerRoute><StoreTemplates /></ExplorerRoute>} />
                        <Route path="/showcase-promotion" element={<ProtectedRoute><ShowcasePromotion /></ProtectedRoute>} />
                        <Route path="/ghost-world/mall" element={<ExplorerRoute><GhostWorldMall /></ExplorerRoute>} />
                        <Route path="/ghost-world/map" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GhostWorldMap /></Suspense>} />
                        <Route path="/hexisle/explore" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><GhostWorldMap /></Suspense>} />
                        <Route path="/member-agreement" element={<MemberAgreement />} />
                        <Route path="/creator-draft-pick" element={<ExplorerRoute><CreatorDraftPick /></ExplorerRoute>} />
                        <Route path="/onboarding/trickle" element={<ProtectedRoute><TrickleOnboarding /></ProtectedRoute>} />
                        <Route path="/vouch" element={<ProtectedRoute><VouchSystem /></ProtectedRoute>} />
                        <Route path="/subscriptions" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><Subscriptions /></Suspense>} />
                        <Route path="/tools/storefront-builder" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StorefrontBuilder /></Suspense></ProtectedRoute>} />
                        <Route path="/menu/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MenuPage /></Suspense>} />
                        <Route path="/dashboard/provider" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProviderDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/runner" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><RunnerDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/onboarder" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><OnboarderDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/lb-card" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LBCardPage /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/fund-card" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FundMyCard /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/war-chest" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><WarChestPage /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/payouts" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PayoutsPage /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/helm" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HelmActionsPage /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/oob" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><OutOfBoundsPage /></Suspense></ProtectedRoute>} />
                        <Route path="/settings/social-accounts" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SocialAccountsPage /></Suspense></ProtectedRoute>} />
                        <Route path="/admin/feature-flags" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><FounderFeatureFlags /></Suspense></ProtectedRoute>} />
                        <Route path="/calendar" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CalendarPage /></Suspense></ProtectedRoute>} />
                        <Route path="/tools/cue-card-generator" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CueCardGenerator /></Suspense></ProtectedRoute>} />
                        <Route path="/treasure-maps" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TreasureMaps /></Suspense>} />
                        <Route path="/treasure-maps/:mapId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TreasureMapGuide /></Suspense>} />
                        <Route path="/chain-voting" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ChainVoting /></Suspense>} />

                        {/* K119: Social Import + Bridge-to-Local */}
                        <Route path="/import" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><SocialImportPage /></Suspense></ProtectedRoute>} />
                        <Route path="/dashboard/bridges" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ConnectedServicesPage /></Suspense></ProtectedRoute>} />

                        {/* Sessions 47-49 routes (Bishop 013) */}
                        <Route path="/santa" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SantaEverAfter /></Suspense></ProtectedRoute>} />
                        <Route path="/node-captain" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><NodeCaptainPage /></Suspense></ProtectedRoute>} />
                        <Route path="/star-chamber" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StarChamber /></Suspense></ProtectedRoute>} />
                        <Route path="/castle" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><Castle /></Suspense>} />
                        <Route path="/c-plus-20" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CPlus20Dashboard /></Suspense>} />
                        <Route path="/tereno-certification" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TerenoCertificationPage /></Suspense></ExplorerRoute>} />
                        <Route path="/the-forge" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ModularManufacturing /></Suspense></ProtectedRoute>} />
                        <Route path="/maker-spotlight" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MakerSpotlightPage /></Suspense>} />
                        <Route path="/proteus-anchor" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProteusAnchorPage /></Suspense>} />
                        <Route path="/designed-to-be-broken" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DesignedToBeBroken /></Suspense>} />
                        <Route path="/as-you-wish" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AsYouWishCard /></Suspense>} />
                        <Route path="/no-atomo" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><NoAtomo /></Suspense>} />

                        {/* New Routes — Feb 9 Session 2 */}
                        <Route path="/herald-success" element={<ProtectedRoute><HeraldSuccess /></ProtectedRoute>} />
                        <Route path="/sponsor-success" element={<ProtectedRoute><SponsorSuccess /></ProtectedRoute>} />
                        <Route path="/manufacturing" element={<ProtectedRoute><ManufacturingStore /></ProtectedRoute>} />
                        <Route path="/store" element={<ProtectedRoute><ManufacturingStore /></ProtectedRoute>} />
                        <Route path="/lets-make-bread" element={<ProtectedRoute><ManufacturingStore /></ProtectedRoute>} />
                        
                        {/* Factory System — Decentralized Manufacturing */}
                        <Route path="/factory" element={<ExplorerRoute><FactoryHub /></ExplorerRoute>} />
                        <Route path="/factory/hub" element={<ExplorerRoute><FactoryHub /></ExplorerRoute>} />
                        <Route path="/factory/nodes" element={<ProtectedRoute><NodeRegistration /></ProtectedRoute>} />
                        <Route path="/factory/register" element={<ProtectedRoute><NodeRegistration /></ProtectedRoute>} />
                        <Route path="/factory/bounties" element={<ProtectedRoute><ManufacturingStore /></ProtectedRoute>} />
                        <Route path="/factory/canister" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CanisterConfigurator /></Suspense></ExplorerRoute>} />
                        <Route path="/factory/canister/shop" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CanisterProductCatalog /></Suspense></ExplorerRoute>} />
                        <Route path="/canister/bom" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CanisterBOMPage /></Suspense></ExplorerRoute>} />
                        <Route path="/brass-tacks" element={<ExplorerRoute><FactoryHub /></ExplorerRoute>} />
                        <Route path="/looking-glass" element={<LookingGlass />} />
                        <Route path="/glass" element={<LookingGlass />} />
                        <Route path="/governance/proposals/:id" element={<ProposalDetail />} />
                        <Route path="/steward" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StewardDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/steward/apply" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StewardApply /></Suspense></ProtectedRoute>} />
                        <Route path="/treasure-map-game" element={<TreasureMapGame />} />
                        <Route path="/52-cards" element={<TreasureMapGame />} />
                        <Route path="/card-hunt" element={<TreasureMapGame />} />
                        <Route path="/treasure-map/create" element={<TreasureMapCreator />} />
                        {/* /create-map moved to Cold Start section below; TreasureMapCreator still at /treasure-map/create */}
                        <Route path="/beacon-run/create" element={<ProtectedRoute><BeaconRunCreator /></ProtectedRoute>} />
                        <Route path="/create-beacon-run" element={<ProtectedRoute><BeaconRunCreator /></ProtectedRoute>} />
                        
                        {/* Senate — Governance Navigation Hub */}
                        <Route path="/senate" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        <Route path="/senate/tower" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        <Route path="/senate/tower/:level" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        <Route path="/senate/records" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        <Route path="/senate/innovations" element={<ExplorerRoute><HallOfInnovations /></ExplorerRoute>} />
                        <Route path="/hall-of-innovations" element={<ExplorerRoute><HallOfInnovations /></ExplorerRoute>} />
                        <Route path="/innovations" element={<ExplorerRoute><HallOfInnovations /></ExplorerRoute>} />
                        <Route path="/senate/projects" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        <Route path="/senate/saltmines" element={<ExplorerRoute><Senate /></ExplorerRoute>} />
                        
                        {/* Switzerland Rule Arenas — OUTSIDE LB proper */}
                        <Route path="/arenas" element={<Arenas />} />
                        <Route path="/political-expedition" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PoliticalExpeditionPage /></Suspense></ExplorerRoute>} />
                        <Route path="/areopagus" element={<Arenas />} />
                        <Route path="/crucible" element={<Arenas />} />
                        <Route path="/petitions" element={<Petitions />} />
                        <Route path="/discover/:area" element={<Discover />} />
                        
                        {/* Admin/Dev Routes (still accessible in marketplace) */}
                        <Route path="/admin/project/create" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
                        <Route path="/admin/industry-pricing" element={<ProtectedRoute><IndustryPricing /></ProtectedRoute>} />
                        <Route path="/template-setup" element={<ProtectedRoute><TemplateSetup /></ProtectedRoute>} />
                        <Route path="/simulator" element={<ProtectedRoute><Simulator /></ProtectedRoute>} />
                        <Route path="/task-log" element={<ProtectedRoute><TaskLog /></ProtectedRoute>} />
                        <Route path="/sample-xml" element={<ProtectedRoute><SampleDataXML /></ProtectedRoute>} />
                        <Route path="/admin/failure-queue" element={<ProtectedRoute><div className="container mx-auto p-6"><FailureQueueDashboard /></div></ProtectedRoute>} />
                        <Route path="/membership-success" element={<ProtectedRoute><MembershipSuccess /></ProtectedRoute>} />
                        <Route path="/membership/confirm" element={<MembershipConfirm />} />
              <Route path="/admin/roles" element={<ProtectedRoute><RoleManagement /></ProtectedRoute>} />
              <Route path="/admin/showcase" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><ShowcaseAdminPage /></Suspense></ProtectedRoute>} />
              <Route path="/admin/company-independence" element={<ProtectedRoute><CompanyIndependenceManager /></ProtectedRoute>} />
              <Route path="/projects/:projectId/scale-rates" element={<ProtectedRoute><ContractScaleManager /></ProtectedRoute>} />
              <Route path="/external-services" element={<ProtectedRoute><ExternalServices /></ProtectedRoute>} />
              <Route path="/admin/service-review" element={<ProtectedRoute><AdminServiceReview /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/side-quests" element={<ProtectedRoute><SideQuests /></ProtectedRoute>} />
              <Route path="/docs/video-scripts" element={<VideoScripts />} />
              <Route path="/pre-beta-recruits" element={<ProtectedRoute><PreBetaRecruits /></ProtectedRoute>} />
              <Route path="/asset-library" element={<ProtectedRoute><LBAssetLibrary /></ProtectedRoute>} />
              <Route path="/prototyping" element={<ProtectedRoute><PrototypingContracts /></ProtectedRoute>} />
              <Route path="/positions/browse" element={<ProtectedRoute><AllPositionsBrowse /></ProtectedRoute>} />
                        <Route path="/guild-stake-success" element={<ProtectedRoute><GuildStakeSuccess /></ProtectedRoute>} />
                        <Route path="/credit-purchase-success" element={<ProtectedRoute><CreditPurchaseSuccess /></ProtectedRoute>} />
                        <Route path="/preorder-success" element={<ProtectedRoute><PreOrderSuccess /></ProtectedRoute>} />
                        <Route path="/business-plan-generator" element={<ProtectedRoute><BusinessPlanGenerator /></ProtectedRoute>} />
                        <Route path="/business-plan" element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
                        <Route path="/docs/business-plan" element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
                        
                        {/* Business routes (mounted directly here for preview/dev) */}
                        <Route path="/positions" element={<ProtectedRoute><ContractPositions /></ProtectedRoute>} />
                        <Route path="/manage-positions" element={<ProtectedRoute><ManagePositions /></ProtectedRoute>} />
                        <Route path="/admin-project/:id" element={<ProtectedRoute><AdminProject /></ProtectedRoute>} />
                        <Route path="/task-list" element={<ProtectedRoute><TaskList /></ProtectedRoute>} />
                        <Route path="/tasks" element={<Navigate to="/task-list" replace />} />
                        <Route path="/subdomain-manager" element={<ProtectedRoute><SubdomainManager /></ProtectedRoute>} />
                        <Route path="/client-api-manager" element={<ProtectedRoute><ClientAPIManager /></ProtectedRoute>} />
                        <Route path="/credential-management" element={<ProtectedRoute><CredentialManagement /></ProtectedRoute>} />
                        <Route path="/member-resources" element={<ProtectedRoute><MemberResources /></ProtectedRoute>} />
                        <Route path="/workshop" element={<ProtectedRoute><Workshop /></ProtectedRoute>} />
                        <Route path="/campaign-production/:workstationId" element={<ProtectedRoute><CampaignProduction /></ProtectedRoute>} />
                        <Route path="/project-landing/:projectId/:segmentSlug?" element={<ProjectLanding />} />
                        <Route path="/landing-manager/:projectId" element={<ProtectedRoute><LandingPageManager /></ProtectedRoute>} />
                          <Route path="/briefcase" element={<ProtectedRoute><Briefcase /></ProtectedRoute>} />
                          <Route path="/moneypenny" element={<ProtectedRoute><MoneyPenny /></ProtectedRoute>} />
                          <Route path="/moneypenny/briefing" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MoneypennyBriefing /></Suspense></ProtectedRoute>} />
                          <Route path="/moneypenny/spotlight" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SpotlightManager /></Suspense></ProtectedRoute>} />
                          <Route path="/moneypenny/social" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MoneyPennySocial /></Suspense></ProtectedRoute>} />
                          <Route path="/moneypenny/qa" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MoneyPennyQA /></Suspense></ProtectedRoute>} />
                          <Route path="/academy" element={<ExplorerRoute><Academy /></ExplorerRoute>} />
                          <Route path="/hexisle-dashboard" element={<ProtectedRoute><HexisleDashboard /></ProtectedRoute>} />
                        
                        {/* Initiative Project Routes */}
                        <Route path="/initiatives" element={<ExplorerRoute><InitiativeProjectsPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-make-dinner" element={<ExplorerRoute><LetsMakeDinnerPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-make-dinner/about" element={<ExplorerRoute><LetsMakeDinnerLanding /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-make-dinner/reviews" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LMDReviewerDashboard /></Suspense></ProtectedRoute>} />
                        <Route path="/initiatives/lets-make-dinner/review/:mealId" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LMDReviewSubmitPage /></Suspense></ProtectedRoute>} />
                        <Route path="/initiatives/lets-make-dinner/start-node" element={<ExplorerRoute><ServiceNodeRegistration /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-make-dinner/chefs" element={<ExplorerRoute><ChefMarketplacePage /></ExplorerRoute>} />
                        <Route path="/service-node/register" element={<ExplorerRoute><ServiceNodeRegistration /></ExplorerRoute>} />
                        <Route path="/initiatives/the-pantry" element={<ExplorerRoute><PantryPage /></ExplorerRoute>} />
                        <Route path="/initiatives/family-table" element={<ExplorerRoute><FamilyTablePage /></ExplorerRoute>} />
                        <Route path="/initiatives/family-table/sessions" element={<ExplorerRoute><GroupCookPage /></ExplorerRoute>} />
                        <Route path="/initiatives/family-table/host-session" element={<Navigate to="/initiatives/family-table/sessions" replace />} />
                        <Route path="/initiatives/family-table/start-pod" element={<Navigate to="/initiatives/family-table" replace />} />
                        <Route path="/initiatives/lets-make-dinner/become-chef" element={<Navigate to="/initiatives/lets-make-dinner/chefs" replace />} />
                        <Route path="/initiatives/lets-make-dinner/register-business" element={<Navigate to="/initiatives/lets-make-dinner/start-node" replace />} />
                        <Route path="/initiatives/lets-make-dinner/register-kitchen" element={<Navigate to="/initiatives/lets-make-dinner/start-node" replace />} />
                        
                        {/* Family Table — Family Management System */}
                        <Route path="/family" element={<ExplorerRoute><FamilyPage /></ExplorerRoute>} />
                        <Route path="/family/:familyId" element={<ProtectedRoute><FamilyDetailPage /></ProtectedRoute>} />
                        <Route path="/family/:familyId/gifts" element={<ProtectedRoute><FamilyDetailPage /></ProtectedRoute>} />
                        <Route path="/family/:familyId/calendar" element={<ProtectedRoute><FamilyDetailPage /></ProtectedRoute>} />
                        <Route path="/initiatives/defense-claws" element={<ExplorerRoute><DefenseClawsPage /></ExplorerRoute>} />
                        {/* /initiatives/defense-klaus already defined above with DefenseKlausPage */}
                        
                        {/* Defense Klaus Submarine Door System */}
                        <Route path="/defense-klaus" element={<DefenseKlausSubmarineDoor />} />
                        <Route path="/defense-klaus/gift/:referralCode" element={<DefenseKlausSubmarineDoor />} />
                        
                        {/* Help Each Other Help Ourselves - Philosophy Page */}
                        <Route path="/help-each-other" element={<ExplorerRoute><HelpEachOtherPage /></ExplorerRoute>} />
                        <Route path="/starter-kit" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StarterKitPage /></Suspense></ExplorerRoute>} />
                        <Route path="/initiatives/msa" element={<ExplorerRoute><MSAPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lifeline-medications" element={<ExplorerRoute><LifeLineMedicationsPage /></ExplorerRoute>} />
                        <Route path="/initiatives/tatiana-schlossburg-health-accords" element={<ExplorerRoute><LifeLineMedicationsPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-go-shopping" element={<ExplorerRoute><LetsGoShoppingPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-get-groceries" element={<ExplorerRoute><LetsGetGroceriesPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-get-groceries/box" element={<ExplorerRoute><GroceryBoxPage /></ExplorerRoute>} />
                        <Route path="/initiatives/lets-get-groceries/start-node" element={<ExplorerRoute><GroceryNodeRegistration /></ExplorerRoute>} />
                        <Route path="/initiatives/proprietary-recipes" element={<ExplorerRoute><ProprietaryRecipesPage /></ExplorerRoute>} />
                        <Route path="/initiatives/taste-tester" element={<ExplorerRoute><TasteTesterDashboard /></ExplorerRoute>} />
                        <Route path="/initiatives/cottage-law" element={<ExplorerRoute><CottageLawPage /></ExplorerRoute>} />
                        <Route path="/initiatives/documentation" element={<ExplorerRoute><DocumentationMarketplacePage /></ExplorerRoute>} />
                        {/* Generic InitiativePage routes removed — these slugs have dedicated page components defined above */}
                        
                        {/* Concentric Circle Testing Dashboard */}
                        <Route path="/testing/circles" element={<ProtectedRoute><ConcentricCircles /></ProtectedRoute>} />

                        {/* Steward & Admin Tools */}
                        <Route path="/steward/legal-formations" element={<ProtectedRoute><StewardLegalDashboard /></ProtectedRoute>} />
                        <Route path="/send-lists" element={<ProtectedRoute><SendLists /></ProtectedRoute>} />
                        <Route path="/themes" element={<ProtectedRoute><ThemeManagement /></ProtectedRoute>} />
                        
                        {/* Contingency Operators — Innovation #1188 */}
                        <Route path="/contingency-operators" element={<ProtectedRoute><ContingencyOperatorsPage /></ProtectedRoute>} />
                        <Route path="/thought-experiments" element={<ProtectedRoute><ContingencyOperatorsPage /></ProtectedRoute>} />
                        <Route path="/co" element={<ProtectedRoute><ContingencyOperatorsPage /></ProtectedRoute>} />
                        
                        {/* Thought Experiment — "What If" Business Simulator */}
                        <Route path="/crank-it" element={<CrankIt />} />
                        <Route path="/cold-start" element={<CrankIt />} />
                        <Route path="/thought-experiment" element={<ThoughtExperiment />} />
                        <Route path="/what-if" element={<ThoughtExperiment />} />

                        {/* Missing routes — wired Feb 9 Session 3 */}
                        <Route path="/clans" element={<ProtectedRoute><Tribes /></ProtectedRoute>} />
                        <Route path="/funding-pool" element={<ProtectedRoute><BrowseNonprofit /></ProtectedRoute>} />
                        <Route path="/eoi-vesting" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                        <Route path="/gas-tracking" element={<ProtectedRoute><LookingGlass /></ProtectedRoute>} />
                        <Route path="/project-costs" element={<ProtectedRoute><BrowseNetwork /></ProtectedRoute>} />
                        <Route path="/blockchain/overview" element={<ProtectedRoute><BlockchainExplorer /></ProtectedRoute>} />
                        
                        {/* Browse portals */}
                        <Route path="/browse/marketplace" element={<BrowseMarketplace />} />
                        <Route path="/browse/business" element={<ProtectedRoute><BrowseBusiness /></ProtectedRoute>} />
                        <Route path="/browse/nonprofit" element={<ProtectedRoute><BrowseNonprofit /></ProtectedRoute>} />
                        <Route path="/browse/network" element={<ProtectedRoute><BrowseNetwork /></ProtectedRoute>} />
                        
                        {/* Cue Card Landing Pages */}
          <Route path="/tower-of-peace" element={<TowerOfPeace />} />
          <Route path="/cue/sponsor" element={<CueCardSponsorPortal />} />
          <Route path="/cue/durins-door" element={<CueCardDurinsDoor />} />
          <Route path="/canada40k" element={<Canada40K />} />
          <Route path="/beacon" element={<WildfireBeaconRun />} />
          <Route path="/hall-of-records" element={<HallOfRecords />} />
          <Route path="/mainland" element={<MainlandHub />} />
          <Route path="/bounties" element={<CodeBreakersHub />} />
          <Route path="/business-cards" element={<BusinessCardPortal />} />
          <Route path="/hexisle/keeps" element={<KeepsLobby />} />
          <Route path="/cue/hexisle-world" element={<HexIsleWorldCard />} />
          
          {/* A.T.T.I. Campaign (Innovation #1555) */}
          <Route path="/atti" element={<ATTILanding />} />
          <Route path="/bifrost" element={<ProtectedRoute><BifrostCardBuilder /></ProtectedRoute>} />
          <Route path="/card-builder" element={<ProtectedRoute><BifrostCardBuilder /></ProtectedRoute>} />

          {/* Cold Start & Stewardship System (Milestone 2) */}
          <Route path="/cold-start-dashboard" element={<ColdStartDashboard />} />
          <Route path="/become-captain/:initiativeId" element={<BecomeCaptain />} />
          <Route path="/cold-start/:initiativeId" element={<ColdStartDashboard />} />
          <Route path="/create-map" element={<TreasureMapBuilder />} />
          <Route path="/incumbent-advantage" element={<IncumbentAdvantage />} />

          {/* HexIsle Encyclopedia + Island Sub-Pages (Session 6H) */}
          <Route path="/hexisle/encyclopedia" element={<ExplorerRoute><HexIsleEncyclopedia /></ExplorerRoute>} />
          <Route path="/hexisle/:islandName" element={<ExplorerRoute><HexIsleIslandPage /></ExplorerRoute>} />

          {/* Crew Tables — Design Pipeline (Session 87) */}
          <Route path="/crew-tables" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CrewTablesPage /></Suspense></ExplorerRoute>} />

          {/* Mission TWO: Housing (Session 89) */}
          <Route path="/housing" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><HousingPage /></Suspense></ExplorerRoute>} />
          <Route path="/shelter" element={<Navigate to="/housing" replace />} />
          <Route path="/mission-two" element={<Navigate to="/housing" replace />} />

          {/* Vehicle Systems — Rally Group (Session 85) */}
          <Route path="/lemon-lot" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LemonLot /></Suspense></ExplorerRoute>} />
          <Route path="/local-wheels" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><LocalWheels /></Suspense></ExplorerRoute>} />
          <Route path="/rideshare-routes" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><RideshareRoutesPage /></Suspense></ExplorerRoute>} />
          <Route path="/rideshare" element={<Navigate to="/rideshare-routes" replace />} />
          <Route path="/fleet" element={<Navigate to="/local-wheels" replace />} />
          <Route path="/vehicle-sharing" element={<Navigate to="/lemon-lot" replace />} />

          {/* ADAPT Score Dashboard (Session 92) */}
          <Route path="/adapt-score" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><AdaptScore /></Suspense></ExplorerRoute>} />
          <Route path="/adapt" element={<Navigate to="/adapt-score" replace />} />
          <Route path="/effectiveness" element={<Navigate to="/adapt-score" replace />} />

          {/* K114: Subscription Engine + Coalition Formation */}
          <Route path="/subscribe" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SubscribePage /></Suspense></ExplorerRoute>} />
          <Route path="/coalitions" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CoalitionDirectory /></Suspense></ExplorerRoute>} />
          <Route path="/coalitions/create" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CoalitionCreate /></Suspense></ProtectedRoute>} />
          <Route path="/coalitions/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><CoalitionDetail /></Suspense></ExplorerRoute>} />
          <Route path="/alliances" element={<Navigate to="/coalitions" replace />} />

          {/* Coaster Medallion & Farmer Supply Chain (Session 6F/6G) */}
          <Route path="/coaster-medallion" element={<ExplorerRoute><CoasterMedallionProject /></ExplorerRoute>} />
          <Route path="/farmer-supply-chain" element={<ExplorerRoute><FarmerSupplyChainPage /></ExplorerRoute>} />
          <Route path="/meal-kits" element={<ExplorerRoute><FarmerSupplyChainPage /></ExplorerRoute>} />
          <Route path="/freeze-dried" element={<ExplorerRoute><FarmerSupplyChainPage /></ExplorerRoute>} />

          {/* K120: Contest Infrastructure + Buy Credits */}
          <Route path="/contests" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ContestDirectory /></Suspense></ExplorerRoute>} />
          <Route path="/contests/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ContestDetailPage /></Suspense></ExplorerRoute>} />
          <Route path="/contests/:slug/enter" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ContestEntryPage /></Suspense></ProtectedRoute>} />
          <Route path="/buy-credits" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BuyCreditsPage /></Suspense></ProtectedRoute>} />
          <Route path="/dashboard/payments" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PayoutsPage /></Suspense></ProtectedRoute>} />

          {/* K127: Business Campaign Onboarding */}
          <Route path="/campaigns" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BusinessCampaignDirectory /></Suspense>} />
          <Route path="/campaigns/nominate" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><NominateBusinessPage /></Suspense></ProtectedRoute>} />
          <Route path="/campaigns/:slug" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BusinessCampaignDetail /></Suspense>} />
          <Route path="/campaigns/:slug/pitch-packet" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PitchPacketPage /></Suspense></ProtectedRoute>} />

          {/* K137: Cephas Knowledge Graph — community resources + bidirectional links */}
          <Route path="/knowledge/:slug" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-foreground">Loading...</div></div>}><KnowledgeViewer /></Suspense></ExplorerRoute>} />

          {/* K141: X-Ray Bounty Arena — gamified error hunting + design auctions */}
          <Route path="/dashboard/bounty-arena" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><XRayBountyDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/auction" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DesignAuctionPage /></Suspense>} />

          {/* K147: Piggyback Improvement Pipeline — community improvement submissions */}
          <Route path="/piggyback" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PiggybackSubmitPage /></Suspense></ProtectedRoute>} />
          <Route path="/dashboard/piggyback-review" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><PiggybackReviewPage /></Suspense></ProtectedRoute>} />
          <Route path="/dashboard/my-improvements" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MyPiggybackPage /></Suspense></ProtectedRoute>} />

          {/* K142: Production Project Pages — Industry Backbone */}
          <Route path="/production" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProjectsDirectoryPage /></Suspense></ExplorerRoute>} />
          <Route path="/production/:projectId" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><ProductionProjectPage /></Suspense></ExplorerRoute>} />

          {/* K143: 2nd Second Landing — Manufacturing Escalation Ladder */}
          <Route path="/2nd-second" element={<ExplorerRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><SecondSecondLanding /></Suspense></ExplorerRoute>} />

          {/* K121: Stripe Billing — Membership Tiers, Credits, Earnings */}
          <Route path="/membership" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MembershipPage /></Suspense>} />
          <Route path="/dashboard/membership" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MembershipDashboard /></Suspense></ProtectedRoute>} />
          <Route path="/dashboard/earnings" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><EarningsDashboard /></Suspense></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
                      </Routes>
                  </Suspense>
                  </ErrorBoundary>
                </AppShell>
              </SubdomainRouter>
              {/* <CrowsNestFloat /> */}{/* Replaced by DenkenMenu */}
              <DenkenMenu />
              <BeaconBiteNudge />
              <CrowsNestOverlay />
              <LarkSidePanel />
              <XRayOverlay />
              <CoinFlipAnimation />
            </RecordingProvider>
          </CrowsNestProvider>
          </PathwayProgressProvider>
          </MockDataProvider>
          </WildfireRunProvider>
          </FeatureTipProvider>
          </SeamlessOnboardProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
    </BuilderModeProvider>
  </QueryClientProvider>
);

export default App;
