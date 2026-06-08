import { useEffect } from "react";
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
import { BanyanWordmark } from "@/components/BanyanWordmark";
import { MarksMilestonePopup } from "@/components/marks/MarksMilestonePopup";
import { useMarksMilestone } from "@/hooks/useMarksMilestone";
import { useRtlDirection } from "@/hooks/useRtlDirection";
import { useLocaleRouting } from "@/hooks/useLocaleRouting";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const { trackPageVisit, isGhost } = useGhostSession();
  const isMobile = useIsMobile();
  const marks = useMarksMilestone();
  useDiscoveryTracker();
  useLocaleRouting(); // Wave 15: path-prefix locale detection (/ar/, /he/, etc.)

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

  useRtlDirection();

  const isLanding = location.pathname === '/';
  const FOCUS_ROUTES = ['/membership', '/membership/confirm', '/ghost', '/explore', '/free-explore', '/welcome'];
  const isFocusRoute = FOCUS_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));
  const HIDDEN_ROUTES = ['/', '/founder', '/proofs', '/welcome', '/pathways'];
  const isBannerHidden = HIDDEN_ROUTES.some(r => location.pathname === r || location.pathname.startsWith(r + '/'));
  const showChrome = !!user && !isLanding && !isFocusRoute;

  return (
    <DiscoveryProvider>
      <DiscoveryGateProvider>
        <SidebarProvider defaultOpen={false}>
          {/* W16 AAA SC 2.4.1 — skip navigation links; visible on keyboard focus */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[9999] focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded focus:ring-2 focus:ring-primary focus:outline-none font-medium text-sm"
          >
            Skip to main content
          </a>
          {/* W16 AAA — aria-live polite region for dynamic content announcements.
              Marks balance updates, vote confirmations, and queue depth changes
              are announced here via useA11yAnnouncer hook. */}
          <div
            id="lb-sr-announcer"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="sr-only"
          />
          <div className="min-h-screen flex w-full overflow-x-hidden">
            {showChrome && <AppSidebar />}
            <div className="flex-1 flex flex-col min-w-0">
              {!isLanding && <CrossPortalNav />}
              {!isBannerHidden && <BetaBanner />}
              {showChrome && (
                <div className="flex items-center gap-3 px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
                  <SidebarTrigger className="shrink-0" />
                  {/* BP074-W3: Liana Banyan wordmark + moon/sun theme toggle */}
                  <BanyanWordmark />
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
                <main id="main-content" className="flex-1 overflow-x-hidden flex flex-col" tabIndex={-1}>
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
