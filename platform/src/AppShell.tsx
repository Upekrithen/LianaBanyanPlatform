import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useDiscoveryTracker } from "@/hooks/useDiscoveryTracker";
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

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  useDiscoveryTracker();

  useEffect(() => {
    import("@/lib/analytics").then(({ trackPageView }) => {
      trackPageView(location.pathname);
    });
  }, [location.pathname]);

  const isLanding = location.pathname === '/';
  const showChrome = !!user && !isLanding;

  return (
    <DiscoveryProvider>
      <DiscoveryGateProvider>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full overflow-x-hidden">
            {showChrome && <AppSidebar />}
            <div className="flex-1 flex flex-col min-w-0">
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
                {showChrome && (
                  <aside className="hidden xl:block w-64 border-l bg-card/30 overflow-y-auto shrink-0">
                    <DiscoveryBookshelf />
                  </aside>
                )}
              </div>
            </div>
          </div>
        </SidebarProvider>
        <GlobalRecorderOverlay />
        <HelmCompact />
        <PWAInstallPrompt />
        <LanguageSwitcher />
      </DiscoveryGateProvider>
    </DiscoveryProvider>
  );
}
