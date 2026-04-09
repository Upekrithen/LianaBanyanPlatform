import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute, ExplorerRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const ProjectDirectory = lazy(() => import("@/pages/ProjectDirectory"));
const TurnKeyCreatePage = lazy(() => import("@/pages/TurnKeyCreatePage"));
const ShowcaseClaimPage = lazy(() => import("@/pages/ShowcaseClaimPage"));
const TurnKeyProjectDetailPage = lazy(() => import("@/pages/TurnKeyProjectDetailPage"));
const ProjectView = lazy(() => import("@/pages/ProjectView"));
const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
const ProductionQueue = lazy(() => import("@/pages/ProductionQueue"));
const ProductionRuns = lazy(() => import("@/pages/ProductionRuns"));
const ProjectsDirectoryPage = lazy(() => import("@/pages/ProjectsDirectoryPage"));
const ProductionProjectPage = lazy(() => import("@/pages/ProductionProjectPage"));
const ProductionOrderFlow = lazy(() => import("@/pages/ProductionOrderFlow"));
const ProductCatalog = lazy(() => import("@/pages/ProductCatalog"));
const CatalogProductDetail = lazy(() => import("@/pages/CatalogProductDetail"));
const MakerDirectory = lazy(() => import("@/pages/MakerDirectory"));
const MakerProfile = lazy(() => import("@/pages/MakerProfile"));
const MakerRegistration = lazy(() => import("@/pages/MakerRegistration"));
const ManufacturingStore = lazy(() => import("@/pages/ManufacturingStore"));
const FactoryHub = lazy(() => import("@/pages/FactoryHub"));
const NodeRegistration = lazy(() => import("@/pages/NodeRegistration"));
const CanisterConfigurator = lazy(() => import("@/pages/CanisterConfigurator"));
const CanisterProductCatalog = lazy(() => import("@/pages/CanisterProductCatalog"));
const CanisterBOMPage = lazy(() => import("@/pages/CanisterBOMPage"));
const SecondSecondLanding = lazy(() => import("@/pages/SecondSecondLanding"));
const ModularManufacturing = lazy(() => import("@/pages/ModularManufacturing"));
const MakerSpotlightPage = lazy(() => import("@/pages/MakerSpotlight"));
const ProteusAnchorPage = lazy(() => import("@/pages/ProteusAnchor"));
const DesignedToBeBroken = lazy(() => import("@/pages/DesignedToBeBroken"));
const AsYouWishCard = lazy(() => import("@/pages/AsYouWishCard"));
const NoAtomo = lazy(() => import("@/pages/NoAtomo"));
const ContentPipelinePage = lazy(() => import("@/pages/ContentPipelinePage"));
const ProjectLanding = lazy(() => import("@/pages/ProjectLanding"));
const LandingPageManager = lazy(() => import("@/pages/LandingPageManager"));
const CampaignProduction = lazy(() => import("@/pages/CampaignProduction"));
const Workshop = lazy(() => import("@/pages/Workshop"));
const CreateProject = lazy(() => import("@/pages/CreateProject"));
const LaunchTracker = lazy(() => import("@/pages/LaunchTracker"));
const TerenoCertificationPage = lazy(() => import("@/pages/TerenoCertification"));
const ContractScaleManager = lazy(() => import("@/pages/ContractScaleManager"));
const CoasterMedallionProject = lazy(() => import("@/pages/CoasterMedallionProject"));
const RecipePotPage = lazy(() => import("@/pages/RecipePotPage"));
const CanisterConfiguratorV2 = lazy(() => import("@/pages/tools/CanisterConfiguratorV2"));

export const productionRoutes = (
  <>
    <Route path="/projects" element={<ExplorerRoute><LazyPage><ProjectDirectory /></LazyPage></ExplorerRoute>} />
    <Route path="/projects/create" element={<ProtectedRoute><LazyPage><TurnKeyCreatePage /></LazyPage></ProtectedRoute>} />
    <Route path="/projects/:slug/claim" element={<ProtectedRoute><LazyPage><ShowcaseClaimPage /></LazyPage></ProtectedRoute>} />
    <Route path="/projects/:slug" element={<ExplorerRoute><LazyPage><TurnKeyProjectDetailPage /></LazyPage></ExplorerRoute>} />
    <Route path="/project/:projectSlug" element={<ProtectedRoute><LazyPage><ProjectView /></LazyPage></ProtectedRoute>} />
    <Route path="/project/:projectSlug/product/:productId" element={<ProtectedRoute><LazyPage><ProductDetail /></LazyPage></ProtectedRoute>} />
    <Route path="/projects/:projectId/scale-rates" element={<ProtectedRoute><LazyPage><ContractScaleManager /></LazyPage></ProtectedRoute>} />
    <Route path="/production-queue" element={<ProtectedRoute><LazyPage><ProductionQueue /></LazyPage></ProtectedRoute>} />
    <Route path="/launch-tracker" element={<ExplorerRoute><LazyPage><LaunchTracker /></LazyPage></ExplorerRoute>} />
    <Route path="/production-runs" element={<ExplorerRoute><LazyPage><ProductionRuns /></LazyPage></ExplorerRoute>} />
    <Route path="/production" element={<ExplorerRoute><LazyPage><ProjectsDirectoryPage /></LazyPage></ExplorerRoute>} />
    <Route path="/production/:projectId" element={<ExplorerRoute><LazyPage><ProductionProjectPage /></LazyPage></ExplorerRoute>} />
    <Route path="/production/new" element={<ProtectedRoute><LazyPage><ProductionOrderFlow /></LazyPage></ProtectedRoute>} />
    <Route path="/products" element={<ExplorerRoute><LazyPage><ProductCatalog /></LazyPage></ExplorerRoute>} />
    <Route path="/products/:slug" element={<ExplorerRoute><LazyPage><CatalogProductDetail /></LazyPage></ExplorerRoute>} />
    <Route path="/makers" element={<ExplorerRoute><LazyPage><MakerDirectory /></LazyPage></ExplorerRoute>} />
    <Route path="/makers/:slug" element={<ExplorerRoute><LazyPage><MakerProfile /></LazyPage></ExplorerRoute>} />
    <Route path="/register-maker" element={<ProtectedRoute><LazyPage><MakerRegistration /></LazyPage></ProtectedRoute>} />
    <Route path="/manufacturing" element={<ProtectedRoute><LazyPage><ManufacturingStore /></LazyPage></ProtectedRoute>} />
    <Route path="/store" element={<ProtectedRoute><LazyPage><ManufacturingStore /></LazyPage></ProtectedRoute>} />
    <Route path="/factory" element={<ExplorerRoute><LazyPage><FactoryHub /></LazyPage></ExplorerRoute>} />
    <Route path="/factory/hub" element={<ExplorerRoute><LazyPage><FactoryHub /></LazyPage></ExplorerRoute>} />
    <Route path="/factory/nodes" element={<ProtectedRoute><LazyPage><NodeRegistration /></LazyPage></ProtectedRoute>} />
    <Route path="/factory/register" element={<ProtectedRoute><LazyPage><NodeRegistration /></LazyPage></ProtectedRoute>} />
    <Route path="/factory/bounties" element={<ProtectedRoute><LazyPage><ManufacturingStore /></LazyPage></ProtectedRoute>} />
    <Route path="/factory/canister" element={<ExplorerRoute><LazyPage><CanisterConfigurator /></LazyPage></ExplorerRoute>} />
    <Route path="/canister/configurator" element={<ProtectedRoute><LazyPage><CanisterConfiguratorV2 /></LazyPage></ProtectedRoute>} />
    <Route path="/factory/canister/shop" element={<ExplorerRoute><LazyPage><CanisterProductCatalog /></LazyPage></ExplorerRoute>} />
    <Route path="/canister/bom" element={<ExplorerRoute><LazyPage><CanisterBOMPage /></LazyPage></ExplorerRoute>} />
    <Route path="/2nd-second" element={<ExplorerRoute><LazyPage><SecondSecondLanding /></LazyPage></ExplorerRoute>} />
    <Route path="/the-forge" element={<ProtectedRoute><LazyPage><ModularManufacturing /></LazyPage></ProtectedRoute>} />
    <Route path="/maker-spotlight" element={<LazyPage><MakerSpotlightPage /></LazyPage>} />
    <Route path="/proteus-anchor" element={<LazyPage><ProteusAnchorPage /></LazyPage>} />
    <Route path="/designed-to-be-broken" element={<LazyPage><DesignedToBeBroken /></LazyPage>} />
    <Route path="/as-you-wish" element={<LazyPage><AsYouWishCard /></LazyPage>} />
    <Route path="/no-atomo" element={<LazyPage><NoAtomo /></LazyPage>} />
    <Route path="/content-pipeline" element={<LazyPage><ContentPipelinePage /></LazyPage>} />
    <Route path="/project-landing/:projectId/:segmentSlug?" element={<LazyPage><ProjectLanding /></LazyPage>} />
    <Route path="/landing-manager/:projectId" element={<ProtectedRoute><LazyPage><LandingPageManager /></LazyPage></ProtectedRoute>} />
    <Route path="/campaign-production/:workstationId" element={<ProtectedRoute><LazyPage><CampaignProduction /></LazyPage></ProtectedRoute>} />
    <Route path="/workshop" element={<ProtectedRoute><LazyPage><Workshop /></LazyPage></ProtectedRoute>} />
    <Route path="/create" element={<LazyPage><CreateProject /></LazyPage>} />
    <Route path="/tereno-certification" element={<ExplorerRoute><LazyPage><TerenoCertificationPage /></LazyPage></ExplorerRoute>} />
    <Route path="/coaster-medallion" element={<ExplorerRoute><LazyPage><CoasterMedallionProject /></LazyPage></ExplorerRoute>} />
    <Route path="/bridge/recipe" element={<ProtectedRoute><LazyPage><RecipePotPage /></LazyPage></ProtectedRoute>} />
  </>
);
