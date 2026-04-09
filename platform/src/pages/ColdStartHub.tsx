import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Anchor, ArrowRight, Snowflake, HelpCircle, X, ChevronDown, Flame } from 'lucide-react';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';
import { ForRentCard } from '@/components/v2/marketplace/ForRentCard';

const PATHWAYS = [
  {
    key: 'food',
    emoji: '🍽️',
    title: 'FOOD NODE',
    bestFor: 'Best for cooks & food lovers',
    description: 'Start a food campaign. Onboard a restaurant. Feed your neighborhood.',
    href: '/start/cold-start/food',
    gradient: 'from-orange-50 to-red-50',
    border: 'hover:border-orange-400',
    accent: 'text-orange-700',
    badgeColor: 'bg-orange-100 text-orange-700',
  },
  {
    key: 'manufacturing',
    emoji: '🏭',
    title: 'MAKE NODE',
    bestFor: 'Best for makers & builders',
    description: 'Start a factory from your garage. 3D print → mold → inject. Scale up.',
    href: '/start/cold-start/manufacturing',
    gradient: 'from-slate-50 to-zinc-100',
    border: 'hover:border-slate-500',
    accent: 'text-slate-700',
    badgeColor: 'bg-slate-100 text-slate-700',
  },
  {
    key: 'service',
    emoji: '🔧',
    title: 'SERVICE NODE',
    bestFor: 'Best for skilled trades',
    description: 'Offer your skills. Plumbing, tutoring, cleaning, auto repair.',
    href: '/start/cold-start/service',
    gradient: 'from-blue-50 to-cyan-50',
    border: 'hover:border-blue-400',
    accent: 'text-blue-700',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    key: 'local-business',
    emoji: '🏪',
    title: 'LOCAL BIZ',
    bestFor: 'Best for community connectors',
    description: 'Know a great local spot? Nominate it. Rally your neighbors. Walk in with the card.',
    href: '/start/cold-start/local-business',
    gradient: 'from-emerald-50 to-green-50',
    border: 'hover:border-emerald-400',
    accent: 'text-emerald-700',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    key: 'guild',
    emoji: '⚔️',
    title: 'GUILD',
    bestFor: 'Best for professionals',
    description: 'Rally your profession. Designers, makers, farmers, tutors — forge a guild.',
    href: '/guilds/create',
    gradient: 'from-purple-50 to-violet-50',
    border: 'hover:border-purple-400',
    accent: 'text-purple-700',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
  {
    key: 'tribe',
    emoji: '🔥',
    title: 'TRIBE',
    bestFor: 'Best for organizers',
    description: 'Gather your people. Family, neighbors, interest groups — form a tribe.',
    href: '/tribes/create',
    gradient: 'from-amber-50 to-yellow-50',
    border: 'hover:border-amber-400',
    accent: 'text-amber-700',
    badgeColor: 'bg-amber-100 text-amber-700',
  },
  {
    key: 'broadcast',
    emoji: '📡',
    title: 'BROADCAST',
    bestFor: 'Best for content creators & streamers',
    description: 'Connect your channels. Podcasts, YouTube, Twitch, Instagram, TikTok — earn from your audience through cooperative commerce, not ads.',
    href: '/start/cold-start/broadcast',
    gradient: 'from-pink-50 to-rose-50',
    border: 'hover:border-pink-400',
    accent: 'text-pink-700',
    badgeColor: 'bg-pink-100 text-pink-700',
  },
] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function ColdStartHub() {
  const navigate = useNavigate();
  const stats = useCanonicalStats();
  const [showDrawer, setShowDrawer] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 flex flex-col items-center px-4 py-12">
      <motion.div
        className="w-full max-w-4xl"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Hero — doctrine pattern: eyebrow → headline → body → CTA → utility strip */}
        <motion.div variants={fadeUp} className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-600 mb-4">
            Cold Start
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Choose your starting path.
          </h1>
          <p className="text-gray-600 max-w-md mx-auto mb-6">
            Pick the lane that best matches what you want to build first.
            You can expand later.
          </p>
          <Button
            variant="outline"
            className="text-sky-700 border-sky-300 hover:bg-sky-50"
            onClick={() => setShowDrawer(true)}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            I'm not sure yet
          </Button>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <Badge variant="outline" className="text-[11px] text-gray-500 border-gray-300">7 pathways</Badge>
            <Badge variant="outline" className="text-[11px] text-gray-500 border-gray-300">Change later</Badge>
            <Badge variant="outline" className="text-[11px] text-gray-500 border-gray-300">Guided setup</Badge>
          </div>
        </motion.div>

        {/* 2x3 Pathway Grid — doctrine: NOT a carousel */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PATHWAYS.map((p) => (
            <motion.div key={p.key} variants={fadeUp}>
              <Card
                className={`cursor-pointer border-2 border-transparent ${p.border} transition-all hover:shadow-lg group bg-gradient-to-br ${p.gradient}`}
                onClick={() => navigate(p.href)}
                data-xray-id={`cold-start-${p.key}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{p.emoji}</span>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${p.badgeColor}`}>
                      {p.bestFor}
                    </span>
                  </div>
                  <h2 className={`text-lg font-bold ${p.accent} mb-1`}>{p.title}</h2>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{p.description}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`${p.accent} group-hover:underline p-0 h-auto`}
                  >
                    Start <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* WildFire Tour CTA */}
        <motion.div variants={fadeUp} className="mb-4">
          <Card className="border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:border-orange-300 cursor-pointer transition-all" onClick={() => navigate('/wildfire-tour')}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="h-6 w-6 text-orange-500" />
                <div>
                  <p className="font-semibold text-orange-800 text-sm">Try WildFire Tour</p>
                  <p className="text-xs text-orange-600">See subscriptions, crews, and storefronts with demo data — no account needed</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-orange-500 shrink-0" />
            </CardContent>
          </Card>
        </motion.div>

        {/* For Rent reminder */}
        <motion.div variants={fadeUp} className="mb-4">
          <ForRentCard variant="inline" />
        </motion.div>

        {/* Accordion: How the pathways differ */}
        <motion.div variants={fadeUp} className="mb-8">
          <button
            className="w-full flex items-center justify-between p-4 rounded-lg border bg-white/70 hover:bg-white transition-colors"
            onClick={() => setShowAccordion(!showAccordion)}
          >
            <span className="text-sm font-semibold text-gray-700">How the pathways differ</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showAccordion ? 'rotate-180' : ''}`} />
          </button>
          {showAccordion && (
            <div className="mt-2 p-4 rounded-lg border bg-white/70 text-sm text-gray-600 space-y-2">
              <p><strong>Food, Service, Local Biz</strong> are demand-side — you find customers and connect them to supply.</p>
              <p><strong>Make</strong> is supply-side — you build the product and sell through the cooperative.</p>
              <p><strong>Guild</strong> organizes your profession. <strong>Tribe</strong> organizes your community.</p>
              <p className="text-xs text-gray-400 pt-2">All paths lead to Captain. You can expand later.</p>
            </div>
          )}
        </motion.div>

        {/* What happens after you choose */}
        <motion.div variants={fadeUp} className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <Anchor className="h-5 w-5" />
            <span className="font-semibold">What happens after you choose</span>
          </div>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Start with 10 — prove yourself small. Graduate to 50, then 100, then 1,000.
            Every Captain starts at 10. Every path leads forward.
          </p>
          <p className="text-xs text-gray-400 mt-4">
            {stats.innovationCount.toLocaleString()} innovations · {stats.productionSystems} production systems
          </p>
        </motion.div>
      </motion.div>

      {/* "I'm not sure yet" recommendation drawer */}
      <AnimatePresence>
        {showDrawer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setShowDrawer(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Not sure where to start?</h3>
                  <button onClick={() => setShowDrawer(false)} className="p-1 rounded-full hover:bg-gray-100">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div className="space-y-4">
                  <RecommendationItem
                    question="Do you cook, bake, or know great local restaurants?"
                    answer="Food Node"
                    onClick={() => { setShowDrawer(false); navigate('/start/cold-start/food'); }}
                  />
                  <RecommendationItem
                    question="Do you make things with your hands or want to learn?"
                    answer="Make Node"
                    onClick={() => { setShowDrawer(false); navigate('/start/cold-start/manufacturing'); }}
                  />
                  <RecommendationItem
                    question="Do you have a skill people pay for?"
                    answer="Service Node"
                    onClick={() => { setShowDrawer(false); navigate('/start/cold-start/service'); }}
                  />
                  <RecommendationItem
                    question="Do you know a business that deserves more customers?"
                    answer="Local Biz"
                    onClick={() => { setShowDrawer(false); navigate('/start/cold-start/local-business'); }}
                  />
                  <RecommendationItem
                    question="Do you want to organize people in your profession?"
                    answer="Guild"
                    onClick={() => { setShowDrawer(false); navigate('/guilds/create'); }}
                  />
                  <RecommendationItem
                    question="Do you want to organize your family or neighbors?"
                    answer="Tribe"
                    onClick={() => { setShowDrawer(false); navigate('/tribes/create'); }}
                  />
                </div>
                <p className="text-xs text-gray-400 text-center mt-6">
                  You can change your path at any time. This just picks your starting point.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecommendationItem({ question, answer, onClick }: { question: string; answer: string; onClick: () => void }) {
  return (
    <button
      className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-sky-50 hover:border-sky-300 transition-colors text-left"
      onClick={onClick}
    >
      <span className="text-sm text-gray-700">{question}</span>
      <span className="text-xs font-semibold text-sky-600 whitespace-nowrap ml-3">{answer} →</span>
    </button>
  );
}
