import { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { getTier, getBoxNotation } from '@/lib/xpService';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface XPBoxDisplayProps {
  xp: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showExact?: boolean;
  animate?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { box: 'w-3 h-3', text: 'text-xs', gap: 'gap-0.5', bracket: 'text-xs' },
  md: { box: 'w-4 h-4', text: 'text-sm', gap: 'gap-1', bracket: 'text-sm' },
  lg: { box: 'w-6 h-6', text: 'text-base', gap: 'gap-1.5', bracket: 'text-base' },
} as const;

export function XPBoxDisplay({
  xp,
  size = 'md',
  showLabel = false,
  showExact = true,
  animate = false,
  className,
}: XPBoxDisplayProps) {
  const tier = useMemo(() => getTier(xp), [xp]);
  const { boxes, remainder } = useMemo(() => getBoxNotation(xp), [xp]);
  const sizeConfig = SIZE_CONFIG[size];

  const [visibleBoxes, setVisibleBoxes] = useState(animate ? 0 : boxes);

  useEffect(() => {
    if (!animate || boxes === 0) {
      setVisibleBoxes(boxes);
      return;
    }
    setVisibleBoxes(0);
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setVisibleBoxes(current);
      if (current >= boxes) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, [animate, boxes]);

  const content = (
    <div
      className={cn(
        'inline-flex items-center',
        sizeConfig.gap,
        tier.textColor,
        className
      )}
    >
      {showLabel && (
        <span
          className={cn(
            'font-semibold mr-1 rounded px-1.5 py-0.5',
            sizeConfig.text,
            tier.bgColor,
            tier.borderColor,
            'border'
          )}
        >
          {tier.name}
        </span>
      )}

      {/* Box notation */}
      <span className={cn('inline-flex items-center', sizeConfig.gap)}>
        {/* Filled boxes */}
        {boxes > 0 && (
          <>
            <span className={cn(sizeConfig.bracket, 'opacity-60')}>[</span>
            <span className={cn('inline-flex items-center', sizeConfig.gap)}>
              {Array.from({ length: boxes }).map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    sizeConfig.box,
                    'rounded-sm transition-all duration-200',
                    i < visibleBoxes
                      ? cn(tier.bgColor, 'border', tier.borderColor, 'opacity-100')
                      : 'opacity-0'
                  )}
                  style={{
                    backgroundColor:
                      i < visibleBoxes ? undefined : 'transparent',
                  }}
                >
                  {i < visibleBoxes && (
                    <span
                      className={cn(
                        'block w-full h-full rounded-sm',
                        tier.name === 'Bronze' && 'bg-amber-700',
                        tier.name === 'Silver' && 'bg-slate-400',
                        tier.name === 'Gold' && 'bg-yellow-500',
                        tier.name === 'Platinum' && 'bg-blue-400',
                        tier.name === 'Diamond' && 'bg-cyan-400',
                        tier.name === 'Obsidian' && 'bg-slate-200'
                      )}
                    />
                  )}
                </span>
              ))}
            </span>
            <span className={cn(sizeConfig.bracket, 'opacity-60')}>]</span>
          </>
        )}

        {/* Separator dash between boxes and remainder */}
        {boxes > 0 && (
          <span className={cn(sizeConfig.bracket, 'opacity-40')}>-</span>
        )}

        {/* Remainder */}
        <span className={cn(sizeConfig.bracket, 'opacity-60')}>[</span>
        <span className={cn(sizeConfig.text, 'font-mono font-medium tabular-nums')}>
          {remainder.toLocaleString()}
        </span>
        <span className={cn(sizeConfig.bracket, 'opacity-60')}>]</span>
      </span>
    </div>
  );

  if (!showExact) return content;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-default">{content}</span>
      </TooltipTrigger>
      <TooltipContent>
        <div className="text-center">
          <div className="font-semibold">{xp.toLocaleString()} XP</div>
          <div className={cn('text-xs', tier.textColor)}>{tier.name} Tier</div>
          {boxes > 0 && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {boxes} box{boxes !== 1 ? 'es' : ''} + {remainder.toLocaleString()} remainder
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
