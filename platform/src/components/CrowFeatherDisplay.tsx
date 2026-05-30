/**
 * CROW FEATHER DISPLAY
 * =====================
 * Displays a user's Crow Feathers - permanent achievements earned by setting records.
 * These are the ONLY thing that persists in Ghost World.
 *
 * "The only persistent thing for ghosts." — Founder
 *
 * @see DESIGN_DOCS/WILL_O_WISP_SYSTEM.md
 */

import React, { useState, useEffect } from 'react';
import {
  Feather,
  Trophy,
  Clock,
  Zap,
  Sparkles,
  Crown,
  Star
} from 'lucide-react';
import {
  getUserCrowFeathers,
  getCrowFeatherCount,
  CrowFeather,
  FeatherCategory
} from '@/lib/crowFeatherService';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import './CrowFeatherDisplay.css';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface CrowFeatherDisplayProps {
  userId?: string;
  variant?: 'badge' | 'full' | 'inline';
  showDetails?: boolean;
  maxVisible?: number;
  className?: string;
}

interface CategoryInfo {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY METADATA
// ═══════════════════════════════════════════════════════════════════════════════

const CATEGORY_INFO: Record<FeatherCategory, CategoryInfo> = {
  chase_speed: {
    icon: <Zap className="w-4 h-4" />,
    name: 'Speed Demon',
    description: 'Fastest chase completion',
    color: '#fbbf24',
  },
  chase_streak: {
    icon: <Sparkles className="w-4 h-4" />,
    name: 'Unstoppable',
    description: 'Longest win streak',
    color: '#a78bfa',
  },
  chase_earnings: {
    icon: <Trophy className="w-4 h-4" />,
    name: 'Big Winner',
    description: 'Most Marks earned in a single chase',
    color: '#34d399',
  },
  discovery: {
    icon: <Star className="w-4 h-4" />,
    name: 'Explorer',
    description: 'Most areas discovered',
    color: '#60a5fa',
  },
  golden_keys: {
    icon: <Crown className="w-4 h-4" />,
    name: 'Key Master',
    description: 'Most golden keys collected',
    color: '#f472b6',
  },
  candles: {
    icon: <Feather className="w-4 h-4" />,
    name: 'Light Bearer',
    description: 'Most candles collected',
    color: '#fb923c',
  },
  mirror_travel: {
    icon: <Clock className="w-4 h-4" />,
    name: 'Mirror Walker',
    description: 'Most mirrors traversed',
    color: '#22d3ee',
  },
  red_crow: {
    icon: (
      <img
        src="/characters/pfp/PFPcrow_red.png"
        alt="Red Crow"
        className="w-4 h-4 object-contain"
        style={{ filter: 'hue-rotate(300deg) saturate(3) brightness(0.85)' }}
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
      />
    ),
    name: 'Red Crow',
    description: 'First cohort — connected before the cert. The crow remembers.',
    color: '#ef4444',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Single Crow Feather badge
 */
const FeatherBadge: React.FC<{ feather: CrowFeather; showTooltip?: boolean }> = ({
  feather,
  showTooltip = true,
}) => {
  const info = CATEGORY_INFO[feather.category];

  const badge = (
    <div
      className="crow-feather-badge"
      style={{ borderColor: info.color, boxShadow: `0 0 10px ${info.color}40` }}
    >
      <div className="feather-icon" style={{ color: info.color }}>
        {info.icon}
      </div>
      <span className="feather-number">#{feather.featherNumber}</span>
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 border-slate-700 text-white">
          <div className="p-2">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: info.color }}>{info.icon}</span>
              <span className="font-semibold">{info.name}</span>
            </div>
            <p className="text-xs text-slate-400">{info.description}</p>
            <p className="text-xs text-slate-500 mt-1">
              Record: {formatRecordValue(feather.category, feather.recordValue)}
            </p>
            <p className="text-xs text-slate-600 mt-1">
              {new Date(feather.achievedAt).toLocaleDateString()}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

/**
 * Format record value based on category
 */
function formatRecordValue(category: FeatherCategory, value: number): string {
  switch (category) {
    case 'chase_speed':
      const seconds = Math.floor(value / 1000);
      const ms = value % 1000;
      return `${seconds}.${ms.toString().padStart(3, '0')}s`;
    case 'chase_earnings':
      return `${value} Marks`;
    case 'chase_streak':
      return `${value} wins`;
    case 'red_crow':
      return 'First cohort';
    default:
      return `${value}`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export const CrowFeatherDisplay: React.FC<CrowFeatherDisplayProps> = ({
  userId,
  variant = 'badge',
  showDetails = false,
  maxVisible = 5,
  className = '',
}) => {
  const [feathers, setFeathers] = useState<CrowFeather[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeathers() {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const [userFeathers, count] = await Promise.all([
        getUserCrowFeathers(userId),
        getCrowFeatherCount(userId),
      ]);

      setFeathers(userFeathers);
      setTotalCount(count);
      setLoading(false);
    }

    loadFeathers();
  }, [userId]);

  // Loading state
  if (loading) {
    return (
      <div className={`crow-feather-display ${variant} loading ${className}`}>
        <Feather className="w-4 h-4 animate-pulse" />
      </div>
    );
  }

  // No feathers
  if (feathers.length === 0) {
    if (variant === 'inline') {
      return null; // Don't show anything inline if no feathers
    }
    return (
      <div className={`crow-feather-display ${variant} empty ${className}`}>
        <Feather className="w-4 h-4 text-slate-600" />
        <span className="text-slate-500 text-sm">No Crow Feathers yet</span>
      </div>
    );
  }

  // Badge variant - compact display
  if (variant === 'badge') {
    return (
      <div className={`crow-feather-display badge ${className}`}>
        <div className="feather-count-badge">
          <Feather className="w-4 h-4 text-amber-400" />
          <span className="count">{totalCount}</span>
        </div>
      </div>
    );
  }

  // Inline variant - small row of feather icons
  if (variant === 'inline') {
    const visibleFeathers = feathers.slice(0, maxVisible);
    const remaining = feathers.length - maxVisible;

    return (
      <div className={`crow-feather-display inline ${className}`}>
        <div className="feather-row">
          {visibleFeathers.map((feather) => (
            <FeatherBadge key={feather.id} feather={feather} />
          ))}
          {remaining > 0 && (
            <span className="more-count">+{remaining}</span>
          )}
        </div>
      </div>
    );
  }

  // Full variant - detailed list
  return (
    <div className={`crow-feather-display full ${className}`}>
      <div className="feather-header">
        <Feather className="w-5 h-5 text-amber-400" />
        <h3>Crow Feathers</h3>
        <span className="total-count">{totalCount}</span>
      </div>

      <div className="feather-grid">
        {feathers.map((feather) => {
          const info = CATEGORY_INFO[feather.category];
          return (
            <div
              key={feather.id}
              className="feather-card"
              style={{ borderColor: info.color }}
            >
              <div className="feather-card-header" style={{ color: info.color }}>
                {info.icon}
                <span className="feather-name">{info.name}</span>
                <span className="feather-number">#{feather.featherNumber}</span>
              </div>

              <div className="feather-card-body">
                <p className="feather-description">{info.description}</p>
                <p className="feather-record">
                  Record: {formatRecordValue(feather.category, feather.recordValue)}
                </p>
                {feather.difficulty && (
                  <p className="feather-difficulty">Difficulty: {feather.difficulty}</p>
                )}
              </div>

              <div className="feather-card-footer">
                <span className="feather-date">
                  {new Date(feather.achievedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {showDetails && feathers.length > 0 && (
        <div className="feather-stats">
          <p className="text-sm text-slate-400">
            Categories conquered: {new Set(feathers.map(f => f.category)).size} / {Object.keys(CATEGORY_INFO).length}
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Small badge to show in headers/nav
 */
export const CrowFeatherBadge: React.FC<{ userId?: string; className?: string }> = ({
  userId,
  className = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      if (userId) {
        const c = await getCrowFeatherCount(userId);
        setCount(c);
      }
    }
    loadCount();
  }, [userId]);

  if (count === 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 ${className}`}>
            <Feather className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">{count}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-900 border-slate-700">
          <p className="text-sm">
            <span className="text-amber-400">{count}</span> Crow Feather{count !== 1 ? 's' : ''} earned
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CrowFeatherDisplay;
