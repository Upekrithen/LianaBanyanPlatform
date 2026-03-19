/**
 * PATENT PORTFOLIO TICKER
 * =======================
 * Displays the patent portfolio countdown showing:
 * - $9M equivalent (conservative floor value)
 * - 60% available = $5.4M equivalent for platform operations
 * - Countdown as allocations are made
 * 
 * Two display modes:
 * 1. Compact: Small ticker for bottom-left corner of every page
 * 2. Full: Detailed view for the Patent Portfolio page
 * 
 * Quote: "For I will not offer that which costs me nothing."
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, FileText, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface PatentPortfolioTickerProps {
  mode?: 'compact' | 'full';
  className?: string;
}

const PORTFOLIO_BASE = 9_000_000;
const AVAILABLE_PERCENTAGE = 0.60;
const AVAILABLE_BASE = PORTFOLIO_BASE * AVAILABLE_PERCENTAGE;

const ALLOCATION_CATEGORIES = [
  { name: 'Bounties Paid', amount: 0, color: '#38a169' },
  { name: 'Sponsor Rewards', amount: 0, color: '#d69e2e' },
  { name: 'Initiative Funding', amount: 0, color: '#4299e1' },
  { name: 'Operations', amount: 0, color: '#9f7aea' },
];

const formatCurrency = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(0)}`;
};

export function PatentPortfolioTicker({ mode = 'compact', className = '' }: PatentPortfolioTickerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const location = useLocation();

  if (location.pathname === '/' && mode === 'compact') return null;
  
  const remaining = AVAILABLE_BASE - totalAllocated;
  const percentRemaining = (remaining / AVAILABLE_BASE) * 100;
  
  if (mode === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed bottom-4 left-4 z-50 ${className}`}
      >
        <Link 
          to="/patent-portfolio"
          className="group flex items-center gap-2 px-3 py-2 bg-slate-900/95 backdrop-blur-sm border border-amber-500/30 rounded-lg hover:border-amber-500/60 transition-all shadow-lg"
        >
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-white/70">Patent Portfolio</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-mono font-bold text-amber-400">
              {formatCurrency(remaining)}
            </span>
            <span className="text-xs text-white/50">equiv</span>
          </div>
          <ExternalLink className="w-3 h-3 text-white/40 group-hover:text-amber-400 transition-colors" />
        </Link>
        
        <div className="mt-1 h-1 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentRemaining}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 to-green-500"
          />
        </div>
      </motion.div>
    );
  }
  
  return (
    <div className={`bg-slate-900 border border-amber-500/20 rounded-xl p-6 ${className}`}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-400" />
            Patent Portfolio Value
          </h2>
          <p className="text-white/60 mt-1">
            Conservative floor valuation of 1,751 documented innovations
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-amber-400">
            {formatCurrency(PORTFOLIO_BASE)}
            <span className="text-lg text-white/50 ml-1">equivalent</span>
          </div>
          <p className="text-sm text-white/50">Total Portfolio Value</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Platform (60%)</div>
          <div className="text-xl font-mono font-bold text-green-400">
            {formatCurrency(AVAILABLE_BASE)}
            <span className="text-sm text-white/50 ml-1">equiv</span>
          </div>
          <p className="text-xs text-white/40 mt-1">Available for operations, bounties, rewards</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Sponsor Pool (10%)</div>
          <div className="text-xl font-mono font-bold text-amber-400">
            {formatCurrency(PORTFOLIO_BASE * 0.10)}
            <span className="text-sm text-white/50 ml-1">equiv</span>
          </div>
          <p className="text-xs text-white/40 mt-1">Reserved for 5,000 sponsors @ $1K each</p>
        </div>
        
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-sm text-white/60 mb-1">Patent Buckets (10%)</div>
          <div className="text-xl font-mono font-bold text-blue-400">
            {formatCurrency(PORTFOLIO_BASE * 0.10)}
            <span className="text-sm text-white/50 ml-1">equiv</span>
          </div>
          <p className="text-xs text-white/40 mt-1">Member voting on prosecution priorities</p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/70">Platform Allocation Remaining</span>
          <span className="text-sm font-mono text-amber-400">
            {formatCurrency(remaining)} / {formatCurrency(AVAILABLE_BASE)}
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentRemaining}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-amber-500 via-green-500 to-emerald-500"
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/40">
          <span>Allocated: {formatCurrency(totalAllocated)}</span>
          <span>{percentRemaining.toFixed(1)}% remaining</span>
        </div>
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors"
      >
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {isExpanded ? 'Hide' : 'Show'} Allocation Breakdown
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {ALLOCATION_CATEGORIES.map((category) => (
                <div key={category.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-sm text-white/70">{category.name}</span>
                  </div>
                  <span className="text-sm font-mono text-white/90">
                    {formatCurrency(category.amount)} equiv
                  </span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-200 italic text-center">
                "For I will not offer that which costs me nothing."
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="mt-6 pt-4 border-t border-slate-700">
        <h3 className="text-sm font-semibold text-white/80 mb-3">Why "Equivalent"?</h3>
        <p className="text-sm text-white/60 leading-relaxed">
          All dollar amounts represent platform service unit value, not cash. 
          Platform credits are "future service coupons" — prepaid access to platform services at Cost+20%. 
          <strong className="text-amber-400"> Test-Net By Design</strong> means no trading, no speculation, no cashing out. 
          This is a feature, not a limitation.
        </p>
      </div>
    </div>
  );
}

export default PatentPortfolioTicker;
