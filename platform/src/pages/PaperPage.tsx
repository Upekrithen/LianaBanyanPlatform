/**
 * PAPER PAGE
 * ==========
 * Pudding.cool-style individual paper page using scrollytelling components.
 * Displays academic papers with multiple reading levels.
 */

import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ArrowRight, 
  BookOpen, 
  GraduationCap, 
  Baby, 
  Scale,
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  getPaperById, 
  getRelatedPapers, 
  getLawByNumber,
  FIVE_ECONOMIC_LAWS,
  type EconomicPaper 
} from '@/data/economicPapers';
import {
  ExpandableBlock,
  RevealBlock,
  DataVizBar
} from '@/components/pudding';
import { TreasureKeyIndicator } from '@/components/TreasureKeyIndicator';

const LAW_COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444'];

type ReadingLevel = 'academic' | 'freshman' | 'sixth-grade';

const READING_LEVELS = [
  { id: 'academic' as const, label: 'Full Paper', icon: GraduationCap, description: 'Academic version with citations' },
  { id: 'freshman' as const, label: 'Explained', icon: BookOpen, description: 'College freshman level' },
  { id: 'sixth-grade' as const, label: 'Summary', icon: Baby, description: '6th grade level' },
];

function ReadingLevelSelector({ 
  selected, 
  onChange 
}: { 
  selected: ReadingLevel; 
  onChange: (level: ReadingLevel) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {READING_LEVELS.map((level) => {
        const Icon = level.icon;
        const isSelected = selected === level.id;
        return (
          <button
            key={level.id}
            onClick={() => onChange(level.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isSelected 
                ? 'bg-blue-500 text-white' 
                : 'bg-slate-800 text-white/70 hover:bg-slate-700 hover:text-white'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">{level.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function RelatedPaperCard({ paper }: { paper: EconomicPaper }) {
  return (
    <Link
      to={`/economics/${paper.id}`}
      className="block bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition-all group"
    >
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ backgroundColor: paper.color + '20' }}
        >
          {paper.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">
            {paper.title}
          </h4>
          <p className="text-white/50 text-sm truncate">{paper.subtitle}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-blue-400 transition-colors" />
      </div>
    </Link>
  );
}

function MetricsDisplay({ metrics }: { metrics: EconomicPaper['metrics'] }) {
  if (!metrics || metrics.length === 0) return null;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {metrics.map((metric, i) => (
        <div key={i} className="bg-slate-800/50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {metric.value}
            {metric.unit && <span className="text-sm text-white/50 ml-1">{metric.unit}</span>}
          </div>
          <div className="text-white/50 text-sm">{metric.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function PaperPage() {
  const { paperId } = useParams<{ paperId: string }>();
  const [readingLevel, setReadingLevel] = useState<ReadingLevel>('freshman');
  const [showProblem, setShowProblem] = useState(false);
  
  const paper = paperId ? getPaperById(paperId) : undefined;
  
  if (!paper) {
    return <Navigate to="/economics" replace />;
  }
  
  const relatedPapers = getRelatedPapers(paper.id);
  const law = paper.lawNumber ? getLawByNumber(paper.lawNumber) : undefined;
  const lawColor = paper.lawNumber ? LAW_COLORS[paper.lawNumber - 1] : paper.color;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Link */}
        <Link 
          to="/economics"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Economic Laws
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Law Badge */}
          {paper.lawNumber && law && (
            <div 
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4"
              style={{ backgroundColor: lawColor + '20', borderColor: lawColor, borderWidth: 1 }}
            >
              <Scale className="w-4 h-4" style={{ color: lawColor }} />
              <span className="text-sm font-medium" style={{ color: lawColor }}>
                Economic Law #{paper.lawNumber}: {law.shortName}
              </span>
            </div>
          )}

          {/* Category Badge (for non-law papers) */}
          {!paper.lawNumber && (
            <div className="inline-flex items-center gap-2 bg-slate-800 rounded-full px-4 py-2 mb-4">
              {paper.category === 'system' ? (
                <FileText className="w-4 h-4 text-blue-400" />
              ) : (
                <Lightbulb className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-sm font-medium text-white/70">
                {paper.category === 'system' ? 'System Design' : 'Application'}
              </span>
            </div>
          )}

          {/* Title */}
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0"
              style={{ backgroundColor: paper.color + '20' }}
            >
              {paper.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {paper.title}
              </h1>
              {paper.subtitle && (
                <p className="text-xl text-white/70">{paper.subtitle}</p>
              )}
            </div>
          </div>

          {/* Reading Level Selector */}
          <div className="mt-6">
            <p className="text-white/50 text-sm mb-2">Choose your reading level:</p>
            <ReadingLevelSelector selected={readingLevel} onChange={setReadingLevel} />
          </div>
        </motion.header>

        {/* Key Insight (Always Visible) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div 
            className="border-l-4 rounded-r-lg p-6"
            style={{ borderColor: paper.color, backgroundColor: paper.color + '10' }}
          >
            <p className="text-lg font-medium text-white italic">
              "{paper.keyInsight}"
            </p>
          </div>
        </motion.section>

        {/* Metrics */}
        {paper.metrics && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-8"
          >
            <MetricsDisplay metrics={paper.metrics} />
          </motion.section>
        )}

        {/* Problem & Solution */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 space-y-4"
        >
          {/* Problem Statement - Expandable */}
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowProblem(!showProblem)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                  <span className="text-red-400">?</span>
                </div>
                <span className="font-medium text-white">The Problem</span>
              </div>
              {showProblem ? (
                <ChevronUp className="w-5 h-5 text-white/50" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white/50" />
              )}
            </button>
            {showProblem && (
              <div className="px-4 pb-4">
                <p className="text-white/80 pl-11">{paper.problemStatement}</p>
              </div>
            )}
          </div>

          {/* Solution - Always Visible */}
          <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <span className="text-green-400">✓</span>
              </div>
              <div>
                <span className="font-medium text-white block mb-2">The Solution</span>
                <p className="text-white/80">{paper.solution}</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Summary Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            {readingLevel === 'academic' ? 'Abstract' : readingLevel === 'freshman' ? 'Overview' : 'What Is This?'}
          </h2>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <p className="text-white/80 leading-relaxed">{paper.summary}</p>
          </div>
        </motion.section>

        {/* Law Equation (if applicable) */}
        {law && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">The Law</h2>
            <div 
              className="border rounded-xl p-6 text-center"
              style={{ borderColor: lawColor + '50', backgroundColor: lawColor + '10' }}
            >
              <p className="text-lg font-medium text-white mb-2">{law.name}</p>
              {law.equation && (
                <div className="font-mono text-xl text-amber-400 bg-slate-900/50 rounded-lg py-3 px-4 inline-block">
                  {law.equation}
                </div>
              )}
              <p className="text-white/70 mt-4">{law.principle}</p>
            </div>
          </motion.section>
        )}

        {/* Tags */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mb-8"
        >
          <div className="flex flex-wrap gap-2">
            {paper.tags.map((tag) => (
              <span 
                key={tag}
                className="bg-slate-800 text-white/70 px-3 py-1 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Related Papers */}
        {relatedPapers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h2 className="text-xl font-bold text-white mb-4">Related Papers</h2>
            <div className="space-y-3">
              {relatedPapers.map((related) => (
                <RelatedPaperCard key={related.id} paper={related} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Source Links */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-4">Source Documents</h2>
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-2">
            {paper.academicSource && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="w-4 h-4 text-white/50" />
                <span className="text-white/50">Academic:</span>
                <code className="text-blue-400 text-xs">{paper.academicSource}</code>
              </div>
            )}
            {paper.tldrSource && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4 text-white/50" />
                <span className="text-white/50">Explained:</span>
                <code className="text-blue-400 text-xs">{paper.tldrSource}</code>
              </div>
            )}
            {paper.sixthGradeSource && (
              <div className="flex items-center gap-2 text-sm">
                <Baby className="w-4 h-4 text-white/50" />
                <span className="text-white/50">Summary:</span>
                <code className="text-blue-400 text-xs">{paper.sixthGradeSource}</code>
              </div>
            )}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-green-500/10 border border-slate-700 rounded-xl p-8">
            <h3 className="text-xl font-bold text-white mb-4">
              See This Law in Action
            </h3>
            <p className="text-white/70 mb-6">
              Join for $5/year and experience these economic laws working for you.
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
                to="/economics"
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View All Papers
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Treasure Keys (Inline) */}
        <TreasureKeyIndicator
          documentPath={`/academic-papers/${paper.id}`}
          variant="inline"
          className="mt-8"
        />

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-12 pt-8 border-t border-slate-800 text-center"
        >
          <p className="text-white/50 text-sm">
            LIANA BANYAN CORPORATION · Wyoming C-Corp · EIN 41-2797446
          </p>
        </motion.div>
      </div>
    </div>
  );
}
