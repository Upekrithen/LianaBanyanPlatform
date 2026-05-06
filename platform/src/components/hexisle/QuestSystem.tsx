import { useState, useEffect, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Scroll, Trophy, Clock, Coins, Star, CheckCircle2,
  AlertCircle, Swords, Pickaxe, BookOpen, Users
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// STUB-003: OuralisClock subscription — QuestSystem reacts to each tide-step tick
import { OuralisClockContext } from '@/components/hexisle/OuralisClockContext';
import type { TidePhase } from '@/hooks/useClockasGameStateController';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'story' | 'guild' | 'contract';
  difficulty: 'novice' | 'apprentice' | 'journeyman' | 'master';
  rewards: {
    credits: number;
    xp: number;
    items?: string[];
    badges?: string[];
  };
  requirements: {
    type: string;
    target: number;
    current: number;
  }[];
  cityId?: string;
  expiresAt?: string;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  isRealWorld?: boolean; // Connects to actual work assignments
}

const SAMPLE_QUESTS: Quest[] = [
  {
    id: 'daily-1',
    title: 'Morning Harvest',
    description: 'Gather resources from three different hex tiles',
    type: 'daily',
    difficulty: 'novice',
    rewards: { credits: 50, xp: 100 },
    requirements: [{ type: 'gather_resources', target: 3, current: 0 }],
    status: 'available',
  },
  {
    id: 'daily-2',
    title: 'City Messenger',
    description: 'Visit two cities and deliver trade goods',
    type: 'daily',
    difficulty: 'apprentice',
    rewards: { credits: 100, xp: 200, items: ['Trade Certificate'] },
    requirements: [{ type: 'visit_cities', target: 2, current: 0 }],
    status: 'available',
  },
  {
    id: 'story-1',
    title: 'The Book of Peace',
    description: 'Journey to the Book of Peace Tower and speak with Sinbad',
    type: 'story',
    difficulty: 'journeyman',
    rewards: { credits: 500, xp: 1000, badges: ['Keeper of Peace'] },
    requirements: [
      { type: 'reach_city', target: 1, current: 0 },
      { type: 'complete_dialogue', target: 1, current: 0 }
    ],
    cityId: 'book-of-peace',
    status: 'available',
  },
  {
    id: 'contract-1',
    title: 'Real World: Code Review',
    description: 'Complete a code review for a guild project (connects to actual assignment)',
    type: 'contract',
    difficulty: 'journeyman',
    rewards: { credits: 250, xp: 500 },
    requirements: [{ type: 'real_world_task', target: 1, current: 0 }],
    status: 'available',
    isRealWorld: true,
  },
  {
    id: 'guild-1',
    title: 'Guild Contribution',
    description: 'Contribute resources to your guild\'s weekly project',
    type: 'guild',
    difficulty: 'apprentice',
    rewards: { credits: 150, xp: 300 },
    requirements: [{ type: 'contribute_resources', target: 50, current: 0 }],
    status: 'available',
  },
];

const DIFFICULTY_COLORS = {
  novice: 'bg-green-500',
  apprentice: 'bg-blue-500',
  journeyman: 'bg-purple-500',
  master: 'bg-orange-500',
};

const TYPE_ICONS = {
  daily: Clock,
  weekly: Star,
  story: BookOpen,
  guild: Users,
  contract: Scroll,
};

export function QuestSystem({
  onQuestSelect
}: {
  onQuestSelect?: (quest: Quest) => void
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [filter, setFilter] = useState<string>('all');

  // STUB-003: Subscribe to OuralisClock ticks — expire daily quests on each full-turn close
  const ouralisClock = useContext(OuralisClockContext);
  useEffect(() => {
    const unsub = ouralisClock.subscribe((step: number, phase: TidePhase, turnNumber: number) => {
      if (phase === 'cycle_close') {
        // Expire any daily quests that were not completed this turn
        setActiveQuests(prev => prev.filter(q => q.type !== 'daily'));
        toast.info(`Ouralis Tide Turn ${turnNumber + 1} complete — daily quests reset`);
      }
    });
    return unsub;
  }, [ouralisClock]);

  // Fetch quests from Supabase
  const { data: dbQuests, isLoading } = useQuery({
    queryKey: ['hexisle-quests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hexisle_quests')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching quests:', error);
        return [];
      }
      return data || [];
    },
  });

  // Transform DB quests to component format, fallback to sample data
  const quests: Quest[] = (dbQuests && dbQuests.length > 0)
    ? dbQuests.map((q: any) => ({
        id: q.id,
        title: q.title,
        description: q.description || '',
        type: q.quest_type as Quest['type'],
        difficulty: q.difficulty as Quest['difficulty'],
        rewards: {
          credits: q.reward_credits || 0,
          xp: q.reward_xp || 0,
          items: q.reward_items || [],
          badges: q.reward_badges || [],
        },
        requirements: q.requirements || [],
        cityId: q.city_id,
        expiresAt: q.expires_at,
        status: 'available' as const,
        isRealWorld: q.is_real_world || false,
      }))
    : SAMPLE_QUESTS;

  const acceptQuest = (quest: Quest) => {
    if (activeQuests.length >= 5) {
      toast.error('Maximum 5 active quests at a time');
      return;
    }

    const updatedQuest = { ...quest, status: 'in_progress' as const };
    setActiveQuests([...activeQuests, updatedQuest]);
    setQuests(quests.map(q => q.id === quest.id ? updatedQuest : q));
    toast.success(`Quest accepted: ${quest.title}`);

    if (onQuestSelect) {
      onQuestSelect(updatedQuest);
    }
  };

  const completeQuest = async (quest: Quest) => {
    // Check if all requirements are met
    const allComplete = quest.requirements.every(r => r.current >= r.target);

    if (!allComplete) {
      toast.error('Quest requirements not yet met');
      return;
    }

    // Award rewards
    toast.success(
      <div>
        <p className="font-bold">Quest Complete!</p>
        <p>+{quest.rewards.credits} Credits</p>
        <p>+{quest.rewards.xp} XP</p>
        {quest.rewards.badges?.map(b => (
          <p key={b}>🏆 Badge: {b}</p>
        ))}
      </div>
    );

    const updatedQuest = { ...quest, status: 'completed' as const };
    setQuests(quests.map(q => q.id === quest.id ? updatedQuest : q));
    setActiveQuests(activeQuests.filter(q => q.id !== quest.id));
  };

  const filteredQuests = quests.filter(q => {
    if (filter === 'all') return true;
    if (filter === 'active') return q.status === 'in_progress';
    return q.type === filter;
  });

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'active', 'daily', 'story', 'guild', 'contract'].map(f => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            className="capitalize"
          >
            {f === 'active' && <Swords className="w-4 h-4 mr-1" />}
            {f}
          </Button>
        ))}
      </div>

      {/* Active Quests Summary */}
      {activeQuests.length > 0 && (
        <Card className="border-yellow-500 bg-yellow-500/10">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Swords className="w-4 h-4" />
              Active Quests ({activeQuests.length}/5)
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2">
            <div className="flex gap-2 flex-wrap">
              {activeQuests.map(q => (
                <Badge key={q.id} variant="outline">
                  {q.title}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quest List */}
      <div className="space-y-3">
        {filteredQuests.map(quest => {
          const TypeIcon = TYPE_ICONS[quest.type];
          const totalProgress = quest.requirements.reduce((sum, r) => sum + r.current, 0);
          const totalTarget = quest.requirements.reduce((sum, r) => sum + r.target, 0);
          const progressPercent = (totalProgress / totalTarget) * 100;

          return (
            <Card
              key={quest.id}
              className={`transition-all hover:shadow-lg ${
                quest.status === 'completed' ? 'opacity-60' : ''
              } ${quest.isRealWorld ? 'border-blue-500' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">{quest.title}</h4>
                      <Badge className={DIFFICULTY_COLORS[quest.difficulty]}>
                        {quest.difficulty}
                      </Badge>
                      {quest.isRealWorld && (
                        <Badge variant="outline" className="border-blue-500 text-blue-500">
                          🌍 Real World
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {quest.description}
                    </p>

                    {/* Progress */}
                    {quest.status === 'in_progress' && (
                      <div className="mb-2">
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalProgress}/{totalTarget} complete
                        </p>
                      </div>
                    )}

                    {/* Rewards */}
                    <div className="flex gap-3 text-sm">
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Coins className="w-3 h-3" />
                        {quest.rewards.credits}
                      </span>
                      <span className="flex items-center gap-1 text-purple-500">
                        <Star className="w-3 h-3" />
                        {quest.rewards.xp} XP
                      </span>
                      {quest.rewards.badges?.map(badge => (
                        <span key={badge} className="flex items-center gap-1 text-orange-500">
                          <Trophy className="w-3 h-3" />
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {quest.status === 'available' && (
                      <Button size="sm" onClick={() => acceptQuest(quest)}>
                        Accept
                      </Button>
                    )}
                    {quest.status === 'in_progress' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => completeQuest(quest)}
                        disabled={progressPercent < 100}
                      >
                        {progressPercent >= 100 ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-1" />
                            In Progress
                          </>
                        )}
                      </Button>
                    )}
                    {quest.status === 'completed' && (
                      <Badge variant="outline" className="bg-green-500/20">
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
