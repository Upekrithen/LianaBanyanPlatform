import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const CephasGatewayPage = lazy(() => import("@/pages/CephasGatewayPage"));
const UnderTheHoodPage = lazy(() => import("@/pages/UnderTheHoodPage"));
const FlyOnTheWallRegistryPage = lazy(() => import("@/pages/FlyOnTheWallPage"));
const CephasCategoryListingPage = lazy(() => import("@/pages/CephasCategoryListingPage"));
const CephasContentDetailPage = lazy(() => import("@/pages/CephasContentDetailPage"));
const CephasSearchPage = lazy(() => import("@/pages/CephasSearchPage"));
const CephasPressJunketPage = lazy(() => import("@/pages/CephasPressJunketPage"));
const CephasInnovationPedestalsPage = lazy(() => import("@/pages/CephasInnovationPedestalsPage"));
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
const BrewsterBonusPage = lazy(() => import("@/pages/BrewsterBonusPage"));
const AlcoveHallway = lazy(() => import("@/components/AlcoveHallway").then(m => ({ default: m.AlcoveHallway })));
const Academy = lazy(() => import("@/pages/Academy"));

export const cephasRoutes = (
  <>
    <Route path="/cephas" element={<ExplorerRoute><LazyPage><CephasGatewayPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/search" element={<ExplorerRoute><LazyPage><CephasSearchPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/press-junket" element={<ExplorerRoute><LazyPage><CephasPressJunketPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/innovation-pedestals" element={<ExplorerRoute><LazyPage><CephasInnovationPedestalsPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/under-the-hood" element={<ExplorerRoute><LazyPage><UnderTheHoodPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/fly-on-the-wall" element={<ExplorerRoute><LazyPage><FlyOnTheWallRegistryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/:category/:slug" element={<ExplorerRoute><LazyPage><CephasContentDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/cephas/:category" element={<ExplorerRoute><LazyPage><CephasCategoryListingPage /></LazyPage></ExplorerRoute>} />
    <Route path="/under-the-hood/*" element={<Navigate to="/cephas/under-the-hood" replace />} />
    <Route path="/crown-letters" element={<LazyPage><CrownLettersPage /></LazyPage>} />
    <Route path="/updates/crown/:slug" element={<LazyPage><CrownLetterUpdate /></LazyPage>} />
    <Route path="/benefits" element={<LazyPage><BenefitsPage /></LazyPage>} />
    <Route path="/knowledge/:slug" element={<ExplorerRoute><LazyPage><KnowledgeViewer /></LazyPage></ExplorerRoute>} />
    <Route path="/papers" element={<LazyPage><AcademicPapersDirectory /></LazyPage>} />
    <Route path="/hard-knocks" element={<LazyPage><CollegeOfHardKnocks /></LazyPage>} />
    <Route path="/patent-portfolio" element={<LazyPage><PatentPortfolio /></LazyPage>} />
    <Route path="/ip-portfolio/:qrCode?" element={<LazyPage><IPPortfolioPage /></LazyPage>} />
    <Route path="/economics" element={<LazyPage><EconomicLaws /></LazyPage>} />
    <Route path="/economics/:paperId" element={<LazyPage><PaperPage /></LazyPage>} />
    <Route path="/fly-on-the-wall" element={<LazyPage><FlyOnTheWall /></LazyPage>} />
    <Route path="/transparency" element={<LazyPage><FlyOnTheWall /></LazyPage>} />
    <Route path="/learn/brewster-bonus" element={<ExplorerRoute><LazyPage><BrewsterBonusPage /></LazyPage></ExplorerRoute>} />
    <Route path="/learn" element={<ExplorerRoute><LazyPage><div className="container mx-auto p-6 max-w-4xl"><AlcoveHallway /></div></LazyPage></ExplorerRoute>} />
    <Route path="/academy" element={<ExplorerRoute><LazyPage><Academy /></LazyPage></ExplorerRoute>} />
  </>
);
