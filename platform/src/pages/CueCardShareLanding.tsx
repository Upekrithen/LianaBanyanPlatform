import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Users, Sparkles, ShieldCheck, Award, Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';
import { useAuth } from '@/contexts/AuthContext';

interface CueCard {
  id: string;
  creator_user_id: string;
  node_type: string;
  template_id: string;
  payload: Record<string, unknown>;
  short_token: string;
  qr_code_url: string | null;
  created_at: string;
  creator_display_name?: string;
}

// Helper functions for click tracking
const getOrCreateAnonSessionId = (): string => {
  let sessionId = localStorage.getItem('lb_anon_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('lb_anon_session', sessionId);
  }
  return sessionId;
};

const detectUAClass = (): string => {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('bot') || ua.includes('crawler')) return 'bot';
  if (ua.includes('mobile')) return 'mobile';
  return 'desktop';
};

export default function CueCardShareLanding() {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const stats = useCanonicalStats();
  const { user } = useAuth();
  const [card, setCard] = useState<CueCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [clickToken, setClickToken] = useState<string | null>(null);

  useEffect(() => {
    if (!shareToken) return;

    (async () => {
      // Fetch cue card by short_token
      const { data, error } = await supabase
        .from('leviathan_cue_cards')
        .select('*')
        .eq('short_token', shareToken)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Fetch creator display name
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', data.creator_user_id)
        .single();

      const cardData = {
        ...data,
        creator_display_name: profile?.display_name || 'A Liana Banyan Member',
      };

      // Record click
      try {
        const { data: clickData } = await supabase.rpc('record_cue_card_click', {
          p_card_id: data.id,
          p_anon_session_id: getOrCreateAnonSessionId(),
          p_ip_country: '', // Could use a geolocation service
          p_ua_class: detectUAClass(),
        });

        if (clickData) {
          setClickToken(clickData as string);
          sessionStorage.setItem('cue_card_click_token', clickData as string);
        }
      } catch (err) {
        console.error('Failed to record click:', err);
      }

      // Persist share token for attribution
      sessionStorage.setItem('cue_card_source', shareToken);

      setCard(cardData);
      setLoading(false);
    })();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse text-white/60">Loading...</div>
      </div>
    );
  }

  if (notFound || !card) {
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

  const payload = card.payload as {
    business_name?: string;
    owner_name?: string;
    hook_copy?: string;
    cover_image_url?: string;
    contact_phone?: string;
  };
  const senderLabel = card.creator_display_name || 'A Liana Banyan Member';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-6 py-16">

        {/* Cue Card Display */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-8 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/10 border border-primary/30 mb-8"
        >
          <div className="text-sm text-white/50 mb-4">{senderLabel} invited you to join Liana Banyan</div>

          {payload.cover_image_url && (
            <img
              src={payload.cover_image_url}
              alt={payload.business_name || 'Business'}
              className="w-full h-64 object-cover rounded-2xl mb-6"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          <div className="text-3xl md:text-4xl font-bold text-white mb-2">
            {payload.business_name || 'Local Business'}
          </div>
          <div className="text-xl text-white/70 mb-4">
            by {payload.owner_name || 'Business Owner'}
          </div>

          {payload.hook_copy && (
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 mb-6">
              <p className="text-lg text-white/80 italic leading-relaxed">
                "{payload.hook_copy}"
              </p>
            </div>
          )}

          {payload.contact_phone && (
            <div className="text-white/60">
              📞 {payload.contact_phone}
            </div>
          )}
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="space-y-4 mb-10"
        >
          <h2 className="text-xl font-semibold text-white mb-2">Ready to learn more?</h2>

          <button
            onClick={() => navigate(`/red-carpet?cardId=${card.id}&token=${shareToken}`)}
            className="w-full p-5 rounded-2xl bg-primary/20 border border-primary/30 hover:border-primary/50 transition-all flex items-center gap-4 text-left group"
          >
            <div className="p-3 rounded-xl bg-primary/30 text-primary"><Sparkles className="w-6 h-6" /></div>
            <div className="flex-1">
              <div className="font-semibold text-white group-hover:text-primary transition-colors">
                Walk through this with me
              </div>
              <div className="text-sm text-white/50">See how {payload.business_name} can thrive on Liana Banyan</div>
            </div>
            <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-primary transition-colors" />
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
