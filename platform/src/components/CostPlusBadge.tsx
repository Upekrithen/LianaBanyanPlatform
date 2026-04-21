/**
 * Cost + 20% Badge Component
 *
 * A NON-HIDEABLE visual contract badge that displays C+20 certification status.
 * This badge CANNOT be removed or hidden by CSS themes or white-label customization.
 * It is a trust signal to the community that pricing follows the cooperative model.
 */

import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  isCostPlusCertified,
  getCostPlusTier,
  getCostPlusTierInfo,
  type Anchor,
  type CostPlusTier
} from '@/lib/costPlusService';

interface CostPlusBadgeProps {
  anchor: Anchor | null | undefined;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
  className?: string;
}

/**
 * The main C+20 badge component.
 * Renders different states based on certification status and tier.
 */
export function CostPlusBadge({
  anchor,
  size = 'md',
  showDetails = false,
  className
}: CostPlusBadgeProps) {
  const tier = getCostPlusTier(anchor);
  const tierInfo = getCostPlusTierInfo(anchor);
  const isCertified = tier === 'FULL';

  // Size configurations
  const sizeConfig = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'text-sm font-bold',
    },
    md: {
      container: 'px-3 py-1.5',
      text: 'text-sm',
      icon: 'w-4 h-4',
      badge: 'text-base font-bold',
    },
    lg: {
      container: 'px-4 py-2',
      text: 'text-base',
      icon: 'w-5 h-5',
      badge: 'text-lg font-bold',
    },
    xl: {
      container: 'px-6 py-3',
      text: 'text-lg',
      icon: 'w-6 h-6',
      badge: 'text-2xl font-bold',
    },
  };

  const config = sizeConfig[size];

  // Revoked certification - show regardless of tier
  if (anchor?.cost_plus_revoked_at) {
    return (
      <div
        className={cn(
          'cplus-badge-revoked',
          'inline-flex items-center gap-2 rounded-lg',
          'bg-red-500/20 border border-red-500/50',
          config.container,
          className
        )}
        data-cplus-badge="revoked"
        aria-label="C+20 Certification Revoked"
      >
        <XCircle className={cn(config.icon, 'text-red-400')} />
        <span className={cn(config.text, 'text-red-300')}>
          Certification Revoked
        </span>
      </div>
    );
  }

  // Tier-based badge rendering
  const tierStyles: Record<CostPlusTier, { bg: string; border: string; text: string; icon: string }> = {
    FULL: {
      bg: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
      border: 'border-2 border-amber-400',
      text: 'text-white',
      icon: 'text-amber-300',
    },
    THREE_QUARTER: {
      bg: 'bg-gradient-to-r from-emerald-700 to-emerald-600',
      border: 'border-2 border-emerald-400',
      text: 'text-white',
      icon: 'text-emerald-300',
    },
    HALF: {
      bg: 'bg-gradient-to-r from-teal-700 to-teal-600',
      border: 'border-2 border-teal-400',
      text: 'text-white',
      icon: 'text-teal-300',
    },
    QUARTER: {
      bg: 'bg-gradient-to-r from-cyan-800 to-cyan-700',
      border: 'border border-cyan-500',
      text: 'text-white',
      icon: 'text-cyan-300',
    },
    NONE: {
      bg: 'bg-slate-700/50',
      border: 'border border-slate-600',
      text: 'text-slate-400',
      icon: 'text-slate-500',
    },
  };

  const style = tierStyles[tier];
  const ratioPercent = Math.round((tierInfo.ratio || 0) * 100);

  // Partial badges (QUARTER, HALF, THREE_QUARTER)
  if (tier !== 'NONE' && tier !== 'FULL') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          `cplus-badge-${tier.toLowerCase()}`,
          'inline-flex items-center gap-2 rounded-lg',
          style.bg,
          style.border,
          'shadow-lg',
          config.container,
          className
        )}
        style={{
          display: 'inline-flex !important',
          visibility: 'visible !important',
          opacity: '1 !important',
        }}
        data-cplus-badge={tier.toLowerCase()}
        aria-label={`C+20 ${tierInfo.shortLabel}`}
      >
        <PartialBadgeIcon tier={tier} className={cn(config.icon, style.icon)} />
        <div className="flex flex-col">
          <span className={cn(config.badge, style.text, 'tracking-tight')}>
            {tierInfo.shortLabel}
          </span>
          {showDetails && (
            <span className={cn(config.text, 'opacity-80 -mt-0.5', style.text)}>
              {ratioPercent}% C+20
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // Full badge - prominent green with gold accent
  if (tier === 'FULL') {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={cn(
          'cplus-badge-certified',
          'inline-flex items-center gap-2 rounded-lg',
          style.bg,
          style.border,
          'shadow-lg shadow-emerald-500/30',
          config.container,
          className
        )}
        style={{
          display: 'inline-flex !important',
          visibility: 'visible !important',
          opacity: '1 !important',
        }}
        data-cplus-badge="certified"
        aria-label="Cost + 20% Pricing Certified"
      >
        <CheckCircle className={cn(config.icon, style.icon)} />
        <div className="flex flex-col">
          <span className={cn(config.badge, style.text, 'tracking-tight')}>
            C+20%
          </span>
          {showDetails && (
            <span className={cn(config.text, 'text-emerald-100 -mt-0.5')}>
              Creators and Workers keep 83.3%
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  // No badge / Economics Unverified
  return (
    <div
      className={cn(
        'cplus-badge-unverified',
        'inline-flex items-center gap-2 rounded-lg',
        style.bg,
        style.border,
        config.container,
        className
      )}
      data-cplus-badge="unverified"
      aria-label="Economics Unverified"
    >
      <AlertCircle className={cn(config.icon, style.icon)} />
      <span className={cn(config.text, style.text)}>
        Economics Unverified
      </span>
    </div>
  );
}

/**
 * Partial badge icon - shows filled quarters based on tier.
 */
function PartialBadgeIcon({ tier, className }: { tier: CostPlusTier; className?: string }) {
  const quarters = tier === 'QUARTER' ? 1 : tier === 'HALF' ? 2 : tier === 'THREE_QUARTER' ? 3 : 0;

  return (
    <svg viewBox="0 0 24 24" className={cn('w-5 h-5', className)} fill="none" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="2" opacity="0.3" />
      {quarters >= 1 && (
        <path d="M12 2 A10 10 0 0 1 22 12 L12 12 Z" fill="currentColor" stroke="none" />
      )}
      {quarters >= 2 && (
        <path d="M22 12 A10 10 0 0 1 12 22 L12 12 Z" fill="currentColor" stroke="none" />
      )}
      {quarters >= 3 && (
        <path d="M12 22 A10 10 0 0 1 2 12 L12 12 Z" fill="currentColor" stroke="none" />
      )}
    </svg>
  );
}

/**
 * Compact inline badge for use in lists and cards.
 */
export function CostPlusBadgeInline({ anchor }: { anchor: Anchor | null | undefined }) {
  const isCertified = isCostPlusCertified(anchor);

  if (!isCertified) return null;

  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/50"
      data-cplus-badge="certified-inline"
    >
      <CheckCircle className="w-3 h-3 text-emerald-400" />
      <span className="text-xs font-semibold text-emerald-300">C+20%</span>
    </span>
  );
}

/**
 * Large hero badge for featured placements.
 */
export function CostPlusBadgeHero({ anchor }: { anchor: Anchor | null | undefined }) {
  const isCertified = isCostPlusCertified(anchor);

  if (!isCertified) return null;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="relative"
      data-cplus-badge="certified-hero"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-emerald-500/30 blur-xl rounded-full" />

      {/* Badge */}
      <div className="relative flex flex-col items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 border-4 border-amber-400 shadow-2xl">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8 text-amber-300" />
          <span className="text-4xl font-black text-white tracking-tight">C+20%</span>
        </div>
        <div className="text-center">
          <p className="text-emerald-100 font-medium">Cost + 20% Certified</p>
          <p className="text-emerald-200 text-sm">Creators and Workers keep 83.3% of every transaction</p>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Badge with economic comparison (shows what certified vs uncertified earns).
 */
export function CostPlusBadgeWithComparison({
  anchor,
  baseJoules = 100,
  baseMarks = 50,
}: {
  anchor: Anchor | null | undefined;
  baseJoules?: number;
  baseMarks?: number;
}) {
  const isCertified = isCostPlusCertified(anchor);

  const certifiedJoules = baseJoules * 1.0;
  const certifiedMarks = baseMarks * 1.0;
  const uncertifiedJoules = baseJoules * 0.25;
  const uncertifiedMarks = baseMarks * 0.50;

  return (
    <div className="space-y-3">
      <CostPlusBadge anchor={anchor} size="lg" showDetails />

      <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
        <div className={cn(
          'p-3 rounded-lg',
          isCertified ? 'bg-emerald-500/20 border border-emerald-500/50' : 'bg-slate-700/50'
        )}>
          <p className="text-xs text-slate-400 mb-1">If Certified</p>
          <p className="text-lg font-bold text-emerald-400">{certifiedJoules} Joules</p>
          <p className="text-sm text-emerald-300">{certifiedMarks} Marks</p>
          <p className="text-xs text-emerald-200 mt-1">+ IP stake eligible</p>
        </div>

        <div className={cn(
          'p-3 rounded-lg',
          !isCertified ? 'bg-slate-600/50 border border-slate-500/50' : 'bg-slate-700/50'
        )}>
          <p className="text-xs text-slate-400 mb-1">If Not Certified</p>
          <p className="text-lg font-bold text-slate-400">{uncertifiedJoules} Joules</p>
          <p className="text-sm text-slate-500">{uncertifiedMarks} Marks</p>
          <p className="text-xs text-slate-500 mt-1">No IP stakes</p>
        </div>
      </div>

      {!isCertified && (
        <p className="text-sm text-amber-400 text-center">
          Get certified to earn <strong>4× more Joules</strong> and unlock IP stake eligibility!
        </p>
      )}
    </div>
  );
}

export default CostPlusBadge;
