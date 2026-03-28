import React, { useState } from 'react';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trophy, Flame, Search as SearchIcon, Eye, FileText, Wrench, Plus, Coins, Clock, Users, Gavel, ChevronRight, BarChart3 } from 'lucide-react';
import { useBounties, useDailyTracker, useDesignAuction, type Bounty, type AuctionEntry } from '@/hooks/useXRayBountyArena';
import { getCoinSoundEnabled, setCoinSoundEnabled } from '@/components/xray/CoinFlipAnimation';
import { useAuth } from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────
 * ROLE BADGE — based on where most Marks are earned
 * ────────────────────────────────────────────── */

function getRoleBadge(stats: { errors_found: number; errors_documented: number; fixes_proposed: number }) {
  const { errors_found, errors_documented, fixes_proposed } = stats;
  const total = errors_found + errors_documented + fixes_proposed;
  if (total === 0) return { label: 'Rookie', color: 'bg-slate-600' };
  const max = Math.max(errors_found, errors_documented, fixes_proposed);
  if (max === errors_found && errors_found > errors_documented && errors_found > fixes_proposed)
    return { label: 'Scout', color: 'bg-blue-600' };
  if (max === errors_documented) return { label: 'Scribe', color: 'bg-purple-600' };
  if (max === fixes_proposed) return { label: 'Fixer', color: 'bg-green-600' };
  return { label: 'All-Rounder', color: 'bg-amber-600' };
}

/* ──────────────────────────────────────────────
 * TAB: My Stats
 * ────────────────────────────────────────────── */

const MyStatsTab: React.FC = () => {
  const { dailyStats } = useDailyTracker();
  const stats = dailyStats.data;
  const [soundOn, setSoundOn] = useState(getCoinSoundEnabled());

  const role = getRoleBadge({
    errors_found: stats?.errors_found ?? 0,
    errors_documented: stats?.errors_documented ?? 0,
    fixes_proposed: stats?.fixes_proposed ?? 0,
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Daily Tracker */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" /> Today's Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-blue-400">{stats?.errors_found ?? 0}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Eye className="w-3 h-3" /> Found
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-purple-400">{stats?.errors_documented ?? 0}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="w-3 h-3" /> Documented
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-green-400">{stats?.fixes_proposed ?? 0}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                <Wrench className="w-3 h-3" /> Fixes
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Marks + Streak */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" /> Marks & Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-black text-amber-400">{stats?.marks_earned ?? 0}M</div>
              <div className="text-xs text-muted-foreground">earned today</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-400 flex items-center gap-1 justify-end">
                <Flame className="w-5 h-5" /> {stats?.streak_days ?? 0}
              </div>
              <div className="text-xs text-muted-foreground">day streak</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Badge */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Arena Role</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge className={`${role.color} text-white text-sm px-3 py-1`}>{role.label}</Badge>
          <p className="text-xs text-muted-foreground mt-2">
            Earned by your contribution mix — find, document, or fix to evolve.
          </p>
        </CardContent>
      </Card>

      {/* Sound Toggle */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Coin Sound</CardTitle>
          <CardDescription className="text-xs">NES-style chime when earning Marks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch
              checked={soundOn}
              onCheckedChange={(v) => {
                setSoundOn(v);
                setCoinSoundEnabled(v);
              }}
            />
            <span className="text-sm text-muted-foreground">{soundOn ? 'On' : 'Off (default)'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

/* ──────────────────────────────────────────────
 * TAB: Bounty Board
 * ────────────────────────────────────────────── */

const BountyBoard: React.FC = () => {
  const { user } = useAuth();
  const { openBounties, myBounties, createBounty } = useBounties();
  const [filter, setFilter] = useState<'all' | 'mine' | 'fulfilled'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', marks: '', expires: '' });

  const bounties = filter === 'mine' ? (myBounties.data ?? []) : (openBounties.data ?? []);
  const filtered = filter === 'fulfilled'
    ? bounties.filter((b) => b.fulfilled_by === user?.id)
    : bounties;

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.marks) return;
    await createBounty.mutateAsync({
      title: form.title,
      description: form.description,
      marksReward: Number(form.marks),
      expiresAt: form.expires || undefined,
    });
    setForm({ title: '', description: '', marks: '', expires: '' });
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | 'mine' | 'fulfilled')}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Open</SelectItem>
            <SelectItem value="mine">My Created</SelectItem>
            <SelectItem value="fulfilled">My Fulfilled</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="w-3.5 h-3.5" /> Create Bounty</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Bounty</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input
                placeholder="Bounty title"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
              <Textarea
                placeholder="Describe what needs to be fixed..."
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Marks reward"
                value={form.marks}
                onChange={(e) => setForm((p) => ({ ...p, marks: e.target.value }))}
              />
              <Input
                type="date"
                value={form.expires}
                onChange={(e) => setForm((p) => ({ ...p, expires: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={createBounty.isPending}>
                {createBounty.isPending ? 'Creating...' : 'Create Bounty'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No bounties yet. Be the first to create one!
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {filtered.map((b: Bounty) => (
          <BountyCard key={b.id} bounty={b} />
        ))}
      </div>
    </div>
  );
};

const BountyCard: React.FC<{ bounty: Bounty }> = ({ bounty }) => {
  const statusColors: Record<string, string> = {
    open: 'bg-green-600/20 text-green-400',
    claimed: 'bg-amber-600/20 text-amber-400',
    fulfilled: 'bg-blue-600/20 text-blue-400',
    expired: 'bg-slate-600/20 text-slate-400',
    cancelled: 'bg-red-600/20 text-red-400',
  };

  return (
    <Card className="hover:border-primary/30 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-sm truncate">{bounty.title}</h4>
              <Badge variant="outline" className={`text-[10px] ${statusColors[bounty.status] ?? ''}`}>
                {bounty.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">{bounty.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {bounty.expires_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires {new Date(bounty.expires_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-black text-amber-400">{bounty.marks_reward}M</div>
            <div className="text-[10px] text-muted-foreground">
              Pool: {bounty.marks_pool}M
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Button variant="outline" size="sm" className="text-xs gap-1">
            <Coins className="w-3 h-3" /> Contribute
          </Button>
          <Button size="sm" className="text-xs gap-1">
            <Wrench className="w-3 h-3" /> I Can Fix This
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

/* ──────────────────────────────────────────────
 * TAB: Auction
 * ────────────────────────────────────────────── */

const AuctionTab: React.FC = () => {
  const { todayAuction, winners } = useDesignAuction();
  const entries = todayAuction.data ?? [];
  const pastWinners = winners.data ?? [];

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const msRemaining = Math.max(0, endOfDay.getTime() - Date.now());
  const hoursLeft = Math.floor(msRemaining / 3_600_000);
  const minsLeft = Math.floor((msRemaining % 3_600_000) / 60_000);

  return (
    <div className="space-y-6">
      {/* Timer */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Cycle ends in <strong className="text-foreground">{hoursLeft}h {minsLeft}m</strong></span>
      </div>

      {/* Current entries carousel */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Gavel className="w-4 h-4 text-cyan-400" /> Today's Entries
        </h3>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No entries today. Submit a design proposal to compete!
            </CardContent>
          </Card>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {entries.map((entry: AuctionEntry) => (
              <AuctionCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>

      {/* Past winners */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Previous Winners
        </h3>
        {pastWinners.length === 0 ? (
          <p className="text-xs text-muted-foreground">No winners yet.</p>
        ) : (
          <div className="grid gap-2">
            {pastWinners.map((w: AuctionEntry) => (
              <div
                key={w.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div>
                  <span className="text-sm font-medium">{w.title}</span>
                  {w.nickname && (
                    <span className="text-xs text-muted-foreground ml-2">"{w.nickname}"</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{w.auction_cycle}</Badge>
                  <span className="text-sm font-bold text-amber-400">{w.bid_total}M</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AuctionCard: React.FC<{ entry: AuctionEntry }> = ({ entry }) => (
  <Card className="min-w-[220px] max-w-[260px] flex-shrink-0">
    <CardContent className="p-4">
      <h4 className="font-semibold text-sm truncate">{entry.title}</h4>
      {entry.nickname && (
        <p className="text-xs text-muted-foreground">"{entry.nickname}"</p>
      )}
      <div className="flex items-center justify-between mt-3">
        <span className="text-lg font-black text-amber-400">{entry.bid_total}M</span>
        <Button size="sm" variant="outline" className="text-xs gap-1">
          <Gavel className="w-3 h-3" /> Bid
        </Button>
      </div>
      <div className="text-[10px] text-muted-foreground mt-1">
        {entry.display_duration_seconds}s display time
      </div>
    </CardContent>
  </Card>
);

/* ──────────────────────────────────────────────
 * MAIN PAGE
 * ────────────────────────────────────────────── */

const XRayBountyDashboard: React.FC = () => {
  return (
    <PortalPageLayout
      title="Bounty Arena"
      subtitle="Hunt errors. Document issues. Propose fixes. Earn Marks."
      data-xray-id="bounty-arena"
    >
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="stats" className="gap-1">
            <BarChart3 className="w-3.5 h-3.5" /> My Stats
          </TabsTrigger>
          <TabsTrigger value="bounties" className="gap-1">
            <Trophy className="w-3.5 h-3.5" /> Bounty Board
          </TabsTrigger>
          <TabsTrigger value="auction" className="gap-1">
            <Gavel className="w-3.5 h-3.5" /> Auction
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <MyStatsTab />
        </TabsContent>
        <TabsContent value="bounties">
          <BountyBoard />
        </TabsContent>
        <TabsContent value="auction">
          <AuctionTab />
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
};

export default XRayBountyDashboard;
