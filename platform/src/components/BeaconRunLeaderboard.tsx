import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatCompletionTime, getBeaconRunCrowFeathers } from '@/lib/ghostWorld';
import { Trophy, Clock, Flag, Ghost, Medal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BeaconRunLeaderboardProps {
  runId?: string;
  showGlobalStats?: boolean;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  beacon_run_id: string;
  completion_time_ms: number;
  completed_at: string;
  crow_feather_id?: number;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
  beacon_runs?: {
    name: string;
    total_waypoints: number;
  };
}

interface GlobalStats {
  totalRuns: number;
  totalCompletions: number;
  fastestTime: number;
  mostPopularRun: string;
}

/**
 * Beacon Run Leaderboard
 * 
 * Displays rankings for Beacon Run completions.
 * "Not in normal mode. You'd have to go Ghost."
 * 
 * Features:
 * - Per-run leaderboard (fastest completions)
 * - Global leaderboard (all-time bests)
 * - Crow Feather indicators for record holders
 */
export const BeaconRunLeaderboard: React.FC<BeaconRunLeaderboardProps> = ({
  runId,
  showGlobalStats = false,
}) => {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['beacon-run-leaderboard', runId],
    queryFn: async () => {
      let query = supabase
        .from('beacon_run_progress')
        .select(`
          id,
          user_id,
          beacon_run_id,
          completion_time_ms,
          completed_at,
          crow_feather_id,
          profiles:user_id (
            display_name,
            avatar_url
          ),
          beacon_runs:beacon_run_id (
            name,
            total_waypoints
          )
        `)
        .eq('status', 'completed')
        .order('completion_time_ms', { ascending: true })
        .limit(50);

      if (runId) {
        query = query.eq('beacon_run_id', runId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  const { data: globalStats } = useQuery({
    queryKey: ['beacon-run-global-stats'],
    queryFn: async () => {
      const { data: runs } = await supabase
        .from('beacon_runs')
        .select('id, name, times_completed')
        .order('times_completed', { ascending: false });

      const { data: completions } = await supabase
        .from('beacon_run_progress')
        .select('completion_time_ms')
        .eq('status', 'completed')
        .order('completion_time_ms', { ascending: true })
        .limit(1);

      return {
        totalRuns: runs?.length || 0,
        totalCompletions: runs?.reduce((acc, r) => acc + (r.times_completed || 0), 0) || 0,
        fastestTime: completions?.[0]?.completion_time_ms || 0,
        mostPopularRun: runs?.[0]?.name || 'None yet',
      } as GlobalStats;
    },
    enabled: showGlobalStats,
  });

  const crowFeathers = getBeaconRunCrowFeathers();

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-orange-500/20">
        <CardContent className="p-6 text-center">
          <Ghost className="w-8 h-8 mx-auto mb-2 animate-pulse text-orange-400" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-orange-500/20">
      <CardHeader className="border-b border-orange-500/10">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-400" />
          <span>Beacon Run Leaderboard</span>
          <Badge variant="outline" className="ml-auto border-orange-500/30 text-orange-400">
            <Ghost className="w-3 h-3 mr-1" />
            Ghost Mode Only
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {showGlobalStats && globalStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-b border-orange-500/10 bg-orange-500/5">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-400">{globalStats.totalRuns}</div>
              <div className="text-xs text-muted-foreground">Total Runs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{globalStats.totalCompletions}</div>
              <div className="text-xs text-muted-foreground">Completions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {globalStats.fastestTime ? formatCompletionTime(globalStats.fastestTime) : '--'}
              </div>
              <div className="text-xs text-muted-foreground">Fastest Time</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-400 truncate">{globalStats.mostPopularRun}</div>
              <div className="text-xs text-muted-foreground">Most Popular</div>
            </div>
          </div>
        )}

        <Tabs defaultValue="speed" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b border-orange-500/10 bg-transparent p-0">
            <TabsTrigger 
              value="speed" 
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent"
            >
              <Clock className="w-4 h-4 mr-1" />
              Fastest Times
            </TabsTrigger>
            <TabsTrigger 
              value="feathers"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-400 data-[state=active]:bg-transparent"
            >
              🪶 Crow Feathers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speed" className="m-0">
            {!leaderboard || leaderboard.length === 0 ? (
              <div className="p-8 text-center">
                <Flag className="w-12 h-12 mx-auto mb-3 text-orange-400/30" />
                <p className="text-muted-foreground">No completions yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Be the first to complete this Beacon Run!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-orange-500/10">
                {leaderboard.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className={`flex items-center gap-4 p-4 transition-colors hover:bg-orange-500/5 ${
                      index < 3 ? 'bg-orange-500/5' : ''
                    }`}
                  >
                    <div className="w-8 text-center font-bold">
                      {getRankBadge(index + 1)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {entry.profiles?.display_name || 'Anonymous Ghost'}
                      </div>
                      {!runId && entry.beacon_runs && (
                        <div className="text-xs text-muted-foreground truncate">
                          {entry.beacon_runs.name} ({entry.beacon_runs.total_waypoints} waypoints)
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-orange-400">
                        {formatCompletionTime(entry.completion_time_ms)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.completed_at).toLocaleDateString()}
                      </div>
                    </div>

                    {entry.crow_feather_id && (
                      <div className="text-xl" title={`Crow Feather #${entry.crow_feather_id}`}>
                        🪶
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="feathers" className="m-0">
            {crowFeathers.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl block mb-3 opacity-30">🪶</span>
                <p className="text-muted-foreground">No Beacon Run feathers earned yet</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Set a record to earn a Crow Feather!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-orange-500/10">
                {crowFeathers.map((feather) => (
                  <div 
                    key={feather.id}
                    className="flex items-center gap-4 p-4 transition-colors hover:bg-orange-500/5"
                  >
                    <div className="text-2xl">🪶</div>
                    <div className="flex-1">
                      <div className="font-medium">Crow Feather #{feather.id}</div>
                      <div className="text-xs text-muted-foreground">
                        {feather.category === 'beacon_run_speed' ? 'Speed Record' : feather.category}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-orange-400">
                        {feather.category === 'beacon_run_speed' 
                          ? formatCompletionTime(feather.recordValue * 1000)
                          : feather.recordValue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(feather.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="p-3 border-t border-orange-500/10 bg-orange-500/5 text-center">
          <p className="text-xs text-muted-foreground italic">
            "The crow remembers what the ghost forgets."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BeaconRunLeaderboard;
