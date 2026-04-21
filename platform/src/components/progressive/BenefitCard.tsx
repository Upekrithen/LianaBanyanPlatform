import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Gift, Sparkles, Lock, Unlock } from 'lucide-react';
import { useWildfireRunSafe } from '@/contexts/WildfireRunContext';

export interface BenefitItem {
  id: string;
  text: string;
  category: 'job' | 'business' | 'seeds' | 'all';
  icon?: string;
}

interface BenefitCardProps {
  benefits: BenefitItem[];
  currentSection: number;
  totalSections: number;
  onJoinClick?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

const categoryLabels: Record<string, string> = {
  job: 'GET A JOB',
  business: 'BUILD A BUSINESS',
  seeds: 'PLANT SEEDS',
  all: 'ALL PATHS',
};

const categoryColors: Record<string, string> = {
  job: 'from-amber-500/20 to-orange-500/20',
  business: 'from-emerald-500/20 to-green-500/20',
  seeds: 'from-violet-500/20 to-purple-500/20',
  all: 'from-blue-500/20 to-cyan-500/20',
};

export function BenefitCard({
  benefits,
  currentSection,
  totalSections,
  onJoinClick,
  isExpanded = false,
  onToggleExpand,
}: BenefitCardProps) {
  const wildfireState = useWildfireRunSafe();
  const [showAll, setShowAll] = useState(false);
  const progress = Math.min((currentSection / totalSections) * 100, 100);

  // Hide during active Wildfire Tours or Spotlight Tours
  if (wildfireState?.isRunning || wildfireState?.spotlight?.isActive) return null;

  const visibleBenefits = showAll ? benefits : benefits.slice(-3);

  const groupedBenefits = benefits.reduce((acc, benefit) => {
    if (!acc[benefit.category]) acc[benefit.category] = [];
    acc[benefit.category].push(benefit);
    return acc;
  }, {} as Record<string, BenefitItem[]>);

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      dragElastic={0.1}
      dragConstraints={{ top: -500, left: -500, right: 500, bottom: 100 }}
      whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
      className={`fixed bottom-4 left-4 z-50 w-80 rounded-xl border border-white/20 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden cursor-grab ${
        isExpanded ? 'max-h-[80vh]' : 'max-h-48'
      }`}
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 20 }}
    >
      {/* Header */}
      <div
        className="p-3 bg-gradient-to-r from-primary/30 to-purple-500/30 cursor-pointer flex items-center justify-between"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <span className="font-semibold text-white">Your Benefits</span>
          <span className="text-xs bg-primary/30 px-2 py-0.5 rounded-full text-primary">
            {benefits.length} unlocked
          </span>
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-white/60" />
        ) : (
          <ChevronUp className="w-5 h-5 text-white/60" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-slate-800">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-purple-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Benefits List */}
      <div className={`p-3 overflow-y-auto ${isExpanded ? 'max-h-[50vh]' : 'max-h-24'}`}>
        <AnimatePresence mode="popLayout">
          {isExpanded ? (
            Object.entries(groupedBenefits).map(([category, items]) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-3"
              >
                <div className={`text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1.5 px-2 py-1 rounded bg-gradient-to-r ${categoryColors[category]}`}>
                  {categoryLabels[category]}
                </div>
                {items.map((benefit, idx) => (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 py-1 px-2 text-sm text-white/80"
                  >
                    <Sparkles className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            ))
          ) : (
            visibleBenefits.map((benefit, idx) => (
              <motion.div
                key={benefit.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-2 py-1 text-sm text-white/80"
              >
                <Sparkles className="w-3 h-3 text-primary mt-1 flex-shrink-0" />
                <span className="line-clamp-1">{benefit.text}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>

        {!isExpanded && benefits.length > 3 && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand?.(); }}
            className="text-xs text-primary hover:text-primary/80 mt-1"
          >
            +{benefits.length - 3} more benefits...
          </button>
        )}
      </div>

      {/* CTA Footer */}
      <div className="p-3 border-t border-white/10 bg-slate-900/50">
        <div className="text-center mb-2">
          <span className="text-xs text-white/50">All this for just</span>
          <span className="text-lg font-bold text-primary ml-2">$5/year</span>
        </div>
        <button
          onClick={onJoinClick}
          className="w-full py-2 px-4 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 rounded-lg font-semibold text-white transition-all flex items-center justify-center gap-2"
        >
          <Unlock className="w-4 h-4" />
          Unlock All Benefits
        </button>
      </div>
    </motion.div>
  );
}

export function useBenefitAccumulator() {
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);

  const addBenefit = (benefit: BenefitItem) => {
    setBenefits(prev => {
      if (prev.some(b => b.id === benefit.id)) return prev;
      return [...prev, benefit];
    });
  };

  const addBenefits = (newBenefits: BenefitItem[]) => {
    setBenefits(prev => {
      const existingIds = new Set(prev.map(b => b.id));
      const uniqueNew = newBenefits.filter(b => !existingIds.has(b.id));
      return [...prev, ...uniqueNew];
    });
  };

  const clearBenefits = () => setBenefits([]);

  return { benefits, addBenefit, addBenefits, clearBenefits };
}
