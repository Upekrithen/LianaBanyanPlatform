import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import {
  Shield, Sword, Trophy, Star, Clock, CheckCircle,
  Eye, EyeOff, Users, Zap, Lock, FileText, ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface TeamScore {
  team: 'red' | 'blue';
  cumulative_wins: number;
  cumulative_marks: number;
  cumulative_ip_stamps: number;
  current_week_wins: number;
  current_month_wins: number;
  refreshed_at: string;
}

interface IndividualEntry {
  member_id: string;
  team: 'red' | 'blue';
  wins: number;
  marks: number;
  ip_stamps: number;
  rank_within_team: number;
  rank_overall: number;
}

interface CompetitionEvent {
  event_id: string;
  member_id: string;
  team: 'red' | 'blue';
  event_class: 'find' | 'harden';
  event_subclass: string;
  target_artifact: string | null;
  submitted_at: string;
  verified_at: string | null;
  status: string;
  marks_payout_amount: number | null;
  win_class_multiplier: number | null;
  ip_stamp_id: string | null;
  parent_event_id: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function TeamBadge({ team }: { team: 'red' | 'blue' }) {
  return team === 'red' ? (
    <Badge className="bg-red-900/30 text-red-400 border-red-700/40 gap-1">
      <Sword className="w-3 h-3" /> Red Team
    </Badge>
  ) : (
    <Badge className="bg-blue-900/30 text-blue-400 border-blue-700/40 gap-1">
      <Shield className="w-3 h-3" /> Blue Team
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    submitted:   'bg-zinc-800 text-zinc-400 border-zinc-700',
    claimed:     'bg-amber-900/30 text-amber-400 border-amber-700/40',
    verified:    'bg-emerald-900/30 text-emerald-400 border-emerald-700/40',
    ip_stamped:  'bg-purple-900/30 text-purple-400 border-purple-700/40',
    marks_paid:  'bg-gold-900/30 text-yellow-400 border-yellow-700/40',
    rejected:    'bg-red-900/20 text-red-500 border-red-800/30',
  };
  return (
    <Badge className={cn('text-xs capitalize', map[status] ?? 'bg-zinc-800 text-zinc-400')}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

function subclassLabel(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

// ── Scoreboard panel ──────────────────────────────────────────────────────────

function ScoreboardPanel({ scores }: { scores: TeamScore[] }) {
  const red  = scores.find(s => s.team === 'red');
  const blue = scores.find(s => s.team === 'blue');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[red, blue].map(s => {
        if (!s) return null;
        const isRed = s.team === 'red';
        const accent = isRed ? 'red' : 'blue';
        return (
          <Card
            key={s.team}
            className={cn(
              'border',
              isRed
                ? 'bg-red-950/20 border-red-800/30'
                : 'bg-blue-950/20 border-blue-800/30',
            )}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl">
                {isRed ? <Sword className="w-5 h-5 text-red-400" /> : <Shield className="w-5 h-5 text-blue-400" />}
                <span className={isRed ? 'text-red-300' : 'text-blue-300'}>
                  {isRed ? 'Red Team — Finders' : 'Blue Team — Defenders'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-zinc-900/60 p-3">
                  <div className={cn('text-2xl font-bold', isRed ? 'text-red-300' : 'text-blue-300')}>
                    {s.cumulative_wins}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Total Wins</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-3">
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round(s.cumulative_marks).toLocaleString()}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">Marks Earned</div>
                </div>
                <div className="rounded-lg bg-zinc-900/60 p-3">
                  <div className="text-2xl font-bold text-purple-400">
                    {s.cumulative_ip_stamps}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">IP Stamps</div>
                </div>
              </div>
              <div className="flex gap-3 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> This week: <strong className="text-zinc-200">{s.current_week_wins}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" /> This month: <strong className="text-zinc-200">{s.current_month_wins}</strong>
                </span>
              </div>
              <Link to={`/helm/red-blue-leaderboard/${s.team}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full mt-2',
                    isRed
                      ? 'border-red-800/40 text-red-400 hover:bg-red-950/40'
                      : 'border-blue-800/40 text-blue-400 hover:bg-blue-950/40',
                  )}
                >
                  View {isRed ? 'Red' : 'Blue'} Team Detail <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── Individual leaderboard table ───────────────────────────────────────────────

function IndividualLeaderboard({
  entries,
  teamFilter,
}: {
  entries: IndividualEntry[];
  teamFilter: 'all' | 'red' | 'blue';
}) {
  const filtered = teamFilter === 'all'
    ? entries.sort((a, b) => a.rank_overall - b.rank_overall)
    : entries.filter(e => e.team === teamFilter).sort((a, b) => a.rank_within_team - b.rank_within_team);

  if (!filtered.length) {
    return (
      <div className="text-center py-16 text-zinc-500">
        No verified wins yet — be the first.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-zinc-800">
          <TableHead className="text-zinc-400 w-12">Rank</TableHead>
          <TableHead className="text-zinc-400">Member</TableHead>
          <TableHead className="text-zinc-400">Team</TableHead>
          <TableHead className="text-zinc-400 text-right">Wins</TableHead>
          <TableHead className="text-zinc-400 text-right">Marks</TableHead>
          <TableHead className="text-zinc-400 text-right">IP Stamps</TableHead>
          <TableHead className="text-zinc-400"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map(e => (
          <TableRow key={`${e.member_id}-${e.team}`} className="border-zinc-800/60">
            <TableCell className="font-mono text-zinc-300">
              #{teamFilter === 'all' ? e.rank_overall : e.rank_within_team}
            </TableCell>
            <TableCell className="font-mono text-zinc-300 text-xs truncate max-w-[140px]">
              {e.member_id.slice(0, 8)}…
            </TableCell>
            <TableCell><TeamBadge team={e.team} /></TableCell>
            <TableCell className="text-right text-zinc-200 font-bold">{e.wins}</TableCell>
            <TableCell className="text-right text-yellow-400 font-bold">
              {Math.round(e.marks).toLocaleString()}
            </TableCell>
            <TableCell className="text-right text-purple-400">{e.ip_stamps}</TableCell>
            <TableCell>
              <Link to={`/helm/red-blue-leaderboard/member/${e.member_id}`}>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ── Event timeline feed ────────────────────────────────────────────────────────

function EventFeed({ events }: { events: CompetitionEvent[] }) {
  if (!events.length) {
    return (
      <div className="text-center py-16 text-zinc-500">
        No events submitted yet. The first find is waiting.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {events.map(ev => (
        <Card key={ev.event_id} className="bg-zinc-900/60 border-zinc-800/60">
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <TeamBadge team={ev.team} />
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs capitalize">
                {ev.event_class === 'find'
                  ? <><Sword className="w-3 h-3 inline mr-1" />Find</>
                  : <><Shield className="w-3 h-3 inline mr-1" />Harden</>}
              </Badge>
              <Badge className="bg-zinc-800/50 text-zinc-400 border-zinc-700/50 text-xs">
                {subclassLabel(ev.event_subclass)}
              </Badge>
              <StatusBadge status={ev.status} />
              {ev.parent_event_id && (
                <Badge className="bg-indigo-900/30 text-indigo-400 border-indigo-700/30 text-xs gap-1">
                  <Zap className="w-3 h-3" /> Cross-Team Challenge
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Submitted {new Date(ev.submitted_at).toLocaleDateString()}
              </span>
              {ev.verified_at && (
                <span className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle className="w-3 h-3" />
                  Verified {new Date(ev.verified_at).toLocaleDateString()}
                </span>
              )}
              {ev.ip_stamp_id && (
                <span className="flex items-center gap-1 text-purple-400">
                  <FileText className="w-3 h-3" />
                  IP Stamped
                </span>
              )}
              {ev.marks_payout_amount != null && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Trophy className="w-3 h-3" />
                  {Math.round(ev.marks_payout_amount)} Marks
                  {ev.win_class_multiplier != null && (
                    <span className="text-zinc-500">({ev.win_class_multiplier}×)</span>
                  )}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── X-Ray Mode info panel ──────────────────────────────────────────────────────

function XRayInfoPanel({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Card className="bg-indigo-950/20 border-indigo-800/30 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-indigo-300 text-base flex items-center gap-2">
          <Eye className="w-4 h-4" /> X-Ray Mode — Red/Blue Team Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs text-indigo-200/70">
        <p>
          <strong className="text-indigo-300">What is this?</strong> The Red/Blue Team Competition
          lets LB Elves Guild members earn Marks and permanent IP Ledger stamps by adversarially
          testing (Red Team) and defensively hardening (Blue Team) the Liana Banyan platform.
        </p>
        <p>
          <strong className="text-indigo-300">Cross-team transparency:</strong> Both teams see
          each other's wins in real time — zero hidden information. Red Team finds become Blue Team
          harden opportunities. Every verified win is permanently attributed in the Public IP Ledger.
        </p>
        <p>
          <strong className="text-indigo-300">IP Ledger stamps:</strong> Every verified find or
          harden generates an immutable <code>ip_ledger_stamp</code> row with
          first-finder / first-hardener attribution. Winners may also author a Pedestal
          contribution decree on the canonical artifact (Mordecai-Esther composition class).
        </p>
        <p>
          <strong className="text-indigo-300">Marks payout multipliers:</strong> Tier 5 Security
          events (crypto-bypass, substrate-poisoning, eblet-tamper) pay 3.0× (300 Marks base).
          Tier 4 pheromone-corner-case events pay 2.5× (125 Marks). Final values lock at
          Founder Fire Code.
        </p>
        <p>
          <strong className="text-indigo-300">Anti-collusion:</strong> Members cannot be on both
          teams simultaneously. Team switches are time-locked (30-day default cooldown).
        </p>
        <p className="text-indigo-300/50 italic">
          LB Orchestra Librarian umbrella · CAI ◌ NotCents composite trademark · Bushel 27 BP022
        </p>
      </CardContent>
    </Card>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function RedBlueLeaderboard() {
  const { user } = useAuth();
  const [xRayVisible, setXRayVisible] = useState(false);
  const [teamFilter, setTeamFilter] = useState<'all' | 'red' | 'blue'>('all');

  const { data: scores = [] } = useQuery<TeamScore[]>({
    queryKey: ['red-blue-team-scoreboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_team_scoreboard')
        .select('*');
      if (error) throw error;
      return (data ?? []) as TeamScore[];
    },
    staleTime: 60_000,
  });

  const { data: individuals = [] } = useQuery<IndividualEntry[]>({
    queryKey: ['red-blue-individual-leaderboard'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_individual_leaderboard')
        .select('*')
        .order('rank_overall', { ascending: true });
      if (error) throw error;
      return (data ?? []) as IndividualEntry[];
    },
    staleTime: 60_000,
  });

  const { data: events = [] } = useQuery<CompetitionEvent[]>({
    queryKey: ['red-blue-competition-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_competition_event')
        .select('*')
        .order('submitted_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as CompetitionEvent[];
    },
    staleTime: 30_000,
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId="red-blue-leaderboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/50">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-100">
                Red / Blue Leaderboard
              </h1>
              <p className="text-sm text-zinc-500">
                LB Elves Guild · Find · Harden · Stamp · Earn
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'border-zinc-700 gap-1',
              xRayVisible ? 'text-indigo-400 border-indigo-700/50' : 'text-zinc-400',
            )}
            onClick={() => setXRayVisible(v => !v)}
          >
            {xRayVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            X-Ray Mode
          </Button>
          <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 gap-1 text-xs">
            <Lock className="w-3 h-3" /> Anti-collusion gated
          </Badge>
        </div>
      </div>

      {/* X-Ray info */}
      <XRayInfoPanel visible={xRayVisible} />

      {/* Team scoreboard */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
          <Users className="w-4 h-4" /> Team Scoreboard
        </h2>
        {scores.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(['red', 'blue'] as const).map(team => (
              <Card key={team} className={cn('border', team === 'red' ? 'bg-red-950/10 border-red-800/20' : 'bg-blue-950/10 border-blue-800/20')}>
                <CardContent className="py-12 text-center text-zinc-500">
                  {team === 'red' ? <Sword className="w-8 h-8 mx-auto mb-3 text-red-800/40" /> : <Shield className="w-8 h-8 mx-auto mb-3 text-blue-800/40" />}
                  <p className="text-sm">{team === 'red' ? 'Red Team — no wins yet' : 'Blue Team — no wins yet'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <ScoreboardPanel scores={scores} />
        )}
      </section>

      {/* Tabs: Leaderboard + Event Feed */}
      <Tabs defaultValue="leaderboard">
        <TabsList className="bg-zinc-900 border border-zinc-800 mb-6">
          <TabsTrigger value="leaderboard">Individual Leaderboard</TabsTrigger>
          <TabsTrigger value="events">Event Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard">
          <div className="flex gap-2 mb-4">
            {(['all', 'red', 'blue'] as const).map(t => (
              <Button
                key={t}
                size="sm"
                variant={teamFilter === t ? 'default' : 'outline'}
                className={cn(
                  'capitalize',
                  teamFilter !== t && 'border-zinc-700 text-zinc-400',
                  t === 'red' && teamFilter === t && 'bg-red-900/60 border-red-800/50 text-red-200',
                  t === 'blue' && teamFilter === t && 'bg-blue-900/60 border-blue-800/50 text-blue-200',
                )}
                onClick={() => setTeamFilter(t)}
              >
                {t === 'all' ? 'All Teams' : t === 'red' ? <><Sword className="w-3 h-3 mr-1" />Red</> : <><Shield className="w-3 h-3 mr-1" />Blue</>}
              </Button>
            ))}
          </div>
          <IndividualLeaderboard entries={individuals} teamFilter={teamFilter} />
        </TabsContent>

        <TabsContent value="events">
          <EventFeed events={events} />
        </TabsContent>
      </Tabs>
    </PortalPageLayout>
  );
}
