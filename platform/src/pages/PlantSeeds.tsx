/**
 * Plant Seeds - Progressive Disclosure Track
 * 
 * Pre-ordering, backing projects, multiplier system
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sprout, Vote, Layers, TrendingUp, Gift,
  ArrowRight, Sparkles, Unlock, ChevronDown, Key,
  Users, Coins, Star, Award
} from 'lucide-react';
import { 
  BenefitCard, 
  useBenefitAccumulator, 
  ProgressiveSection,
  ProgressiveContainer,
  type BenefitItem 
} from '@/components/progressive';
import { saveGhostBeacon } from '@/lib/beacons';
import { PathwayNavigator } from '@/components/PathwayNavigator';

import { LarkWrapper } from '@/components/builder/LarkWrapper';

const PRODUCTION_LEVELS_BACKER = [
  { level: 1, state: 'Pre-Mint', joules: '5x', description: 'Highest risk, highest reward', color: 'text-red-400' },
  { level: 2, state: 'Minted', joules: '3x', description: 'Proof of concept validated', color: 'text-orange-400' },
  { level: 3, state: 'Production', joules: '2x', description: 'Manufacturing underway', color: 'text-yellow-400' },
  { level: 4, state: 'Distribution', joules: '1.5x', description: 'Shipping to backers', color: 'text-emerald-400' },
  { level: 5, state: 'Established', joules: '1x', description: 'Ongoing operations', color: 'text-green-400' },
];

const MULTIPLIER_TYPES = [
  { type: 'Timing', range: '1x-5x', basedOn: 'Production level', icon: '⏱️' },
  { type: 'Mark Level', range: '1x-2x', basedOn: 'Your reputation', icon: '⭐' },
  { type: 'Outlet', range: '1x-5x', basedOn: 'Publication tier', icon: '📰' },
  { type: 'Golden Key', range: '1x-1.5x', basedOn: 'Discovery bonus', icon: '🔑' },
  { type: 'First 100', range: '1x-2x', basedOn: 'Early member bonus', icon: '🏆' },
];

export default function PlantSeeds() {
  const navigate = useNavigate();
  const { benefits, addBenefit } = useBenefitAccumulator();
  const [currentSection, setCurrentSection] = useState(0);
  const [benefitCardExpanded, setBenefitCardExpanded] = useState(false);
  const totalSections = 5;

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-6 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-violet-500/10 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6"
          >
            <Sprout className="w-5 h-5 text-violet-400" />
            <span className="text-violet-300 font-medium">Plant Seeds</span>
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Back Early. <span className="text-primary">Earn More.</span>
          </motion.h1>
          
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
          >
            Support projects early and receive 5× the Joules. More collateral, 
            more governance weight. 
            
            <LarkWrapper componentId="plant-seeds-explainer" bountyCredits={50} className="inline-block mt-4 w-full">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 text-left">
                <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  "Help others succeed, own a piece of that success."
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  What does this actually mean? When you plant seeds (sponsor a project), you aren't just donating. You are acquiring <strong>Joules</strong> (Platform Service Vouchers) and fractional IP participation in the Liana Banyan ecosystem.
                </p>
                <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-700/50">
                  <p className="text-xs text-slate-400 mb-3">
                    <strong>The Medallion System:</strong> Every contribution is tracked on our immutable ledger. We call this "Test-Net By Design." You can view the actual bank transactions proving this system works on our <a href="/public-ledger" className="text-violet-400 hover:underline">"Fly on the Wall" Public Ledger</a>. 
                  </p>
                  <p className="text-xs text-slate-400 mb-3">
                    <strong>Predicting the Market:</strong> We don't guess the market. We pre-order everything. With 50% machine capacity and after-the-fact Cost+20% pricing, the only thing that can disrupt us is an "Act of God". In an era of tariff wars and supply chain gaffes, our decentralized local manufacturing network solves the crisis.
                  </p>
                  <p className="text-xs text-slate-400">
                    <strong>SEC Compliance & Crowdfunding:</strong> When we use third-party sites like Kickstarter, we are offering <em>Rewards</em> (Joules/Utility Vouchers). Kickstarter strictly prohibits offering equity or fractional IP ownership. To legally offer fractional IP ownership under Regulation Crowdfunding (Reg CF) of the JOBS Act, we must use registered equity portals (like Wefunder or Republic) who handle the SEC Form C filings, or manage it internally through our compliant cooperative revenue-share structure.
                  </p>
                </div>
              </div>
            </LarkWrapper>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('pre-order')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
            >
              Browse Projects
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/sponsor')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20"
            >
              Sponsor Members
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
        {/* Section P1: Pre-Order Products */}
        <ProgressiveSection
          id="pre-order"
          title="Pre-Order Products"
          subtitle="Back ideas before they're real"
          sectionNumber={1}
          totalSections={totalSections}
          benefit={{ id: 'back-early', text: 'Back ideas before they\'re real', category: 'seeds' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          className="bg-gradient-to-b from-transparent to-violet-500/5"
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Vote className="w-10 h-10 text-violet-400 mb-4" />
              <h4 className="text-xl font-semibold text-white mb-3">How It Works</h4>
              <ul className="space-y-3 text-white/70">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">1</span>
                  <span>Browse projects at various production levels</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">2</span>
                  <span>Vote with Credits to advance production</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">3</span>
                  <span>Early backers get multiplier bonuses</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs text-violet-300 flex-shrink-0">4</span>
                  <span>"Soft pledges" convert when threshold met</span>
                </li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30">
              <h4 className="text-xl font-semibold text-white mb-3">Why Back Early?</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/30 flex items-center justify-center">
                    <span className="text-2xl font-bold text-violet-300">5x</span>
                  </div>
                  <div>
                    <div className="font-medium text-white">Pre-Mint Multiplier</div>
                    <div className="text-sm text-white/60">Highest risk = highest reward</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-violet-500/30 flex items-center justify-center">
                    <Key className="w-6 h-6 text-violet-300" />
                  </div>
                  <div>
                    <div className="font-medium text-white">Fractional IP Participation</div>
                    <div className="text-sm text-white/60">Participate in what you help build</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ProgressiveSection>

        {/* Section P2: Back Projects (Sponsor Others) */}
        <ProgressiveSection
          id="sponsor-others"
          title="Back Projects"
          subtitle="The 1/3, 1/3, 1/3 Rule"
          sectionNumber={2}
          totalSections={totalSections}
          benefit={{ id: 'own-part', text: 'Participate in what you help build', category: 'seeds' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Sponsor to Own', href: 'https://cephas.lianabanyan.com/under-the-hood/sponsor-to-own' },
          ]}
        >
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { fraction: '1/3', label: 'Funds the project directly', icon: <Gift className="w-6 h-6" />, color: 'from-emerald-500/20' },
              { fraction: '1/3', label: 'Platform operations', icon: <Layers className="w-6 h-6" />, color: 'from-blue-500/20' },
              { fraction: '1/3', label: 'Your IP participation', icon: <Key className="w-6 h-6" />, color: 'from-violet-500/20' },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-xl bg-gradient-to-br ${item.color} to-transparent border border-white/10 text-center`}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 text-primary mb-3">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{item.fraction}</div>
                <div className="text-sm text-white/60">{item.label}</div>
              </motion.div>
            ))}
          </div>
          
          <div className="p-6 rounded-xl bg-slate-800/50 border border-white/10">
            <h4 className="font-semibold text-white mb-3">Key Message</h4>
            <p className="text-lg text-white/80 italic">
              "When you help someone else succeed, you participate in that success."
            </p>
            <p className="mt-4 text-white/60">
              Your contribution is recorded on the immutable IP ledger. As the project grows, 
              your fractional participation grows with it.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section P3: 6 Production Levels (Voting) */}
        <ProgressiveSection
          id="production-voting"
          title="6 Production Levels"
          subtitle="From backer perspective"
          sectionNumber={3}
          totalSections={totalSections}
          benefit={{ id: 'multipliers-reward', text: 'Multipliers reward early believers', category: 'seeds' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Voting System', href: 'https://cephas.lianabanyan.com/under-the-hood/voting-system' },
          ]}
        >
          <div className="space-y-3">
            {PRODUCTION_LEVELS_BACKER.map((level, idx) => (
              <motion.div
                key={level.level}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-white">
                    {level.level}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{level.state}</h4>
                    <p className="text-sm text-white/60">{level.description}</p>
                  </div>
                </div>
                <div className={`text-2xl font-bold ${level.color}`}>
                  {level.joules} Joules
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <p className="text-violet-200">
              <strong>The Earlier You Believe, The More You Earn.</strong> Pre-Mint backers 
              take the biggest risk — and get the biggest reward when the project succeeds.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section P4: Multiplier System */}
        <ProgressiveSection
          id="multiplier-system"
          title="Multiplier System"
          subtitle="Stack them for massive service value"
          sectionNumber={4}
          totalSections={totalSections}
          benefit={{ id: 'multipliers-stack', text: 'Multipliers stack for massive service value', category: 'seeds' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
        >
          <div className="overflow-x-auto mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Range</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Based On</th>
                </tr>
              </thead>
              <tbody>
                {MULTIPLIER_TYPES.map((mult, idx) => (
                  <motion.tr
                    key={idx}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{mult.icon}</span>
                        <span className="text-white font-medium">{mult.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-primary font-bold">{mult.range}</td>
                    <td className="py-3 px-4 text-white/70">{mult.basedOn}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
            <h4 className="font-semibold text-white mb-4">Example Stack</h4>
            <div className="flex flex-wrap items-center gap-2 text-lg">
              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-300">Pre-Mint (5x)</span>
              <span className="text-white/40">×</span>
              <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300">Mark Level (1.5x)</span>
              <span className="text-white/40">×</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300">First 100 (2x)</span>
              <span className="text-white/40">=</span>
              <span className="px-4 py-2 rounded-full bg-primary text-white font-bold text-xl">15x multiplier</span>
            </div>
          </div>
        </ProgressiveSection>

        {/* Section P5: THE CRESCENDO */}
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
            <div className="p-8 rounded-2xl bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-fuchsia-500/20 border border-violet-500/30">
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">🌱</span>
                <h3 className="text-3xl font-bold text-white mb-2">Plant Your Seeds</h3>
                <p className="text-white/60">Watch them grow into forests</p>
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
                  <div className="text-2xl font-bold text-primary">5x</div>
                  <div className="text-xs text-white/50">Pre-Mint bonus</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-primary">15x</div>
                  <div className="text-xs text-white/50">Max multiplier</div>
                </div>
                <div className="text-center p-4 rounded-xl bg-white/5">
                  <div className="text-2xl font-bold text-primary">1/3</div>
                  <div className="text-xs text-white/50">IP participation</div>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 mb-6">
                <p className="text-white text-center">
                  <strong>PLUS:</strong> I'm personally offering you part of MY patents.<br />
                  <span className="text-primary text-xl font-bold">60%</span> of my entire portfolio goes to the Platform.<br />
                  You become a member. You participate in that 60%.
                </p>
              </div>
              
              <button
                onClick={() => navigate('/auth')}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-500/90 hover:to-purple-500/90 text-white text-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Unlock className="w-6 h-6" />
                Start Planting for $5/year
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
    </div>
  );
}
