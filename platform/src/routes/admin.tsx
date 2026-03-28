import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LazyPage } from "./LazyPage";

const RoleManagement = lazy(() => import("@/pages/RoleManagement"));
const ShowcaseAdminPage = lazy(() => import("@/pages/ShowcaseAdminPage"));
const CompanyIndependenceManager = lazy(() => import("@/pages/CompanyIndependenceManager"));
const ExternalServices = lazy(() => import("@/pages/ExternalServices"));
const AdminServiceReview = lazy(() => import("@/pages/AdminServiceReview"));
const AdminAnalytics = lazy(() => import("@/pages/AdminAnalytics"));
const FounderFeatureFlags = lazy(() => import("@/pages/FounderFeatureFlags"));
const IndustryPricing = lazy(() => import("@/pages/IndustryPricing"));
const TemplateSetup = lazy(() => import("@/pages/TemplateSetup"));
const TaskLog = lazy(() => import("@/pages/TaskLog"));
const SampleDataXML = lazy(() => import("@/pages/SampleDataXML"));
const PreBetaRecruits = lazy(() => import("@/pages/PreBetaRecruits"));
const LBAssetLibrary = lazy(() => import("@/pages/LBAssetLibrary"));
const PrototypingContracts = lazy(() => import("@/pages/PrototypingContracts"));
const AllPositionsBrowse = lazy(() => import("@/pages/AllPositionsBrowse"));
const PositionCategories = lazy(() => import("@/pages/PositionCategories"));
const LBInternalPositions = lazy(() => import("@/pages/LBInternalPositions"));
const ContractPositions = lazy(() => import("@/pages/ContractPositions"));
const ManagePositions = lazy(() => import("@/pages/ManagePositions"));
const AdminProject = lazy(() => import("@/pages/AdminProject"));
const TaskList = lazy(() => import("@/pages/TaskList"));
const SubdomainManager = lazy(() => import("@/pages/SubdomainManager"));
const ClientAPIManager = lazy(() => import("@/pages/ClientAPIManager"));
const CredentialManagement = lazy(() => import("@/pages/CredentialManagement"));
const VideoScripts = lazy(() => import("@/pages/VideoScripts"));
const SideQuests = lazy(() => import("@/pages/SideQuests"));
const SendLists = lazy(() => import("@/pages/SendLists"));
const ThemeManagement = lazy(() => import("@/pages/ThemeManagement"));
const CreateProject = lazy(() => import("@/pages/CreateProject"));
const FailureQueueDashboard = lazy(() =>
  import("@/components/FailureQueueDashboard").then(m => ({ default: m.FailureQueueDashboard }))
);
const SocialMediaAdmin = lazy(() => import("@/components/SocialMediaAdmin"));
const TheBattery = lazy(() => import("@/components/TheBattery"));
const UniversalDispatch = lazy(() => import("@/components/UniversalDispatch"));

export const adminRoutes = (
  <>
    <Route path="/admin/project/create" element={<ProtectedRoute><LazyPage><CreateProject /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/industry-pricing" element={<ProtectedRoute><LazyPage><IndustryPricing /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/failure-queue" element={<ProtectedRoute><LazyPage><div className="container mx-auto p-6"><FailureQueueDashboard /></div></LazyPage></ProtectedRoute>} />
    <Route path="/admin/roles" element={<ProtectedRoute><LazyPage><RoleManagement /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/showcase" element={<ProtectedRoute><LazyPage><ShowcaseAdminPage /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/company-independence" element={<ProtectedRoute><LazyPage><CompanyIndependenceManager /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/service-review" element={<ProtectedRoute><LazyPage><AdminServiceReview /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/analytics" element={<ProtectedRoute><LazyPage><AdminAnalytics /></LazyPage></ProtectedRoute>} />
    <Route path="/admin/feature-flags" element={<ProtectedRoute><LazyPage><FounderFeatureFlags /></LazyPage></ProtectedRoute>} />
    <Route path="/template-setup" element={<ProtectedRoute><LazyPage><TemplateSetup /></LazyPage></ProtectedRoute>} />
    <Route path="/task-log" element={<ProtectedRoute><LazyPage><TaskLog /></LazyPage></ProtectedRoute>} />
    <Route path="/sample-xml" element={<ProtectedRoute><LazyPage><SampleDataXML /></LazyPage></ProtectedRoute>} />
    <Route path="/pre-beta-recruits" element={<ProtectedRoute><LazyPage><PreBetaRecruits /></LazyPage></ProtectedRoute>} />
    <Route path="/asset-library" element={<ProtectedRoute><LazyPage><LBAssetLibrary /></LazyPage></ProtectedRoute>} />
    <Route path="/prototyping" element={<ProtectedRoute><LazyPage><PrototypingContracts /></LazyPage></ProtectedRoute>} />
    <Route path="/positions/browse" element={<ProtectedRoute><LazyPage><AllPositionsBrowse /></LazyPage></ProtectedRoute>} />
    <Route path="/position-categories" element={<ProtectedRoute><LazyPage><PositionCategories /></LazyPage></ProtectedRoute>} />
    <Route path="/lb-positions" element={<ProtectedRoute><LazyPage><LBInternalPositions /></LazyPage></ProtectedRoute>} />
    <Route path="/positions" element={<ProtectedRoute><LazyPage><ContractPositions /></LazyPage></ProtectedRoute>} />
    <Route path="/manage-positions" element={<ProtectedRoute><LazyPage><ManagePositions /></LazyPage></ProtectedRoute>} />
    <Route path="/admin-project/:id" element={<ProtectedRoute><LazyPage><AdminProject /></LazyPage></ProtectedRoute>} />
    <Route path="/task-list" element={<ProtectedRoute><LazyPage><TaskList /></LazyPage></ProtectedRoute>} />
    <Route path="/subdomain-manager" element={<ProtectedRoute><LazyPage><SubdomainManager /></LazyPage></ProtectedRoute>} />
    <Route path="/client-api-manager" element={<ProtectedRoute><LazyPage><ClientAPIManager /></LazyPage></ProtectedRoute>} />
    <Route path="/credential-management" element={<ProtectedRoute><LazyPage><CredentialManagement /></LazyPage></ProtectedRoute>} />
    <Route path="/external-services" element={<ProtectedRoute><LazyPage><ExternalServices /></LazyPage></ProtectedRoute>} />
    <Route path="/docs/video-scripts" element={<LazyPage><VideoScripts /></LazyPage>} />
    <Route path="/side-quests" element={<ProtectedRoute><LazyPage><SideQuests /></LazyPage></ProtectedRoute>} />
    <Route path="/send-lists" element={<ProtectedRoute><LazyPage><SendLists /></LazyPage></ProtectedRoute>} />
    <Route path="/themes" element={<ProtectedRoute><LazyPage><ThemeManagement /></LazyPage></ProtectedRoute>} />
    <Route path="/social-admin" element={<ProtectedRoute><LazyPage><div className="container mx-auto p-6 max-w-4xl"><SocialMediaAdmin /></div></LazyPage></ProtectedRoute>} />
    <Route path="/the-battery" element={<ProtectedRoute><LazyPage><div className="container mx-auto p-6 max-w-4xl"><TheBattery /></div></LazyPage></ProtectedRoute>} />
    <Route path="/dispatch" element={<ProtectedRoute><LazyPage><div className="container mx-auto p-6 max-w-4xl"><UniversalDispatch /></div></LazyPage></ProtectedRoute>} />
  </>
);
