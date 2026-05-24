import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ExplorerRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { LazyPage } from "./LazyPage";
import Index from "@/pages/Index";

const Auth = lazy(() => import("@/pages/Auth"));
const TikTokCallback = lazy(() => import("@/pages/TikTokCallback"));
const GhostWorld = lazy(() => import("@/pages/GhostWorld"));
const GhostBrowseV2Page = lazy(() => import("@/pages/GhostBrowseV2Page"));
const GhostWorldMap = lazy(() => import("@/pages/GhostWorldMap"));
const MemberProfile = lazy(() => import("@/pages/MemberProfile"));
const PortalGateway = lazy(() => import("@/pages/PortalGateway"));
const LikeWhatPage = lazy(() => import("@/pages/LikeWhatPage"));
const SearchResultsPage = lazy(() => import("@/pages/SearchResultsPage"));
const PatrioticInterdependentalist = lazy(() => import("@/pages/PatrioticInterdependentalist"));
const PuddingDemo = lazy(() => import("@/pages/PuddingDemo"));
const NotLeftNotRightPage = lazy(() => import("@/pages/cue-cards/NotLeftNotRightPage"));
const SanAntonioLanding = lazy(() => import("@/pages/SanAntonioLanding"));
const DailyNews = lazy(() => import("@/pages/DailyNews"));
const BandWagon = lazy(() => import("@/pages/BandWagon"));
const Discover = lazy(() => import("@/pages/Discover"));
const BoiseBusinessCardsExample = lazy(() => import("@/pages/BoiseBusinessCardsExample"));
const HelpEachOtherPage = lazy(() => import("@/pages/HelpEachOtherPage"));
const MissionOnePage = lazy(() => import("@/pages/MissionOnePage"));
const DurinsDoor = lazy(() => import("@/pages/DurinsDoor"));
const FriendPage = lazy(() => import("@/pages/FriendPage"));
const CommunitySupport = lazy(() => import("@/pages/CommunitySupport"));
const DeveloperPortal = lazy(() => import("@/pages/DeveloperPortal"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const ReputationProfile = lazy(() => import("@/pages/ReputationProfile"));
const WhyNoAds = lazy(() => import("@/pages/WhyNoAds"));
const WhyNoVC = lazy(() => import("@/pages/WhyNoVC"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const CreatorRedCarpet = lazy(() => import("@/pages/CreatorRedCarpet"));
const PressJunket = lazy(() => import("@/pages/PressJunket"));
const ReadLandingPage = lazy(() => import("@/pages/ReadLandingPage"));
const ViewingSchedulePage = lazy(() => import("@/pages/ViewingSchedulePage"));
const WildfireTourEntry = lazy(() => import("@/pages/WildfireTourEntry"));
const WhoCanUsePage = lazy(() => import("@/pages/WhoCanUsePage"));
const EntityMembershipApply = lazy(() => import("@/pages/EntityMembershipApply"));
const EntityMembershipDashboard = lazy(() => import("@/pages/EntityMembershipDashboard"));
const PedestalStakeLearn = lazy(() => import("@/pages/PedestalStakeLearn"));
const PedestalStakeEarlyInterest = lazy(() => import("@/pages/PedestalStakeEarlyInterest"));
const PedestalStakeApply = lazy(() => import("@/pages/PedestalStakeApply"));
const PedestalStakeDashboard = lazy(() => import("@/pages/PedestalStakeDashboard"));
const MiniTour = lazy(() => import("@/pages/MiniTour"));
const TestFrameDemo = lazy(() => import("@/pages/TestFrameDemo"));
const MedallionPage = lazy(() => import("@/pages/MedallionPage"));
const MnemosyneDownloadPage = lazy(() => import("@/components/MnemosyneDownload"));

function HomepageGateway() {
  const { user, loading } = useAuth();
  // frame.lianabanyan.com — route / directly to the demo page
  if (typeof window !== "undefined" && window.location.hostname === "frame.lianabanyan.com") {
    return <Navigate to="/demo" replace />;
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/welcome" replace />;
  return <Index />;
}

export const publicRoutes = (
  <>
    <Route path="/" element={<HomepageGateway />} />
    <Route path="/classic-landing" element={<Index />} />
    <Route path="/auth" element={<LazyPage><Auth /></LazyPage>} />
    <Route path="/auth/tiktok/callback" element={<LazyPage><TikTokCallback /></LazyPage>} />
    <Route path="/ghost" element={<LazyPage><GhostWorld /></LazyPage>} />
    <Route path="/ghost-browse" element={<LazyPage><GhostBrowseV2Page /></LazyPage>} />
    <Route path="/ghost-world" element={<LazyPage><GhostWorldMap /></LazyPage>} />
    <Route path="/explore" element={<LazyPage><GhostWorld /></LazyPage>} />
    <Route path="/free-explore" element={<LazyPage><GhostWorld /></LazyPage>} />
    <Route path="/member/:username" element={<LazyPage><MemberProfile /></LazyPage>} />
    <Route path="/portal" element={<ExplorerRoute><LazyPage><PortalGateway /></LazyPage></ExplorerRoute>} />
    <Route path="/enter" element={<ExplorerRoute><LazyPage><PortalGateway /></LazyPage></ExplorerRoute>} />
    <Route path="/like-what" element={<LazyPage><LikeWhatPage /></LazyPage>} />
    <Route path="/search" element={<LazyPage><SearchResultsPage /></LazyPage>} />
    <Route path="/reputation/:userId" element={<LazyPage><ReputationProfile /></LazyPage>} />
    <Route path="/about/patriotic-interdependentalist" element={<LazyPage><PatrioticInterdependentalist /></LazyPage>} />
    <Route path="/pudding" element={<LazyPage><PuddingDemo /></LazyPage>} />
    <Route path="/components" element={<LazyPage><PuddingDemo /></LazyPage>} />
    <Route path="/forward" element={<LazyPage><NotLeftNotRightPage /></LazyPage>} />
    <Route path="/sanantonio" element={<LazyPage><SanAntonioLanding /></LazyPage>} />
    <Route path="/daily-news" element={<LazyPage><DailyNews /></LazyPage>} />
    <Route path="/bandwagon" element={<LazyPage><BandWagon /></LazyPage>} />
    <Route path="/discover/:area" element={<LazyPage><Discover /></LazyPage>} />
    <Route path="/worked-example" element={<LazyPage><BoiseBusinessCardsExample /></LazyPage>} />
    <Route path="/help-each-other" element={<ExplorerRoute><LazyPage><HelpEachOtherPage /></LazyPage></ExplorerRoute>} />
    <Route path="/mission-one" element={<ExplorerRoute><LazyPage><MissionOnePage /></LazyPage></ExplorerRoute>} />
    <Route path="/durins-door" element={<ExplorerRoute><LazyPage><DurinsDoor /></LazyPage></ExplorerRoute>} />
    <Route path="/international" element={<ExplorerRoute><LazyPage><DurinsDoor /></LazyPage></ExplorerRoute>} />
    <Route path="/door" element={<LazyPage><DurinsDoor /></LazyPage>} />
    <Route path="/friend" element={<ExplorerRoute><LazyPage><FriendPage /></LazyPage></ExplorerRoute>} />
    <Route path="/support" element={<ExplorerRoute><LazyPage><CommunitySupport /></LazyPage></ExplorerRoute>} />
    <Route path="/community-support" element={<ExplorerRoute><LazyPage><CommunitySupport /></LazyPage></ExplorerRoute>} />
    <Route path="/help" element={<ExplorerRoute><LazyPage><CommunitySupport /></LazyPage></ExplorerRoute>} />
    <Route path="/developers" element={<LazyPage><DeveloperPortal /></LazyPage>} />
    <Route path="/dev" element={<LazyPage><DeveloperPortal /></LazyPage>} />
    <Route path="/contact" element={<LazyPage><ContactPage /></LazyPage>} />
    <Route path="/why-no-ads" element={<ExplorerRoute><LazyPage><WhyNoAds /></LazyPage></ExplorerRoute>} />
    <Route path="/why-no-vc" element={<ExplorerRoute><LazyPage><WhyNoVC /></LazyPage></ExplorerRoute>} />
    <Route path="/faq" element={<LazyPage><FAQ /></LazyPage>} />
    <Route path="/welcome/creator/:handle" element={<LazyPage><CreatorRedCarpet /></LazyPage>} />
    <Route path="/press" element={<LazyPage><PressJunket /></LazyPage>} />
    <Route path="/read/:paperKey" element={<LazyPage><ReadLandingPage /></LazyPage>} />
    <Route path="/watch" element={<LazyPage><ViewingSchedulePage /></LazyPage>} />
    <Route path="/viewing-schedule" element={<LazyPage><ViewingSchedulePage /></LazyPage>} />
    <Route path="/wildfire-tour" element={<LazyPage><WildfireTourEntry /></LazyPage>} />
    {/* K454: Mini Wildfire Tour — sibling to /wildfire-tour, standalone */}
    <Route path="/mini-tour" element={<LazyPage><MiniTour /></LazyPage>} />
    {/* K427 Workstream 3: Who Can Use the Librarian */}
    <Route path="/who-can-use" element={<LazyPage><WhoCanUsePage /></LazyPage>} />
    <Route path="/licensing" element={<LazyPage><WhoCanUsePage /></LazyPage>} />
    {/* K427 Workstream 2: Entity Membership */}
    <Route path="/entity-membership/apply" element={<LazyPage><EntityMembershipApply /></LazyPage>} />
    <Route path="/entity-membership/dashboard" element={<LazyPage><EntityMembershipDashboard /></LazyPage>} />
    {/* K427 Workstream 1: Pedestal Stake (Reg CF) */}
    <Route path="/pedestal-stake/learn" element={<LazyPage><PedestalStakeLearn /></LazyPage>} />
    <Route path="/pedestal-stake/early-interest" element={<LazyPage><PedestalStakeEarlyInterest /></LazyPage>} />
    <Route path="/pedestal-stake/apply" element={<LazyPage><PedestalStakeApply /></LazyPage>} />
    <Route path="/my/pedestal-stake" element={<LazyPage><PedestalStakeDashboard /></LazyPage>} />
    {/* 506(c) accredited-investor route — reserved, not implemented (K431) */}
    <Route path="/pedestal-stake/accredited/apply" element={<LazyPage><PedestalStakeApply /></LazyPage>} />

    {/* K512: LB Frame Public Web Demo — also served at frame.lianabanyan.com via hostname redirect */}
    <Route path="/demo" element={<LazyPage><TestFrameDemo /></LazyPage>} />
    <Route path="/frame" element={<Navigate to="/demo" replace />} />
    <Route path="/try" element={<Navigate to="/demo" replace />} />

    {/* KN053+KN054+KN055 (Pod T, BP005): Librarian Medallion variant routes (Submarine Doors per B089) */}
    <Route path="/medallion/:variant" element={<LazyPage><MedallionPage /></LazyPage>} />
    <Route path="/medallion" element={<LazyPage><MedallionPage /></LazyPage>} />

    {/* KniPr012: Mnemosyne download landing page */}
    <Route path="/mnemosyne" element={<LazyPage><MnemosyneDownloadPage /></LazyPage>} />
    <Route path="/download/mnemosyne" element={<LazyPage><MnemosyneDownloadPage /></LazyPage>} />
  </>
);
