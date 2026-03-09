/**
 * PathwayLink — Navigation link with level indicator
 * 
 * Shows level badge and handles locked state for progressive disclosure.
 * Links above user's current level are shown but disabled with lock icon.
 */

import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Lock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PathwayLevel } from '@/lib/pathwayLevels';
import { cn } from '@/lib/utils';

interface PathwayLinkProps {
  to: string;
  level: PathwayLevel;
  userLevel?: PathwayLevel;
  children: React.ReactNode;
  icon?: React.ReactNode;
  description?: string;
  className?: string;
  variant?: 'default' | 'card' | 'compact' | 'button';
  showLevelBadge?: boolean;
  onClick?: () => void;
}

const LEVEL_COLORS: Record<PathwayLevel, { bg: string; text: string; border: string; glow: string }> = {
  1: { 
    bg: 'bg-green-500/20', 
    text: 'text-green-400', 
    border: 'border-green-500/30',
    glow: 'hover:shadow-green-500/20'
  },
  2: { 
    bg: 'bg-blue-500/20', 
    text: 'text-blue-400', 
    border: 'border-blue-500/30',
    glow: 'hover:shadow-blue-500/20'
  },
  3: { 
    bg: 'bg-purple-500/20', 
    text: 'text-purple-400', 
    border: 'border-purple-500/30',
    glow: 'hover:shadow-purple-500/20'
  },
};

const LEVEL_LABELS: Record<PathwayLevel, string> = {
  1: 'Starter',
  2: 'Intermediate', 
  3: 'Advanced',
};

export function PathwayLink({
  to,
  level,
  userLevel = 1,
  children,
  icon,
  description,
  className,
  variant = 'default',
  showLevelBadge = true,
  onClick,
}: PathwayLinkProps) {
  const isLocked = level > userLevel;
  const colors = LEVEL_COLORS[level];

  // Compact variant - inline badge
  if (variant === 'compact') {
    if (isLocked) {
      return (
        <span className={cn(
          "inline-flex items-center gap-1.5 text-white/40 cursor-not-allowed",
          className
        )}>
          <Lock className="w-3 h-3" />
          {children}
          {showLevelBadge && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 opacity-50">
              Lvl {level}
            </Badge>
          )}
        </span>
      );
    }

    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "inline-flex items-center gap-1.5 hover:text-white transition-colors",
          colors.text,
          className
        )}
      >
        {icon}
        {children}
        {showLevelBadge && (
          <Badge className={cn("text-[10px] px-1 py-0 h-4", colors.bg, colors.text)}>
            {level}
          </Badge>
        )}
      </Link>
    );
  }

  // Button variant
  if (variant === 'button') {
    if (isLocked) {
      return (
        <div className={cn(
          "flex items-center justify-between px-4 py-3 rounded-lg",
          "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed",
          className
        )}>
          <div className="flex items-center gap-3">
            {icon && <span className="text-white/40">{icon}</span>}
            <div>
              <div className="text-white/40 font-medium">{children}</div>
              {description && <div className="text-xs text-white/30">{description}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs opacity-50">Lvl {level}</Badge>
            <Lock className="w-4 h-4 text-white/30" />
          </div>
        </div>
      );
    }

    return (
      <Link
        to={to}
        onClick={onClick}
        className={cn(
          "flex items-center justify-between px-4 py-3 rounded-lg transition-all",
          "bg-white/5 border hover:bg-white/10",
          colors.border, colors.glow, "hover:shadow-lg",
          className
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className={colors.text}>{icon}</span>}
          <div>
            <div className="text-white font-medium">{children}</div>
            {description && <div className="text-xs text-white/60">{description}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showLevelBadge && (
            <Badge className={cn("text-xs", colors.bg, colors.text)}>
              Lvl {level}
            </Badge>
          )}
          <ChevronRight className={cn("w-4 h-4", colors.text)} />
        </div>
      </Link>
    );
  }

  // Card variant
  if (variant === 'card') {
    if (isLocked) {
      return (
        <div className={cn(
          "relative p-4 rounded-xl bg-white/5 border border-white/10",
          "opacity-50 cursor-not-allowed",
          className
        )}>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="text-xs opacity-50">
              <Lock className="w-3 h-3 mr-1" />
              Lvl {level}
            </Badge>
          </div>
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl opacity-50">{icon}</span>}
            <h3 className="font-semibold text-white/40">{children}</h3>
          </div>
          {description && (
            <p className="text-sm text-white/30">{description}</p>
          )}
          <div className="mt-3 text-xs text-white/30">
            Complete Level {level - 1} three-pack to unlock
          </div>
        </div>
      );
    }

    return (
      <Link to={to} onClick={onClick}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "relative p-4 rounded-xl transition-all cursor-pointer",
            "bg-white/5 border hover:bg-white/10",
            colors.border, colors.glow, "hover:shadow-lg",
            className
          )}
        >
          {showLevelBadge && (
            <div className="absolute top-2 right-2">
              <Badge className={cn("text-xs", colors.bg, colors.text)}>
                Lvl {level}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-3 mb-2">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="font-semibold text-white">{children}</h3>
          </div>
          {description && (
            <p className="text-sm text-white/60">{description}</p>
          )}
          <div className={cn("mt-3 flex items-center gap-1 text-xs", colors.text)}>
            <span>Explore</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </motion.div>
      </Link>
    );
  }

  // Default variant - simple link with badge
  if (isLocked) {
    return (
      <span className={cn(
        "flex items-center gap-2 text-white/40 cursor-not-allowed",
        className
      )}>
        <Lock className="w-4 h-4" />
        {icon}
        {children}
        {showLevelBadge && (
          <Badge variant="outline" className="text-xs opacity-50">Lvl {level}</Badge>
        )}
      </span>
    );
  }

  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 transition-colors hover:text-white",
        colors.text,
        className
      )}
    >
      {icon}
      {children}
      {showLevelBadge && (
        <Badge className={cn("text-xs", colors.bg, colors.text)}>
          {level}
        </Badge>
      )}
      <ChevronRight className="w-4 h-4 opacity-50" />
    </Link>
  );
}

// Simplified exports for common use cases
export function Level1Link(props: Omit<PathwayLinkProps, 'level'>) {
  return <PathwayLink {...props} level={1} />;
}

export function Level2Link(props: Omit<PathwayLinkProps, 'level'>) {
  return <PathwayLink {...props} level={2} />;
}

export function Level3Link(props: Omit<PathwayLinkProps, 'level'>) {
  return <PathwayLink {...props} level={3} />;
}

export default PathwayLink;
