/**
 * UpekrithenApp — 7th Portal: MoneyPenny Admin (Founder-Only)
 * ===========================================================
 * Accessible only to users with role === 'founder' in profiles table.
 * Houses all MoneyPenny admin functions: inbox, briefing, social, QA, SMS, sessions.
 */
import { lazy, Suspense, useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { supabase } from "@/integrations/supabase/client";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { CrossPortalNav } from "@/components/CrossPortalNav";

const UpekrithenLanding = lazy(() => import("./pages/UpekrithenLanding"));
const MoneyPenny = lazy(() => import("./pages/MoneyPenny"));
const MoneypennyBriefing = lazy(() => import("./pages/MoneypennyBriefing"));
const MoneyPennyQA = lazy(() => import("./pages/MoneyPennyQA"));
const MoneyPennySocial = lazy(() => import("./pages/MoneyPennySocial"));

const queryClient = new QueryClient();

function UpekrithenLoadingFallback() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4 animate-pulse">🏰</div>
        <p className="text-amber-400 animate-pulse text-lg">Loading Upekrithen...</p>
      </div>
    </div>
  );
}

function FounderGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [isFounder, setIsFounder] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setChecking(false); return; }

    const verify = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      setIsFounder(data?.role === 'founder');
      setChecking(false);
    };
    verify();
  }, [user, authLoading]);

  if (authLoading || checking) return <UpekrithenLoadingFallback />;

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-amber-400 mb-2">Upekrithen</h1>
          <p className="text-zinc-400 mb-6">Fortress of Solitude. Authentication required.</p>
          <Link
            to="/auth"
            className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors font-semibold"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (!isFounder) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">Access Denied</h1>
          <p className="text-zinc-400 mb-6">This portal is restricted to the Founder.</p>
          <a
            href="https://lianabanyan.com"
            className="inline-block px-6 py-3 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
          >
            Return to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

const UpekrithenApp = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <RecordingProvider>
              <Toaster />
              <Sonner />
              <CrossPortalNav />
              <Suspense fallback={<UpekrithenLoadingFallback />}>
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/*" element={
                    <FounderGate>
                      <Routes>
                        <Route path="/" element={<UpekrithenLanding />} />
                        <Route path="/inbox" element={<MoneyPenny />} />
                        <Route path="/briefing" element={<MoneypennyBriefing />} />
                        <Route path="/qa" element={<MoneyPennyQA />} />
                        <Route path="/social" element={<MoneyPennySocial />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </FounderGate>
                  } />
                </Routes>
              </Suspense>
            </RecordingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default UpekrithenApp;
