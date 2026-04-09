import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoveryTracker } from "@/hooks/useDiscoveryTracker";
import { useGhostSession } from "@/hooks/useGhostSession";
import { DiscoveryProvider } from "@/hooks/useDiscovery";
import { DiscoveryGateProvider } from "@/components/DiscoveryGate";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { GlobalSearch } from "@/components/GlobalSearch";
import { CreditBalanceHeader } from "@/components/CreditBalanceHeader";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PlatformFooter } from "@/components/PlatformFooter";
import { DiscoveryBookshelf } from "@/components/DiscoveryBookshelf";
import { GlobalRecorderOverlay } from "@/components/GlobalRecorderOverlay";
import { HelmCompact } from "@/components/HelmCompact";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import BetaBanner from "@/components/BetaBanner";
import { CrossPortalNav } from "@/components/CrossPortalNav";
import { FeedbackTutorialOverlay } from "@/components/tour/FeedbackTutorialOverlay";
import { MarksMilestonePopup } from "@/components/marks/MarksMilestonePopup";
import { useMarksMilestone } from "@/hooks/useMarksMilestone";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const { trackPageVisit, isGhost } = useGhostSession();
  const [showTutorial, setShowTutorial] = useState(false);
  const isMobile = useIsMobile();
  const marks = useMarksMilestone();
  useDiscoveryTracker();

  useEffect(() => {
    import("@/lib/analytics").then(({ trackPageView }) => {
      trackPageView(location.pathname);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (isGhost) {
      trackPageVisit(location.pathname);
    }
  }, [isGhost, location.pathname, trackPageVisit]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    // Skip tutorial on mobile landing — CrossPortalNav + tutorial crowd the viewport (B053)
    if (isMobile) return;
    const dismissed = localStorage.getItem('feedback_tutorial_dismissed');
    if (dismissed === 'true') return;

    if (user) {
      supabase
        .from('user_preferences' as never)
        .select('value')
        .eq('user_id', user.id)
        .eq('key', 'feedback_tutorial_dismissed')
        .single()
        .then(({ data }: { data: unknown }) => {
          if (!data) setShowTutorial(true);
        });
    } else {
      setShowTutorial(true);
    }
  }, [user, location.pathname]);

  const isLanding = location.pathname === '/';
  const FOCUS_ROUTES = ['/membership', '/membership/confirm', '/ghost', '/explore', '/free-explore'];
  const isFocusRoute = FOCUS_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));
  const showChrome = !!user && !isLanding && !isFocusRoute;

  return (
    <DiscoveryProvider>
      <DiscoveryGateProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full overflow-x-hidden">
            {showChrome && <AppSidebar />}
            <div className="flex-1 flex flex-col min-w-0">
              <CrossPortalNav />
              <BetaBanner />
              {showChrome && (
                <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
                  <SidebarTrigger className="shrink-0" />
                  <div className="flex-1" />
                  <GlobalSearch />
                  <CreditBalanceHeader />
                  <NotificationBell />
                  <span className="text-xs text-muted-foreground hidden sm:inline truncate max-w-[140px]" title={user.email || ''}>
                    Signed in{user.email ? ` as ${user.email.split('@')[0]}` : ''}
                  </span>
                </div>
              )}
              <div className="flex flex-1 overflow-x-hidden">
                <main className="flex-1 overflow-x-hidden flex flex-col">
                  <div className="flex-1">{children}</div>
                  <PlatformFooter />
                </main>
                {/* Bookshelf removed from always-on rail — Discovery is accessible via Crow's Nest */}
              </div>
            </div>
          </div>
        </SidebarProvider>
        <GlobalRecorderOverlay />
        <HelmCompact />
        <PWAInstallPrompt />
        <LanguageSwitcher />
        {showTutorial && (
          <FeedbackTutorialOverlay onDismiss={() => setShowTutorial(false)} />
        )}
        {marks.showMilestone && (
          <MarksMilestonePopup
            open={marks.showMilestone}
            milestone={marks.currentMilestone}
            totalMarks={marks.totalMarks}
            categories={marks.categories}
            primaryCategory={marks.primaryCategory}
            isPrizePanel={marks.isPrizePanel}
            isGhost={isGhost}
            onDismiss={marks.dismiss}
          />
        )}
      </DiscoveryGateProvider>
    </DiscoveryProvider>
  );
}
