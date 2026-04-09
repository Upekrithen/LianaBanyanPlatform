/**
 * HexIsleApp — Dedicated portal for hexisle.com
 * Full HexIsle experience: Dashboard, Encyclopedia, 3D World, Overworld, Islands
 *
 * Subdomain-aware: future subdomains (encyclopedia.hexisle.com, etc.)
 * will be detected in portalDetector.ts and route here with a hint.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { CrossPortalNav } from "@/components/CrossPortalNav";

// Lazy-load all HexIsle pages for code splitting
const HexIsle = lazy(() => import("./pages/HexIsle"));
const HexIsleProjects = lazy(() => import("./pages/HexIsleProjects"));
const HexIsleEncyclopedia = lazy(() => import("./pages/HexIsleEncyclopedia"));
const HexIsleIslandPage = lazy(() => import("./pages/HexIsleIslandPage"));
const HexIsleWorld3D = lazy(() => import("./pages/HexIsleWorld3D"));
const HexIsleOverworld = lazy(() => import("./pages/HexIsleOverworld"));
const HexisleDashboard = lazy(() => import("./pages/HexisleDashboard"));
const CompanyIsland = lazy(() => import("./pages/CompanyIsland"));
const HarvestIsland = lazy(() => import("./pages/HarvestIsland"));
const TreasureIsland = lazy(() => import("./pages/TreasureIsland"));
const IslandAssignmentBoard = lazy(() => import("./pages/IslandAssignmentBoard"));
const IslandBuilderPage = lazy(() => import("./pages/IslandBuilderPage"));
const IslandCreator = lazy(() => import("./pages/IslandCreator"));
const IslandDesignPortfolio = lazy(() => import("./pages/IslandDesignPortfolio"));
const IslandDetail = lazy(() => import("./pages/IslandDetail"));
const IslandWorldMap = lazy(() => import("./pages/IslandWorldMap"));
const KeepsLobby = lazy(() => import("./pages/cue-cards/KeepsLobby"));
const HexIsleWorldCard = lazy(() => import("./pages/cue-cards/HexIsleWorldCard"));
const HexIsleShowcase = lazy(() => import("./components/hexisle/HexIsleShowcase").then(m => ({ default: m.HexIsleShowcase })));
const HexIsleCampaignsPage = lazy(() => import("./pages/HexIsleCampaignsPage"));
const KickstarterCampaignPage = lazy(() => import("./pages/KickstarterCampaignPage"));

const queryClient = new QueryClient();

/**
 * Loading fallback for lazy-loaded pages
 */
function HexIsleLoadingFallback() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🏝️</div>
        <p className="text-emerald-400 animate-pulse text-lg">Loading HexIsle...</p>
      </div>
    </div>
  );
}

/**
 * Detect if we're on a subdomain of hexisle.com
 * Returns the subdomain prefix or null for root
 */
function getHexIsleSubdomain(): string | null {
  const hostname = window.location.hostname;

  // Dev mode
  if (hostname === 'localhost') return null;

  // Check for hexisle.com subdomains
  if (hostname.endsWith('hexisle.com') && hostname !== 'hexisle.com' && hostname !== 'www.hexisle.com') {
    const parts = hostname.split('.');
    // e.g., encyclopedia.hexisle.com → "encyclopedia"
    if (parts.length >= 3) {
      return parts[0];
    }
  }

  return null;
}

const HexIsleApp = () => {
  const subdomain = getHexIsleSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
            <RecordingProvider>
              <Toaster />
              <Sonner />
              <CrossPortalNav />
              <Suspense fallback={<HexIsleLoadingFallback />}>
                <Routes>
                  {/* Subdomain-based routing */}
                  {subdomain === 'encyclopedia' ? (
                    <>
                      <Route path="/" element={<HexIsleEncyclopedia />} />
                      <Route path="/:islandName" element={<HexIsleIslandPage />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  ) : subdomain === 'showcase' ? (
                    <>
                      <Route path="/" element={<HexIsleShowcase />} />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </>
                  ) : (
                    <>
                      {/* Root hexisle.com — Full Dashboard Experience */}
                      <Route path="/" element={<HexIsle />} />
                      <Route path="/auth" element={<Auth />} />

                      {/* Core navigation — 3-phase view system */}
                      <Route path="/overworld" element={<HexIsleOverworld />} />
                      <Route path="/world-3d" element={<HexIsleWorld3D />} />
                      <Route path="/world-map" element={<IslandWorldMap />} />

                      {/* Encyclopedia & Knowledge */}
                      <Route path="/encyclopedia" element={<HexIsleEncyclopedia />} />
                      <Route path="/island/:islandName" element={<HexIsleIslandPage />} />

                      {/* Showcase & Projects */}
                      <Route path="/showcase" element={<HexIsleShowcase />} />
                      <Route path="/projects" element={<HexIsleProjects />} />

                      {/* Individual islands */}
                      <Route path="/company" element={<CompanyIsland />} />
                      <Route path="/harvest" element={<HarvestIsland />} />
                      <Route path="/treasure" element={<TreasureIsland />} />
                      <Route path="/island/:id" element={<IslandDetail />} />

                      {/* Builder tools */}
                      <Route path="/assignments" element={<IslandAssignmentBoard />} />
                      <Route path="/builder" element={<IslandBuilderPage />} />
                      <Route path="/creator" element={<IslandCreator />} />
                      <Route path="/portfolio" element={<IslandDesignPortfolio />} />
                      <Route path="/dashboard" element={<HexisleDashboard />} />

                      {/* Campaigns (K146) */}
                      <Route path="/campaigns" element={<HexIsleCampaignsPage />} />
                      <Route path="/campaign/:slug" element={<KickstarterCampaignPage />} />

                      {/* Keeps & Cue Cards */}
                      <Route path="/keeps" element={<KeepsLobby />} />
                      <Route path="/world-card" element={<HexIsleWorldCard />} />

                      {/* Legacy paths from main app — redirect */}
                      <Route path="/hexisle" element={<Navigate to="/" replace />} />
                      <Route path="/hexisle/*" element={<Navigate to="/" replace />} />

                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </Suspense>
            </RecordingProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default HexIsleApp;
