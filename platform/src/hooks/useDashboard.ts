import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardProject {
  id: string;
  title: string;
  slug: string;
  status: string;
  category: string;
  backer_count: number;
  total_pledged: number;
  created_at: string;
}

export interface DashboardNotification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
  link: string | null;
}

export interface DashboardTreasureMapProgress {
  map_id: string;
  map_title: string;
  total_steps: number;
  completed_steps: number;
  next_step_title: string | null;
}

export interface DashboardCueCard {
  id: string;
  title: string;
  slug: string;
  craft_type: string;
  icon: string;
  template_count: number;
}

export interface CaptainSummary {
  level: string;
  orders_managed: number;
  orders_fulfilled: number;
  fulfillment_rate: number;
}

export interface DashboardData {
  projects: DashboardProject[];
  totalEarnings: number;
  ordersFulfilled: number;
  ordersTotal: number;
  reputationScore: number;
  notifications: DashboardNotification[];
  treasureMapProgress: DashboardTreasureMapProgress | null;
  cueCards: DashboardCueCard[];
  captain: CaptainSummary | null;
}

export function useDashboard() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['creator-dashboard', user?.id],
    queryFn: async (): Promise<DashboardData> => {
      if (!user) throw new Error('Not authenticated');

      const [
        projectsRes,
        earningsRes,
        captainRes,
        ordersRes,
        notificationsRes,
        mapProgressRes,
        mapsRes,
        cueCardsRes,
        reputationRes,
      ] = await Promise.all([
        supabase
          .from('turnkey_projects' as never)
          .select('id, title, slug, status, category, community_matched, early_adopter_filled, created_at')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10) as { data: any[] | null; error: any },

        supabase
          .from('credit_wallets' as never)
          .select('lifetime_earned')
          .eq('user_id', user.id)
          .maybeSingle() as { data: { lifetime_earned: number } | null; error: any },

        supabase
          .from('captains' as never)
          .select('level, orders_managed, orders_fulfilled, fulfillment_rate')
          .eq('user_id', user.id)
          .maybeSingle() as { data: CaptainSummary | null; error: any },

        supabase
          .from('captain_order_assignments' as never)
          .select('id, status')
          .eq('captain_id', user.id) as { data: { id: string; status: string }[] | null; error: any },

        supabase
          .from('notifications' as never)
          .select('id, title, body, type, read_at, created_at, link')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10) as { data: DashboardNotification[] | null; error: any },

        supabase
          .from('craft_treasure_map_progress' as never)
          .select('treasure_map_id, completed_steps, current_step')
          .eq('user_id', user.id)
          .order('last_activity', { ascending: false })
          .limit(1)
          .maybeSingle() as { data: { treasure_map_id: string; completed_steps: number[]; current_step: number } | null; error: any },

        supabase
          .from('craft_treasure_maps' as never)
          .select('id, title, steps')
          .limit(50) as { data: { id: string; title: string; steps: any[] }[] | null; error: any },

        supabase
          .from('cue_card_campaigns' as never)
          .select('id, title, slug, craft_type, icon')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(10) as { data: any[] | null; error: any },

        supabase
          .from('member_profiles' as never)
          .select('reputation_score')
          .eq('user_id', user.id)
          .maybeSingle() as { data: { reputation_score: number } | null; error: any },
      ]);

      const projects: DashboardProject[] = (projectsRes.data || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        status: p.status,
        category: p.category,
        backer_count: p.early_adopter_filled || 0,
        total_pledged: p.community_matched || 0,
        created_at: p.created_at,
      }));

      const orders = ordersRes.data || [];
      const ordersTotal = orders.length;
      const ordersFulfilled = orders.filter((o: any) => o.status === 'confirmed' || o.status === 'shipped').length;

      let treasureMapProgress: DashboardTreasureMapProgress | null = null;
      if (mapProgressRes.data && mapsRes.data) {
        const activeMap = mapsRes.data.find((m: any) => m.id === mapProgressRes.data!.treasure_map_id);
        if (activeMap) {
          const totalSteps = Array.isArray(activeMap.steps) ? activeMap.steps.length : 0;
          const completedSteps = mapProgressRes.data.completed_steps?.length || 0;
          const nextStepIndex = mapProgressRes.data.current_step - 1;
          const nextStep = Array.isArray(activeMap.steps) && activeMap.steps[nextStepIndex]
            ? activeMap.steps[nextStepIndex].title
            : null;
          treasureMapProgress = {
            map_id: activeMap.id,
            map_title: activeMap.title,
            total_steps: totalSteps,
            completed_steps: completedSteps,
            next_step_title: nextStep,
          };
        }
      }

      return {
        projects,
        totalEarnings: earningsRes.data?.lifetime_earned || 0,
        ordersFulfilled,
        ordersTotal,
        reputationScore: reputationRes.data?.reputation_score || 0,
        notifications: notificationsRes.data || [],
        treasureMapProgress,
        cueCards: (cueCardsRes.data || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
          craft_type: c.craft_type,
          icon: c.icon,
          template_count: 0,
        })),
        captain: captainRes.data,
      };
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}
