import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { UnifiedNavigation } from "@/components/UnifiedNavigation";
import { SyncStatusIndicator } from "@/components/SyncStatusIndicator";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { CrossPortalNav } from "@/components/CrossPortalNav";
import { GlobalBreadcrumbs } from "@/components/GlobalBreadcrumbs";

// Auth
import Auth from "./pages/Auth";

// Business Portal Pages
import Dashboard from "./pages/Dashboard";
import ContractPositions from "./pages/ContractPositions";
import ManagePositions from "./pages/ManagePositions";
import MemberResources from "./pages/MemberResources";
import LBInternalPositions from "./pages/LBInternalPositions";
import PositionCategories from "./pages/PositionCategories";
import AdminProject from "./pages/AdminProject";
import TaskList from "./pages/TaskList";
import TaskLog from "./pages/TaskLog";
import SubdomainManager from "./pages/SubdomainManager";
import ClientAPIManager from "./pages/ClientAPIManager";
import CredentialManagement from "./pages/CredentialManagement";
import CreateProject from "./pages/CreateProject";
import BrowseBusiness from "./pages/BrowseBusiness";
import ThemeManagement from "./pages/ThemeManagement";
import Workshop from "./pages/Workshop";
import CampaignProduction from "./pages/CampaignProduction";
import Briefcase from "./pages/Briefcase";
import ProjectView from "./pages/ProjectView";
import NotFound from "./pages/NotFound";

// Business Portal Landing (public entry page)
import BusinessLanding from "./pages/BusinessLanding";

// Business Portal — shared pages (also available on marketplace)
import { lazy, Suspense } from "react";
const BizKaleidoscope = lazy(() => import("./pages/BizKaleidoscope"));
const StoreFrontAggregation = lazy(() => import("./pages/StoreFrontAggregation"));
const TheFurnace = lazy(() => import("./pages/TheFurnace"));
const MakerDashboard = lazy(() => import("./pages/MakerDashboard"));
const OrderManifestPage = lazy(() => import("./pages/OrderManifestPage"));

const queryClient = new QueryClient();

const BusinessApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <RecordingProvider>
              <SubdomainRouter>
                <SidebarProvider defaultOpen={true}>
                  <Toaster />
                  <Sonner />
                  <div className="min-h-screen flex w-full bg-background">
                    <UnifiedNavigation />
                    <div className="flex-1 flex flex-col">
                      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                          <SidebarTrigger />
                          <GlobalBreadcrumbs />
                        </div>
                        <SyncStatusIndicator />
                      </header>
                      <CrossPortalNav />
                      <main className="flex-1 overflow-auto p-6">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/browse" element={<BrowseBusiness />} />

          {/* Public landing for unauthenticated visitors */}
          <Route path="/" element={<BusinessLanding />} />

          {/* Protected Business Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

                          {/* Member Routes */}
                          <Route
                            path="/positions"
                            element={
                              <ProtectedRoute>
                                <ContractPositions />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/member-resources"
                            element={
                              <ProtectedRoute>
                                <MemberResources />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/workshop"
                            element={
                              <ProtectedRoute>
                                <Workshop />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/campaign-production/:workstationId"
                            element={
                              <ProtectedRoute>
                                <CampaignProduction />
                              </ProtectedRoute>
                            }
                          />
          <Route
            path="/briefcase"
            element={
              <ProtectedRoute>
                <Briefcase />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project/:slug"
            element={
              <ProtectedRoute>
                <ProjectView />
              </ProtectedRoute>
            }
          />

          {/* HR/Management Routes */}
          <Route
            path="/manage-positions"
            element={
              <ProtectedRoute>
                <ManagePositions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lb-positions"
            element={
              <ProtectedRoute>
                <LBInternalPositions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/position-categories"
            element={
              <ProtectedRoute>
                <PositionCategories />
              </ProtectedRoute>
            }
          />

                          {/* Steward/Admin Routes */}
                          <Route
                            path="/admin-project/:id"
                            element={
                              <ProtectedRoute>
                                <AdminProject />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/create-project"
                            element={
                              <ProtectedRoute>
                                <CreateProject />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/task-list"
                            element={
                              <ProtectedRoute>
                                <TaskList />
                              </ProtectedRoute>
                            }
                          />
                          {/* Redirect /tasklist and /tasks to /task-list */}
                          <Route path="/tasklist" element={<Navigate to="/task-list" replace />} />
                          <Route path="/tasks" element={<Navigate to="/task-list" replace />} />
                          <Route
                            path="/task-log"
                            element={
                              <ProtectedRoute>
                                <TaskLog />
                              </ProtectedRoute>
                            }
                          />
                          {/* Redirect /tasklog to /task-log */}
                          <Route path="/tasklog" element={<Navigate to="/task-log" replace />} />
                          <Route
                            path="/subdomain-manager"
                            element={
                              <ProtectedRoute>
                                <SubdomainManager />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/client-api-manager"
                            element={
                              <ProtectedRoute>
                                <ClientAPIManager />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/credential-management"
                            element={
                              <ProtectedRoute>
                                <CredentialManagement />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/themes"
                            element={
                              <ProtectedRoute>
                                <ThemeManagement />
                              </ProtectedRoute>
                            }
                          />

                          {/* Redirect marketplace routes to marketplace portal */}
                          <Route
                            path="/marketplace"
                            element={<Navigate to="https://lianabanyan.com/marketplace" replace />}
                          />
                          <Route
                            path="/projects"
                            element={<Navigate to="https://lianabanyan.com/projects" replace />}
                          />
                          <Route
                            path="/portfolio"
                            element={<Navigate to="https://lianabanyan.com/portfolio" replace />}
                          />

                          {/* Business Portal shared pages */}
                          <Route path="/kaleidoscope" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BizKaleidoscope /></Suspense>} />
                          <Route path="/biz-directory" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><BizKaleidoscope /></Suspense>} />
                          <Route path="/storefront-aggregation" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StoreFrontAggregation /></Suspense>} />
                          <Route path="/biz-aggregation" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><StoreFrontAggregation /></Suspense>} />
                          <Route path="/the-furnace" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TheFurnace /></Suspense>} />
                          <Route path="/furnace" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><TheFurnace /></Suspense>} />

                          {/* K109: Maker Dashboard */}
                          <Route path="/dashboard/maker" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><MakerDashboard /></Suspense></ProtectedRoute>} />

                          {/* K130: Order Manifest — Restaurant pre-order view */}
                          <Route path="/orders" element={<ProtectedRoute><Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><OrderManifestPage /></Suspense></ProtectedRoute>} />

                          {/* 404 */}
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                  <PWAInstallPrompt />
                </SidebarProvider>
              </SubdomainRouter>
            </RecordingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default BusinessApp;
