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

// Network Portal Pages (.net)
import ClientAPIManager from "@/pages/ClientAPIManager";
import CredentialManagement from "@/pages/CredentialManagement";
import IndustryPricing from "@/pages/IndustryPricing";
import SubdomainManager from "@/pages/SubdomainManager";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminProject from "@/pages/AdminProject";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const NetworkApp = () => {
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
                      <main className="flex-1 overflow-auto p-6">
                        <Routes>
                          {/* Public Routes */}
                          <Route path="/auth" element={<Auth />} />

                          {/* Protected Network Portal Routes */}
                          <Route
                            path="/"
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
                                <div className="container mx-auto p-8">
                                  <h1 className="text-3xl font-bold mb-4">Production Schedules</h1>
                                  <p className="text-muted-foreground">
                                    B2B production schedule coordination coming soon...
                                  </p>
                                </div>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/b2b-contracts"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-8">
                                  <h1 className="text-3xl font-bold mb-4">B2B Contracts</h1>
                                  <p className="text-muted-foreground">
                                    Inter-business contract management coming soon...
                                  </p>
                                </div>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/supply-chain"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-8">
                                  <h1 className="text-3xl font-bold mb-4">Supply Chain</h1>
                                  <p className="text-muted-foreground">
                                    Supply chain coordination coming soon...
                                  </p>
                                </div>
                              </ProtectedRoute>
                            }
                          />

                          <Route
                            path="/manifests"
                            element={
                              <ProtectedRoute>
                                <div className="container mx-auto p-8">
                                  <h1 className="text-3xl font-bold mb-4">Production Manifests</h1>
                                  <p className="text-muted-foreground">
                                    Manifest management coming soon...
                                  </p>
                                </div>
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

export default NetworkApp;