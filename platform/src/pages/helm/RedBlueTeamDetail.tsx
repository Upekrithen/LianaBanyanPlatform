import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Sword, Shield, Trophy, ArrowLeft, FileText, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

type TeamSlug = 'red' | 'blue';

interface IndividualEntry {
  member_id: string;
  team: TeamSlug;
  wins: number;
  marks: number;
  ip_stamps: number;
  rank_within_team: number;
}

interface CompetitionEvent {
  event_id: string;
  member_id: string;
  team: TeamSlug;
  event_class: 'find' | 'harden';
  event_subclass: string;
  target_artifact: string | null;
  submitted_at: string;
  verified_at: string | null;
  status: string;
  marks_payout_amount: number | null;
  ip_stamp_id: string | null;
  parent_event_id: string | null;
}

function subclassLabel(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function RedBlueTeamDetail() {
  const { team: teamParam } = useParams<{ team: string }>();
  const team = (teamParam === 'red' || teamParam === 'blue') ? teamParam : 'red';
  const isRed = team === 'red';

  const { data: members = [] } = useQuery<IndividualEntry[]>({
    queryKey: ['red-blue-team-members', team],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_individual_leaderboard')
        .select('*')
        .eq('team', team)
        .order('rank_within_team', { ascending: true });
      if (error) throw error;
      return (data ?? []) as IndividualEntry[];
    },
    staleTime: 60_000,
  });

  const { data: events = [] } = useQuery<CompetitionEvent[]>({
    queryKey: ['red-blue-team-events', team],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_competition_event')
        .select('*')
        .eq('team', team)
        .order('submitted_at', { ascending: false })
        .limit(30);
      if (error) throw error;
      return (data ?? []) as CompetitionEvent[];
    },
    staleTime: 30_000,
  });

  return (
    <PortalPageLayout maxWidth="xl" xrayId={`red-blue-${team}-detail`}>
      <div className="mb-6">
        <Link to="/helm/red-blue-leaderboard">
          <Button variant="ghost" size="sm" className="text-zinc-400 gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Leaderboard
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg border', isRed ? 'bg-red-950/30 border-red-800/40' : 'bg-blue-950/30 border-blue-800/40')}>
            {isRed ? <Sword className="w-6 h-6 text-red-400" /> : <Shield className="w-6 h-6 text-blue-400" />}
          </div>
          <div>
            <h1 className={cn('text-3xl font-bold tracking-tight', isRed ? 'text-red-300' : 'text-blue-300')}>
              {isRed ? 'Red Team — Finders' : 'Blue Team — Defenders'}
            </h1>
            <p className="text-sm text-zinc-500">
              {isRed
                ? 'Adversarial testing · Find exploits · Earn IP Ledger stamps'
                : 'Defensive hardening · Close vulnerabilities · Earn IP Ledger stamps'}
            </p>
          </div>
        </div>
      </div>

      {/* Member roster */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Member Roster</h2>
        {members.length === 0 ? (
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="py-12 text-center text-zinc-500">
              No verified wins yet. The leaderboard populates as members earn wins.
            </CardContent>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800">
                <TableHead className="text-zinc-400 w-12">Rank</TableHead>
                <TableHead className="text-zinc-400">Member</TableHead>
                <TableHead className="text-zinc-400 text-right">Wins</TableHead>
                <TableHead className="text-zinc-400 text-right">Marks</TableHead>
                <TableHead className="text-zinc-400 text-right">IP Stamps</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map(m => (
                <TableRow key={m.member_id} className="border-zinc-800/60">
                  <TableCell className="font-mono text-zinc-300">#{m.rank_within_team}</TableCell>
                  <TableCell className="font-mono text-zinc-300 text-xs truncate max-w-[160px]">
                    {m.member_id.slice(0, 8)}…
                  </TableCell>
                  <TableCell className="text-right text-zinc-200 font-bold">{m.wins}</TableCell>
                  <TableCell className="text-right text-yellow-400 font-bold">
                    {Math.round(m.marks).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-purple-400">{m.ip_stamps}</TableCell>
                  <TableCell>
                    <Link to={`/helm/red-blue-leaderboard/member/${m.member_id}`}>
                      <Button variant="ghost" size="sm" className="text-zinc-400 text-xs">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {/* Recent events */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Recent Events</h2>
        <div className="space-y-3">
          {events.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardContent className="py-8 text-center text-zinc-500 text-sm">
                No events yet.
              </CardContent>
            </Card>
          ) : (
            events.map(ev => (
              <Card key={ev.event_id} className="bg-zinc-900/60 border-zinc-800/60">
                <CardContent className="pt-3 pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs capitalize">
                      {ev.event_class === 'find' ? <><Sword className="w-3 h-3 inline mr-1" />Find</> : <><Shield className="w-3 h-3 inline mr-1" />Harden</>}
                    </Badge>
                    <span className="text-xs text-zinc-400">{subclassLabel(ev.event_subclass)}</span>
                    {ev.parent_event_id && (
                      <Badge className="bg-indigo-900/30 text-indigo-400 border-indigo-700/30 text-xs">Cross-Team</Badge>
                    )}
                    {ev.ip_stamp_id && (
                      <Badge className="bg-purple-900/30 text-purple-400 border-purple-700/30 text-xs gap-1">
                        <FileText className="w-3 h-3" /> IP Stamped
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(ev.submitted_at).toLocaleDateString()}</span>
                    {ev.verified_at && (
                      <span className="flex items-center gap-1 text-emerald-500">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    )}
                    {ev.marks_payout_amount != null && (
                      <span className="flex items-center gap-1 text-yellow-400">
                        <Trophy className="w-3 h-3" /> {Math.round(ev.marks_payout_amount)} Marks
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </PortalPageLayout>
  );
}
