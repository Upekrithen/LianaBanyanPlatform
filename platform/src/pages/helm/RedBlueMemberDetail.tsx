import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User, ArrowLeft, Trophy, FileText, Clock, CheckCircle, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PortalPageLayout } from '@/components/PortalPageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface IpStamp {
  id: string;
  stamp_class: 'red_team_find' | 'blue_team_harden';
  canonical_artifact: string;
  first_finder_marker: boolean;
  first_hardener_marker: boolean;
  stamped_at: string;
  competition_event_id: string | null;
}

interface CompetitionEvent {
  event_id: string;
  team: 'red' | 'blue';
  event_class: 'find' | 'harden';
  event_subclass: string;
  submitted_at: string;
  verified_at: string | null;
  marks_payout_amount: number | null;
  ip_stamp_id: string | null;
  status: string;
  parent_event_id: string | null;
}

function subclassLabel(s: string) {
  return s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function RedBlueMemberDetail() {
  const { member_id } = useParams<{ member_id: string }>();

  const { data: events = [] } = useQuery<CompetitionEvent[]>({
    queryKey: ['red-blue-member-events', member_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('red_blue_competition_event')
        .select('*')
        .eq('member_id', member_id)
        .order('submitted_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CompetitionEvent[];
    },
    enabled: !!member_id,
    staleTime: 60_000,
  });

  const { data: stamps = [] } = useQuery<IpStamp[]>({
    queryKey: ['ip-ledger-stamps-member', member_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ip_ledger_stamp')
        .select('*')
        .eq('member_id', member_id)
        .order('stamped_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as IpStamp[];
    },
    enabled: !!member_id,
    staleTime: 60_000,
  });

  const totalWins = events.filter(e => ['verified', 'ip_stamped', 'marks_paid'].includes(e.status)).length;
  const totalMarks = events.reduce((sum, e) => sum + (e.marks_payout_amount ?? 0), 0);

  return (
    <PortalPageLayout maxWidth="xl" xrayId="red-blue-member-detail">
      <Link to="/helm/red-blue-leaderboard">
        <Button variant="ghost" size="sm" className="text-zinc-400 gap-1 mb-4">
          <ArrowLeft className="w-3 h-3" /> Back to Leaderboard
        </Button>
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-700/50">
          <User className="w-6 h-6 text-zinc-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 font-mono">
            {member_id ? `${member_id.slice(0, 8)}…` : 'Member'}
          </h1>
          <p className="text-sm text-zinc-500">Red/Blue Competition · Individual Record</p>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{totalWins}</div>
            <div className="text-xs text-zinc-500 mt-1">Total Wins</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{Math.round(totalMarks).toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">Total Marks</div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900/60 border-zinc-800">
          <CardContent className="py-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{stamps.length}</div>
            <div className="text-xs text-zinc-500 mt-1">IP Stamps</div>
          </CardContent>
        </Card>
      </div>

      {/* IP Ledger stamps */}
      {stamps.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-400" /> IP Ledger Stamps
          </h2>
          <div className="space-y-3">
            {stamps.map(s => (
              <Card key={s.id} className="bg-purple-950/10 border-purple-800/20">
                <CardContent className="pt-3 pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className={s.stamp_class === 'red_team_find'
                      ? 'bg-red-900/30 text-red-400 border-red-700/40'
                      : 'bg-blue-900/30 text-blue-400 border-blue-700/40'}>
                      {s.stamp_class === 'red_team_find' ? 'Red Find' : 'Blue Harden'}
                    </Badge>
                    {s.first_finder_marker && (
                      <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700/40 gap-1 text-xs">
                        <Trophy className="w-3 h-3" /> First Finder
                      </Badge>
                    )}
                    {s.first_hardener_marker && (
                      <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-700/40 gap-1 text-xs">
                        <Trophy className="w-3 h-3" /> First Hardener
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-zinc-300 truncate">{s.canonical_artifact}</p>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Stamped {new Date(s.stamped_at).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Event history */}
      <section>
        <h2 className="text-lg font-semibold text-zinc-300 mb-4">Event History</h2>
        {events.length === 0 ? (
          <Card className="bg-zinc-900/60 border-zinc-800">
            <CardContent className="py-8 text-center text-zinc-500 text-sm">
              No events submitted yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map(ev => (
              <Card key={ev.event_id} className="bg-zinc-900/60 border-zinc-800/60">
                <CardContent className="pt-3 pb-3">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs capitalize">
                      {ev.event_class}
                    </Badge>
                    <span className="text-xs text-zinc-400">{subclassLabel(ev.event_subclass)}</span>
                    {ev.parent_event_id && (
                      <Badge className="bg-indigo-900/30 text-indigo-400 border-indigo-700/30 text-xs gap-1">
                        <Zap className="w-3 h-3" /> Cross-Team
                      </Badge>
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
            ))}
          </div>
        )}
      </section>
    </PortalPageLayout>
  );
}
