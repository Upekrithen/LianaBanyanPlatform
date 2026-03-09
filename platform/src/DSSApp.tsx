/**
 * DSSApp — Dedicated portal for the2ndsecond.com
 * Root: Maker Portal (STL Vault, Prototyper Guild, Test & Report)
 * /get-hired: Original "Get Hired Doing What You Like" experience (preserved)
 *
 * Subdomain-aware: future subdomains (showcase.the2ndsecond.com, etc.)
 * will be detected here and route to the appropriate view.
 */
import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Maker Portal (primary experience for the2ndsecond.com)
const The2ndSecondPortal = lazy(() => import("./pages/The2ndSecondPortal"));

// Original "Get Hired" experience (preserved at /get-hired)
const GetHiredLanding = lazy(() => import("./DSSGetHiredApp"));

// HexIsle Showcase (for showcase.the2ndsecond.com subdomain)
const HexIsleShowcase = lazy(() => import("./components/hexisle/HexIsleShowcase").then(m => ({ default: m.HexIsleShowcase })));

const queryClient = new QueryClient();

/**
 * Loading fallback
 */
function DSSLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🖨️</div>
        <p className="text-zinc-400 animate-pulse text-lg">Loading The 2nd Second...</p>
      </div>
    </div>
  );
}

/**
 * Detect if we're on a subdomain of the2ndsecond.com
 */
function getDSSSubdomain(): string | null {
  const hostname = window.location.hostname;

  if (hostname === 'localhost') return null;

  if (hostname.endsWith('the2ndsecond.com') && hostname !== 'the2ndsecond.com' && hostname !== 'www.the2ndsecond.com') {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0];
    }
  }

  return null;
}

const DSSApp = () => {
  const subdomain = getDSSSubdomain();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <RecordingProvider>
              <Toaster />
              <Sonner />
              <Suspense fallback={<DSSLoadingFallback />}>
                <Routes>
                  {subdomain === 'showcase' ? (
                    <>
                      <Route path="/" element={<HexIsleShowcase />} />
                      <Route path="*" element={<HexIsleShowcase />} />
                    </>
                  ) : (
                    <>
                      {/* Root: Maker Portal (STL Vault, Prototyper Guild, Test & Report) */}
                      <Route path="/" element={<The2ndSecondPortal />} />
                      <Route path="/auth" element={<Auth />} />

                      {/* Original "Get Hired" experience — preserved intact */}
                      <Route path="/get-hired" element={<GetHiredLanding />} />

                      <Route path="*" element={<NotFound />} />
                    </>
                  )}
                </Routes>
              </Suspense>
            </RecordingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default DSSApp;
