import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DashboardStatCards,
  DashboardProjects,
  DashboardTreasureMap,
  DashboardCueCards,
  DashboardNotifications,
  DashboardCaptain,
} from '@/components/dashboard';
import { MoneyPennyWidget } from '@/components/MoneyPennyWidget';
import { FundingWidget } from '@/components/helm/FundingWidget';
import { Settings, Palette } from 'lucide-react';

export default function CreatorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  const displayName = user?.user_metadata?.display_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Creator';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
          <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
          <Skeleton className="h-48 rounded-lg" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  const d = data!;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        <div className="container mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="min-w-0">
            <h1 className="text-lg md:text-2xl font-bold truncate">
              Welcome back, {displayName}
            </h1>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/themes')}
              className="touch-manipulation"
              title="Customize Theme"
            >
              <Palette className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile-settings')}
              className="touch-manipulation"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={signOut} size="sm" className="touch-manipulation">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-6 space-y-6">
        <MoneyPennyWidget />

        {/* Stat Cards */}
        <DashboardStatCards
          projectCount={d.projects.length}
          totalEarnings={d.totalEarnings}
          ordersFulfilled={d.ordersFulfilled}
          ordersTotal={d.ordersTotal}
          reputationScore={d.reputationScore}
        />

        {/* Projects */}
        <DashboardProjects projects={d.projects} />

        {/* Two-column grid: Treasure Map + Cue Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          <DashboardTreasureMap progress={d.treasureMapProgress} />
          <DashboardCueCards cueCards={d.cueCards} />
        </div>

        {/* Card Funding Widget */}
        <FundingWidget />

        {/* Notifications */}
        <DashboardNotifications notifications={d.notifications} />

        {/* Captain Status — only if user is a Captain */}
        {d.captain && <DashboardCaptain captain={d.captain} />}
      </main>
    </div>
  );
}
