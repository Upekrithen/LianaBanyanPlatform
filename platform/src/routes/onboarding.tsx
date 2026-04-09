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
    <Route path="/RedCarpet" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/RedCarpet/:slug" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/red-carpet" element={<LazyPage><RedCarpetLandingV2Page /></LazyPage>} />
    <Route path="/redcarpet" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/redcarpet/:slug" element={<RedCarpetErrorBoundary><LazyPage><RedCarpet /></LazyPage></RedCarpetErrorBoundary>} />
    <Route path="/launch" element={<LazyPage><LaunchHub /></LazyPage>} />
    <Route path="/launch/run-a-node" element={<LazyPage><RunANode /></LazyPage>} />
    <Route path="/start" element={<LazyPage><WhatDoYouWantFlow /></LazyPage>} />
    <Route path="/start/cold-start" element={<LazyPage><ColdStartHub /></LazyPage>} />
    <Route path="/start/cold-start/food" element={<LazyPage><FoodNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/manufacturing" element={<LazyPage><ManufacturingNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/service" element={<LazyPage><ServiceNodeCueCard /></LazyPage>} />
    <Route path="/start/cold-start/local-business" element={<LazyPage><LocalBusinessNodeCueCard /></LazyPage>} />
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
  </>
);
