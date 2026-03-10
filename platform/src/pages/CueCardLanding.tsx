/**
 * Cue Card Landing Page
 * 
 * Dynamic landing page for Cue Card → Hofund routing
 * Each Cue Card gets a dedicated landing page that:
 * 1. Shows the Cue Card content
 * 2. Provides context for where it leads
 * 3. Routes to appropriate Hofund destination
 * 4. Tracks referral source for Credit rewards
 */

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight, Share2, QrCode, Calendar, Gift,
  Building2, Key, Stamp, Sparkles, ExternalLink, Palette, CheckCircle,
  Megaphone
} from 'lucide-react';
import { getGateBountyById, type GateArtworkBounty } from '@/data/gateArtworkBounties';
import { GUILD_LANDING_CARDS } from '@/data/guildRecruitingCards';
import { TreasureKeyIndicator } from '@/components/TreasureKeyIndicator';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';

interface CueCardData {
  id: string;
  title: string;
  tagline: string;
  content: string;
  destination: string;
  destinationLabel: string;
  color: string;
  icon: React.ReactNode;
  benefits: string[];
}

const CUE_CARDS: Record<string, CueCardData> = {
  'stage-play': {
    id: 'stage-play',
    title: 'You Have a Play. I Have a Stage.',
    tagline: 'Launch your business on the aircraft carrier',
    content: 'Got a business idea? A product? A service? You have a play. I built a stage. $5/year gets you access to the aircraft carrier. Launch your airplane.',
    destination: '/build-a-business',
    destinationLabel: 'Build a Business',
    color: 'from-emerald-500/30 to-green-500/20',
    icon: <Building2 className="w-12 h-12 text-emerald-400" />,
    benefits: [
      'Launch your project for $5/year',
      'Keep 83.3% of everything you earn',
      'Same terms as the Founder',
      'Post bounties to hire talent',
    ],
  },
  'own-patent': {
    id: 'own-patent',
    title: 'Own a Patent. Help Someone Join.',
    tagline: 'Fractional participation through sponsorship',
    content: 'Sponsor 5 new members ($25). Receive fractional participation in 8+ utility patents. Help others = participate in something real.',
    destination: '/sponsor',
    destinationLabel: 'Sponsor Portal',
    color: 'from-violet-500/30 to-purple-500/20',
    icon: <Key className="w-12 h-12 text-violet-400" />,
    benefits: [
      'Fractional patent participation',
      '8+ Crown Jewel utility patents',
      'Recorded on immutable ledger',
      'Help others while building service value',
    ],
  },
  'forever-stamps': {
    id: 'forever-stamps',
    title: 'Forever Stamps for Your Future',
    tagline: 'Lock in value that only goes up',
    content: 'Joules lock in today\'s value forever. Like buying postage that never expires. Your work today pays service credits tomorrow.',
    destination: '/plant-seeds',
    destinationLabel: 'Plant Seeds',
    color: 'from-amber-500/30 to-orange-500/20',
    icon: <Stamp className="w-12 h-12 text-amber-400" />,
    benefits: [
      'Value locked at earning time',
      'Forex Ratchet only goes UP',
      '5x multiplier for early backing',
      'Service credits that appreciate',
    ],
  },
  'forward': {
    id: 'forward',
    title: 'Not Left or Right. Forward.',
    tagline: 'Tired of being divided? Here\'s your formal invitation to BETTER.',
    content: '"One ship sails East, And another West, By the self-same winds that blow, \'Tis the set of the sails And not the gales, That tells the way we go. - Ella Wheeler Wilcox"',
    destination: '/forward',
    destinationLabel: 'Read the Invitation',
    color: 'from-emerald-500/30 to-teal-500/20',
    icon: <Stamp className="w-12 h-12 text-emerald-400" />,
    benefits: [
      '16 Practical Initiatives',
      'Cooperative Ownership',
      'Fixed Margins',
      'Community Governance',
    ],
  },
  'political-expedition': {
    id: 'political-expedition',
    title: 'Every petition you sign costs you real effort.',
    tagline: 'Reading for a cause. Paying attention for a PURPOSE.',
    content: 'That\'s why politicians will actually read it. Before you sign, you read. The platform measures your engagement. Your signature carries the weight of your understanding. This is democracy that means something.',
    destination: '/forward',
    destinationLabel: 'Join the Political Expedition',
    color: 'from-blue-500/30 to-indigo-500/20',
    icon: <Megaphone className="w-12 h-12 text-blue-400" />,
    benefits: [
      'Your signature carries real weight',
      'Coverage Minutes prove you read the issue',
      'Politicians see effort-backed petitions',
      'Non-partisan civic engagement for all',
    ],
  },
  // Guild recruiting cards — dynamically merged from guildRecruitingCards.ts
  ...Object.fromEntries(
    Object.entries(GUILD_LANDING_CARDS).map(([key, card]) => [
      key,
      {
        id: card.id,
        title: card.title,
        tagline: card.tagline,
        content: card.content,
        destination: card.destination,
        destinationLabel: card.destinationLabel,
        color: card.color,
        icon: <span className="text-5xl">{card.iconEmoji}</span>,
        benefits: card.benefits,
      } satisfies CueCardData,
    ])
  ),
};

// Gate Bounty Card Component
function GateBountyCard({ bounty }: { bounty: GateArtworkBounty }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Bounty Card Display */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 mb-8"
        >
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium border border-green-500/30">
              {bounty.status === 'open' ? '🎨 Open Bounty' : bounty.status}
            </span>
          </div>
          
          <div className="flex items-start gap-6 mb-6">
            <div className="p-4 rounded-2xl bg-white/10">
              <Palette className="w-12 h-12" style={{ color: bounty.color }} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {bounty.title}
              </h1>
              <p className="text-lg text-white/60">{bounty.subtitle}</p>
            </div>
          </div>
          
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            {bounty.description}
          </p>
          
          {/* Reward Display */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="text-2xl font-bold text-amber-400">{bounty.reward.credits}</div>
              <div className="text-sm text-white/60">Credits</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="text-2xl font-bold text-purple-400">{bounty.reward.marks}</div>
              <div className="text-sm text-white/60">MARKS</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5 text-center">
              <div className="text-lg font-bold text-green-400">+</div>
              <div className="text-sm text-white/60">{bounty.reward.bonus}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                if (!user) {
                  openOnboard({ reason: "claim this bounty", actionLabel: "Claim Bounty", membershipIncluded: true });
                } else {
                  navigate('/salt-mines');
                }
              }}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-semibold flex items-center gap-2"
            >
              Claim This Bounty
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/salt-mines')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 flex items-center gap-2"
            >
              Browse All Bounties
            </button>
          </div>
        </motion.div>

        {/* Requirements Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Requirements
          </h2>
          <div className="space-y-2">
            {bounty.requirements.map((req, idx) => (
              <div key={idx} className="flex items-start gap-2 text-white/70">
                <span className="text-amber-400 mt-1">•</span>
                <span>{req}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            How to Submit
          </h2>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="text-sm text-white/60">Join for $5/year</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="text-sm text-white/60">Create your artwork</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="text-sm text-white/60">Submit via Salt Mines</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl mb-2">4️⃣</div>
              <div className="text-sm text-white/60">Get paid + credited</div>
            </div>
          </div>
        </motion.div>

        {/* Back to Salt Mines */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/salt-mines')}
            className="text-white/50 hover:text-white/70 flex items-center gap-2 mx-auto"
          >
            <ExternalLink className="w-4 h-4" />
            Browse all bounties in the Salt Mines
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CueCardLanding() {
  const { cardId } = useParams<{ cardId: string }>();
  const navigate = useNavigate();
  
  // Check if this is a gate bounty card
  const gateBounty = cardId ? getGateBountyById(cardId) : null;
  if (gateBounty) {
    return <GateBountyCard bounty={gateBounty} />;
  }
  
  const card = cardId ? CUE_CARDS[cardId] : null;
  
  if (!card) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Card Not Found</h1>
          <button
            onClick={() => navigate('/hofund')}
            className="px-4 py-2 rounded-lg bg-primary text-white"
          >
            Browse All Cue Cards
          </button>
        </div>
      </div>
    );
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: card.title,
        text: card.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSchedule = () => {
    navigate('/hofund', { state: { scheduleCard: card.id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-6 py-20">
        {/* Card Display */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className={`relative p-8 rounded-3xl bg-gradient-to-br ${card.color} border border-white/20 mb-8`}
        >
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Share"
            >
              <Share2 className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={handleSchedule}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Schedule Post"
            >
              <Calendar className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          <div className="flex items-start gap-6 mb-6">
            <div className="p-4 rounded-2xl bg-white/10">
              {card.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                "{card.title}"
              </h1>
              <p className="text-lg text-white/60">{card.tagline}</p>
            </div>
          </div>
          
          <p className="text-xl text-white/80 leading-relaxed mb-8">
            {card.content}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate(card.destination)}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
            >
              Go to {card.destinationLabel}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleSchedule}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              Stamp & Schedule
            </button>
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-2xl bg-white/5 border border-white/10 mb-8"
        >
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            What You Get
          </h2>
          <div className="grid md:grid-cols-2 gap-3">
            {card.benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 text-white/70">
                <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sharing Rewards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30"
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            Earn Credits by Sharing
          </h2>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-primary">1 Credit</div>
              <div className="text-sm text-white/60">Share this card</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-primary">10 Credits</div>
              <div className="text-sm text-white/60">Someone signs up</div>
            </div>
            <div className="p-4 rounded-xl bg-white/5">
              <div className="text-2xl font-bold text-primary">500 Credits</div>
              <div className="text-sm text-white/60">5K Sponsor conversion</div>
            </div>
          </div>
        </motion.div>

        {/* Other Cards */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12"
        >
          <h2 className="text-xl font-semibold text-white mb-4">Other Cue Cards</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {Object.values(CUE_CARDS)
              .filter(c => c.id !== card.id)
              .map(otherCard => (
                <button
                  key={otherCard.id}
                  onClick={() => navigate(`/cue/${otherCard.id}`)}
                  className={`p-4 rounded-xl bg-gradient-to-br ${otherCard.color} border border-white/10 text-left hover:border-white/30 transition-all`}
                >
                  <h3 className="font-semibold text-white mb-1 line-clamp-1">
                    {otherCard.title}
                  </h3>
                  <p className="text-sm text-white/60 line-clamp-2">
                    {otherCard.tagline}
                  </p>
                </button>
              ))}
          </div>
        </motion.div>

        {/* Back to Hofund */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/hofund')}
            className="text-white/50 hover:text-white/70 flex items-center gap-2 mx-auto"
          >
            <ExternalLink className="w-4 h-4" />
            Browse all Cue Cards in Hofund Studio
          </button>
        </div>
      </div>

      {/* Treasure Key Indicator */}
      <TreasureKeyIndicator documentPath={`/cue/${card.id}`} />
    </div>
  );
}
