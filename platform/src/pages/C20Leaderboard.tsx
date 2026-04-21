/**
 * C+20 RECIPROCITY LEADERBOARD
 * ============================
 * Innovation #1350: Reciprocity Ledger & Transparency
 *
 * Public view showing top C+20 contributors - businesses that have
 * sacrificed the most margin for the community.
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { PortalPageLayout } from '@/components/PortalPageLayout';

import { getReciprocityLeaderboard } from '@/lib/c20ReciprocityService';
import { CostPlusBadge } from '@/components/CostPlusBadge';

import {
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Package,
  Medal,
  Crown,
  Star,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Heart,
} from 'lucide-react';

interface LeaderboardEntry {
  anchor_id: string;
  anchor_name: string;
  total_margin_contributed: number;
  reciprocity_balance: number;
  products_at_c20: number;
  badge_tier: string;
}

export default function C20Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      const data = await getReciprocityLeaderboard(50);
      setEntries(data as LeaderboardEntry[]);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'FULL': return <Crown className="w-5 h-5 text-emerald-400" />;
      case 'THREE_QUARTER': return <Star className="w-5 h-5 text-teal-400" />;
      case 'HALF': return <Medal className="w-5 h-5 text-cyan-400" />;
      case 'QUARTER': return <Sparkles className="w-5 h-5 text-blue-400" />;
      default: return null;
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'FULL': return 'C+20 Certified';
      case 'THREE_QUARTER': return '¾ Badge';
      case 'HALF': return '½ Badge';
      case 'QUARTER': return '¼ Badge';
      default: return 'Participating';
    }
  };

  const totalContributed = entries.reduce((sum, e) => sum + (e.total_margin_contributed || 0), 0);
  const totalProducts = entries.reduce((sum, e) => sum + (e.products_at_c20 || 0), 0);

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="c20-leaderboard">
      {/* Header */}
      <div className="border-b border-border bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <Trophy className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-300 font-medium">C+20 Reciprocity Leaderboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Businesses Building the Community
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These businesses have committed to Cost + 20% pricing, sacrificing margin to build
              a transparent, cooperative economy. Every dollar they give up earns them purchasing
              power within the ecosystem.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-500/20">
                  <DollarSign className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-300/80">Total Margin Contributed</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalContributed)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-500/20">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-blue-300/80">Participating Businesses</p>
                  <p className="text-2xl font-bold text-blue-400">{entries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/30">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-500/20">
                  <Package className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-300/80">Products at C+20</p>
                  <p className="text-2xl font-bold text-purple-400">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <Card className="bg-slate-900/50 border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  Top Contributors
                </CardTitle>
                <CardDescription>
                  Ranked by total margin contributed to the community
                </CardDescription>
              </div>
              <Button onClick={loadLeaderboard} variant="outline" size="sm" className="border-border">
                <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-300 mb-2">Be the First!</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  No businesses have joined the C+20 program yet. Be a pioneer and start
                  building the cooperative economy.
                </p>
                <Link to="/c20">
                  <Button className="bg-emerald-600 hover:bg-emerald-500">
                    Start Your C+20 Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <LeaderboardRow
                    key={entry.anchor_id}
                    entry={entry}
                    rank={index + 1}
                    formatCurrency={formatCurrency}
                    getTierIcon={getTierIcon}
                    getTierLabel={getTierLabel}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/30 inline-block">
            <CardContent className="pt-6 pb-6 px-8">
              <h3 className="text-xl font-bold text-white mb-2">Ready to Join?</h3>
              <p className="text-muted-foreground mb-4">
                Start with toe-dipping: 3-10 products at 25-50 units each.
              </p>
              <Link to="/c20">
                <Button className="bg-emerald-600 hover:bg-emerald-500">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Your C+20 Pilot
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground text-sm">
          <p>Help Each Other Help Ourselves.</p>
        </div>
      </div>
    </PortalPageLayout>
  );
}

function LeaderboardRow({
  entry,
  rank,
  formatCurrency,
  getTierIcon,
  getTierLabel,
}: {
  entry: LeaderboardEntry;
  rank: number;
  formatCurrency: (n: number) => string;
  getTierIcon: (tier: string) => React.ReactNode;
  getTierLabel: (tier: string) => string;
}) {
  const isTopThree = rank <= 3;
  const rankColors = {
    1: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
    2: 'text-slate-300 bg-slate-500/20 border-slate-500/30',
    3: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  };

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-card/50",
      isTopThree ? "bg-card/30 border-slate-600" : "bg-slate-900/30 border-border"
    )}>
      {/* Rank */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center font-bold border",
        isTopThree
          ? rankColors[rank as 1 | 2 | 3]
          : "text-muted-foreground bg-card/50 border-border"
      )}>
        {rank}
      </div>

      {/* Business Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-white truncate">{entry.anchor_name || 'Anonymous Business'}</h4>
          {getTierIcon(entry.badge_tier)}
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{entry.products_at_c20 || 0} products</span>
          <span className="text-slate-600">•</span>
          <Badge variant="outline" className="text-xs border-slate-600">
            {getTierLabel(entry.badge_tier)}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="text-right">
        <p className="text-lg font-bold text-emerald-400">
          {formatCurrency(entry.total_margin_contributed || 0)}
        </p>
        <p className="text-xs text-muted-foreground">margin contributed</p>
      </div>
    </div>
  );
}
