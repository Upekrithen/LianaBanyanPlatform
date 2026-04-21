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

// Auth
import Auth from "./pages/Auth";

// Non-Profit Portal Landing (public entry page)
import NonprofitLanding from "./pages/NonprofitLanding";

// Non-Profit Portal Pages
import Dashboard from "./pages/Dashboard";
import { LBFundingPoolDisplay } from "@/components/LBFundingPoolDisplay";
import { EOIMilestoneDashboard } from "@/components/EOIMilestoneDashboard";
import { BlockchainGasDashboard } from "@/components/BlockchainGasDashboard";
import MemberResources from "./pages/MemberResources";
import NotFound from "./pages/NotFound";

// K110: Mission ONE & Charitable Features
import { lazy, Suspense } from "react";
const MissionOnePage = lazy(() => import("./pages/MissionOnePage"));
const GleanersCorner = lazy(() => import("./pages/GleanersCorner"));
const EarmarkCredits = lazy(() => import("./pages/EarmarkCredits"));
const CharitableSubscription = lazy(() => import("./pages/CharitableSubscription"));

const queryClient = new QueryClient();

const NonprofitApp = () => {
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
                      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                          <SidebarTrigger />
                          <h1 className="text-lg font-semibold">Liana Banyan Non-Profit Portal</h1>
                          <a
                            href="https://lianabanyan.com"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            → Marketplace
                          </a>
                        </div>
                        <SyncStatusIndicator />
                      </header>
                      <CrossPortalNav />
                      <main className="flex-1 overflow-auto p-6">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/auth" element={<Auth />} />

                          {/* Public landing for unauthenticated visitors */}
                          <Route path="/" element={<NonprofitLanding />} />

                          {/* K110: Mission ONE & Charitable (public) */}
                          <Route path="/mission-one" element={<Suspense fallback={<div className="flex justify-center py-16"><span className="animate-spin">Loading...</span></div>}><MissionOnePage /></Suspense>} />
                          <Route path="/gleaners-corner" element={<Suspense fallback={<div className="flex justify-center py-16"><span className="animate-spin">Loading...</span></div>}><GleanersCorner /></Suspense>} />
                          <Route path="/earmark" element={<Suspense fallback={<div className="flex justify-center py-16"><span className="animate-spin">Loading...</span></div>}><EarmarkCredits /></Suspense>} />
                          <Route path="/subscribe-to-feed" element={<Suspense fallback={<div className="flex justify-center py-16"><span className="animate-spin">Loading...</span></div>}><CharitableSubscription /></Suspense>} />

                          {/* Protected Non-Profit Routes */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />

                          {/* Fund Administration Routes */}
                          <Route
                            path="/funding-pool"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-6">
                                  <h1 className="text-3xl font-bold mb-6">LB Funding Pool</h1>
                                  <LBFundingPoolDisplay />
                                </div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/eoi-vesting"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-6">
                                  <h1 className="text-3xl font-bold mb-6">EOI Milestone Schedules</h1>
                                  <EOIMilestoneDashboard />
                                </div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/gas-tracking"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-6">
                                  <h1 className="text-3xl font-bold mb-6">Blockchain Gas Tracking</h1>
                                  <BlockchainGasDashboard />
                                </div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/member-benefits"
                            element={
                              <ProtectedRoute>
                                <MemberResources />
                              </ProtectedRoute>
                            }
                          />

                          {/* Redirect other portal routes */}
                          <Route
                            path="/marketplace"
                            element={<Navigate to="https://lianabanyan.com/marketplace" replace />}
                          />
                          <Route
                            path="/projects"
                            element={<Navigate to="https://lianabanyan.com/projects" replace />}
                          />

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

export default NonprofitApp;
