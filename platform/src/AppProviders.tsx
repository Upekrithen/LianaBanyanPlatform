import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SeamlessOnboardProvider } from "@/components/SeamlessOnboardDialog";
import { FeatureTipProvider } from "@/components/FeatureTip";
import { WildfireRunProvider } from "@/contexts/WildfireRunContext";
import { MockDataProvider } from "@/contexts/MockDataProvider";
import { PathwayProgressProvider } from "@/contexts/PathwayProgressContext";
import { CrowsNestProvider } from "@/contexts/CrowsNestContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { NotesOverlayProvider } from "@/contexts/NotesOverlayContext";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { BuilderModeProvider } from "@/components/builder/BuilderModeContext";
import { useWebVitals } from "@/hooks/useWebVitals";

const queryClient = new QueryClient();

function WebVitalsTracker() {
  useWebVitals();
  return null;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WebVitalsTracker />
      <BuilderModeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <SeamlessOnboardProvider>
                <FeatureTipProvider>
                  <WildfireRunProvider>
                    <MockDataProvider>
                      <PathwayProgressProvider>
                        <CrowsNestProvider>
                          <RecordingProvider>
                            <NotesOverlayProvider>
                              <SubdomainRouter>
                                {children}
                              </SubdomainRouter>
                            </NotesOverlayProvider>
                          </RecordingProvider>
                        </CrowsNestProvider>
                      </PathwayProgressProvider>
                    </MockDataProvider>
                  </WildfireRunProvider>
                </FeatureTipProvider>
              </SeamlessOnboardProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </BuilderModeProvider>
    </QueryClientProvider>
  );
}
