import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";
import { RedCarpetErrorBoundary } from "@/components/RedCarpetFallback";

const GuidedDiscovery = lazy(() => import("@/pages/GuidedDiscovery"));
const WelcomeV2Page = lazy(() => import("@/pages/WelcomeV2Page"));
const FirstSteps = lazy(() => import("@/pages/FirstSteps"));
const InviteGenerator = lazy(() => import("@/pages/InviteGenerator"));
const PipelinePage = lazy(() => import("@/pages/PipelinePage"));
const MembershipGate = lazy(() => import("@/pages/MembershipGate"));
const CreatorPitchPage = lazy(() => import("@/pages/CreatorPitchPage"));
const CreatorShowcasePage = lazy(() => import("@/pages/CreatorShowcasePage"));
const CreatorProfilePage = lazy(() => import("@/pages/CreatorProfilePage"));
const OnboardingStatusPage = lazy(() => import("@/pages/OnboardingStatusPage"));
const RedCarpet = lazy(() => import("@/pages/RedCarpet"));
const LaunchHub = lazy(() => import("@/pages/LaunchHub"));
const RunANode = lazy(() => import("@/pages/RunANode"));
const WhatDoYouWantFlow = lazy(() => import("@/pages/WhatDoYouWantFlow"));
const ColdStartHub = lazy(() => import("@/pages/ColdStartHub"));
const FoodNodeCueCard = lazy(() => import("@/pages/FoodNodeCueCard"));
const ManufacturingNodeCueCard = lazy(() => import("@/pages/ManufacturingNodeCueCard"));
const ServiceNodeCueCard = lazy(() => import("@/pages/ServiceNodeCueCard"));
const LocalBusinessNodeCueCard = lazy(() => import("@/pages/LocalBusinessNodeCueCard"));
const BroadcastNodeCueCard = lazy(() => import("@/pages/BroadcastNodeCueCard"));
const GuildNodeCueCard = lazy(() => import("@/pages/GuildNodeCueCard"));
const TribeNodeCueCard = lazy(() => import("@/pages/TribeNodeCueCard"));
const WelcomeGatePage = lazy(() => import("@/pages/WelcomeGatePage"));
const RedCarpetLandingV2Page = lazy(() => import("@/pages/RedCarpetLandingV2Page"));
const BusinessPathway = lazy(() => import("@/pages/BusinessPathway"));
const SaltMines = lazy(() => import("@/pages/SaltMines"));
const BuildBusiness = lazy(() => import("@/pages/BuildBusiness"));
const PlantSeeds = lazy(() => import("@/pages/PlantSeeds"));
const TrickleOnboarding = lazy(() => import("@/pages/TrickleOnboarding"));
const AgentOnboarding = lazy(() => import("@/pages/AgentOnboarding"));
const ATTILanding = lazy(() => import("@/pages/ATTILanding"));
const OnboardingStart = lazy(() => import("@/pages/OnboardingStart"));
const CrewCallPage = lazy(() => import("@/pages/CrewCallPage"));
const CrewCallBoardV2Page = lazy(() => import("@/pages/CrewCallBoardV2Page"));
const InviteCodeRedirect = lazy(() => import("@/pages/InviteCodeRedirect"));
const SovereigntyTierSelection = lazy(() => import("@/pages/onboarding/SovereigntyTierSelection"));
const Tier_A_NEEDS_Page = lazy(() => import("@/pages/onboarding/Tier_A_NEEDS_Page"));
const Tier_B_SUGGESTS_Page = lazy(() => import("@/pages/onboarding/Tier_B_SUGGESTS_Page"));
const Tier_C_FOUNDER_Page = lazy(() => import("@/pages/onboarding/Tier_C_FOUNDER_Page"));

export const onboardingRoutes = (
  <>
    <Route path="/welcome" element={<LazyPage><WelcomeV2Page /></LazyPage>} />
    <Route path="/guided-discovery" element={<LazyPage><GuidedDiscovery /></LazyPage>} />
    <Route path="/discover" element={<Navigate to="/welcome" replace />} />
    <Route path="/first-steps" element={<ProtectedRoute><LazyPage><FirstSteps /></LazyPage></ProtectedRoute>} />
    <Route path="/invite" element={<ProtectedRoute><LazyPage><InviteGenerator /></LazyPage></ProtectedRoute>} />
    <Route path="/pipeline" element={<ProtectedRoute><LazyPage><PipelinePage /></LazyPage></ProtectedRoute>} />
    <Route path="/join" element={<LazyPage><MembershipGate /></LazyPage>} />
    <Route path="/membership/gate" element={<Navigate to="/join" replace />} />
    <Route path="/join/creator" element={<ExplorerRoute><LazyPage><CreatorPitchPage /></LazyPage></ExplorerRoute>} />
    <Route path="/creators" element={<ExplorerRoute><LazyPage><CreatorShowcasePage /></LazyPage></ExplorerRoute>} />
    <Route path="/creators/:creatorId" element={<ExplorerRoute><LazyPage><CreatorProfilePage /></LazyPage></ExplorerRoute>} />
    <Route path="/onboarding/status" element={<ProtectedRoute><LazyPage><OnboardingStatusPage /></LazyPage></ProtectedRoute>} />
    {/* BP079: Red Carpet routes moved to redCarpet.tsx (11 routes under commerce portal group)
        Legacy routes below are commented out to avoid conflicts with the new Wave A implementation.
        The new redCarpet.tsx provides: /red-carpet (landing), /red-carpet/:slug (content),
        /rc/:grantToken (grant activation), /red-carpet/dashboard, /red-carpet/cue-cards/* (manager + detail + share),
        /cue-card/:shortToken (public), /cue-cards/:cardId/analytics, plus /redcarpet redirects. */}
    {/* <Route path="/RedCarpet" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/RedCarpet/:slug" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/red-carpet" element={<LazyPage><RedCarpetLandingV2Page /></LazyPage>} />
    <Route path="/red-carpet/:slug" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/redcarpet" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/redcarpet/:slug" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} /> */}
    <Route path="/launch" element={<LazyPage><LaunchHub /></LazyPage>} />
    <Route path="/launch/run-a-node" element={<LazyPage><RunANode /></LazyPage>} />
    <Route path="/start" element={<LazyPage><WhatDoYouWantFlow /></LazyPage>} />
    <Route path="/start/cold-start" element={<LazyPage><ColdStartHub /></LazyPage>} />
    <Route path="/start/cold-start/food" element={<LazyPage><FoodNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/manufacturing" element={<LazyPage><ManufacturingNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/service" element={<LazyPage><ServiceNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/local-business" element={<LazyPage><LocalBusinessNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/broadcast" element={<LazyPage><BroadcastNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/guild" element={<LazyPage><GuildNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/tribe" element={<LazyPage><TribeNodeCueCard /></LazyPage>} />
    <Route path="/w/:medallionId" element={<LazyPage><WelcomeGatePage /></LazyPage>} />
    <Route path="/pathway" element={<LazyPage><BusinessPathway /></LazyPage>} />
    <Route path="/business-pathway" element={<LazyPage><BusinessPathway /></LazyPage>} />
    <Route path="/get-a-job" element={<LazyPage><SaltMines /></LazyPage>} />
    <Route path="/salt-mines" element={<LazyPage><SaltMines /></LazyPage>} />
    <Route path="/build-a-business" element={<LazyPage><BuildBusiness /></LazyPage>} />
    <Route path="/plant-seeds" element={<LazyPage><PlantSeeds /></LazyPage>} />
    <Route path="/onboarding/trickle" element={<ProtectedRoute><LazyPage><TrickleOnboarding /></LazyPage></ProtectedRoute>} />
    <Route path="/agent-onboarding" element={<ProtectedRoute><LazyPage><AgentOnboarding /></LazyPage></ProtectedRoute>} />
    <Route path="/atti" element={<LazyPage><ATTILanding /></LazyPage>} />
    <Route path="/crew-call" element={<ExplorerRoute><LazyPage><CrewCallBoardV2Page /></LazyPage></ExplorerRoute>} />
    <Route path="/crew-call/legacy" element={<ExplorerRoute><LazyPage><CrewCallPage /></LazyPage></ExplorerRoute>} />
    <Route path="/welcome/:code" element={<LazyPage><InviteCodeRedirect /></LazyPage>} />
    <Route path="/welcome/sponsor/:code" element={<LazyPage><InviteCodeRedirect /></LazyPage>} />
    {/* ── 3-Tier Sovereignty onboarding — Bushel 13 Phase C / BP021 ── */}
    <Route path="/onboarding/sovereignty" element={<LazyPage><SovereigntyTierSelection /></LazyPage>} />
    <Route path="/onboarding/sovereignty/tier-a" element={<LazyPage><Tier_A_NEEDS_Page /></LazyPage>} />
    <Route path="/onboarding/sovereignty/tier-b" element={<LazyPage><Tier_B_SUGGESTS_Page /></LazyPage>} />
    <Route path="/onboarding/sovereignty/tier-c" element={<LazyPage><Tier_C_FOUNDER_Page /></LazyPage>} />
  </>
);
