import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UnifiedNavigation } from "@/components/UnifiedNavigation";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
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
import InvestmentExplainer from "./pages/InvestmentExplainer";
import BlockchainExplorer from "./pages/BlockchainExplorer";
import MedallionViewer from "./pages/MedallionViewer";
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
import MembershipConfirm from "./pages/MembershipConfirm";
import RoleManagement from "./pages/RoleManagement";
import CompanyIndependenceManager from "./pages/CompanyIndependenceManager";
import ContractScaleManager from "./pages/ContractScaleManager";
import ExternalServices from "./pages/ExternalServices";
import AdminServiceReview from "./pages/AdminServiceReview";
import VideoScripts from "./pages/VideoScripts";
import PreBetaRecruits from "./pages/PreBetaRecruits";
import LBAssetLibrary from "./pages/LBAssetLibrary";
import PrototypingContracts from "./pages/PrototypingContracts";
import AllPositionsBrowse from "./pages/AllPositionsBrowse";
import { FailureQueueDashboard } from "@/components/FailureQueueDashboard";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { GlobalRecorderOverlay } from "@/components/GlobalRecorderOverlay";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import IPRegistration from "./pages/IPRegistration";
import AgentOnboarding from "./pages/AgentOnboarding";
import CrowdfundingIntegration from "./pages/CrowdfundingIntegration";
import MedallionManagement from "./pages/MedallionManagement";
import { useEffect } from "react";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";
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
import HexisleDashboard from "./pages/HexisleDashboard";
import LetsMakeDinnerPage from "./pages/LetsMakeDinnerPage";
import InitiativeProjectsPage from "./pages/InitiativeProjectsPage";
import StewardLegalDashboard from "./pages/StewardLegalDashboard";
import ThemeManagement from "./pages/ThemeManagement";
import DefenseClawsPage from "./pages/DefenseClawsPage";
import MSAPage from "./pages/MSAPage";
import LifeLineMedicationsPage from "./pages/LifeLineMedicationsPage";
import LetsGoShoppingPage from "./pages/LetsGoShoppingPage";
import LetsGetGroceriesPage from "./pages/LetsGetGroceriesPage";
import RedCarpet from "./pages/RedCarpet";
import HofundStudio from "./pages/HofundStudio";
import HeraldSubscription from "./pages/HeraldSubscription";

const ExternalRedirect = ({ to }: { to: string }) => {
  useEffect(() => {
    window.location.href = to;
  }, [to]);
  return null;
};

const HardReload = () => {
  useEffect(() => {
    // Force a full reload so main.tsx re-detects portal by path (e.g., /task-list)
    window.location.reload();
  }, []);
  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <RecordingProvider>
            <SubdomainRouter>
              <SidebarProvider>
                <div className="min-h-screen flex w-full overflow-x-hidden">
                  <UnifiedNavigation />
                  <div className="flex-1 flex flex-col min-w-0">
                    <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                      <div className="flex items-center gap-4 min-w-0">
                        <SidebarTrigger />
                        <GlobalBreadcrumbs />
                      </div>
                      <SyncStatusIndicator />
                    </header>
                    <main className="flex-1 overflow-x-hidden">
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/RedCarpet" element={<RedCarpet />} />
                        <Route path="/RedCarpet/:slug" element={<RedCarpet />} />
                        <Route path="/redcarpet" element={<RedCarpet />} />
                        <Route path="/redcarpet/:slug" element={<RedCarpet />} />
                        
                        {/* Protected Marketplace Routes */}
                        <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
                        <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
                        <Route path="/project/:projectSlug" element={<ProtectedRoute><ProjectView /></ProtectedRoute>} />
                        <Route path="/project/:projectSlug/product/:productId" element={<ProtectedRoute><ProductDetail /></ProtectedRoute>} />
                        <Route path="/investment-guide" element={<ProtectedRoute><InvestmentExplainer /></ProtectedRoute>} />
                        
                        {/* Protected Investor Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                        <Route path="/blockchain/:projectId" element={<ProtectedRoute><BlockchainExplorer /></ProtectedRoute>} />
                        <Route path="/medallions" element={<ProtectedRoute><MedallionViewer /></ProtectedRoute>} />
                        <Route path="/withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                        <Route path="/reputation/:userId" element={<ReputationProfile />} />
                        <Route path="/profile-settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
                        <Route path="/peer-contracts" element={<ProtectedRoute><PeerContracts /></ProtectedRoute>} />
                        <Route path="/guilds" element={<ProtectedRoute><Guilds /></ProtectedRoute>} />
                        <Route path="/tribes" element={<ProtectedRoute><Tribes /></ProtectedRoute>} />
                        <Route path="/position-categories" element={<ProtectedRoute><PositionCategories /></ProtectedRoute>} />
                        <Route path="/lb-positions" element={<ProtectedRoute><LBInternalPositions /></ProtectedRoute>} />
                        <Route path="/production-queue" element={<ProtectedRoute><ProductionQueue /></ProtectedRoute>} />
                        <Route path="/ip/register" element={<ProtectedRoute><IPRegistration /></ProtectedRoute>} />
                        <Route path="/agent-onboarding" element={<ProtectedRoute><AgentOnboarding /></ProtectedRoute>} />
                        <Route path="/crowdfunding" element={<ProtectedRoute><CrowdfundingIntegration /></ProtectedRoute>} />
                        <Route path="/hofund" element={<ProtectedRoute><HofundStudio /></ProtectedRoute>} />
                        <Route path="/cue-cards" element={<ProtectedRoute><HofundStudio /></ProtectedRoute>} />
                        <Route path="/herald" element={<ProtectedRoute><HeraldSubscription /></ProtectedRoute>} />
                        <Route path="/herald-subscription" element={<ProtectedRoute><HeraldSubscription /></ProtectedRoute>} />
                        <Route path="/medallion-management" element={<ProtectedRoute><MedallionManagement /></ProtectedRoute>} />
                        
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
              <Route path="/admin/company-independence" element={<ProtectedRoute><CompanyIndependenceManager /></ProtectedRoute>} />
              <Route path="/projects/:projectId/scale-rates" element={<ProtectedRoute><ContractScaleManager /></ProtectedRoute>} />
              <Route path="/external-services" element={<ProtectedRoute><ExternalServices /></ProtectedRoute>} />
              <Route path="/admin/service-review" element={<ProtectedRoute><AdminServiceReview /></ProtectedRoute>} />
              <Route path="/docs/video-scripts" element={<VideoScripts />} />
              <Route path="/pre-beta-recruits" element={<ProtectedRoute><PreBetaRecruits /></ProtectedRoute>} />
              <Route path="/asset-library" element={<ProtectedRoute><LBAssetLibrary /></ProtectedRoute>} />
              <Route path="/prototyping" element={<ProtectedRoute><PrototypingContracts /></ProtectedRoute>} />
              <Route path="/positions/browse" element={<ProtectedRoute><AllPositionsBrowse /></ProtectedRoute>} />
                        <Route path="/guild-stake-success" element={<ProtectedRoute><GuildStakeSuccess /></ProtectedRoute>} />
                        <Route path="/credit-purchase-success" element={<ProtectedRoute><CreditPurchaseSuccess /></ProtectedRoute>} />
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
                        <Route path="/hexisle-dashboard" element={<ProtectedRoute><HexisleDashboard /></ProtectedRoute>} />
                        
                        {/* Initiative Project Routes */}
                        <Route path="/initiatives" element={<ProtectedRoute><InitiativeProjectsPage /></ProtectedRoute>} />
                        <Route path="/initiatives/lets-make-dinner" element={<ProtectedRoute><LetsMakeDinnerPage /></ProtectedRoute>} />
                        <Route path="/initiatives/defense-claws" element={<ProtectedRoute><DefenseClawsPage /></ProtectedRoute>} />
                        <Route path="/initiatives/msa" element={<ProtectedRoute><MSAPage /></ProtectedRoute>} />
                        <Route path="/initiatives/lifeline-medications" element={<ProtectedRoute><LifeLineMedicationsPage /></ProtectedRoute>} />
                        <Route path="/initiatives/lets-go-shopping" element={<ProtectedRoute><LetsGoShoppingPage /></ProtectedRoute>} />
                        <Route path="/initiatives/lets-get-groceries" element={<ProtectedRoute><LetsGetGroceriesPage /></ProtectedRoute>} />
                        
                        {/* Steward & Admin Tools */}
                        <Route path="/steward/legal-formations" element={<ProtectedRoute><StewardLegalDashboard /></ProtectedRoute>} />
                        <Route path="/themes" element={<ProtectedRoute><ThemeManagement /></ProtectedRoute>} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                  </main>
                </div>
              </div>
              <GlobalRecorderOverlay />
              <PWAInstallPrompt />
            </SidebarProvider>
          </SubdomainRouter>
          </RecordingProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
