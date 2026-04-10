/**
 * MascotBubble — Reusable character explanation panel.
 * ==============================================================
 * Drop-in reusable bubble styled like the floating mascot hover
 * tooltip. Use anywhere the platform needs a character-voiced,
 * context-aware explanation (auth gates, feature locks, empty states,
 * tutorial overlays, permission walls).
 *
 * Introduced B080.
 */

import React from 'react';
import { Glasses } from 'lucide-react';

export interface MascotBubbleProps {
  /** Bold title in cyan at the top of the bubble. */
  title?: string;
  /** Main explanation message. Can include JSX for inline accents. */
  message: React.ReactNode;
  /** Optional secondary helper text below the main message. */
  helperMessage?: React.ReactNode;
  /** Show the glasses icon + title row. Default true. */
  showIcon?: boolean;
  /** Show the connecting tail at the bottom-right (tooltip mode). Default false. */
  tail?: boolean;
  /** Max width of the bubble. Default 320px. */
  maxWidth?: number;
  /** Optional className for outer wrapper positioning. */
  className?: string;
  /** Override border color (default: cyan X-Ray). */
  borderColor?: string;
  /** Override title color (default: cyan-300). */
  titleColor?: string;
  /** Children render after the message block (for CTAs, inputs, etc.). */
  children?: React.ReactNode;
}

export const MascotBubble: React.FC<MascotBubbleProps> = ({
  title,
  message,
  helperMessage,
  showIcon = true,
  tail = false,
  maxWidth = 320,
  className,
  borderColor,
  titleColor,
  children,
}) => {
  return (
    <div className={className} style={{ width: 'max-content', maxWidth }}>
      <div
        className="relative px-4 py-3 rounded-xl text-xs leading-relaxed"
        style={{
          background: 'rgba(15, 23, 42, 0.97)',
          border: `1.5px solid ${borderColor || 'rgba(34, 211, 238, 0.45)'}`,
          color: '#e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}
      >
        {showIcon && title && (
          <div className="flex items-center gap-2 mb-1.5">
            <Glasses className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="font-bold text-[13px]" style={{ color: titleColor || '#67e8f9' }}>{title}</span>
          </div>
        )}
        {!showIcon && title && (
          <div className="font-bold text-[13px] mb-1.5" style={{ color: titleColor || '#67e8f9' }}>{title}</div>
        )}
        <div className="text-slate-300 text-[12px] leading-snug" style={{ minHeight: '3.6em' }}>{message}</div>
        {helperMessage && (
          <div className="text-slate-400 text-[11px] leading-snug mt-1.5">
            {helperMessage}
          </div>
        )}
        {children && <div className="mt-3">{children}</div>}
        {tail && (
          <div
            className="absolute -bottom-1.5 right-6 w-3 h-3 rotate-45"
            style={{
              background: 'rgba(15, 23, 42, 0.97)',
              borderRight: `1.5px solid ${borderColor || 'rgba(34, 211, 238, 0.45)'}`,
              borderBottom: `1.5px solid ${borderColor || 'rgba(34, 211, 238, 0.45)'}`,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MascotBubble;
