/**
 * OverlayTrigger — "You Can Do Better" pulsing badge on data-overlay-id elements.
 * Only visible when X-Ray Design Mode is active.
 */
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface OverlayTriggerProps {
  elementRef: string;
  rect: DOMRect;
  onActivate: (elementRef: string) => void;
  hasOverlays?: boolean;
}

export function OverlayTrigger({ elementRef, rect, onActivate, hasOverlays }: OverlayTriggerProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="pointer-events-auto"
      style={{
        position: 'fixed',
        top: Math.max(4, rect.top - 12),
        left: Math.max(4, rect.left + rect.width / 2 - 70),
        zIndex: 10005,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => onActivate(elementRef)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.2rem 0.6rem',
          background: hovered
            ? 'rgba(245, 158, 11, 0.3)'
            : 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(234, 179, 8, 0.12) 100%)',
          border: `1px solid rgba(245, 158, 11, ${hovered ? '0.7' : '0.4'})`,
          borderRadius: '9999px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          animation: hasOverlays ? undefined : 'design-pulse 2s ease-in-out infinite',
          boxShadow: hovered ? '0 0 14px rgba(245, 158, 11, 0.4)' : '0 2px 8px rgba(0, 0, 0, 0.3)',
          whiteSpace: 'nowrap',
        }}
      >
        <Sparkles
          className="flex-shrink-0"
          style={{ width: 12, height: 12, color: 'rgba(251, 191, 36, 0.9)' }}
          strokeWidth={2}
        />
        <span
          style={{
            fontSize: '0.6rem',
            fontWeight: 700,
            color: 'rgba(251, 191, 36, 0.95)',
            letterSpacing: '0.03em',
          }}
        >
          {hasOverlays ? `${elementRef} — View Overlays` : 'You Can Do Better!'}
        </span>
      </button>

      <style>{`
        @keyframes design-pulse {
          0%, 100% { box-shadow: 0 0 4px rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 16px rgba(245, 158, 11, 0.5); }
        }
      `}</style>
    </div>
  );
}

export default OverlayTrigger;
