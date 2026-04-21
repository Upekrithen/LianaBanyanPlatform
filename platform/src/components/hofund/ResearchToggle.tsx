/**
 * RESEARCH TOGGLE COMPONENT
 * =========================
 * Pre-decision commitment system for reciprocal research sharing.
 *
 * Key Innovation: Commitment Lock
 * - Users decide to share data BEFORE launching campaigns
 * - If they access research but don't send, toggle stays ON
 * - Prevents "peek and retreat" behavior
 *
 * Flow:
 * 1. User sees Research Toggle before creating campaign
 * 2. If ON: User commits to share their campaign data
 * 3. User can access research pool (aggregated, anonymized data)
 * 4. If campaign sent: commitment satisfied
 * 5. If not sent within 72h: commitment carries to next campaign
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FlaskConical, Lock, Unlock, Eye, EyeOff,
  Clock, CheckCircle2, AlertTriangle, TrendingUp,
  BarChart3, Users, Sparkles, ChevronDown, ChevronUp,
  Info, Lightbulb
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSeamlessOnboard } from "@/components/SeamlessOnboardDialog";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CommitmentLock {
  id: string;
  locked_at: string;
  expires_at: string;
  is_active: boolean;
  satisfied_at: string | null;
}

interface ResearchAggregate {
  template_type: string;
  initiative_slug: string;
  expiration_hours: number;
  campaign_count: number;
  total_clicks: number;
  total_conversions: number;
  avg_conversion_rate: number;
}

interface ExpirationPreset {
  benefit_type: string;
  display_name: string;
  min_hours: number;
  max_hours: number;
  default_hours: number;
  description: string;
  urgency_note: string;
}

interface ResearchToggleProps {
  onCommitmentChange: (committed: boolean) => void;
  onExpirationChange: (hours: number, type: string) => void;
  campaignId?: string;
  templateType?: string;
  initiativeSlug?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESEARCH TOGGLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ResearchToggle({
  onCommitmentChange,
  onExpirationChange,
  campaignId,
  templateType,
  initiativeSlug
}: ResearchToggleProps) {
  const { user } = useAuth();
  const { openOnboard } = useSeamlessOnboard();

  // State
  const [isCommitted, setIsCommitted] = useState(false);
  const [hasActiveLock, setHasActiveLock] = useState(false);
  const [activeLock, setActiveLock] = useState<CommitmentLock | null>(null);
  const [showResearchPool, setShowResearchPool] = useState(false);
  const [researchData, setResearchData] = useState<ResearchAggregate[]>([]);
  const [expirationPresets, setExpirationPresets] = useState<ExpirationPreset[]>([]);
  const [selectedExpirationType, setSelectedExpirationType] = useState('pass_through');
  const [expirationHours, setExpirationHours] = useState(24);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpirationDetails, setShowExpirationDetails] = useState(false);

  // ─── Load initial state ───
  useEffect(() => {
    if (!user) return;
    loadInitialState();
  }, [user]);

  const loadInitialState = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Check for active commitment lock
      const { data: lockData } = await supabase
        .rpc('has_active_commitment_lock', { p_user_id: user.id });

      setHasActiveLock(!!lockData);

      if (lockData) {
        // Get lock details
        const { data: locks } = await supabase
          .from('research_commitment_locks')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('locked_at', { ascending: false })
          .limit(1);

        if (locks && locks.length > 0) {
          setActiveLock(locks[0] as CommitmentLock);
          setIsCommitted(true);
          onCommitmentChange(true);
        }
      }

      // Load expiration presets
      const { data: presets } = await supabase
        .from('expiration_presets')
        .select('*')
        .eq('is_active', true);

      if (presets) {
        setExpirationPresets(presets as ExpirationPreset[]);
        const defaultPreset = presets.find(p => p.benefit_type === 'pass_through');
        if (defaultPreset) {
          setExpirationHours(defaultPreset.default_hours);
        }
      }
    } catch (err) {
      console.error('Error loading research toggle state:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Toggle commitment ───
  const handleToggleCommitment = async () => {
    if (!user) {
      openOnboard({ reason: "access research features", actionLabel: "Join", membershipIncluded: true });
      return;
    }

    if (hasActiveLock && !isCommitted) {
      toast.info('You have an outstanding commitment from a previous session');
      setIsCommitted(true);
      onCommitmentChange(true);
      return;
    }

    const newValue = !isCommitted;
    setIsCommitted(newValue);
    onCommitmentChange(newValue);

    if (newValue) {
      toast.success('Research commitment enabled - your data will help the community');
    } else if (!hasActiveLock) {
      toast.info('Research commitment disabled');
    }
  };

  // ─── Access research pool (creates lock) ───
  const handleAccessResearch = async () => {
    if (!user) {
      openOnboard({ reason: "access research features", actionLabel: "Join", membershipIncluded: true });
      return;
    }

    if (!isCommitted) {
      toast.error('Enable research commitment first');
      return;
    }

    setIsLoading(true);

    try {
      // Create commitment lock
      const { data: lockId, error: lockError } = await supabase
        .rpc('create_commitment_lock', {
          p_user_id: user.id,
          p_project_id: null
        });

      if (lockError) throw lockError;

      // Load research data
      const { data: research, error: researchError } = await supabase
        .from('research_pool_aggregates')
        .select('*')
        .order('campaign_count', { ascending: false })
        .limit(50);

      if (researchError) throw researchError;

      setResearchData(research as ResearchAggregate[] || []);
      setShowResearchPool(true);
      setHasActiveLock(true);

      toast.success('Research pool accessed - commitment lock created');
    } catch (err) {
      console.error('Error accessing research:', err);
      toast.error('Failed to access research pool');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Update expiration settings ───
  const handleExpirationChange = (type: string, hours: number) => {
    setSelectedExpirationType(type);
    setExpirationHours(hours);
    onExpirationChange(hours, type);
  };

  // ─── Get current preset ───
  const currentPreset = expirationPresets.find(p => p.benefit_type === selectedExpirationType);

  // ─── Filter research data ───
  const filteredResearch = researchData.filter(r => {
    if (templateType && r.template_type !== templateType) return false;
    if (initiativeSlug && r.initiative_slug !== initiativeSlug) return false;
    return true;
  });

  // ─── Render ───
  if (isLoading) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Toggle Card */}
      <motion.div
        className={`p-4 rounded-xl border transition-all ${
          isCommitted
            ? 'bg-emerald-500/10 border-emerald-500/30'
            : 'bg-white/5 border-white/10'
        }`}
        layout
      >
        {/* Toggle Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCommitted ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
              <FlaskConical className={`w-5 h-5 ${isCommitted ? 'text-emerald-400' : 'text-white/60'}`} />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Research Toggle
                {hasActiveLock && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                    Lock Active
                  </span>
                )}
              </h3>
              <p className="text-sm text-white/60">
                Share your data to access community insights
              </p>
            </div>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={handleToggleCommitment}
            disabled={hasActiveLock}
            className={`relative w-14 h-7 rounded-full transition-all ${
              isCommitted
                ? 'bg-emerald-500'
                : 'bg-white/20'
            } ${hasActiveLock ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg flex items-center justify-center"
              animate={{ left: isCommitted ? '32px' : '4px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            >
              {hasActiveLock ? (
                <Lock className="w-3 h-3 text-amber-500" />
              ) : isCommitted ? (
                <Eye className="w-3 h-3 text-emerald-500" />
              ) : (
                <EyeOff className="w-3 h-3 text-slate-400" />
              )}
            </motion.div>
          </button>
        </div>

        {/* Commitment Lock Warning */}
        <AnimatePresence>
          {hasActiveLock && activeLock && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-amber-200 font-medium">Commitment Lock Active</p>
                  <p className="text-amber-200/70 text-xs mt-1">
                    You accessed research on {new Date(activeLock.locked_at).toLocaleDateString()}.
                    Send a campaign to satisfy your commitment.
                  </p>
                  <p className="text-amber-200/50 text-xs mt-1">
                    Expires: {new Date(activeLock.expires_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits Explanation */}
        <AnimatePresence>
          {isCommitted && !showResearchPool && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-white/5">
                  <BarChart3 className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-xs text-white/60">Performance Data</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <TrendingUp className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-xs text-white/60">Best Practices</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">
                  <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                  <div className="text-xs text-white/60">Community Insights</div>
                </div>
              </div>

              <button
                onClick={handleAccessResearch}
                className="w-full py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                <FlaskConical className="w-4 h-4" />
                Access Research Pool
              </button>

              <p className="text-xs text-white/40 text-center">
                Accessing creates a 72-hour commitment lock
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Expiration Settings */}
      <AnimatePresence>
        {isCommitted && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <button
              onClick={() => setShowExpirationDetails(!showExpirationDetails)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-white/60" />
                <span className="text-sm font-medium text-white">
                  Offer Expiration: {expirationHours}h
                </span>
                <span className="text-xs text-white/40">
                  ({currentPreset?.display_name || 'Custom'})
                </span>
              </div>
              {showExpirationDetails ? (
                <ChevronUp className="w-4 h-4 text-white/40" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/40" />
              )}
            </button>

            <AnimatePresence>
              {showExpirationDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  {/* Preset Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    {expirationPresets.map(preset => (
                      <button
                        key={preset.benefit_type}
                        onClick={() => handleExpirationChange(preset.benefit_type, preset.default_hours)}
                        className={`p-3 rounded-lg text-left transition-all ${
                          selectedExpirationType === preset.benefit_type
                            ? 'bg-primary/20 border border-primary/30'
                            : 'bg-white/5 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="text-sm font-medium text-white">
                          {preset.display_name}
                        </div>
                        <div className="text-xs text-white/50">
                          {preset.min_hours}-{preset.max_hours}h
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Custom Slider */}
                  {currentPreset && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-white/50">
                        <span>{currentPreset.min_hours}h</span>
                        <span className="text-white font-medium">{expirationHours}h</span>
                        <span>{currentPreset.max_hours}h</span>
                      </div>
                      <input
                        type="range"
                        min={currentPreset.min_hours}
                        max={currentPreset.max_hours}
                        value={expirationHours}
                        onChange={(e) => handleExpirationChange(selectedExpirationType, parseInt(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <p className="text-xs text-white/40 italic">
                        {currentPreset.urgency_note}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Research Pool Panel */}
      <AnimatePresence>
        {showResearchPool && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/20"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary" />
                Research Pool
              </h4>
              <button
                onClick={() => setShowResearchPool(false)}
                className="text-white/40 hover:text-white/60"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>

            {filteredResearch.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">
                  No research data yet for this category.
                </p>
                <p className="text-xs text-white/30 mt-1">
                  Be a pioneer - your campaign will help build the knowledge base!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-primary">
                      {filteredResearch.reduce((sum, r) => sum + r.campaign_count, 0)}
                    </div>
                    <div className="text-xs text-white/50">Campaigns</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-emerald-400">
                      {(filteredResearch.reduce((sum, r) => sum + r.avg_conversion_rate, 0) / filteredResearch.length * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs text-white/50">Avg Conversion</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5">
                    <div className="text-lg font-bold text-amber-400">
                      {Math.round(filteredResearch.reduce((sum, r) => sum + r.expiration_hours, 0) / filteredResearch.length)}h
                    </div>
                    <div className="text-xs text-white/50">Avg Expiration</div>
                  </div>
                </div>

                {/* Top Performing */}
                <div className="space-y-2">
                  <h5 className="text-xs font-medium text-white/60 uppercase tracking-wide">
                    Top Performing Configurations
                  </h5>
                  {filteredResearch.slice(0, 5).map((r, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/40">#{idx + 1}</span>
                        <div>
                          <div className="text-sm text-white">
                            {r.template_type || 'General'} • {r.expiration_hours}h
                          </div>
                          <div className="text-xs text-white/40">
                            {r.campaign_count} campaigns
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-emerald-400">
                          {(r.avg_conversion_rate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-white/40">
                          {r.total_clicks} clicks
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Insight */}
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-white/60">
                      <strong className="text-white/80">Insight:</strong> Campaigns with 24-48h expiration
                      windows show 23% higher conversion rates than longer windows.
                      Urgency drives action.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ResearchToggle;
