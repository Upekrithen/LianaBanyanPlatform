import { lazy } from "react";
import { Route, Navigate, useParams } from "react-router-dom";
import { ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

// Small inline redirect for /cephas/glass-door/:slug → /outreach/:slug
function GlassDoorSlugRedirect() {
  const { slug } = useParams<{ slug: string }>();
  return <Navigate to={`/outreach/${slug}`} replace />;
}

const CephasGatewayPage = lazy(() => import("@/pages/CephasGatewayV2Page"));
const UnderTheHoodPage = lazy(() => import("@/pages/UnderTheHoodPage"));
const FlyOnTheWallRegistryPage = lazy(() => import("@/pages/FlyOnTheWallPage"));
const CephasCategoryListingPage = lazy(() => import("@/pages/CephasCategoryListingPage"));
const CephasContentDetailPage = lazy(() => import("@/pages/CephasContentDetailPage"));
const CephasSearchPage = lazy(() => import("@/pages/CephasSearchPage"));
const CephasPressJunketPage = lazy(() => import("@/pages/CephasPressJunketPage"));
const CephasInnovationPedestalsPage = lazy(() => import("@/pages/CephasInnovationPedestalsPage"));
const AllThePuddingPage = lazy(() => import("@/pages/AllThePuddingPage"));
const CrownLetterUpdate = lazy(() => import("@/pages/CrownLetterUpdate"));
const CrownLettersPage = lazy(() => import("@/pages/CrownLettersPage"));
const BenefitsPage = lazy(() => import("@/pages/BenefitsPage"));
const KnowledgeViewer = lazy(() => import("@/pages/KnowledgeViewer"));
const AcademicPapersDirectory = lazy(() => import("@/pages/AcademicPapersDirectory"));
const CollegeOfHardKnocks = lazy(() => import("@/pages/CollegeOfHardKnocks"));
const PatentPortfolio = lazy(() => import("@/pages/PatentPortfolio"));
const IPPortfolioPage = lazy(() => import("@/pages/IPPortfolioPage"));
const EconomicLaws = lazy(() => import("@/pages/EconomicLaws"));
const PaperPage = lazy(() => import("@/pages/PaperPage"));
const FlyOnTheWall = lazy(() => import("@/pages/FlyOnTheWall"));
const PedestalForum = lazy(() => import("@/pages/papers/PedestalForum"));
const SubstackHookPage = lazy(() => import("@/pages/papers/SubstackHookPage"));
const AlcoveHallwayPage = lazy(() => import("@/pages/AlcoveHallwayPage"));
const AlcoveStopPage = lazy(() => import("@/pages/AlcoveStopPage"));
const Academy = lazy(() => import("@/pages/Academy"));
const GuidedTourPage = lazy(() => import("@/pages/GuidedTourPage"));
const TourGalleryPage = lazy(() => import("@/pages/TourGalleryPage"));
const PublicationsIndex = lazy(() => import("@/pages/PublicationsIndex"));
const ArchiveIndex = lazy(() => import("@/pages/ArchiveIndex"));
const ArchiveDocumentReader = lazy(() => import("@/pages/ArchiveDocumentReader"));
const NorthernProvinceLanding = lazy(() => import("@/pages/NorthernProvinceLanding"));
const NorthernProvinceSectionPage = lazy(() => import("@/pages/NorthernProvinceSectionPage"));
const NorthernNoidTierPage = lazy(() => import("@/pages/NorthernNoidTierPage"));

// K537: Glass Door — Open Outreach (B131)
const OutreachIndexPage = lazy(() => import("@/pages/OutreachIndexPage"));
const OutreachLetterDetailPage = lazy(() => import("@/pages/OutreachLetterDetailPage"));

export const cephasRoutes = (
  <>
    {/* K537: Glass Door — Open Outreach routes (public — no ExplorerRoute gate) */}
    <Route path="/outreach" element={<LazyPage><OutreachIndexPage /></LazyPage>} />
    <Route path="/outreach/:slug" element={<LazyPage><OutreachLetterDetailPage /></LazyPage>} />
    {/* Cephas sub-path alias for Glass Door */}
    <Route path="/cephas/glass-door" element={<Navigate to="/outreach" replace />} />
    <Route path="/cephas/glass-door/:slug" element={<GlassDoorSlugRedirect />} />

    <Route path="/cephas" element={<ExplorerRoute><LazyPage><CephasGatewayPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/search" element={<ExplorerRoute><LazyPage><CephasSearchPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/press-junket" element={<ExplorerRoute><LazyPage><CephasPressJunketPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/innovation-pedestals" element={<ExplorerRoute><LazyPage><CephasInnovationPedestalsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/all-the-pudding" element={<ExplorerRoute><LazyPage><AllThePuddingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/under-the-hood" element={<ExplorerRoute><LazyPage><UnderTheHoodPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/fly-on-the-wall" element={<ExplorerRoute><LazyPage><FlyOnTheWallRegistryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/archive" element={<ExplorerRoute><LazyPage><ArchiveIndex /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/archive/:slug" element={<ExplorerRoute><LazyPage><ArchiveDocumentReader /></LazyPage></ExplorerRoute>} />
    <Route path="/northern" element={<ExplorerRoute><LazyPage><NorthernProvinceLanding /></LazyPage></ExplorerRoute>} />
    <Route path="/northern/noid/:tier" element={<ExplorerRoute><LazyPage><NorthernNoidTierPage /></LazyPage></ExplorerRoute>} />
    <Route path="/northern/:section" element={<ExplorerRoute><LazyPage><NorthernProvinceSectionPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/northern" element={<ExplorerRoute><LazyPage><NorthernProvinceLanding /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/northern/noid/:tier" element={<ExplorerRoute><LazyPage><NorthernNoidTierPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/northern/:section" element={<ExplorerRoute><LazyPage><NorthernProvinceSectionPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/:category/:slug" element={<ExplorerRoute><LazyPage><CephasContentDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/:category" element={<ExplorerRoute><LazyPage><CephasCategoryListingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/business-plan" element={<Navigate to="/cephas/business-plan/six-easy-steps" replace />} />
    <Route path="/six-easy-steps" element={<Navigate to="/cephas/business-plan/six-easy-steps" replace />} />
    <Route path="/under-the-hood/*" element={<Navigate to="/cephas/under-the-hood" replace />} />
    <Route path="/crown-letters" element={<LazyPage><CrownLettersPage /></LazyPage>} />
    <Route path="/updates/crown/:slug" element={<LazyPage><CrownLetterUpdate /></LazyPage>} />
    <Route path="/benefits" element={<LazyPage><BenefitsPage /></LazyPage>} />
    <Route path="/knowledge/:slug" element={<ExplorerRoute><LazyPage><KnowledgeViewer /></LazyPage></ExplorerRoute>} />
    <Route path="/papers" element={<LazyPage><AcademicPapersDirectory /></LazyPage>} />
    {/* Bushel 13 Phase D — Pedestal Forum (Mordecai-Esther Decree-Composition) */}
    <Route path="/papers/:paperId/pedestal-forum" element={<LazyPage><PedestalForum /></LazyPage>} />
    {/* Bushel 13 Phase A — Pre-Cathedral Substack Hook (productized) */}
    <Route path="/papers/pre-cathedral-hook" element={<LazyPage><SubstackHookPage /></LazyPage>} />
    <Route path="/hard-knocks" element={<LazyPage><CollegeOfHardKnocks /></LazyPage>} />
    <Route path="/patent-portfolio" element={<LazyPage><PatentPortfolio /></LazyPage>} />
    <Route path="/ip-portfolio/:qrCode?" element={<LazyPage><IPPortfolioPage /></LazyPage>} />
    <Route path="/economics" element={<LazyPage><EconomicLaws /></LazyPage>} />
    <Route path="/economics/:paperId" element={<LazyPage><PaperPage /></LazyPage>} />
    <Route path="/fly-on-the-wall" element={<LazyPage><FlyOnTheWall /></LazyPage>} />
    <Route path="/transparency" element={<Navigate to="/ledger" replace />} />
    <Route path="/learn" element={<ExplorerRoute><LazyPage><AlcoveHallwayPage /></LazyPage></ExplorerRoute>} />
    <Route path="/learn/:stopSlug" element={<ExplorerRoute><LazyPage><AlcoveStopPage /></LazyPage></ExplorerRoute>} />
    <Route path="/academy" element={<ExplorerRoute><LazyPage><Academy /></LazyPage></ExplorerRoute>} />
    <Route path="/publications" element={<LazyPage><PublicationsIndex /></LazyPage>} />
    <Route path="/tour" element={<LazyPage><GuidedTourPage /></LazyPage>} />
    <Route path="/tour/packages" element={<LazyPage><TourGalleryPage /></LazyPage>} />
  </>
);
