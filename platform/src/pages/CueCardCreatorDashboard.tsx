import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  PlusCircle, Eye, UserPlus, Rocket, Copy, ExternalLink,
  BarChart3, Award
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CueCardShare {
  id: string;
  short_code: string;
  recipient_name: string | null;
  personal_message: string | null;
  call_to_action: string;
  views: number;
  signups: number;
  projects_created: number;
  created_at: string;
  campaign_id: string | null;
}

interface Attribution {
  share_id: string;
  marks_awarded: number;
}

function useCueCardShares() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cue-card-shares', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cue_card_shares' as never)
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false }) as { data: CueCardShare[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as CueCardShare[];
    },
    enabled: !!user,
    staleTime: 30_000,
  });
}

function useCueCardMarks() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['cue-card-marks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cue_card_attribution' as never)
        .select('share_id, marks_awarded') as { data: Attribution[] | null; error: unknown };
      if (error) throw error;
      return (data || []) as Attribution[];
    },
    enabled: !!user,
    staleTime: 60_000,
  });
}

export default function CueCardCreatorDashboard() {
  const navigate = useNavigate();
  const { data: shares = [], isLoading } = useCueCardShares();
  const { data: attributions = [] } = useCueCardMarks();

  const totals = useMemo(() => {
    const t = { views: 0, signups: 0, projects: 0, marks: 0 };
    for (const s of shares) {
      t.views += s.views;
      t.signups += s.signups;
      t.projects += s.projects_created;
    }
    for (const a of attributions) t.marks += a.marks_awarded;
    return t;
  }, [shares, attributions]);

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/c/${code}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Cue Cards</h1>
            <p className="text-white/50 mt-1">Track how your Cue Cards are performing</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/cue-cards/create')}
            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
          >
            <PlusCircle className="w-5 h-5" /> Create New
          </button>
        </div>

        {/* Totals banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-white">{totals.views.toLocaleString()}</div>
              <div className="text-sm text-white/50 flex items-center justify-center gap-1"><Eye className="w-4 h-4" /> Views</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">{totals.signups}</div>
              <div className="text-sm text-white/50 flex items-center justify-center gap-1"><UserPlus className="w-4 h-4" /> Signups</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-400">{totals.projects}</div>
              <div className="text-sm text-white/50 flex items-center justify-center gap-1"><Rocket className="w-4 h-4" /> Projects</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{totals.marks}</div>
              <div className="text-sm text-white/50 flex items-center justify-center gap-1"><Award className="w-4 h-4" /> Marks Earned</div>
            </div>
          </div>
          {shares.length > 0 && (
            <p className="text-sm text-white/40 text-center mt-4">
              Your Cue Cards have been viewed {totals.views.toLocaleString()} times, generated {totals.signups} signups, and started {totals.projects} projects.
            </p>
          )}
        </motion.div>

        {/* Cards list */}
        {isLoading ? (
          <div className="text-center text-white/50 py-12">Loading your Cue Cards...</div>
        ) : shares.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Cue Cards Yet</h2>
            <p className="text-white/50 mb-6">Create your first personalized Cue Card to start sharing.</p>
            <button
              onClick={() => navigate('/dashboard/cue-cards/create')}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold"
            >
              Create Your First Cue Card
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {shares.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-white truncate">
                        {s.recipient_name ? `To: ${s.recipient_name}` : 'General Invite'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{s.call_to_action}</span>
                    </div>
                    {s.personal_message && (
                      <p className="text-sm text-white/50 truncate">"{s.personal_message}"</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                      <span className="font-mono">/c/{s.short_code}</span>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-white">{s.views}</div>
                      <div className="text-xs text-white/40">views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-400">{s.signups}</div>
                      <div className="text-xs text-white/40">signups</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-amber-400">{s.projects_created}</div>
                      <div className="text-xs text-white/40">projects</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => copyLink(s.short_code)}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60"
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(`/c/${s.short_code}`, '_blank')}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60"
                        title="Open landing page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
