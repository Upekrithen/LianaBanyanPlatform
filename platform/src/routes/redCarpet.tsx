import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const FoodNodeCueCard = lazy(() => import("@/pages/FoodNodeCueCard"));
const LocalBusinessNodeCueCard = lazy(() => import("@/pages/LocalBusinessNodeCueCard"));
const FoodCueCardBuilderPage = lazy(() => import("@/pages/FoodCueCardBuilderPage"));
const LocalBusinessCueCardBuilderPage = lazy(() => import("@/pages/LocalBusinessCueCardBuilderPage"));
const CueCardShare = lazy(() => import("@/pages/CueCardShare"));
const CueCardShareLanding = lazy(() => import("@/pages/CueCardShareLanding"));
const CueCardLanding = lazy(() => import("@/pages/CueCardLanding"));
const CueCardGeneratorV2 = lazy(() => import("@/pages/tools/CueCardGeneratorV2"));
const CreatorRedCarpet = lazy(() => import("@/pages/CreatorRedCarpet"));
const RedCarpet = lazy(() => import("@/pages/RedCarpet"));
const RedCarpetLandingV2Page = lazy(() => import("@/pages/RedCarpetLandingV2Page"));
const TribeNodeCueCard = lazy(() => import("@/pages/TribeNodeCueCard"));
const ServiceNodeCueCard = lazy(() => import("@/pages/ServiceNodeCueCard"));
const MyAttributionsPage = lazy(() => import("@/pages/MyAttributionsPage"));

export const redCarpetRoutes = (
  <>
    {/* Cue Card Routes — Node-specific card generators and viewers */}
    <Route path="/cue-card/food-node/:id?" element={<ProtectedRoute><LazyPage><FoodNodeCueCard /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/local-business/:id?" element={<ProtectedRoute><LazyPage><LocalBusinessNodeCueCard /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/tribe/:id?" element={<ProtectedRoute><LazyPage><TribeNodeCueCard /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/service/:id?" element={<ProtectedRoute><LazyPage><ServiceNodeCueCard /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/share/:cardId" element={<ProtectedRoute><LazyPage><CueCardShare /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/generate/:nodeType" element={<ProtectedRoute><LazyPage><CueCardGeneratorV2 /></LazyPage></ProtectedRoute>} />

    {/* Cue Card Builders — Wave A builder pages for Red Carpet */}
    <Route path="/cue-card/food-node/build" element={<ProtectedRoute><LazyPage><FoodCueCardBuilderPage /></LazyPage></ProtectedRoute>} />
    <Route path="/cue-card/local-business/build" element={<ProtectedRoute><LazyPage><LocalBusinessCueCardBuilderPage /></LazyPage></ProtectedRoute>} />

    {/* Cue Card Landing Pages — Public access for card viewing */}
    <Route path="/cue-card/landing/:shareToken" element={<LazyPage><CueCardShareLanding /></LazyPage>} />
    <Route path="/cue-card/welcome/:cardId" element={<LazyPage><CueCardLanding /></LazyPage>} />

    {/* Red Carpet Routes — Creator onboarding and invitation system */}
    <Route path="/red-carpet" element={<ExplorerRoute><LazyPage><RedCarpet /></LazyPage></ExplorerRoute>} />
    <Route path="/red-carpet/creator" element={<ProtectedRoute><LazyPage><CreatorRedCarpet /></LazyPage></ProtectedRoute>} />
    <Route path="/red-carpet/landing/:token" element={<LazyPage><RedCarpetLandingV2Page /></LazyPage>} />
    <Route path="/red-carpet/my-credits" element={<ProtectedRoute><LazyPage><MyAttributionsPage /></LazyPage></ProtectedRoute>} />
  </>
);
