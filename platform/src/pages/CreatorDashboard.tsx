import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import {
  Settings,
  Palette,
  Clock,
  Swords,
  Share2,
  Coins,
  Zap,
  Shield,
  Activity,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';

function useLoginDuration(): string | null {
  return useMemo(() => {
    const ts = localStorage.getItem('lb_login_timestamp');
    if (!ts) return null;
    const days = Math.floor((Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Logged in today';
    if (days === 1) return 'Logged in for 1 day';
    return `Logged in for ${days} days`;
  }, []);
}

export default function CreatorDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();
  const loginDuration = useLoginDuration();

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
            {loginDuration && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3" />
                {loginDuration}
              </p>
            )}
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

        {/* Currencies: Credits / Marks / Joules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-5 w-5" />
              Revenue &amp; Currencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border p-3 text-center">
                <Coins className="h-5 w-5 mx-auto mb-1 text-green-600" />
                <p className="text-lg font-bold tabular-nums">{d.currencies.credits.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Credits</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Shield className="h-5 w-5 mx-auto mb-1 text-amber-600" />
                <p className="text-lg font-bold tabular-nums">{d.currencies.marksEarned}</p>
                <p className="text-xs text-muted-foreground">Marks Earned</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Shield className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                <p className="text-lg font-bold tabular-nums">{d.currencies.marksBacked}</p>
                <p className="text-xs text-muted-foreground">Marks Backed</p>
              </div>
              <div className="rounded-lg border p-3 text-center">
                <Zap className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                <p className="text-lg font-bold tabular-nums">{d.currencies.joules}</p>
                <p className="text-xs text-muted-foreground">Joules</p>
              </div>
            </div>
            {d.currencies.credits === 0 && d.currencies.marksEarned === 0 && (
              <div className="text-center mt-4 pt-3 border-t">
                <p className="text-sm text-muted-foreground">Earn your first Marks by participating in the community</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/treasure-maps')} className="mt-2 gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Start a Treasure Map
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Two-column: League Monitoring + Social Plugs */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Swords className="h-5 w-5" />
                The League
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <Swords className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No active battles</p>
                <p className="text-xs mt-1">Design Battles and votes will appear here</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/arenas')} className="mt-3 gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Check the Arena
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Share2 className="h-5 w-5" />
                Social Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4 text-muted-foreground">
                <Share2 className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No accounts connected</p>
                <p className="text-xs mt-1">Link your social accounts for quick sharing</p>
                <Button size="sm" variant="outline" onClick={() => navigate('/settings/social-accounts')} className="mt-3 gap-1">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Connect Accounts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Funding Widget */}
        <FundingWidget />

        {/* Activity Feed */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {d.notifications.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Your activity will appear here</p>
                <p className="text-xs mt-1">Transactions, contributions, votes, and Crew Call activity</p>
              </div>
            ) : (
              <div className="space-y-2">
                {d.notifications.slice(0, 8).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => n.link && navigate(n.link)}
                    className="w-full flex items-center gap-3 rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${n.read_at ? 'bg-muted-foreground/30' : 'bg-primary'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground truncate">{n.body}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications (bell-style) */}
        <DashboardNotifications notifications={d.notifications} />

        {/* Quick Links: Helm + Bridges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Helm', path: '/dashboard/helm', icon: '🎯' },
            { label: 'Bridges', path: '/dashboard/bridges', icon: '🌉' },
            { label: 'Portfolio', path: '/portfolio', icon: '📁' },
            { label: 'Briefcase', path: '/briefcase', icon: '💼' },
          ].map((link) => (
            <Button
              key={link.path}
              variant="outline"
              className="h-auto py-3 flex-col gap-1"
              onClick={() => navigate(link.path)}
            >
              <span className="text-lg">{link.icon}</span>
              <span className="text-xs">{link.label}</span>
            </Button>
          ))}
        </div>

        {/* Captain Status — only if user is a Captain */}
        {d.captain && <DashboardCaptain captain={d.captain} />}
      </main>
    </div>
  );
}
