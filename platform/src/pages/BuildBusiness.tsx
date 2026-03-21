/**
 * Build a Business - Progressive Disclosure Track
 * 
 * From project creation → production levels → volume discounts → Joules
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Layers, Users, Coins, TrendingUp, 
  ArrowRight, Sparkles, Unlock, ChevronDown, Package,
  Percent, Zap, Gift, Sprout, ChevronRight
} from 'lucide-react';
import { useBuilderMode } from '@/components/builder/BuilderModeContext';
import { PortalPageLayout } from '@/components/PortalPageLayout';

// Word pairs for the spinning wheel animation
const WORD_PAIRS = [
  { play: 'Idea', stage: 'Plan' },
  { play: 'Dream', stage: 'Platform' },
  { play: 'Product', stage: 'Market' },
  { play: 'Business', stage: 'Infrastructure' },
  { play: 'Goal', stage: 'Path' },
  { play: 'Script', stage: 'Theatre' },
  { play: 'Song', stage: 'Venue' },
  { play: 'Painting', stage: 'Gallery' },
  { play: 'Vision', stage: 'Foundation' },
  { play: 'Story', stage: 'Audience' },
  { play: 'Play', stage: 'Stage' },
];
import { 
  BenefitCard, 
  useBenefitAccumulator, 
  ProgressiveSection,
  ProgressiveContainer,
  type BenefitItem 
} from '@/components/progressive';
import { saveGhostBeacon } from '@/lib/beacons';
import { PathwayNavigator } from '@/components/PathwayNavigator';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';

const PRODUCTION_LEVELS = [
  { level: 0, state: 'Concept', credits: '0', multiplier: 'N/A', risk: 'Pre-listing', color: 'bg-slate-500/20' },
  { level: 1, state: 'Pre-Mint', credits: '0-99', multiplier: '5x', risk: 'Highest', color: 'bg-red-500/20' },
  { level: 2, state: 'Minted', credits: '100-999', multiplier: '3x', risk: 'High', color: 'bg-orange-500/20' },
  { level: 3, state: 'Production', credits: '1,000-4,999', multiplier: '2x', risk: 'Moderate', color: 'bg-yellow-500/20' },
  { level: 4, state: 'Distribution', credits: '5,000-9,999', multiplier: '1.5x', risk: 'Lower', color: 'bg-emerald-500/20' },
  { level: 5, state: 'Established', credits: '10,000+', multiplier: '1x', risk: 'Lowest', color: 'bg-green-500/20' },
];

const VOLUME_DISCOUNTS = [
  { orders: '5+', discount: '5%' },
  { orders: '10+', discount: '10%' },
  { orders: '20+', discount: '15%' },
  { orders: '40+', discount: '20%' },
];

export default function BuildBusiness() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { benefits, addBenefit } = useBenefitAccumulator();
  const { isBuilderModeActive } = useBuilderMode();
  const [currentSection, setCurrentSection] = useState(0);
  const [benefitCardExpanded, setBenefitCardExpanded] = useState(false);
  const totalSections = 5;
  
  // Spinning word wheel state
  const [wordIndex, setWordIndex] = useState(0);
  const [showStage, setShowStage] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Flip card states
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  
  const toggleFlip = (cardId: string) => {
    setFlippedCards(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Run the spinning word wheel animation on mount
  useEffect(() => {
    if (animationComplete) return;
    
    const totalPairs = WORD_PAIRS.length;
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;
    
    const spinNext = () => {
      currentIndex++;
      setWordIndex(currentIndex);
      
      // Show stage row after halfway
      if (currentIndex > totalPairs / 2) {
        setShowStage(true);
      }
      
      // Stop at the end
      if (currentIndex >= totalPairs - 1) {
        setAnimationComplete(true);
        return;
      }
      
      // Schedule next spin with SLOWER delay so users can read each word
      // Base delay of 400ms + increasing delay for slot machine slowdown effect
      const delay = 400 + (currentIndex * 80);
      timeoutId = setTimeout(spinNext, delay);
    };
    
    // Start the animation after a brief delay
    timeoutId = setTimeout(spinNext, 800);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [animationComplete]);

  const handleBeaconDrop = (sectionId: string, note: string) => {
    saveGhostBeacon({
      sectionId,
      pageUrl: window.location.href,
      note,
    });
  };

  const handleBenefitUnlock = (benefit: BenefitItem) => {
    addBenefit(benefit);
    setCurrentSection(prev => prev + 1);
  };

  return (
    <PortalPageLayout variant="stage" maxWidth="xl" xrayId="build-business">
      {/* Breadcrumb */}
      <nav className="px-6 pt-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Link to="/portal" className="hover:text-slate-300 transition-colors">Portal</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300">Build a Business</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6"
          >
            <Building2 className="w-5 h-5 text-emerald-400" />
            <span className="text-emerald-300 font-medium">Build a Business</span>
          </motion.div>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            {/* Row 1: You Have a [Play]. */}
            <h1 className="text-4xl md:text-6xl font-bold text-white flex items-baseline justify-center gap-0">
              <span>You Have a</span>
              <span className="inline-flex items-baseline">
                <span className="w-2 md:w-3"></span>
                <motion.span
                  key={wordIndex}
                  initial={{ y: -10, opacity: 0.5, filter: 'blur(2px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  className={`inline-block text-left ${
                    animationComplete ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {WORD_PAIRS[Math.min(wordIndex, WORD_PAIRS.length - 1)].play}
                </motion.span>
                <span className="text-white">.</span>
              </span>
            </h1>
            
            {/* Row 2: I Have a [Stage]. - Same size as row 1 */}
            <AnimatePresence mode="wait">
              {showStage && (
                <motion.h1
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-4xl md:text-6xl font-bold mt-4 flex items-baseline justify-center gap-0"
                >
                  <span className="text-emerald-400">I Have a</span>
                  <span className="inline-flex items-baseline">
                    <span className="w-2 md:w-3"></span>
                    <motion.span
                      key={`stage-${wordIndex}`}
                      initial={{ y: -10, opacity: 0.5, filter: 'blur(2px)' }}
                      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                      className={`inline-block text-left ${
                        animationComplete ? 'text-amber-400' : 'text-emerald-300'
                      }`}
                    >
                      {WORD_PAIRS[Math.min(wordIndex, WORD_PAIRS.length - 1)].stage}
                    </motion.span>
                    <span className="text-emerald-400">.</span>
                  </span>
                </motion.h1>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
          >
            Launch your Keep for $5. Same terms as the Founder — no special treatment, 
            no executive privilege. Your ship, Captain — your rules.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('start-project')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
            >
              Start Your Project
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/factory')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20"
            >
              Browse Examples
            </button>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="w-8 h-8 text-white/30" />
        </motion.div>
      </section>

      <ProgressiveContainer>
        {/* Section B1: Start Your Project */}
        <ProgressiveSection
          id="start-project"
          title="Start Your Project"
          subtitle="Products, services, ideas — launch them all"
          sectionNumber={1}
          totalSections={totalSections}
          benefit={{ id: 'launch-business', text: 'Launch your business for $5/year', category: 'business' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          className="bg-gradient-to-b from-transparent to-emerald-500/5"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Flippable Card: What You Can Build */}
            <div 
              className="relative cursor-pointer group"
              style={{ perspective: '1000px', minHeight: '280px' }}
              onClick={() => toggleFlip('what-build')}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedCards['what-build'] ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 p-6 rounded-xl bg-white/5 border border-white/10 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Package className="w-10 h-10 text-emerald-400" />
                    <span className="text-xs text-white/40 group-hover:text-white/60">Click to flip →</span>
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-3">What You Can Build</h4>
                  <ul className="space-y-2 text-white/70">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Physical products (manufacturing, crafts)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Digital products (software, courses)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Services (consulting, design, development)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Food businesses (Let's Make Dinner, Let's Make Bread)
                    </li>
                  </ul>
                </div>
                {/* Back */}
                <div 
                  className="absolute inset-0 p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-emerald-500/30"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <h4 className="text-xl font-semibold text-emerald-400 mb-3">How It Works</h4>
                  <p className="text-white/80 mb-4">
                    You set up your "Keep" — your own business within the platform. You control pricing, branding, and operations.
                  </p>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>✅ Use platform infrastructure (payments, storefronts)</li>
                    <li>✅ Access cooperative buying power</li>
                    <li>✅ Hire help via bounties</li>
                    <li>✅ Keep 83.3% of everything you make</li>
                  </ul>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/factory'); }}
                    className="mt-4 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-400 text-sm hover:bg-emerald-500/30"
                  >
                    See Examples →
                  </button>
                </div>
              </motion.div>
            </div>
            
            {/* Flippable Card: The Deal */}
            <div 
              className="relative cursor-pointer group"
              style={{ perspective: '1000px', minHeight: '280px' }}
              onClick={() => toggleFlip('the-deal')}
            >
              <motion.div
                className="relative w-full h-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateY: flippedCards['the-deal'] ? 180 : 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-semibold text-white">The Deal</h4>
                    <span className="text-xs text-white/40 group-hover:text-white/60">Click to flip →</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">You keep:</span>
                      <span className="text-3xl font-bold text-amber-400">83.3%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Platform margin:</span>
                      <span className="text-lg text-white font-semibold">Cost + 20%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Startup cost:</span>
                      <span className="text-lg text-white font-semibold">$5/year membership</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-emerald-200">
                    Same terms as the Founder. No special treatment.
                  </p>
                </div>
                {/* Back */}
                <div 
                  className="absolute inset-0 p-6 rounded-xl bg-gradient-to-br from-amber-900/30 to-slate-900 border border-amber-500/30"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <h4 className="text-xl font-semibold text-amber-400 mb-3">Why 83.3%?</h4>
                  <p className="text-white/80 mb-3">
                    On a $500 sale, you get <strong className="text-amber-400">$416.67</strong>. The platform takes $83.33 (Cost + 20%).
                  </p>
                  <p className="text-white/70 text-sm mb-4">
                    Compare to other platforms: Amazon (30-45%), Etsy (15-20%), App Store (30%).
                  </p>
                  <div className="p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <p className="text-amber-200 text-sm">
                      <strong>Locked forever:</strong> The 20% margin is in the operating agreement. It cannot be changed.
                    </p>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate('/under-the-hood/cost-plus-twenty'); }}
                    className="mt-4 px-4 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-400 text-sm hover:bg-amber-500/30"
                  >
                    Learn More →
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-2">Post Bounties to Hire Help</h4>
            <p className="text-white/60 text-sm">
              Need design? Development? Marketing? Post bounties in The Salt Mines and 
              hire talent using Credits. They keep 83.3% too.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section B2: Production Levels */}
        <ProgressiveSection
          id="production-levels"
          title="6 Production Levels"
          subtitle="Early backers get higher multipliers"
          sectionNumber={2}
          totalSections={totalSections}
          benefit={{ id: 'early-rewards', text: 'Higher rewards for early commitment', category: 'business' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Voting System', href: 'https://cephas.lianabanyan.com/under-the-hood/voting-system' },
          ]}
        >
          <div className="space-y-3">
            {PRODUCTION_LEVELS.map((level, idx) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-4 rounded-xl ${level.color} border border-white/10`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                      {level.level}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{level.state}</h4>
                      <p className="text-sm text-white/60">{level.credits} Credits</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{level.multiplier}</div>
                    </div>
                    {level.level > 0 && (
                      <button
                        onClick={() => navigate('/plant-seeds')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-medium hover:bg-primary/30 transition-colors whitespace-nowrap"
                      >
                        <Sprout className="w-3.5 h-3.5" /> Pledge
                      </button>
                    )}
                  </div>
                </div>
                {isBuilderModeActive && (
                  <div className="mt-2 ml-14 text-xs text-white/50 border-t border-white/5 pt-2">
                    {level.risk} risk · {level.credits} credits pledged to reach this tier
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {isBuilderModeActive && (
            <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-emerald-200 text-sm">
                <strong>X-Ray:</strong> Early backers get higher multipliers because they take more risk.
                Pre-Mint (5x) rewards those who believe before proof exists.
              </p>
            </div>
          )}
        </ProgressiveSection>

        {/* Section B3: Volume Discounts */}
        <ProgressiveSection
          id="volume-discounts"
          title="Volume Discounts"
          subtitle="The more who join, the more everyone saves"
          sectionNumber={3}
          totalSections={totalSections}
          benefit={{ id: 'community-buying', text: 'Community buying power', category: 'business' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {VOLUME_DISCOUNTS.map((tier, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-3xl font-bold text-primary mb-2">{tier.discount}</div>
                <div className="text-sm text-white/60">{tier.orders} orders</div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/10 border border-blue-500/30">
            <Users className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="font-semibold text-white mb-2">Aggregated Demand</h4>
            <p className="text-white/70">
              When neighbors order the same product, demand aggregates automatically. 
              More orders = lower per-unit cost = savings passed to everyone.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section B4: Early Backer Joules */}
        <ProgressiveSection
          id="early-backer-joules"
          title="Early Backer Joules"
          subtitle="Surplus returns as Forever Stamps"
          sectionNumber={4}
          totalSections={totalSections}
          benefit={{ id: 'surplus-joules', text: 'Surplus returns as Forever Stamps', category: 'business' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Joules Economics', href: 'https://cephas.lianabanyan.com/under-the-hood/joules-economics-model-a' },
            { label: 'Forex Ratchet', href: 'https://cephas.lianabanyan.com/under-the-hood/forex-ratchet-valuation' },
          ]}
        >
          <div className="p-6 rounded-xl bg-slate-800/50 border border-white/10 mb-8">
            <h4 className="font-semibold text-white mb-4">The Flow</h4>
            <div className="space-y-4">
              {[
                { step: 1, text: 'You pre-order at $150 for a product that will retail at $100' },
                { step: 2, text: 'Volume discount kicks in as more people order' },
                { step: 3, text: 'Final cost to produce: $80' },
                { step: 4, text: 'You paid $150, product costs $80' },
                { step: 5, text: '$70 surplus → 70 Joules (locked-value service credits)', highlight: true },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`flex items-start gap-4 ${item.highlight ? 'p-3 rounded-lg bg-primary/20 border border-primary/30' : ''}`}
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {item.step}
                  </div>
                  <p className={`text-white/80 ${item.highlight ? 'text-primary font-medium' : ''}`}>
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Zap className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Forever Stamp Mechanic</h4>
              <p className="text-sm text-white/70">
                Those Joules lock in value at earning time. If platform grows, 
                they buy MORE services later. Value only ratchets UP.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <TrendingUp className="w-8 h-8 text-violet-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Early Believer Bonus</h4>
              <p className="text-sm text-white/70">
                Pre-Mint backers get 5x multiplier on their Joules. 
                Risk early, reward proportionally.
              </p>
            </div>
          </div>
        </ProgressiveSection>

        {/* Section B5: THE CRESCENDO */}
        <ProgressiveSection
          id="the-pitch"
          title="The Pitch"
          subtitle="Everything above. $5/year."
          sectionNumber={5}
          totalSections={totalSections}
          isLast={true}
          onBeaconDrop={handleBeaconDrop}
        >
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-green-500/20 to-teal-500/20 border border-emerald-500/30">
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">🏰</span>
                <h3 className="text-3xl font-bold text-white mb-2">Build Your Keep</h3>
                <p className="text-white/60">Same terms as the Founder</p>
              </div>
              
              <div className="space-y-3 mb-8">
                {benefits.map((benefit, idx) => (
                  <motion.div
                    key={benefit.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 text-white/80"
                  >
                    <Sparkles className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                    <span>{benefit.text}</span>
                  </motion.div>
                ))}
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-primary">83.3%</div>
                  <div className="text-xs text-white/50">You keep</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-primary">6</div>
                  <div className="text-xs text-white/50">Production levels</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-primary">5x</div>
                  <div className="text-xs text-white/50">Early multiplier</div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 mb-6">
                <p className="text-white text-center">
                  <strong>PLUS:</strong> I'm personally offering you part of MY patents.<br />
                  <span className="text-primary text-xl font-bold">60%</span> of my entire portfolio goes to the Platform.<br />
                  You become a member. You own part of that 60%.
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (!user) {
                    openOnboard({
                      reason: "start building your business",
                      actionLabel: "Go to Dashboard",
                      membershipIncluded: true,
                      onComplete: () => navigate('/dashboard'),
                    });
                  } else {
                    navigate('/dashboard');
                  }
                }}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-500/90 hover:to-green-500/90 text-white text-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Unlock className="w-6 h-6" />
                Start Building for $5/year
              </button>
            </div>
          </div>
        </ProgressiveSection>

        {/* Continue Your Journey - Progressive Disclosure Navigation */}
        <ProgressiveSection id="pathway-nav" title="Continue Your Journey" icon="🧭">
          <div className="max-w-4xl mx-auto">
            <PathwayNavigator maxPaths={2} showProgress={true} showThreePack={true} />
          </div>
        </ProgressiveSection>
      </ProgressiveContainer>

      {/* Floating Benefit Card */}
      <BenefitCard
        benefits={benefits}
        currentSection={currentSection}
        totalSections={totalSections}
        isExpanded={benefitCardExpanded}
        onToggleExpand={() => setBenefitCardExpanded(!benefitCardExpanded)}
        onJoinClick={() => navigate('/auth')}
      />
    </PortalPageLayout>
  );
}
