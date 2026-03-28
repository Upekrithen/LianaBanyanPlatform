import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Anchor, ArrowRight, Snowflake } from 'lucide-react';
import { useCanonicalStats } from '@/hooks/useCanonicalStats';

const PATHWAYS = [
  {
    key: 'food',
    emoji: '🍽️',
    title: 'FOOD NODE',
    description: 'Start a food campaign. Onboard a restaurant. Feed your neighborhood.',
    href: '/start/cold-start/food',
    gradient: 'from-orange-50 to-red-50',
    border: 'hover:border-orange-400',
    accent: 'text-orange-700',
  },
  {
    key: 'manufacturing',
    emoji: '🏭',
    title: 'MAKE NODE',
    description: 'Start a factory from your garage. 3D print → mold → inject. Scale up.',
    href: '/start/cold-start/manufacturing',
    gradient: 'from-slate-50 to-zinc-100',
    border: 'hover:border-slate-500',
    accent: 'text-slate-700',
  },
  {
    key: 'service',
    emoji: '🔧',
    title: 'SERVICE NODE',
    description: 'Offer your skills. Plumbing, tutoring, cleaning, auto repair.',
    href: '/start/cold-start/service',
    gradient: 'from-blue-50 to-cyan-50',
    border: 'hover:border-blue-400',
    accent: 'text-blue-700',
  },
  {
    key: 'local-business',
    emoji: '🏪',
    title: 'LOCAL BIZ',
    description: 'Know a great local spot? Nominate it. Rally your neighbors. Walk in with the card.',
    href: '/start/cold-start/local-business',
    gradient: 'from-emerald-50 to-green-50',
    border: 'hover:border-emerald-400',
    accent: 'text-emerald-700',
  },
  {
    key: 'guild',
    emoji: '⚔️',
    title: 'GUILD',
    description: 'Rally your profession. Designers, makers, farmers, tutors — forge a guild.',
    href: '/guilds/create',
    gradient: 'from-purple-50 to-violet-50',
    border: 'hover:border-purple-400',
    accent: 'text-purple-700',
  },
  {
    key: 'tribe',
    emoji: '🔥',
    title: 'TRIBE',
    description: 'Gather your people. Family, neighbors, interest groups — form a tribe.',
    href: '/tribes/create',
    gradient: 'from-amber-50 to-yellow-50',
    border: 'hover:border-amber-400',
    accent: 'text-amber-700',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-4xl"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp} className="text-center mb-10">
          <Snowflake className="h-10 w-10 text-sky-500 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">COLD START</h1>
          <p className="text-lg text-gray-600 italic mb-4">
            "What you do in little, you do in much."
          </p>
          <p className="text-gray-700 max-w-md mx-auto">
            Start with $0 and your drive. Pick a path.
            Prove yourself with 10. Graduate to 50. Then 100. Then 1,000.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PATHWAYS.map((p) => (
            <motion.div key={p.key} variants={fadeUp}>
              <Card
                className={`cursor-pointer border-2 border-transparent ${p.border} transition-all hover:shadow-lg group bg-gradient-to-br ${p.gradient}`}
                onClick={() => navigate(p.href)}
                data-xray-id={`cold-start-${p.key}`}
              >
                <CardContent className="p-6">
                  <span className="text-3xl mb-3 block">{p.emoji}</span>
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

        <motion.div variants={fadeUp} className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-2">
            <Anchor className="h-5 w-5" />
            <span className="font-semibold">All paths lead to Captain.</span>
          </div>
          <p className="text-sm text-gray-500">Every Captain starts at 10.</p>
          <p className="text-xs text-gray-400 mt-4">
            {stats.innovationCount.toLocaleString()} innovations &middot; {stats.productionSystems} production systems
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
