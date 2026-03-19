/**
 * The Salt Mines - Fulfill a Bounty Progressive Disclosure
 * 
 * One of the six halls in the Hexagon Senate.
 * Progressive disclosure from bounties → patent ownership → $5 membership
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Shield, Database, Palette, Key,
  Share2, Users, Stamp, Scale, Gift, ArrowRight,
  ExternalLink, Sparkles, Lock, Unlock, ChevronDown,
  Code, PenTool, Video, Music, Box, MapPin, RotateCcw, Info
} from 'lucide-react';
import { FableFlipbook } from '@/components/FableFlipbook';
import { useAuth } from '@/contexts/AuthContext';
import { useSeamlessOnboard } from '@/components/SeamlessOnboardDialog';
import { 
  BenefitCard, 
  useBenefitAccumulator, 
  ProgressiveSection,
  ProgressiveContainer,
  type BenefitItem 
} from '@/components/progressive';
import { saveGhostBeacon, emailBeacon } from '@/lib/beacons';
import { BeaconDropButton } from '@/components/BeaconDropButton';
import { PathwayNavigator } from '@/components/PathwayNavigator';
import { usePathwayProgress } from '@/contexts/PathwayProgressContext';

const BOUNTY_CATEGORIES = [
  { 
    name: 'Design', 
    icon: '🎨', 
    lucideIcon: Palette,
    credits: '500-2000', 
    bounties: 0,
    description: 'UI/UX, graphics, branding, illustrations',
    examples: ['Landing page mockups', 'Logo design', 'Icon sets', 'Marketing materials'],
    link: '/help-wanted'
  },
  { 
    name: 'Development', 
    icon: '💻', 
    lucideIcon: Code,
    credits: '1000-5000', 
    bounties: 0,
    description: 'Web, mobile, backend, integrations',
    examples: ['React components', 'API integrations', 'Bug fixes', 'Feature builds'],
    link: '/help-wanted'
  },
  { 
    name: 'Writing', 
    icon: '✍️', 
    lucideIcon: PenTool,
    credits: '200-1000', 
    bounties: 0,
    description: 'Content, copy, documentation, scripts',
    examples: ['Blog posts', 'Documentation', 'Video scripts', 'Email sequences'],
    link: '/help-wanted'
  },
  { 
    name: 'Local Expert', 
    icon: '🗺️', 
    lucideIcon: MapPin,
    credits: '50-500', 
    bounties: 24,
    description: 'Gather local pricing data to enable Volume Dumps',
    examples: ['Price check local print shops', 'Find communal kitchens', 'Verify local business hours'],
    link: '/salt-mines'
  },
  { 
    name: 'Local Fulfillment', 
    icon: '🖨️', 
    lucideIcon: Box,
    credits: '100-1500', 
    bounties: 14,
    description: '3D Printing, QR Deck Cards, Local Delivery',
    examples: ['Print 500 QR Cards', '3D Print HexIsle Medallions', 'Local Delivery Setup'],
    link: '/salt-mines'
  },
  { 
    name: 'Video', 
    icon: '🎬', 
    lucideIcon: Video,
    credits: '500-3000', 
    bounties: 0,
    description: 'Editing, motion graphics, tutorials',
    examples: ['Explainer videos', 'Social clips', 'Tutorials', 'Animations'],
    link: '/help-wanted'
  },
  { 
    name: 'Audio', 
    icon: '🎵', 
    lucideIcon: Music,
    credits: '300-1500', 
    bounties: 0,
    description: 'Music, podcasts, voiceover, sound design',
    examples: ['Podcast editing', 'Jingles', 'Voiceover', 'Sound effects'],
    link: '/help-wanted'
  },
  { 
    name: '3D/CAD', 
    icon: '📐', 
    lucideIcon: Box,
    credits: '800-4000', 
    bounties: 0,
    description: 'Modeling, rendering, product design',
    examples: ['Product renders', '3D printing files', 'Architectural viz', 'Game assets'],
    link: '/help-wanted'
  },
  { 
    name: 'Physical Printing', 
    icon: '🖨️', 
    lucideIcon: Box,
    credits: '1000-5000', 
    bounties: 0,
    description: 'Volume dump print bounties for QR Cue Cards',
    examples: ['Business cards', 'NFC plastic cards', 'Metal cards', 'Stickers'],
    link: '/help-wanted'
  },
];

const CROWN_JEWELS = [
  { name: 'The 300 Governance', description: 'Fixed-capacity governance with DNA Lock protection' },
  { name: 'Harper Certification', description: 'Peer verification without central authority' },
  { name: 'Tab System', description: 'Micro-credit for trust-based transactions' },
  { name: 'Three-Gear Currency', description: 'Credits, Marks, Joules working in harmony' },
  { name: 'DNA Lock', description: 'Constitutional protection against hostile changes' },
  { name: 'Position Funding', description: 'Hire positions, not people' },
  { name: 'HIVI Valuation', description: 'History-based deterministic pricing' },
  { name: 'Forex Ratchet', description: 'Value that only goes up, never down' },
];

const CREATOR_TIERS = [
  { tier: 'A', yourShare: '49%', platformShare: '51%', control: 'Platform-first', benefit: 'Highest utilization, biggest pie' },
  { tier: 'B', yourShare: '60%', platformShare: '40%', control: 'Balanced', benefit: 'Best of both worlds' },
  { tier: 'C', yourShare: '75%', platformShare: '25%', control: 'Creator-first', benefit: 'Maximum control' },
];

// Flippable Bounty Card Component
interface BountyCategory {
  name: string;
  icon: string;
  lucideIcon: React.ElementType;
  credits: string;
  bounties: number;
  description: string;
  examples: string[];
  link: string;
}

function FlippableBountyCard({ category, delay }: { category: BountyCategory; delay: number }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();
  const Icon = category.lucideIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative cursor-pointer"
      style={{ perspective: '1000px', minHeight: '180px' }}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full h-full"
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{category.icon}</span>
            <h3 className="font-semibold text-white text-lg">
              {category.name}
            </h3>
          </div>
          <p className="text-white/60 text-sm mb-3">{category.description}</p>
          <div className="flex justify-between text-sm">
            <span className="text-white/60">{category.bounties > 0 ? `${category.bounties} open bounties` : 'Coming soon'}</span>
            <span className="text-primary font-medium">{category.credits} Credits</span>
          </div>
          <div className="absolute bottom-2 right-2 text-white/20 text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> flip for details
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          onClick={() => setIsFlipped(false)}
        >
          <div className="flex items-center gap-2 mb-3">
            <Icon className="w-5 h-5 text-amber-400" />
            <h3 className="font-semibold text-white">{category.name} Bounties</h3>
          </div>
          <p className="text-xs text-white/70 mb-2">Example projects:</p>
          <ul className="text-xs text-white/80 space-y-1 mb-3">
            {category.examples.map((ex, i) => (
              <li key={i} className="flex items-center gap-1">
                <span className="text-amber-400">•</span> {ex}
              </li>
            ))}
          </ul>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(category.link);
            }}
            className="w-full py-2 px-3 text-xs rounded-lg bg-amber-500/30 hover:bg-amber-500/50 text-amber-200 font-medium transition-colors"
          >
            Browse {category.name} Bounties →
          </button>
          <div className="absolute bottom-2 right-2 text-white/20 text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> flip back
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SaltMines() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();
  const { benefits, addBenefit } = useBenefitAccumulator();
  const [currentSection, setCurrentSection] = useState(0);
  const [benefitCardExpanded, setBenefitCardExpanded] = useState(false);
  const totalSections = 12;

  const handleBeaconDrop = (sectionId: string, note: string) => {
    const beacon = saveGhostBeacon({
      sectionId,
      pageUrl: window.location.href,
      note,
    });
    
    // Optionally email
    if (user?.email) {
      emailBeacon(beacon, user.email);
    }
  };

  const handleBenefitUnlock = (benefit: BenefitItem) => {
    addBenefit(benefit);
    setCurrentSection(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Entrance Artwork - By the Founder's Son */}
      <section className="relative">
        <div className="relative w-full max-w-4xl mx-auto">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            src="/images/salt-mines-entrance.png"
            alt="Salt Mines Entrance - Artwork by the Founder's Son"
            className="w-full h-auto"
          />
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5">
            <p className="text-xs text-amber-300">Artwork by the Founder's Son</p>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-6 py-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center max-w-4xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30 mb-6"
          >
            <Briefcase className="w-5 h-5 text-amber-400" />
            <span className="text-amber-300 font-medium">The Salt Mines</span>
          </motion.div>
          
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Fulfill a Bounty. Keep <span className="text-primary">83.3%</span>.
          </motion.h1>
          
          <motion.p
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
          >
            Real work. Real pay. No middleman taking half. Browse bounties, 
            post your own, and discover why this platform exists. You are an independent participant. The platform does not dictate your hours, methods, or guarantee bounty acceptance.
          </motion.p>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button
              onClick={() => document.getElementById('bounty-board')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2"
            >
              Browse Bounties
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/factory')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20"
            >
              Post a Bounty
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
        {/* Section 0: The Story - Little Red Hen Flipbook */}
        <ProgressiveSection
          id="the-story"
          title="The Story"
          subtitle="Why we built this — in 26 drawings by my son"
          sectionNumber={1}
          totalSections={totalSections}
          benefit={{ id: 'story-understood', text: 'Understand the cooperative vision', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          className="bg-gradient-to-b from-transparent to-amber-500/5"
        >
          <div className="max-w-3xl mx-auto">
            <FableFlipbook 
              autoPlay={false}
              interval={4000}
              showControls={true}
              onComplete={() => {
                document.getElementById('bounty-board')?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            
            <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <p className="text-amber-200">
                <strong>The moral:</strong> When we work together, everyone gets bread.<br />
                <span className="text-white/60 text-sm">Drawings by my son. Story by generations. Platform by us.</span>
              </p>
            </div>
          </div>
        </ProgressiveSection>

        {/* Section 1: Bounty Board */}
        <ProgressiveSection
          id="bounty-board"
          title="The Bounty Board"
          subtitle="Real work, real Credits — $500-$2000+ value"
          sectionNumber={2}
          totalSections={totalSections}
          benefit={{ id: 'bounty-access', text: 'Access to all bounties', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          className="bg-gradient-to-b from-transparent to-amber-500/5"
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOUNTY_CATEGORIES.map((cat, idx) => (
              <FlippableBountyCard key={cat.name} category={cat} delay={idx * 0.1} />
            ))}
          </div>

          <div className="mt-12 p-6 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-amber-500" />
              <h3 className="text-2xl font-bold text-amber-500">The Three-Human Rule</h3>
            </div>
            <p className="text-slate-300 mb-6">
              To ensure quality and prevent AI slop, every bounty requires three humans: the <strong>Creator</strong> (who does the work), the <strong>Peer</strong> (who reviews it), and the <strong>Approver</strong> (who posted the bounty).
            </p>
            <div className="bg-black/20 p-4 rounded-lg border border-amber-500/20 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-amber-200/80">
                  <strong>Peer Review Protocol:</strong> Peers are assigned via randomized Noid routing to prevent collusion. Staked Marks are required to accept a Peer Review bounty. If the Approver rejects the work due to poor Peer review, the Peer's stake is slashed.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-4 mt-8">
              <Shield className="h-8 w-8 text-amber-500" />
              <h3 className="text-2xl font-bold text-amber-500">Captain's Collateral & Print Bounties</h3>
            </div>
            <p className="text-slate-300 mb-6">
              Captains lock their own Marks as collateral to back local print runs (QR Deck Cards, Medallions, etc.). 
              <strong> This is real money purchased.</strong> It acts exactly like a Bond to guarantee payment upon delivery, but without the expensive legal overhead that normally prevents small communities from organizing.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">Phoenix, AZ: 500 QR Cards</h4>
                  <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded">Level 6 Active</span>
                </div>
                <p className="text-sm text-slate-400 mb-4">Backed by Captain @MarcusT. 500 Marks locked.</p>
                <button className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-medium transition-colors">
                  Claim Print Bounty
                </button>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-white">Austin, TX: 50 Medallions</h4>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded">Level 2 Pending</span>
                </div>
                <p className="text-sm text-slate-400 mb-4">Backed by Captain @SarahJ. 150 Marks locked.</p>
                <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-medium transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-amber-200 text-center">
              <strong>500-2000 Credits = $500-$2000</strong> in real value. 
              You keep 83.3% of everything you earn.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 3: Patent Showcase */}
        <ProgressiveSection
          id="patent-showcase"
          title="Patent Showcase"
          subtitle="1,754 innovations. 8 Crown Jewels. Your competitive moat."
          sectionNumber={3}
          totalSections={totalSections}
          benefit={{ id: 'patent-access', text: 'Access to 1,754 documented innovations', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Crown Jewels Showcase', href: 'https://cephas.lianabanyan.com/verification/crown-jewels-showcase' },
            { label: 'Patent Portfolio', href: 'https://cephas.lianabanyan.com/under-the-hood/patent-portfolio' },
          ]}
        >
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-violet-500/20">
                <Shield className="w-8 h-8 text-violet-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">HexIsle IP</h3>
                <p className="text-white/60">91 innovations, 381+ claims</p>
              </div>
            </div>
          </div>

          <h4 className="text-lg font-semibold text-white mb-4">The Crown Jewels (Top 8)</h4>
          <div className="grid md:grid-cols-2 gap-3">
            {CROWN_JEWELS.map((jewel, idx) => (
              <motion.div
                key={jewel.name}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-amber-400 mt-1 flex-shrink-0" />
                  <div>
                    <h5 className="font-medium text-white">{jewel.name}</h5>
                    <p className="text-xs text-white/50">{jewel.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ProgressiveSection>

        {/* Section 4: Test-Net By Design */}
        <ProgressiveSection
          id="testnet-design"
          title="Test-Net By Design"
          subtitle="Blockchain for provenance, not speculation"
          sectionNumber={4}
          totalSections={totalSections}
          benefit={{ id: 'permanent-record', text: 'Your contributions are permanently recorded', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Blockchain IP Comparison', href: 'https://cephas.lianabanyan.com/under-the-hood/blockchain-ip-comparison' },
          ]}
        >
          <div className="p-6 rounded-xl bg-slate-800/50 border border-white/10">
            <Database className="w-10 h-10 text-blue-400 mb-4" />
            <blockquote className="text-lg text-white/80 italic mb-4">
              "We use blockchain strictly as an immutable ledger — for intellectual property 
              provenance, transaction audit trails, and internal valuation markers. Not on a 
              public mainnet. Not tradeable. Not redeemable for cash."
            </blockquote>
            <p className="text-white/60">
              The IP ledger facilitates FUTURE services and products when you fund OTHERS'
              businesses and get fractional usage rights to that I.P.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 5: Creator's Prerogative */}
        <ProgressiveSection
          id="creators-prerogative"
          title="Creator's Prerogative"
          subtitle="Choose your control vs. value balance"
          sectionNumber={5}
          totalSections={totalSections}
          benefit={{ id: 'control-choice', text: 'Choose your own control/value balance', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Derivatives & Collaboration', href: 'https://cephas.lianabanyan.com/under-the-hood/derivatives-collaboration' },
          ]}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Tier</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Your Share</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Platform</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Control</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Benefit</th>
                </tr>
              </thead>
              <tbody>
                {CREATOR_TIERS.map((tier, idx) => (
                  <tr key={tier.tier} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                        {tier.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium">{tier.yourShare}</td>
                    <td className="py-3 px-4 text-white/70">{tier.platformShare}</td>
                    <td className="py-3 px-4 text-white/70">{tier.control}</td>
                    <td className="py-3 px-4 text-primary text-sm">{tier.benefit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-200">
              <strong>Key Insight:</strong> More control = smaller pie. Less control = bigger pie. 
              Tier A earns MORE absolute dollars despite lower percentage.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 6: Arcade Tokens Argument */}
        <ProgressiveSection
          id="arcade-tokens"
          title="Arcade Tokens"
          subtitle="Valuable to anyone building a business"
          sectionNumber={6}
          totalSections={totalSections}
          benefit={{ id: 'purchasing-power', text: 'Real purchasing power for real services', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Three-Gear Currency', href: 'https://cephas.lianabanyan.com/under-the-hood/three-gear-currency' },
          ]}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Palette className="w-8 h-8 text-pink-400 mb-4" />
              <h4 className="font-semibold text-white mb-2">The Analogy</h4>
              <ul className="space-y-2 text-white/70">
                <li>• Arcade tokens work at THIS arcade</li>
                <li>• Walmart gift cards work at Walmart</li>
                <li>• Platform Credits work on THIS platform</li>
              </ul>
            </div>
            
            <div className="p-6 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary mb-4" />
              <h4 className="font-semibold text-white mb-2">The Point</h4>
              <p className="text-white/80">
                <strong>If you want to build a business, these ARE valuable.</strong>
                Credits buy real services: design, development, marketing, manufacturing.
              </p>
            </div>
          </div>

          {/* Barter Wash Tax Explainer */}
          <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-emerald-400" />
              <h3 className="text-xl font-bold text-emerald-300">The Barter Wash</h3>
            </div>
            <p className="text-white/80 mb-4">
              Yes, the IRS taxes barter income. If you earn 1,000 in Marks, that's taxable.{' '}
              <strong className="text-emerald-300">BUT</strong>, if you spend those 1,000 Marks to hire
              someone for your project, that's a deductible business expense.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-black/20 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-white mb-1">+1,000</div>
                <div className="text-xs text-white/60">Marks Earned</div>
                <div className="text-xs text-emerald-400">Taxable Income</div>
              </div>
              <div className="p-4 rounded-lg bg-black/20 border border-emerald-500/20 text-center">
                <div className="text-2xl font-bold text-white mb-1">−1,000</div>
                <div className="text-xs text-white/60">Marks Spent</div>
                <div className="text-xs text-emerald-400">Business Expense</div>
              </div>
              <div className="p-4 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-center">
                <div className="text-2xl font-bold text-emerald-300 mb-1">= $0</div>
                <div className="text-xs text-white/60">Net Tax Impact</div>
                <div className="text-xs text-emerald-400">The Barter Wash</div>
              </div>
            </div>
            <p className="text-sm text-white/60 italic">
              The platform tracks both sides automatically for you.
              Consult your own tax professional for advice specific to your situation.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 7: Ghost Mode Side Quests */}
        <ProgressiveSection
          id="ghost-quests"
          title="Ghost Mode Side Quests"
          subtitle="Games within the game"
          sectionNumber={7}
          totalSections={totalSections}
          benefit={{ id: 'ghost-games', text: 'Games within the game (Ghost Mode exclusive)', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Golden Key Puzzle', href: 'https://cephas.lianabanyan.com/under-the-hood/golden-key-puzzle' },
            { label: 'Ghost World Half-Life', href: 'https://cephas.lianabanyan.com/under-the-hood/ghost-world-half-life' },
          ]}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Key className="w-8 h-8 text-amber-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Golden Keys Hunt</h4>
              <p className="text-sm text-white/60">
                Hidden throughout platform documentation. Solve the "Help Each Other Help Ourselves" 
                puzzle. Earn Marks for discovery.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Share2 className="w-8 h-8 text-blue-400 mb-3" />
              <h4 className="font-semibold text-white mb-2">Media Blitz</h4>
              <p className="text-sm text-white/60">
                Published strategy anyone can follow. Cue Card triggers at milestones. 
                Transparency as competitive advantage.
              </p>
            </div>
            
            <div className="p-5 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <span className="text-3xl mb-3 block">🪶</span>
              <h4 className="font-semibold text-white mb-2">Ghost World Speedruns</h4>
              <p className="text-sm text-white/60">
                Crow Feathers (permanent achievements). Half-Life decay creates urgency. 
                "The crow remembers what the ghost forgets."
              </p>
            </div>
          </div>
        </ProgressiveSection>

        {/* Section 8: Cue Cards Introduction */}
        <ProgressiveSection
          id="cue-cards"
          title="Cue Cards"
          subtitle="Share with your world. Earn Credits."
          sectionNumber={8}
          totalSections={totalSections}
          benefit={{ id: 'earn-sharing', text: 'Earn by sharing (scheduled posts available)', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Sharing Cue Cards', href: 'https://cephas.lianabanyan.com/under-the-hood/sharing-cue-cards' },
          ]}
        >
          <div className="space-y-4">
            {[
              {
                title: 'You Have a Play. I Have a Stage.',
                content: 'Got a business idea? A product? A service? You have a play. I built a stage. $5/year gets you access to the aircraft carrier. Launch your airplane.',
                color: 'from-emerald-500/20 to-green-500/10',
              },
              {
                title: 'Own a Patent. Help Someone Join.',
                content: 'Sponsor 5 new members ($25). Receive fractional usage rights to 8+ utility patents. Help others = access something real.',
                color: 'from-violet-500/20 to-purple-500/10',
              },
              {
                title: 'Forever Stamps for Your Future',
                content: 'Joules lock in today\'s value forever. Like buying postage that never expires. Your work today creates service credits for tomorrow.',
                color: 'from-amber-500/20 to-orange-500/10',
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-5 rounded-xl bg-gradient-to-r ${card.color} border border-white/10`}
              >
                <h4 className="font-semibold text-white mb-2">"{card.title}"</h4>
                <p className="text-white/70 text-sm">{card.content}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="font-medium text-white mb-2">Member Benefits:</h4>
            <ul className="space-y-1 text-sm text-white/70">
              <li>• Share any document = <span className="text-primary">1 Credit</span></li>
              <li>• Share results in signup = <span className="text-primary">10 Credits</span></li>
              <li>• Share results in 5K sponsor = <span className="text-primary">500 Credits</span></li>
            </ul>
          </div>
        </ProgressiveSection>

        {/* Section 9: Sponsor Pitch */}
        <ProgressiveSection
          id="sponsor-pitch"
          title="The 1/3, 1/3, 1/3 Rule"
          subtitle="Help others. Own something real."
          sectionNumber={9}
          totalSections={totalSections}
          benefit={{ id: 'fractional-ip', text: 'Fractional patent usage rights when you sponsor', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Sponsor to Own', href: 'https://cephas.lianabanyan.com/under-the-hood/sponsor-to-own' },
          ]}
        >
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              { fraction: '1/3', label: 'Funds the project', icon: <Gift className="w-6 h-6" /> },
              { fraction: '1/3', label: 'Platform operations', icon: <Database className="w-6 h-6" /> },
              { fraction: '1/3', label: 'Your IP usage rights', icon: <Key className="w-6 h-6" /> },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-white/5 border border-white/10 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/20 text-primary mb-3">
                  {item.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{item.fraction}</div>
                <div className="text-sm text-white/60">{item.label}</div>
              </div>
            ))}
          </div>
          
          <div className="p-6 rounded-xl bg-gradient-to-r from-primary/20 to-purple-500/20 border border-primary/30">
            <h4 className="font-semibold text-white mb-2">5K SPONSOR Project</h4>
            <ul className="space-y-2 text-white/80">
              <li>• $5,000 sponsors 1,000 new members</li>
              <li>• Receive 0.25% usage rights in patent portfolio</li>
              <li>• Recorded NOW on immutable ledger</li>
            </ul>
            <p className="mt-4 text-primary font-medium">
              "Help others set up to help ourselves in the future"
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 10: Forever Stamp Value */}
        <ProgressiveSection
          id="forever-stamp"
          title="Forever Stamp Value"
          subtitle="Locked-in value that only ratchets UP"
          sectionNumber={10}
          totalSections={totalSections}
          benefit={{ id: 'locked-value', text: 'Locked-in value that only ratchets UP', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'Forex Ratchet Valuation', href: 'https://cephas.lianabanyan.com/under-the-hood/forex-ratchet-valuation' },
          ]}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <Stamp className="w-8 h-8 text-amber-400 mb-4" />
              <h4 className="font-semibold text-white mb-2">Service Coupon Framing</h4>
              <p className="text-white/70">
                "Your Joules today will still buy X hours of platform services in 10 years, 
                even if prices rise. Like Forever Stamps — always valid for one first-class letter."
              </p>
            </div>
            
            <div className="p-6 rounded-xl bg-white/5 border border-white/10">
              <span className="text-3xl mb-4 block">📈</span>
              <h4 className="font-semibold text-white mb-2">Historical Example</h4>
              <p className="text-white/70">
                "If the platform had existed 10 years ago, here's what early Joules would be 
                worth TODAY based on platform growth."
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-200 text-sm">
              <strong>NOT A GUARANTEE.</strong> Joules are platform service units, not investments. 
              Past performance does not predict future results.
            </p>
          </div>
        </ProgressiveSection>

        {/* Section 11: NOT SEC Explainer */}
        <ProgressiveSection
          id="not-sec"
          title="Why This Isn't Securities"
          subtitle="The Howey Test, explained"
          sectionNumber={11}
          totalSections={totalSections}
          benefit={{ id: 'legal-clarity', text: 'Legal clarity (not securities)', category: 'job' }}
          onBenefitUnlock={handleBenefitUnlock}
          onBeaconDrop={handleBeaconDrop}
          branchLinks={[
            { label: 'IP Load Balancing Academic', href: 'https://cephas.lianabanyan.com/academic/ip-load-balancing-academic' },
            { label: 'Aircraft Carrier IP Funding', href: 'https://cephas.lianabanyan.com/articles/aircraft-carrier-ip-funding' },
          ]}
        >
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Howey Element</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Required?</th>
                  <th className="text-left py-3 px-4 text-white/60 font-medium">Our Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { element: 'Investment of money', required: 'Yes', status: 'NO \u2014 Service purchase', pass: true },
                  { element: 'Common enterprise', required: 'Yes', status: 'NO \u2014 Personal property', pass: true },
                  { element: 'Expectation of profits', required: 'Yes', status: 'NO \u2014 Service access', pass: true },
                  { element: 'From efforts of others', required: 'Yes', status: 'NO \u2014 IP already exists', pass: true },
                ].map((row, idx) => (
                  <tr key={idx} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{row.element}</td>
                    <td className="py-3 px-4 text-white/70">{row.required}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-sm ${row.pass ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-6 rounded-xl bg-slate-800/50 border border-white/10">
            <Scale className="w-8 h-8 text-blue-400 mb-4" />
            <h4 className="font-semibold text-white mb-3">Key Points</h4>
            <ul className="space-y-2 text-white/70">
              <li>• These are MY patents (personal property)</li>
              <li>• I can sell, license, or give away my property</li>
              <li>• Joules are service credits, not financial instruments</li>
              <li>• External crowdfunding handles product sponsorship</li>
            </ul>
          </div>
        </ProgressiveSection>

        {/* Section 12: THE CRESCENDO */}
        <ProgressiveSection
          id="the-pitch"
          title="The Pitch"
          subtitle="Everything above. $5/year."
          sectionNumber={12}
          totalSections={totalSections}
          isLast={true}
          onBeaconDrop={handleBeaconDrop}
        >
          <div className="max-w-2xl mx-auto">
            <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-purple-500/20 to-violet-500/20 border border-primary/30">
              <div className="text-center mb-8">
                <span className="text-6xl mb-4 block">🎁</span>
                <h3 className="text-3xl font-bold text-white mb-2">For $5/year, you get:</h3>
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
              
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 mb-6">
                <p className="text-white text-center">
                  <strong>PLUS:</strong> I'm personally offering you part of MY patents.<br />
                  <span className="text-primary text-xl font-bold">60%</span> of my entire portfolio goes to the Platform.<br />
                  You become a member. You get usage rights to that 60%.
                </p>
              </div>
              
              <blockquote className="text-white/70 italic text-center mb-4">
                "I spent 37 years building this. I could have kept 100% of the patents.
                Instead, I'm giving 60% to the platform — which means to YOU, the members.
                80% of something built by a community beats 100% of something built alone."
              </blockquote>

              <p className="text-white/40 text-sm text-center italic mb-8">
                "Muzzle not the ox that treadeth out the corn, for the laborer is worthy of his hire."
              </p>
              
              <button
                onClick={() => openOnboard({ reason: "find work and earn", actionLabel: "Join", membershipIncluded: true })}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 text-white text-xl font-bold flex items-center justify-center gap-3 transition-all"
              >
                <Unlock className="w-6 h-6" />
                Join for $5/year
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
        onJoinClick={() => openOnboard({ reason: "find work and earn", actionLabel: "Join", membershipIncluded: true })}
      />

      {/* Floating Beacon Pill - above Patent Portfolio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-16 left-4 z-50"
      >
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/95 backdrop-blur-sm border border-purple-500/30 rounded-lg shadow-lg">
          <MapPin className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-white/70">Drop Beacon</span>
          <BeaconDropButton compact className="ml-1" />
        </div>
      </motion.div>
    </div>
  );
}
