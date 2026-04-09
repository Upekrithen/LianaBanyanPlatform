import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MILESTONES = [1, 10, 25, 50, 75, 100, 250, 500, 1000] as const;
const LS_KEY = 'marks_milestone_last_shown';

export interface CategoryBreakdown {
  category: string;
  total: number;
}

const CATEGORY_EMOJI: Record<string, string> = {
  photography: '📸',
  bounty_photo: '📸',
  pearl_diver: '🐚',
  deals: '🐚',
  scouting: '🐚',
  feedback: '✍️',
  cooking: '🍳',
  food: '🍳',
  teaching: '📚',
  classroom: '📚',
  general: '⭐',
  backing: '🏗️',
  campaign: '📢',
  delivery: '🚗',
  tour_package_completion: '🎒',
  captain: '⚓',
  coordination: '⚓',
};

export function getCategoryEmoji(cat: string): string {
  return CATEGORY_EMOJI[cat] || '⭐';
}

export function useMarksMilestone() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['marks-milestone', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return { totalMarks: 0, categories: [] as CategoryBreakdown[] };

      const { data: rows, error } = await supabase
        .from('mark_work_records' as never)
        .select('marks_earned, category, work_type')
        .eq('user_id', user.id) as {
          data: Array<{ marks_earned: number; category: string | null; work_type: string | null }> | null;
          error: unknown;
        };
      if (error) throw error;

      let totalMarks = 0;
      const catMap: Record<string, number> = {};

      for (const row of rows ?? []) {
        totalMarks += row.marks_earned || 0;
        const cat = row.category || row.work_type || 'general';
        catMap[cat] = (catMap[cat] || 0) + (row.marks_earned || 0);
      }

      const categories: CategoryBreakdown[] = Object.entries(catMap)
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

      return { totalMarks, categories };
    },
    staleTime: 30_000,
    enabled: !!user,
  });

  const totalMarks = data?.totalMarks ?? 0;
  const categories = data?.categories ?? [];
  const primaryCategory = categories[0]?.category || 'general';

  const lastShown = typeof window !== 'undefined'
    ? parseInt(localStorage.getItem(LS_KEY) || '0', 10)
    : 0;

  const currentMilestone = [...MILESTONES]
    .reverse()
    .find(m => totalMarks >= m) ?? 0;

  const showMilestone = currentMilestone > 0 && currentMilestone > lastShown;

  const nextMilestone = MILESTONES.find(m => m > totalMarks) ?? 1000;
  const progressTo100 = Math.min(totalMarks, 100);

  function dismiss() {
    if (currentMilestone > 0) {
      localStorage.setItem(LS_KEY, String(currentMilestone));
    }
  }

  return {
    totalMarks,
    categories,
    primaryCategory,
    showMilestone,
    currentMilestone,
    nextMilestone,
    progressTo100,
    isPrizePanel: currentMilestone >= 100,
    isLoading,
    dismiss,
  };
}
