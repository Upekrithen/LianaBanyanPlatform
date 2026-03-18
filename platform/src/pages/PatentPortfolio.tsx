/**
 * PATENT PORTFOLIO PAGE
 * =====================
 * Pudding.cool-style detailed view of the patent portfolio
 * showing valuations, allocations, and the "Test-Net By Design" philosophy.
 * 
 * Updated Feb 24, 2026:
 * - Added Nine Laws and HexIsle showcase features
 * - Swivel cards (JUMBO deck cards) for all info blocks
 * - Full valuation breakdown with conservative claim juxtaposition
 * - Revenue pathway information (SEC-safe)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Shield, TrendingUp, Users, Lock, ArrowLeft, Sparkles, 
  RefreshCw, Award, Stamp, Calculator, ChevronRight, RotateCcw,
  Scale, Building, Briefcase, Globe, BookOpen, Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PatentPortfolioTicker } from '@/components/PatentPortfolioTicker';
import { DataVizBar, ExpandableBlock, ComparisonBar } from '@/components/pudding';

// Swivel Card Component - JUMBO Deck Card style
interface SwivelCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

function SwivelCard({ front, back, className = '' }: SwivelCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  return (
    <div 
      className={`relative cursor-pointer perspective-1000 ${className}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="w-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
          <div className="absolute bottom-2 right-2 text-white/30 text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Click to flip
          </div>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 w-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {back}
          <div className="absolute bottom-2 right-2 text-white/30 text-xs flex items-center gap-1">
            <RotateCcw className="w-3 h-3" /> Click to flip back
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Flippable Button Component - Individual items that flip to show details
interface FlippableButtonProps {
  frontContent: React.ReactNode;
  backTitle: string;
  backDescription: string;
  academicLink?: string;
  technicalLink?: string;
  accentColor?: string;
  className?: string;
}

function FlippableButton({ 
  frontContent, 
  backTitle, 
  backDescription, 
  academicLink, 
  technicalLink,
  accentColor = 'green',
  className = '' 
}: FlippableButtonProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const colorClasses = {
    green: { border: 'border-green-500/30', bg: 'bg-green-500/10', text: 'text-green-400', hover: 'hover:bg-green-500/20' },
    amber: { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400', hover: 'hover:bg-amber-500/20' },
    purple: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', hover: 'hover:bg-purple-500/20' },
    cyan: { border: 'border-cyan-500/30', bg: 'bg-cyan-500/10', text: 'text-cyan-400', hover: 'hover:bg-cyan-500/20' },
    blue: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', hover: 'hover:bg-blue-500/20' },
  };
  
  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.green;
  
  return (
    <div 
      className={`relative cursor-pointer perspective-1000 ${className}`}
      style={{ minHeight: '120px' }}
    >
      <motion.div
        className="relative w-full h-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 w-full backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
          onClick={() => setIsFlipped(true)}
        >
          <div className={`h-full ${colors.bg} border ${colors.border} rounded-lg p-4 hover:border-opacity-60 transition-colors`}>
            {frontContent}
            <div className="absolute bottom-1 right-2 text-white/20 text-[10px] flex items-center gap-1">
              <RotateCcw className="w-2.5 h-2.5" /> flip
            </div>
          </div>
        </div>
        
        {/* Back */}
        <div 
          className="absolute inset-0 w-full backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
          onClick={() => setIsFlipped(false)}
        >
          <div className={`h-full ${colors.bg} border ${colors.border} rounded-lg p-3 flex flex-col`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`text-sm font-semibold ${colors.text}`}>{backTitle}</h4>
            </div>
            <p className="text-xs text-white/60 flex-grow mb-2">{backDescription}</p>
            <div className="flex gap-2 mt-auto">
              {academicLink && (
                academicLink.startsWith('http') ? (
                  <a 
                    href={academicLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 text-center py-1.5 text-xs rounded ${colors.bg} ${colors.hover} ${colors.text} border ${colors.border} transition-colors`}
                  >
                    📚 Academic
                  </a>
                ) : (
                  <Link 
                    to={academicLink}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 text-center py-1.5 text-xs rounded ${colors.bg} ${colors.hover} ${colors.text} border ${colors.border} transition-colors`}
                  >
                    📚 Academic
                  </Link>
                )
              )}
              {technicalLink && (
                technicalLink.startsWith('http') ? (
                  <a 
                    href={technicalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 text-center py-1.5 text-xs rounded ${colors.bg} ${colors.hover} ${colors.text} border ${colors.border} transition-colors`}
                  >
                    ⚙️ Technical
                  </a>
                ) : (
                  <Link 
                    to={technicalLink}
                    onClick={(e) => e.stopPropagation()}
                    className={`flex-1 text-center py-1.5 text-xs rounded ${colors.bg} ${colors.hover} ${colors.text} border ${colors.border} transition-colors`}
                  >
                    ⚙️ Technical
                  </Link>
                )
              )}
              {!academicLink && !technicalLink && (
                <span className="text-xs text-white/40 italic">Specs coming soon</span>
              )}
            </div>
            <div className="absolute bottom-1 right-2 text-white/20 text-[10px] flex items-center gap-1">
              <RotateCcw className="w-2.5 h-2.5" /> flip back
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Updated valuation data with full breakdown
const VALUATION_BREAKDOWN = {
  conservative: {
    year1: '$5M',
    year5: '$37.5M', 
    year10: '$145M',
    label: 'Conservative',
    color: 'green',
  },
  moderate: {
    year1: '$25M',
    year5: '$150M',
    year10: '$600M',
    label: 'Moderate', 
    color: 'amber',
  },
  aggressive: {
    year1: '$100M',
    year5: '$500M',
    year10: '$2B',
    label: 'Aggressive',
    color: 'red',
  },
};

// Revenue pathways (SEC-safe language)
const REVENUE_PATHWAYS = [
  {
    icon: Scale,
    name: 'Licensing',
    description: 'Other platforms may license innovations for their own implementations.',
    potential: 'Primary pathway for IP monetization',
  },
  {
    icon: Building,
    name: 'Platform Services',
    description: 'Innovations power Cost+20% marketplace, creating service revenue.',
    potential: 'Operational revenue from member activity',
  },
  {
    icon: Briefcase,
    name: 'Enterprise Adoption',
    description: 'Corporations may adopt cooperative models for internal use.',
    potential: 'B2B licensing opportunities',
  },
  {
    icon: Globe,
    name: 'International Expansion',
    description: 'Geographic expansion multiplies addressable market.',
    potential: 'Market size multiplication',
  },
];

// Nine Laws showcase data
const NINE_LAWS = [
  { 
    num: 1, 
    name: 'Forex-Differential Absorption', 
    crown: false,
    description: 'Captures value from currency exchange differentials and routes it to platform stability rather than speculation.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/nine-economic-laws/',
    technicalLink: '/economics'
  },
  { 
    num: 2, 
    name: 'Ratchet Value Accumulation (HIVI)', 
    crown: true,
    description: 'One-way value ratchet ensures platform credits can only increase in value over time. The HIVI mechanism prevents deflation.',
    academicLink: 'https://cephas.lianabanyan.com/academic/hivi-tldr/',
    technicalLink: '/economics'
  },
  { 
    num: 3, 
    name: 'Quality-Volume Alignment (Cost+20%)', 
    crown: true,
    description: 'The revolutionary pricing model where creators and workers keep 83.3% and platform operates at transparent Cost+20% margin.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/cost-plus-twenty/',
    technicalLink: '/economics'
  },
  { 
    num: 4, 
    name: 'One-Way Valve Decoupling', 
    crown: false,
    description: 'Prevents reverse flow of value that would enable speculation. Credits flow in one direction through the system.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/nine-economic-laws/',
    technicalLink: undefined
  },
  { 
    num: 5, 
    name: 'Structural Gleaning (3.3%)', 
    crown: false,
    description: 'The Boaz Principle applied to platform economics: 3.3% of transactions support community welfare automatically.',
    academicLink: 'https://cephas.lianabanyan.com/academic/boaz-principle-tldr/',
    technicalLink: '/economics'
  },
  { 
    num: 6, 
    name: 'Generosity for Potential (Boaz)', 
    crown: false,
    description: 'Leave the corners of your field for those who need it. Built-in generosity mechanisms that strengthen the whole.',
    academicLink: 'https://cephas.lianabanyan.com/academic/boaz-generosity-potential/',
    technicalLink: undefined
  },
  { 
    num: 7, 
    name: 'Inception Principle', 
    crown: false,
    description: 'Value creation begins at the moment of inception, not at the point of sale. Recognizes contribution before monetization.',
    academicLink: 'https://cephas.lianabanyan.com/academic/inception-principle/',
    technicalLink: undefined
  },
  { 
    num: 8, 
    name: 'Simultaneous Pricing Paradox', 
    crown: true,
    description: 'Resolves the paradox of pricing goods simultaneously across different markets with different purchasing powers.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/nine-economic-laws/',
    technicalLink: '/economics'
  },
  { 
    num: 9, 
    name: 'Jeep of Theseus (Cold Start)', 
    crown: false,
    description: 'How to bootstrap a cooperative economy from nothing. The cold start problem solved through incremental value building.',
    academicLink: 'https://cephas.lianabanyan.com/academic/cold-start-theseus/',
    technicalLink: '/build-a-business'
  },
];

// HexIsle showcase data
const HEXISLE_INNOVATIONS = [
  { 
    name: 'Golden Lotus Configuration', 
    crown: true,
    description: 'Optimal hexagonal tile arrangement that maximizes hydraulic efficiency while maintaining structural integrity.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: '/hall-of-innovations'
  },
  { 
    name: 'AC Phase Unidirectional Rotation', 
    crown: true,
    description: 'Novel mechanism for converting alternating current into unidirectional mechanical rotation without traditional rectification.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: '/hall-of-innovations'
  },
  { 
    name: 'HoFund Reversible Valve', 
    crown: true,
    description: 'Bidirectional valve system that enables complex fluid routing in modular game terrain with minimal pressure loss.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: '/hall-of-innovations'
  },
  { 
    name: '469-Hexel System Validation', 
    crown: false,
    description: 'Proven system architecture supporting 469 interconnected hexagonal tiles with centralized hydraulic control.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: undefined
  },
  { 
    name: 'Swan Neck Inverse Coupling', 
    crown: false,
    description: 'Flexible coupling mechanism that allows tiles to connect at various angles while maintaining fluid seal.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: undefined
  },
  { 
    name: 'WaterCap Universal Connector', 
    crown: false,
    description: 'Standardized quick-connect system for modular hydraulic components with tool-free assembly.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/hexisle/',
    technicalLink: undefined
  },
];

const CROWN_JEWELS = [
  { 
    name: 'Cost+20% Economic Model', 
    category: 'Economics', 
    status: 'Filed',
    description: 'Revolutionary pricing model where creators and workers keep 83.3% while platform operates at transparent Cost+20% margin. Eliminates hidden fees and algorithmic manipulation.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/cost-plus-twenty/',
    technicalLink: '/economics'
  },
  { 
    name: 'Three-Gear Currency System', 
    category: 'Currency', 
    status: 'Filed',
    description: 'Interlocking currency gears (Credits, Golden Keys, Cascade Pool) that enable value flow without speculation. Each gear serves a distinct purpose in the ecosystem.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/three-gear-currency/',
    technicalLink: 'https://cephas.lianabanyan.com/architecture/three-gear-currency/'
  },
  { 
    name: 'IP Load Balancing', 
    category: 'Intellectual Property', 
    status: 'Filed',
    description: 'Novel approach to distributing intellectual property value across the platform. Ensures fair compensation while maintaining collective benefit.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/ip-load-balancing-ledger/',
    technicalLink: '/hall-of-innovations'
  },
  { 
    name: 'Compass Governance Structure', 
    category: 'Governance', 
    status: 'Filed',
    description: 'Four-directional governance model (North/South/East/West) that balances stakeholder interests and prevents capture by any single group.',
    academicLink: 'https://cephas.lianabanyan.com/architecture/voting-mechanics/',
    technicalLink: '/governance'
  },
  { 
    name: 'Harper Quality Assurance', 
    category: 'Quality', 
    status: 'Filed',
    description: 'Distributed quality assurance system where community members verify and validate content, products, and services through structured review processes.',
    academicLink: 'https://cephas.lianabanyan.com/initiatives/harper-guild/',
    technicalLink: undefined
  },
  { 
    name: 'Zero-PII Architecture', 
    category: 'Privacy', 
    status: 'Filed',
    description: 'Privacy-first architecture that operates without collecting personally identifiable information. Proves you can build functional systems without surveillance.',
    academicLink: 'https://cephas.lianabanyan.com/legal/privacy-policy/',
    technicalLink: undefined
  },
  { 
    name: 'Quadratic Voting Implementation', 
    category: 'Governance', 
    status: 'Filed',
    description: 'Mathematical voting system where vote cost increases quadratically, preventing plutocratic capture while allowing intensity of preference expression.',
    academicLink: 'https://cephas.lianabanyan.com/architecture/voting-mechanics/',
    technicalLink: '/governance'
  },
  { 
    name: 'Forex Ratchet Valuation', 
    category: 'Currency', 
    status: 'Filed',
    description: 'One-way value ratchet that absorbs forex differentials to increase platform credit value over time. Credits can only go up, never down.',
    academicLink: 'https://cephas.lianabanyan.com/under-the-hood/forex-ratchet-valuation/',
    technicalLink: '/economics'
  },
];

export default function PatentPortfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Patent Portfolio
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            1,370 documented innovations across economics, governance, privacy, 
            IP management, and cooperative business systems.
          </p>
        </motion.div>
        
        {/* Quick Stats DataVizBar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <DataVizBar
            title="Portfolio Allocation"
            subtitle="How the $9M equivalent is distributed"
            data={[
              { label: 'Platform (60%)', value: 60, color: '#22c55e', icon: '🏛️' },
              { label: 'Founder (20%)', value: 20, color: '#8b5cf6', icon: '👤' },
              { label: 'Sponsor Pool (10%)', value: 10, color: '#3b82f6', icon: '🤝' },
              { label: 'Patent Buckets (10%)', value: 10, color: '#f59e0b', icon: '📦' },
            ]}
            maxValue={100}
            showPercentages={true}
            height={28}
          />
        </motion.div>
        
        {/* JUMBO DECK CARD: Patent Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SwivelCard
            className="min-h-[320px]"
            front={
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    <span className="text-white/70 font-medium">Patent Portfolio Value</span>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-amber-400">$9.00M<span className="text-lg text-white/50">equivalent</span></div>
                    <div className="text-xs text-white/50">Conservative Floor Valuation</div>
                  </div>
                </div>
                
                {/* Full valuation breakdown */}
                <div className="bg-slate-950/50 rounded-lg p-4 mb-4">
                  <div className="text-xs text-white/50 mb-2">10-Year Projection Range (for context):</div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-400 font-mono">$145M</span>
                    <span className="text-white/30">→</span>
                    <span className="text-amber-400 font-mono">$600M</span>
                    <span className="text-white/30">→</span>
                    <span className="text-red-400 font-mono">$2B</span>
                  </div>
                  <div className="text-xs text-white/40 mt-1">
                    We claim only <span className="text-amber-400">$9M</span> — the conservative floor.
                  </div>
                </div>
                
                {/* Allocation bars */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-900/50 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">$5.40M</div>
                    <div className="text-xs text-white/50">Platform (60%)</div>
                  </div>
                  <div className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-400">$900K</div>
                    <div className="text-xs text-white/50">Sponsor Pool (10%)</div>
                  </div>
                  <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-400">$900K</div>
                    <div className="text-xs text-white/50">Patent Buckets (10%)</div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-white/50 mb-1">
                    <span>Platform Allocation Remaining</span>
                    <span className="text-green-400">$5.40M / $5.40M</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-green-400 w-full" />
                  </div>
                  <div className="flex justify-between text-xs text-white/40 mt-1">
                    <span>Allocated: $0</span>
                    <span>100.0% remaining</span>
                  </div>
                </div>
                
                <details className="text-xs text-white/50">
                  <summary className="cursor-pointer hover:text-white/70">Show Allocation Breakdown</summary>
                  <div className="mt-2 p-2 bg-slate-900/50 rounded text-white/60">
                    60% Platform + 10% Sponsor Pool + 10% Patent Buckets + 20% Founder = 100%
                  </div>
                </details>
                
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <p className="text-xs text-white/50 italic border-l-2 border-amber-500/30 pl-3 mb-3">
                    "I'm not trying to be Valjean. I'm trying to be the Bishop — one of many — and these patents are my silver candlesticks. I don't have any silver spoons."
                    <span className="block text-amber-400/60 mt-1 not-italic">— Founder</span>
                  </p>
                  <h4 className="text-white/70 text-sm font-medium mb-2">Why "Equivalent"?</h4>
                  <p className="text-xs text-white/50">
                    All dollar amounts represent platform service unit value, not cash. Platform credits are "future service coupons" — prepaid access to platform services at Cost+20%. <span className="text-amber-400 font-medium">Test-Net By Design</span> means no trading, no speculation, no cashing out. This is a feature, not a limitation.
                  </p>
                </div>
              </div>
            }
            back={
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-500/30 rounded-2xl p-6 h-full">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Revenue Pathways
                </h3>
                <p className="text-sm text-white/60 mb-4">
                  How the patent portfolio may generate value (not guarantees):
                </p>
                
                <div className="space-y-3">
                  {REVENUE_PATHWAYS.map((pathway) => (
                    <div key={pathway.name} className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <pathway.icon className="w-4 h-4 text-amber-400" />
                        <span className="text-white font-medium text-sm">{pathway.name}</span>
                      </div>
                      <p className="text-xs text-white/50">{pathway.description}</p>
                      <p className="text-xs text-amber-400/70 mt-1">{pathway.potential}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-200">
                    <strong>SEC Compliance:</strong> These are potential pathways, not investment promises. 
                    Platform credits are prepaid service units, not securities. No expectation of profit 
                    from the efforts of others.
                  </p>
                </div>
              </div>
            }
          />
        </motion.div>
        
        {/* The Nine Economic Laws - Individually Flippable */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">The Nine Economic Laws</h2>
              <p className="text-xs text-purple-300">37 years in the making • Click any law to flip and explore</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-purple-400 font-bold">9</span>
              <span className="text-white/50">Laws</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">3</span>
              <span className="text-white/50">Crown Jewels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">~126</span>
              <span className="text-white/50">Claims</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-purple-400">Est. 10-Year:</span>
              <span className="text-white/70">$42M – $89M equiv</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {NINE_LAWS.map((law) => (
              <FlippableButton
                key={law.num}
                accentColor={law.crown ? 'amber' : 'purple'}
                frontContent={
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/30 text-purple-400 text-xs flex items-center justify-center flex-shrink-0 font-bold">
                      {law.num}
                    </span>
                    <div className="flex-grow">
                      <span className={`text-sm font-medium ${law.crown ? 'text-amber-400' : 'text-white'}`}>
                        {law.name}
                      </span>
                      {law.crown && <span className="text-amber-400 text-xs ml-1">⭐</span>}
                    </div>
                  </div>
                }
                backTitle={`Law ${law.num}: ${law.name}`}
                backDescription={law.description}
                academicLink={law.academicLink}
                technicalLink={law.technicalLink}
              />
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              to="/hall-of-innovations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-300 text-sm transition-colors"
            >
              Vote on Nine Laws →
            </Link>
          </div>
        </motion.section>
        
        {/* HexIsle Mechanical Systems - Individually Flippable */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">HexIsle Mechanical Systems</h2>
              <p className="text-xs text-cyan-300">Real hydraulics that DO something • Click any innovation to flip</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">6</span>
              <span className="text-white/50">Innovations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-bold">3</span>
              <span className="text-white/50">Crown Jewels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 font-bold">~154</span>
              <span className="text-white/50">Claims</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-cyan-400">Est. 10-Year:</span>
              <span className="text-white/70">$35M – $71M equiv</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {HEXISLE_INNOVATIONS.map((innov) => (
              <FlippableButton
                key={innov.name}
                accentColor={innov.crown ? 'amber' : 'cyan'}
                frontContent={
                  <div className="flex items-start gap-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${innov.crown ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                    <div className="flex-grow">
                      <span className={`text-sm font-medium ${innov.crown ? 'text-amber-400' : 'text-white'}`}>
                        {innov.name}
                      </span>
                      {innov.crown && <span className="text-amber-400 text-xs ml-1">⭐</span>}
                    </div>
                  </div>
                }
                backTitle={innov.name}
                backDescription={innov.description}
                academicLink={innov.academicLink}
                technicalLink={innov.technicalLink}
              />
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-slate-900/50 border border-cyan-500/20 rounded-lg">
            <p className="text-xs text-white/50">
              <strong className="text-cyan-400">System Validated:</strong> 469 Hexels, 
              5-gallon reservoir, 10× torque margin, 95% pressure retention
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link 
              to="/hall-of-innovations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded-lg text-cyan-300 text-sm transition-colors"
            >
              Vote on HexIsle →
            </Link>
          </div>
        </motion.section>
        
        {/* Link to Hall of Innovations */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-center">
            <Link 
              to="/hall-of-innovations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 transition-colors"
            >
              <Award className="w-5 h-5" />
              Enter the Hall of Innovations
              <ChevronRight className="w-4 h-4" />
            </Link>
            <p className="text-xs text-white/40 mt-2">
              Vote with Credits to fund patent prosecution and earn fractional participation
            </p>
          </div>
        </motion.section>
        
        {/* Valuation Scenarios - Swivel Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-400" />
            Valuation Scenarios
          </h2>
          
          <SwivelCard
            className="min-h-[200px]"
            front={
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-white/70">Scenario</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Year 1</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Year 5</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-white/70">Year 10</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.values(VALUATION_BREAKDOWN).map((row, i) => (
                      <tr key={row.label} className={i < 2 ? 'border-b border-slate-800' : ''}>
                        <td className="px-4 py-3 text-white font-medium">{row.label}</td>
                        <td className="px-4 py-3 text-right font-mono text-green-400">{row.year1} <span className="text-white/50 text-xs">equiv</span></td>
                        <td className="px-4 py-3 text-right font-mono text-amber-400">{row.year5} <span className="text-white/50 text-xs">equiv</span></td>
                        <td className="px-4 py-3 text-right font-mono text-blue-400">{row.year10} <span className="text-white/50 text-xs">equiv</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="p-4 bg-slate-950/50 border-t border-slate-700">
                  <p className="text-sm text-white/50">
                    All amounts represent platform service unit value ("equivalent"), not cash. 
                    See "Test-Net By Design" section below.
                  </p>
                </div>
              </div>
            }
            back={
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Valuation Methodology</h3>
                <div className="space-y-3 text-sm text-white/70">
                  <p>
                    <strong className="text-amber-400">Relief-from-Royalty Method:</strong> Estimates 
                    the royalty a company would pay to license the technology, then calculates 
                    present value of that royalty stream.
                  </p>
                  <p>
                    <strong className="text-green-400">Conservative:</strong> Assumes minimal market 
                    penetration, limited licensing, and slow adoption.
                  </p>
                  <p>
                    <strong className="text-amber-400">Moderate:</strong> Assumes reasonable market 
                    adoption with multiple licensing deals and steady growth.
                  </p>
                  <p>
                    <strong className="text-red-400">Aggressive:</strong> Assumes significant market 
                    disruption, widespread adoption, and premium licensing rates.
                  </p>
                </div>
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <p className="text-xs text-amber-200">
                    We publicly claim only the <strong>$9M conservative floor</strong> to maintain 
                    credibility and avoid overpromising.
                  </p>
                </div>
              </div>
            }
          />
        </motion.section>
        
        {/* Valuation Comparison - Progressive Disclosure */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-12"
        >
          <ExpandableBlock
            title="📊 Why We Claim Only $9M"
            subtitle="Understanding the conservative floor vs. full potential"
            preview="The portfolio could be worth $145M-$2B at Year 10, but we publicly claim only the conservative floor..."
            accentColor="#f59e0b"
            defaultExpanded={false}
          >
            <ComparisonBar
              title="10-Year Valuation Range"
              leftLabel="Conservative"
              rightLabel="Aggressive"
              leftValue={145}
              rightValue={2000}
              unit="$M"
              leftColor="#22c55e"
              rightColor="#ef4444"
            />
            <div className="mt-4 space-y-3 text-sm text-white/70">
              <p>
                <strong className="text-amber-400">Why the conservative claim?</strong> Credibility matters more than hype. 
                We'd rather under-promise and over-deliver than join the chorus of inflated valuations.
              </p>
              <p>
                <strong className="text-green-400">What "equivalent" means:</strong> All values represent platform service 
                units, not cash. Credits are prepaid access to Cost+20% services — like gift cards, not investments.
              </p>
            </div>
          </ExpandableBlock>
        </motion.section>

        {/* Crown Jewels - Individually Flippable Buttons */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-green-400" />
            Crown Jewels (No Prior Art)
          </h2>
          <p className="text-white/50 text-sm mb-6">
            Click any jewel to flip it and see details, then choose to read academic or technical specs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CROWN_JEWELS.map((jewel) => (
              <FlippableButton
                key={jewel.name}
                accentColor="green"
                frontContent={
                  <div className="flex items-start justify-between h-full">
                    <div>
                      <h3 className="text-white font-medium">{jewel.name}</h3>
                      <p className="text-sm text-white/50 mt-1">{jewel.category}</p>
                    </div>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded flex-shrink-0">
                      {jewel.status}
                    </span>
                  </div>
                }
                backTitle={jewel.name}
                backDescription={jewel.description}
                academicLink={jewel.academicLink}
                technicalLink={jewel.technicalLink}
              />
            ))}
          </div>
          
          {/* What Crown Jewel Means - Expandable */}
          <ExpandableBlock
            title="💎 What 'Crown Jewel' Means"
            subtitle="Understanding our highest-value innovations"
            preview="Crown jewels are innovations with no prior art found, high commercial value, and strong defensible claims..."
            accentColor="#22c55e"
            defaultExpanded={false}
            className="mt-6"
          >
            <div className="space-y-3 text-sm text-white/70">
              <p>
                <strong className="text-green-400">No Prior Art Found:</strong> Extensive patent 
                searches found no existing patents, publications, or products that anticipate 
                these innovations.
              </p>
              <p>
                <strong className="text-amber-400">High Commercial Value:</strong> These innovations 
                address significant market needs with novel solutions that competitors cannot 
                easily replicate.
              </p>
              <p>
                <strong className="text-blue-400">Strong Claims:</strong> Each crown jewel has 
                detailed claims with technical specifications, making them defensible against 
                infringement.
              </p>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs text-green-200">
                Crown jewels receive <strong>2-3× valuation multipliers</strong> in our 
                Relief-from-Royalty calculations.
              </p>
            </div>
          </ExpandableBlock>
        </motion.section>
        
        {/* Test-Net By Design - Swivel Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            Test-Net By Design
          </h2>
          
          <SwivelCard
            className="min-h-[280px]"
            front={
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <p className="text-white/90 leading-relaxed mb-4">
                  The platform operates <strong className="text-amber-400">permanently on testnet</strong>. 
                  This is not a staging environment — it's an architectural decision that prevents speculation 
                  and maintains SEC compliance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">What This Means</h4>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• No trading on exchanges</li>
                      <li>• No speculation possible</li>
                      <li>• No cashing out — ever</li>
                      <li>• Credits = prepaid services</li>
                    </ul>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-2">Why This Matters</h4>
                    <ul className="text-sm text-white/70 space-y-1">
                      <li>• Fails Howey Test = not a security</li>
                      <li>• No SEC registration required</li>
                      <li>• Stable value, not volatile</li>
                      <li>• Focus on utility, not speculation</li>
                    </ul>
                  </div>
                </div>
              </div>
            }
            back={
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">The Howey Test</h3>
                <p className="text-sm text-white/70 mb-4">
                  A transaction is a "security" if it involves:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✓</span>
                    <span className="text-white/70">Investment of money — <span className="text-green-400">Yes, but...</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✗</span>
                    <span className="text-white/70">In a common enterprise — <span className="text-green-400">No, prepaid services</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✗</span>
                    <span className="text-white/70">With expectation of profit — <span className="text-green-400">No, service access</span></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">✗</span>
                    <span className="text-white/70">From efforts of others — <span className="text-green-400">No, self-service</span></span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-xs text-green-200">
                    <strong>Result:</strong> Platform credits are NOT securities. They're prepaid 
                    service units, like gift cards or airline miles.
                  </p>
                </div>
              </div>
            }
          />
        </motion.section>
        
        {/* Allocation Structure - Swivel Card */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-400" />
            Allocation Structure
          </h2>
          
          <SwivelCard
            className="min-h-[320px]"
            front={
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Why We Show This Valuation</h3>
                <p className="text-white/80 leading-relaxed mb-4">
                  This patent portfolio isn't just documentation — it's the <strong className="text-blue-400">fuel for the platform</strong>. 
                  The Founder is committing real intellectual property to fund operations, reward contributors, and give every 
                  $5 member a stake in something substantial.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-900/50 border border-green-500/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">60%</div>
                    <div className="text-sm text-white/70">Platform & Sponsors</div>
                    <div className="text-xs text-white/50 mt-1">Operations + Cascade Pool</div>
                  </div>
                  <div className="bg-slate-900/50 border border-blue-500/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-1">10%</div>
                    <div className="text-sm text-white/70">Patent Buckets</div>
                    <div className="text-xs text-white/50 mt-1">5K max per person</div>
                  </div>
                  <div className="bg-slate-900/50 border border-purple-500/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-1">20%</div>
                    <div className="text-sm text-white/70">Founder</div>
                    <div className="text-xs text-white/50 mt-1">Development reserve</div>
                  </div>
                  <div className="bg-slate-900/50 border border-cyan-500/30 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-cyan-400 mb-1">10%</div>
                    <div className="text-sm text-white/70">Prosecution</div>
                    <div className="text-xs text-white/50 mt-1">Legal + Implementation</div>
                  </div>
                </div>
              </div>
            }
            back={
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">The Sponsorship Cascade</h3>
                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center justify-center flex-shrink-0">1</span>
                    <span><strong className="text-green-400">25 Credit Minimum:</strong> Anyone can sponsor someone else</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center flex-shrink-0">2</span>
                    <span><strong className="text-amber-400">5K Community Seeder:</strong> Seed 500 people in your city</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center flex-shrink-0">3</span>
                    <span><strong className="text-blue-400">Cascade Effect:</strong> Recipients split and pass forward</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center flex-shrink-0">4</span>
                    <span><strong className="text-purple-400">Renewal Cycle:</strong> At $10M cap, pool resets</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-slate-900/50 rounded-lg">
                  <p className="text-xs text-white/60 font-mono">
                    100 Credits → split to 10 (10 each) → each splits to 9 (1 each) → resurgence to 5K
                  </p>
                </div>
              </div>
            }
          />
          
          <div className="mt-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-l-4 border-amber-500 rounded-r-lg p-4">
            <p className="text-amber-200 italic text-lg">
              "For I will not offer that which costs me nothing."
            </p>
            <p className="text-white/50 text-sm mt-2">
              — The Founder's commitment: real IP, real value, real skin in the game.
            </p>
          </div>
        </motion.section>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 pt-8 border-t border-slate-800 text-center"
        >
          <p className="text-white/50 text-sm">
            LIANA BANYAN CORPORATION
          </p>
          <p className="text-white/30 text-xs mt-2">
            Forward-looking statements apply. Actual results may differ materially.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
