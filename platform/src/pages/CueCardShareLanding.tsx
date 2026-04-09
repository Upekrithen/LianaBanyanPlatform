import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Users, Rocket, Ghost, UserPlus, Sparkles,
  ShieldCheck, Package, Award, Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';
import { useAuth } from '@/contexts/AuthContext';
import { CueCardInterestSignal } from '@/components/CueCardInterestSignal';

interface ShareRecord {
  id: string;
  short_code: string;
  recipient_name: string | null;
  personal_message: string | null;
  call_to_action: string;
  campaign_id: string | null;
  creator_id: string;
  featured_project_id: string | null;
  campaign_title?: string;
  campaign_craft_type?: string;
  creator_display_name?: string;
}

export default function CueCardShareLanding() {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const stats = useCanonicalStats();
  const { user } = useAuth();
  const [share, setShare] = useState<ShareRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!shortCode) return;

    (async () => {
      const { data, error } = await supabase
        .from('cue_card_shares' as never)
        .select('*')
        .eq('short_code', shortCode)
        .single() as { data: ShareRecord | null; error: unknown };

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Increment view counter (fire-and-forget)
      supabase
        .from('cue_card_shares' as never)
        .update({ views: (data as any).views + 1 } as never)
        .eq('id', data.id)
        .then();

      // Fetch campaign title if linked
      if (data.campaign_id) {
        const { data: campaign } = await supabase
          .from('cue_card_campaigns' as never)
          .select('title, craft_type')
          .eq('id', data.campaign_id)
          .single() as { data: { title: string; craft_type: string } | null };
        if (campaign) {
          data.campaign_title = campaign.title;
          data.campaign_craft_type = campaign.craft_type;
        }
      }

      // Fetch creator display name
      const { data: profile } = await supabase
        .from('member_profiles' as never)
        .select('display_name')
        .eq('id', data.creator_id)
        .single() as { data: { display_name: string } | null };
      if (profile) {
        data.creator_display_name = profile.display_name;
      }

      // Persist short code in sessionStorage for attribution tracking
      sessionStorage.setItem('cue_card_source', shortCode);

      setShare(data);
      setLoading(false);
    })();
  }, [shortCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (notFound || !share) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Card Not Found</h1>
          <p className="text-white/60 mb-6">This Cue Card link may have expired or doesn't exist.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl bg-primary text-white font-semibold">
            Visit Liana Banyan
          </button>
        </div>
      </div>
    );
  }

  const greeting = share.recipient_name
    ? `Hey ${share.recipient_name}!`
    : 'Hey there!';
  const senderLabel = share.creator_display_name || 'Someone';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Personal greeting card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 mb-8"
        >
          <div className="text-3xl md:text-4xl font-bold text-white mb-1">{greeting}</div>
          <div className="text-white/50 mb-6">{senderLabel} sent you this.</div>

          {share.personal_message && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6 relative">
              <div className="absolute -top-3 left-4 px-2 bg-slate-900 text-white/40 text-xs">Personal Note</div>
              <p className="text-lg text-white/80 italic leading-relaxed">
                "{share.personal_message}"
              </p>
            </div>
          )}

          {share.campaign_title && (
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6 flex items-center gap-4">
              <div className="p-2.5 rounded-lg bg-primary/20">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-white">{share.campaign_title}</div>
                <div className="text-sm text-white/50">{share.campaign_craft_type}</div>
              </div>
            </div>
          )}
        </motion.div>

        {share.creator_id !== user?.id && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <CueCardInterestSignal memberId={share.creator_id} />
          </motion.div>
        )}

        {/* Journey fork */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-4 mb-10"
        >
          <h2 className="text-xl font-semibold text-white mb-2">What would you like to do?</h2>

          {share.campaign_id && (
            <button
              onClick={() => navigate(`/cue-cards/campaigns/${share.campaign_id}`)}
              className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all flex items-center gap-4 text-left group"
            >
              <div className="p-3 rounded-xl bg-primary/20 text-primary"><Users className="w-6 h-6" /></div>
              <div className="flex-1">
                <div className="font-semibold text-white group-hover:text-primary transition-colors">
                  Join {senderLabel}'s Project
                </div>
                <div className="text-sm text-white/50">See what they're building and get involved</div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
            </button>
          )}

          <button
            onClick={() => navigate('/cue-cards/campaigns')}
            className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400"><Rocket className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">Start Your Own Project</div>
              <div className="text-sm text-white/50">Browse Turn-Key campaigns and launch something new</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/50 transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400"><Ghost className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-semibold text-white group-hover:text-violet-400 transition-colors">Explore First</div>
              <div className="text-sm text-white/50">Browse freely as a guest — no signup required</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-violet-400 transition-colors" />
          </button>

          <button
            onClick={() => navigate('/membership')}
            className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/50 transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400"><UserPlus className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-semibold text-white group-hover:text-amber-400 transition-colors">Sign Up — $5/year</div>
              <div className="text-sm text-white/50">Full membership access to the cooperative</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-amber-400 transition-colors" />
          </button>
        </motion.div>

        {/* Platform overview */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            What is Liana Banyan?
          </h2>
          <p className="text-white/60 mb-5 leading-relaxed">
            A cooperative-style platform where creators keep 83.3% of everything they earn. One membership ($5/year),
            same terms as the Founder. Build a business, launch a product, join a project — your call.
          </p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xl font-bold text-primary">{stats.innovationCount.toLocaleString()}</div>
              <div className="text-xs text-white/50">Innovations</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xl font-bold text-amber-400">{stats.crownJewels}</div>
              <div className="text-xs text-white/50">Crown Jewels</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5">
              <div className="text-xl font-bold text-emerald-400">{stats.productionSystems}</div>
              <div className="text-xs text-white/50">Production Systems</div>
            </div>
          </div>

          <div className="mt-5 grid sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-2 text-sm text-white/60">
              <ShieldCheck className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
              <span>Wyoming C-Corp — Liana Banyan Corporation</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/60">
              <Award className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <span>{stats.patentApplications} provisional patent applications</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/60">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>16 integrated initiatives</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-white/60">
              <Users className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
              <span>Same terms for every member</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
