import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Sprout, ArrowRight, Sparkles } from 'lucide-react';

interface PathCardProps {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  href: string;
  cta: string;
  benefits: string[];
  isFlipped: boolean;
  onFlip: () => void;
}

function PathCard({
  title,
  subtitle,
  description,
  icon,
  color,
  href,
  cta,
  benefits,
  isFlipped,
  onFlip,
}: PathCardProps) {
  const navigate = useNavigate();

  return (
    <div
      className="relative h-80 cursor-pointer perspective-1000"
      onClick={onFlip}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {/* Front */}
        <div
          className={`absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center text-center border-2 ${color} backface-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="mb-4 p-4 rounded-full bg-white/10">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-white/70 mb-4">{subtitle}</p>
          <div className="mt-auto flex items-center gap-2 text-primary">
            <span className="text-sm font-medium">Tap to learn more</span>
            <span className="text-lg">👉</span>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 rounded-2xl p-6 flex flex-col border-2 ${color} backface-hidden`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
          <p className="text-white/80 text-sm mb-4">{description}</p>
          
          <div className="flex-1 space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm">
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-white/70">{benefit}</span>
              </div>
            ))}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(href);
            }}
            className="mt-4 w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center gap-2 transition-all"
          >
            {cta}
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFlip();
            }}
            className="mt-2 text-xs text-white/40 hover:text-white/60"
          >
            ← flip back
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export function PathSelector() {
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const toggleFlip = (index: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const paths = [
    {
      title: 'Get a Job',
      subtitle: 'Real work. Fair pay. Keep 83.3%.',
      description: 'Browse opportunities across all 16 initiatives AND member projects. Meal delivery, safety services, manufacturing, and more. No middleman taking half.',
      icon: <Briefcase className="w-10 h-10 text-amber-400" />,
      color: 'border-amber-500/50 bg-gradient-to-br from-amber-500/20 to-orange-500/10',
      href: '/get-a-job',
      cta: 'Find Work',
      benefits: [
        'Access to all bounties ($500-$2000+ in Credits)',
        'Post your own bounties to hire help',
        'Access to 1,244 documented innovations',
        'Keep 83.3% of everything you earn',
      ],
    },
    {
      title: 'Build a Business',
      subtitle: 'Same terms as the Founder.',
      description: 'Launch your Keep for $5. Sell products and services. Same deal as the Founder — no special treatment, no executive privilege. Your ship, Captain — your rules.',
      icon: <Building2 className="w-10 h-10 text-emerald-400" />,
      color: 'border-emerald-500/50 bg-gradient-to-br from-emerald-500/20 to-green-500/10',
      href: '/build-a-business',
      cta: 'Start Building',
      benefits: [
        'Launch your project on the platform',
        '6 production levels with volume discounts',
        'Early backer Joules from surplus',
        'Post bounties to hire talent',
      ],
    },
    {
      title: 'Plant Seeds',
      subtitle: 'Support projects early. Gain influence.',
      description: 'Back projects early and receive 5× the Joules — more collateral, more governance weight. Or sponsor innovations in our patent portfolio.',
      icon: <Sprout className="w-10 h-10 text-violet-400" />,
      color: 'border-violet-500/50 bg-gradient-to-br from-violet-500/20 to-purple-500/10',
      href: '/plant-seeds',
      cta: 'Start Planting',
      benefits: [
        'Back projects at any production level',
        'Multipliers up to 15x for early commitment',
        'Fractional IP ownership when you sponsor',
        '5× Joules for Pre-Mint backing',
      ],
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Choose Your Path
        </h2>
        <p className="text-lg text-white/60 max-w-2xl mx-auto">
          Three ways in. Same destination. All paths lead to the $5 membership 
          with access to 1,244 innovations and fractional patent ownership.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {paths.map((path, idx) => (
          <PathCard
            key={idx}
            {...path}
            isFlipped={flippedCards.has(idx)}
            onFlip={() => toggleFlip(idx)}
          />
        ))}
      </div>

      <div className="text-center mt-8">
        <p className="text-sm text-white/40">
          Tap any card to learn more, or scroll down to explore everything at once
        </p>
      </div>
    </div>
  );
}
