import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TourPackage {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  icon: string;
  category: string;
  difficulty: string;
  estimated_minutes: number;
  marks_reward: number;
  stop_slugs: string[];
  is_published: boolean;
  sort_order: number;
}

export interface TourPackageProgress {
  id: string;
  user_id: string;
  package_slug: string;
  current_stop_index: number;
  completed_stops: string[];
  started_at: string;
  completed_at: string | null;
  marks_awarded: boolean;
}

const LS_KEY = 'lb_tour_package_progress_anon';

function getAnonProgress(): Record<string, TourPackageProgress> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch {
    return {};
  }
}

function setAnonProgress(data: Record<string, TourPackageProgress>) {
  localStorage.setItem(LS_KEY, JSON.stringify(data));
}

export function useTourPackages() {
  return useQuery<TourPackage[]>({
    queryKey: ['tour-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tour_packages' as never)
        .select('*')
        .eq('is_published', true)
        .order('sort_order') as { data: TourPackage[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as TourPackage[];
    },
    staleTime: 5 * 60_000,
  });
}

export function useTourPackageProgress() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const progressQuery = useQuery<Record<string, TourPackageProgress>>({
    queryKey: ['tour-package-progress', user?.id ?? 'anon'],
    queryFn: async () => {
      if (!user) return getAnonProgress();
      const { data, error } = await supabase
        .from('tour_package_progress' as never)
        .select('*')
        .eq('user_id', user.id) as { data: TourPackageProgress[] | null; error: unknown };
      if (error || !data) return {};
      const map: Record<string, TourPackageProgress> = {};
      for (const row of data) map[row.package_slug] = row;
      return map;
    },
    staleTime: 30_000,
  });

  const startPackage = useMutation({
    mutationFn: async (packageSlug: string) => {
      if (!user) {
        const all = getAnonProgress();
        if (all[packageSlug]) return all[packageSlug];
        const rec: TourPackageProgress = {
          id: crypto.randomUUID(),
          user_id: 'anon',
          package_slug: packageSlug,
          current_stop_index: 0,
          completed_stops: [],
          started_at: new Date().toISOString(),
          completed_at: null,
          marks_awarded: false,
        };
        all[packageSlug] = rec;
        setAnonProgress(all);
        return rec;
      }
      const { data, error } = await supabase
        .from('tour_package_progress' as never)
        .upsert({
          user_id: user.id,
          package_slug: packageSlug,
          current_stop_index: 0,
          completed_stops: [],
          started_at: new Date().toISOString(),
        }, { onConflict: 'user_id,package_slug' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tour-package-progress'] }),
  });

  const advanceStop = useMutation({
    mutationFn: async (args: { packageSlug: string; stopSlug: string; stopIndex: number }) => {
      if (!user) {
        const all = getAnonProgress();
        const rec = all[args.packageSlug];
        if (!rec) return;
        if (!rec.completed_stops.includes(args.stopSlug)) {
          rec.completed_stops = [...rec.completed_stops, args.stopSlug];
        }
        rec.current_stop_index = Math.max(rec.current_stop_index, args.stopIndex + 1);
        all[args.packageSlug] = rec;
        setAnonProgress(all);
        return rec;
      }
      const existing = progressQuery.data?.[args.packageSlug];
      const completed = existing?.completed_stops || [];
      const newCompleted = completed.includes(args.stopSlug)
        ? completed
        : [...completed, args.stopSlug];
      const newIndex = Math.max(existing?.current_stop_index ?? 0, args.stopIndex + 1);

      const { data, error } = await supabase
        .from('tour_package_progress' as never)
        .update({
          current_stop_index: newIndex,
          completed_stops: newCompleted,
        })
        .eq('user_id', user.id)
        .eq('package_slug', args.packageSlug)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tour-package-progress'] }),
  });

  const completePackage = useMutation({
    mutationFn: async (args: { packageSlug: string; marksReward: number }) => {
      if (!user) {
        const all = getAnonProgress();
        const rec = all[args.packageSlug];
        if (rec) {
          rec.completed_at = new Date().toISOString();
          rec.marks_awarded = true;
          all[args.packageSlug] = rec;
          setAnonProgress(all);
        }
        return { marksAwarded: args.marksReward };
      }
      const { error: progressError } = await supabase
        .from('tour_package_progress' as never)
        .update({
          completed_at: new Date().toISOString(),
          marks_awarded: true,
        })
        .eq('user_id', user.id)
        .eq('package_slug', args.packageSlug);
      if (progressError) throw progressError;

      const { error: marksError } = await supabase
        .from('mark_work_records' as never)
        .insert({
          user_id: user.id,
          work_type: 'tour_package_completion',
          description: `Completed tour package: ${args.packageSlug}`,
          marks_earned: args.marksReward,
        });
      if (marksError) console.error('Failed to award marks:', marksError);

      return { marksAwarded: args.marksReward };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tour-package-progress'] });
      qc.invalidateQueries({ queryKey: ['trail-progress'] });
    },
  });

  return {
    progress: progressQuery.data || {},
    isLoading: progressQuery.isLoading,
    startPackage,
    advanceStop,
    completePackage,
  };
}
