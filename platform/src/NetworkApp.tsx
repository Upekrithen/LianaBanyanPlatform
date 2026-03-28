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

// Network Portal Landing (public entry page)
import NetworkLanding from "./pages/NetworkLanding";

// Network Portal Pages (.net)
import ClientAPIManager from "@/pages/ClientAPIManager";
import CredentialManagement from "@/pages/CredentialManagement";
import IndustryPricing from "@/pages/IndustryPricing";
import SubdomainManager from "@/pages/SubdomainManager";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminProject from "@/pages/AdminProject";
import NotFound from "@/pages/NotFound";
import { lazy, Suspense, type ReactNode } from "react";
const NetworkManifest = lazy(() => import("./pages/NetworkManifest"));
const ProductionSchedules = lazy(() => import("./pages/ProductionSchedules"));
const B2BContracts = lazy(() => import("./pages/B2BContracts"));
const SupplyChain = lazy(() => import("./pages/SupplyChain"));
const Guilds = lazy(() => import("./pages/Guilds"));
const Tribes = lazy(() => import("./pages/Tribes"));
const Simulator = lazy(() => import("./pages/Simulator"));

const queryClient = new QueryClient();

function NetworkShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <UnifiedNavigation />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-lg font-semibold">Liana Banyan Business Network Portal</h1>
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
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

const NetworkApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <RecordingProvider>
              <SubdomainRouter>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Full-bleed public landing — no sidebar chrome */}
                  <Route path="/" element={<NetworkLanding />} />
                  <Route path="/auth" element={<Auth />} />

                  {/* All other routes get the sidebar shell */}
                  <Route path="/*" element={
                    <NetworkShell>
                      <Routes>

                          {/* Protected Network Portal Routes */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/production-schedules"
                            element={
                              <ProtectedRoute>
                                <Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}>
                                  <ProductionSchedules />
                                </Suspense>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/b2b-contracts"
                            element={
                              <ProtectedRoute>
                                <Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}>
                                  <B2BContracts />
                                </Suspense>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/supply-chain"
                            element={
                              <ProtectedRoute>
                                <Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}>
                                  <SupplyChain />
                                </Suspense>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/manifests"
                            element={
                              <ProtectedRoute>
                                <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
                                  <NetworkManifest />
                                </Suspense>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/industry-pricing"
                            element={
                              <ProtectedRoute>
                                <IndustryPricing />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/xml-lockbox"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-8">
                                  <h1 className="text-3xl font-bold mb-4">XML Lockbox</h1>
                                  <p className="text-muted-foreground">
                                    Blockchain-verified project data API
                                  </p>
                                  <div className="mt-6 p-4 border rounded-md">
                                    <h3 className="font-semibold mb-2">API Endpoint:</h3>
                                    <code className="bg-secondary p-2 rounded block">
                                      GET /serve-network-lockbox?project=SKU&version=1
                                    </code>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      Requires: X-API-Key header
                                    </p>
                                  </div>
                                </div>
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
                            path="/subdomain-manager"
                            element={
                              <ProtectedRoute>
                                <SubdomainManager />
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/admin-project/:projectId"
                            element={
                              <ProtectedRoute>
                                <AdminProject />
                              </ProtectedRoute>
                            }
                          />

                          <Route path="/guilds" element={<ProtectedRoute><Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}><Guilds /></Suspense></ProtectedRoute>} />
                          <Route path="/tribes" element={<ProtectedRoute><Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}><Tribes /></Suspense></ProtectedRoute>} />
                          <Route path="/simulator" element={<ProtectedRoute><Suspense fallback={<div className="flex justify-center py-16">Loading...</div>}><Simulator /></Suspense></ProtectedRoute>} />

                          {/* Redirect to other portals */}
                          <Route
                            path="/marketplace"
                            element={<Navigate to="https://lianabanyan.com/marketplace" replace />}
                          />
                          <Route
                            path="/projects"
                            element={<Navigate to="https://lianabanyan.com/projects" replace />}
                          />
                          <Route
                            path="/positions"
                            element={<Navigate to="https://lianabanyan.biz/positions" replace />}
                          />
                          <Route
                            path="/funding-pool"
                            element={<Navigate to="https://lianabanyan.org/funding-pool" replace />}
                          />

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </NetworkShell>
                  } />
                </Routes>
                <PWAInstallPrompt />
              </SubdomainRouter>
            </RecordingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default NetworkApp;