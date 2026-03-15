/**
 * ECONOMIC LAWS PAGE
 * ==================
 * Pudding.cool-style landing page for the Nine Economic Laws
 * and all academic papers.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, Lightbulb, Scale, FileText, ExternalLink } from 'lucide-react';
import { 
  NINE_ECONOMIC_LAWS, 
  ECONOMIC_PAPERS, 
  getPapersByCategory,
  getPaperById,
  type EconomicPaper 
} from '@/data/economicPapers';
import { DataVizBar, ExpandableBlock } from '@/components/pudding';

const LAW_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#f97316', '#06b6d4'];

function LawCard({ law, index }: { law: typeof NINE_ECONOMIC_LAWS[0]; index: number }) {
  const paper = getPaperById(law.paperId);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <ExpandableBlock
        title={`Law ${law.number}: ${law.name}`}
        subtitle={law.principle}
        preview={law.equation || "Click to explore this economic law..."}
        accentColor={LAW_COLORS[index]}
        defaultExpanded={index === 0}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold text-white shrink-0"
              style={{ backgroundColor: LAW_COLORS[index] + '30', borderColor: LAW_COLORS[index], borderWidth: 2 }}
            >
              {law.number}
            </div>
            <div className="flex-1">
              <p className="text-white/70 text-sm mb-3">
                {law.principle}
              </p>
              {law.equation && (
                <div className="bg-slate-800/50 rounded-lg px-3 py-2 font-mono text-sm text-amber-400 mb-3">
                  {law.equation}
                </div>
              )}
            </div>
          </div>
          
          {/* Additional context for each law */}
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700">
            <p className="text-xs text-white/50 mb-2">
              <strong className="text-white/70">Why it matters:</strong>
            </p>
            <p className="text-sm text-white/60">
              {law.number === 1 && "Currency exchange rates shouldn't determine who can participate in the global economy."}
              {law.number === 2 && "Value should accumulate to those who create it, not those who extract it."}
              {law.number === 3 && "Transparent pricing aligns incentives between buyers and sellers."}
              {law.number === 4 && "Economic shocks shouldn't cascade through the entire system."}
              {law.number === 5 && "Every system should have built-in mechanisms for sharing surplus."}
              {law.number === 6 && "Generosity creates more value than extraction."}
              {law.number === 7 && "New ideas need protection during their vulnerable early stages."}
              {law.number === 8 && "The same item can have different values in different contexts."}
              {law.number === 9 && "Complex systems can be built from simple, replaceable parts."}
            </p>
          </div>
          
          {paper && (
            <Link 
              to={`/economics/${paper.id}`}
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-colors"
              style={{ backgroundColor: LAW_COLORS[index] + '20', color: LAW_COLORS[index] }}
              onClick={(e) => e.stopPropagation()}
            >
              Read the full paper <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </ExpandableBlock>
    </motion.div>
  );
}

function PaperCard({ paper, index }: { paper: EconomicPaper; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/economics/${paper.id}`}
        className="block bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-slate-500 hover:bg-slate-800/50 transition-all group h-full"
      >
        <div className="flex items-start gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: paper.color + '20' }}
          >
            {paper.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
                {paper.title}
              </h4>
              {paper.lawNumber && (
                <span 
                  className="text-xs px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: LAW_COLORS[paper.lawNumber - 1] + '30', color: LAW_COLORS[paper.lawNumber - 1] }}
                >
                  Law {paper.lawNumber}
                </span>
              )}
            </div>
            <p className="text-white/50 text-sm line-clamp-2">
              {paper.keyInsight}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function CategorySection({ 
  title, 
  description, 
  papers, 
  icon: Icon,
  accentColor = '#3b82f6'
}: { 
  title: string; 
  description: string; 
  papers: EconomicPaper[]; 
  icon: React.ElementType;
  accentColor?: string;
}) {
  return (
    <div className="mb-8">
      <ExpandableBlock
        title={title}
        subtitle={description}
        preview={`${papers.length} papers available — click to explore`}
        accentColor={accentColor}
        defaultExpanded={true}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper, i) => (
            <PaperCard key={paper.id} paper={paper} index={i} />
          ))}
        </div>
      </ExpandableBlock>
    </div>
  );
}

export default function EconomicLaws() {
  const lawPapers = getPapersByCategory('law');
  const systemPapers = getPapersByCategory('system');
  const applicationPapers = getPapersByCategory('application');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-6">
            <Scale className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">New Economic Theory</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Nine Economic Laws
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-8">
            We're not just building a platform — we're testing nine new economic laws. 
            Each law has a full academic paper, a college-freshman explainer, and a 6th-grade summary.
          </p>
          
          {/* Stats Bar */}
          <div className="flex flex-wrap justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-400">9</div>
              <div className="text-white/50 text-sm">Economic Laws</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">20</div>
              <div className="text-white/50 text-sm">Academic Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">3</div>
              <div className="text-white/50 text-sm">Reading Levels</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-amber-400">1</div>
              <div className="text-white/50 text-sm">Platform Testing Them</div>
            </div>
          </div>
        </motion.div>

        {/* The Nine Laws */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            The Nine Economic Laws
          </h2>
          
          <div className="space-y-4">
            {NINE_ECONOMIC_LAWS.map((law, index) => (
              <LawCard key={law.number} law={law} index={index} />
            ))}
          </div>
        </motion.section>

        {/* Visual: Creator Split */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-16 bg-slate-900/50 border border-slate-700 rounded-xl p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4">The Math Behind It All</h3>
          <p className="text-white/70 mb-6">
            Every transaction follows the same formula: Cost + 20%. Creator/Worker keeps 83.3%.
          </p>
          <DataVizBar 
            data={[
              { label: 'Creator keeps', value: 83.3, color: '#22c55e', icon: '💰' },
              { label: 'Platform operations', value: 13.3, color: '#3b82f6', icon: '🏛️' },
              { label: "Gleaner's Corner", value: 3.3, color: '#f59e0b', icon: '🌾' },
            ]}
            showPercentage
            animated
          />
        </motion.section>

        {/* All Papers by Category */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-400" />
            All 20 Academic Papers
          </h2>

          <CategorySection
            title="Core Economic Laws"
            description="The nine new laws we're testing"
            papers={lawPapers}
            icon={Scale}
            accentColor="#f59e0b"
          />

          <CategorySection
            title="System Design"
            description="How the platform implements these laws"
            papers={systemPapers}
            icon={FileText}
            accentColor="#3b82f6"
          />

          <CategorySection
            title="Applications"
            description="Practical guides for using the system"
            papers={applicationPapers}
            icon={Lightbulb}
            accentColor="#22c55e"
          />
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-slate-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to See These Laws in Action?
            </h3>
            <p className="text-white/70 mb-6 max-w-2xl mx-auto">
              Join for $5/year and experience economics that works for you, not against you.
              Creator/Worker keeps 83.3%. It's in the operating agreement.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/RedCarpet"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Join for $5/year
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/patent-portfolio"
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Patent Portfolio
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
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
            These economic laws are being empirically tested through platform operations.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
