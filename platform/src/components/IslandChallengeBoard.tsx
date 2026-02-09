import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Trophy, Coins, Users } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChallengeSubmissionDialog } from '@/components/ChallengeSubmissionDialog';

interface IslandChallengeBoardProps {
  projectId?: string;
}

const ISLAND_COLORS = {
  harvest: 'bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300',
  navigate: 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300',
  engineer: 'bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300',
  battle: 'bg-red-500/10 border-red-500/30 text-red-700 dark:text-red-300',
  seek: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300',
  magic: 'bg-pink-500/10 border-pink-500/30 text-pink-700 dark:text-pink-300',
  train: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
};

export function IslandChallengeBoard({ projectId }: IslandChallengeBoardProps) {
  const { user } = useAuth();
  const [selectedIsland, setSelectedIsland] = useState<string | null>(null);
  const [submissionDialog, setSubmissionDialog] = useState<{ open: boolean; challenge: any | null }>({
    open: false,
    challenge: null,
  });

  // Fetch user's island progress
  const { data: userProgress } = useQuery({
    queryKey: ['user-hexisle-progress', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_hexisle_skills')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch challenges
  const { data: challenges, isLoading } = useQuery({
    queryKey: ['island-challenges', projectId, selectedIsland],
    queryFn: async () => {
      let query = supabase
        .from('influencer_challenge_config')
        .select('*')
        .eq('is_active', true);

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      if (selectedIsland) {
        query = query.eq('hexisle_skill_category', selectedIsland);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch prerequisites separately
  const { data: allPrerequisites } = useQuery({
    queryKey: ['challenge-prerequisites'],
    enabled: !!challenges,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('challenge_prerequisites' as any)
        .select('*');
      if (error) {
        console.error('Error fetching prerequisites:', error);
        return [];
      }
      return data as any[];
    },
  });

  // Fetch user's challenge submissions
  const { data: submissions } = useQuery({
    queryKey: ['user-challenge-submissions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select('challenge_id, placement, final_score')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if challenge is unlocked for user
  const isChallengeUnlocked = (challengeId: string) => {
    const prereqs = allPrerequisites?.filter((p: any) => p.challenge_id === challengeId);
    
    if (!user?.id || !prereqs || prereqs.length === 0) {
      return true; // No prerequisites means unlocked
    }

    return prereqs.every((prereq: any) => {
      if (prereq.prerequisite_type === 'challenge_completion') {
        return submissions?.some(s => 
          s.challenge_id === prereq.prerequisite_challenge_id && s.placement
        );
      }

      if (prereq.prerequisite_type === 'island_level' || prereq.prerequisite_type === 'island_xp') {
        const progress = userProgress?.find(p => p.island_name === prereq.required_island);
        if (!progress) return false;

        if (prereq.prerequisite_type === 'island_level') {
          return progress.skill_level >= prereq.required_level;
        }
        return progress.xp_earned >= prereq.required_xp;
      }

      return true;
    });
  };

  const islands = ['harvest', 'navigate', 'engineer', 'battle', 'seek', 'magic', 'train'];

  if (isLoading) {
    return <div className="text-muted-foreground">Loading challenges...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs value={selectedIsland || 'all'} onValueChange={(v) => setSelectedIsland(v === 'all' ? null : v)}>
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {islands.map(island => (
            <TabsTrigger key={island} value={island} className="capitalize">
              {island}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedIsland || 'all'} className="space-y-4">
          {challenges && challenges.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge: any) => {
                const unlocked = isChallengeUnlocked(challenge.id);
                const userSubmission = submissions?.find(s => s.challenge_id === challenge.id);
                const prereqs = allPrerequisites?.filter((p: any) => p.challenge_id === challenge.id) || [];
                const islandColor = ISLAND_COLORS[challenge.hexisle_skill_category as keyof typeof ISLAND_COLORS] || '';

                return (
                  <Card key={challenge.id} className={`relative ${!unlocked ? 'opacity-60' : ''}`}>
                    {!unlocked && (
                      <div className="absolute top-2 right-2">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{challenge.contest_name}</CardTitle>
                        </div>
                        {challenge.hexisle_skill_category && (
                          <Badge variant="outline" className={`${islandColor} capitalize`}>
                            {challenge.hexisle_skill_category}
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {challenge.contest_description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span>{challenge.entrance_fee_credits} credits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-amber-500" />
                          <span>Prize Pool</span>
                        </div>
                      </div>

                      {challenge.allow_concurrent && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="h-3 w-3 mr-1" />
                          Concurrent entries allowed
                        </Badge>
                      )}

                      {userSubmission && (
                        <div className="pt-2 border-t">
                          <Badge variant="default">
                            Submitted {userSubmission.placement && `• ${userSubmission.placement}`}
                          </Badge>
                        </div>
                      )}

                      <Button
                        className="w-full"
                        disabled={!unlocked}
                        variant={unlocked ? 'default' : 'outline'}
                        onClick={() => {
                          if (unlocked) {
                            setSubmissionDialog({ open: true, challenge });
                          }
                        }}
                      >
                        {unlocked ? (
                          <>
                            <Unlock className="h-4 w-4 mr-2" />
                            Enter Challenge
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Locked
                          </>
                        )}
                      </Button>

                      {!unlocked && prereqs.length > 0 && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="font-medium">Prerequisites:</div>
                          {prereqs.map((prereq: any, idx: number) => (
                            <div key={idx} className="ml-2">
                              • {prereq.prerequisite_type === 'challenge_completion' 
                                ? 'Complete prerequisite challenge'
                                : `${prereq.required_island}: Level ${prereq.required_level || prereq.required_xp + ' XP'}`
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No challenges available for this island yet.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Challenge Submission Dialog */}
      <ChallengeSubmissionDialog 
        open={submissionDialog.open}
        onOpenChange={(open) => setSubmissionDialog({ open, challenge: null })}
        challenge={submissionDialog.challenge}
      />
    </div>
  );
}