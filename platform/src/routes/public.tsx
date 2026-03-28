import { lazy } from "react";
import { Route } from "react-router-dom";
import { ExplorerRoute } from "@/components/ProtectedRoute";
import { WelcomeGate } from "@/components/WelcomeGate";
import { useAuth } from "@/contexts/AuthContext";
import { LazyPage } from "./LazyPage";
import Index from "@/pages/Index";

const Auth = lazy(() => import("@/pages/Auth"));
const TikTokCallback = lazy(() => import("@/pages/TikTokCallback"));
const GhostWorld = lazy(() => import("@/pages/GhostWorld"));
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

export const publicRoutes = (
  <>
    <Route path="/" element={<HomepageGateway />} />
    <Route path="/classic-landing" element={<Index />} />
    <Route path="/auth" element={<LazyPage><Auth /></LazyPage>} />
    <Route path="/auth/tiktok/callback" element={<LazyPage><TikTokCallback /></LazyPage>} />
    <Route path="/ghost" element={<LazyPage><GhostWorld /></LazyPage>} />
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
  </>
);
