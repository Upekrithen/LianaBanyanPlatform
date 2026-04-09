import { useState, useRef, useEffect } from 'react';
import { getElbowGreaseLevel } from '@/data/elbowGreaseScale';

interface ElbowGreaseBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  soloEarning?: string;
  crewEarning?: string;
  processSteps?: string[];
}

const SIZE_MAP = { sm: 16, md: 32, lg: 64 } as const;

function OilCanIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Spout */}
      <path d="M46 20L58 14L60 18L48 24Z" fill={color} opacity={0.9} />
      {/* Body */}
      <rect x="12" y="20" width="36" height="28" rx="4" fill={color} opacity={0.85} />
      {/* Handle */}
      <path d="M20 20V10H28V20" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Oil drop */}
      <ellipse cx="60" cy="22" rx="2.5" ry="3.5" fill={color} opacity={0.6} />
      {/* Label band */}
      <rect x="16" y="30" width="28" height="8" rx="2" fill="rgba(0,0,0,0.25)" />
      {/* Base */}
      <rect x="10" y="48" width="40" height="4" rx="2" fill={color} opacity={0.7} />
    </svg>
  );
}

export function ElbowGreaseBadge({
  level,
  size = 'md',
  showLabel = false,
  soloEarning,
  crewEarning,
  processSteps,
}: ElbowGreaseBadgeProps) {
  const [flipped, setFlipped] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const info = getElbowGreaseLevel(level);
  const px = SIZE_MAP[size];

  useEffect(() => {
    if (!flipped) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFlipped(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [flipped]);

  const hasBack = soloEarning || crewEarning || (processSteps && processSteps.length > 0);
  const isInteractive = hasBack || size === 'lg';
  const badgeW = size === 'sm' ? px + 4 : size === 'md' ? px + 12 : px + 24;
  const badgeH = size === 'sm' ? px + 4 : size === 'md' ? px + 12 : px + 60;

  return (
    <div
      ref={containerRef}
      className="inline-block"
      style={{ perspective: '600px' }}
    >
      <div
        onClick={() => isInteractive && setFlipped(!flipped)}
        title={`Elbow Grease Level ${info.level}: ${info.name} — ${info.description}`}
        style={{
          width: badgeW,
          minHeight: badgeH,
          cursor: isInteractive ? 'pointer' : 'default',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}
      >
        {/* ── Front ── */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: size === 'sm' ? 0 : 4,
            background: `${info.color}15`,
            border: `1px solid ${info.color}40`,
            borderRadius: size === 'sm' ? '0.25rem' : '0.5rem',
            padding: size === 'sm' ? '2px' : '6px',
          }}
        >
          <OilCanIcon size={px} color={info.color} />
          {size !== 'sm' && (
            <span style={{ fontSize: size === 'md' ? '0.6rem' : '0.75rem', color: info.color, fontWeight: 700 }}>
              Lv {info.level}
            </span>
          )}
          {(showLabel || size === 'lg') && (
            <>
              <span style={{ fontSize: size === 'lg' ? '0.8rem' : '0.65rem', color: '#e2e8f0', fontWeight: 600 }}>
                {info.name}
              </span>
              <span style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: 'center' }}>
                {info.marksRange} Marks
              </span>
            </>
          )}
        </div>

        {/* ── Back ── */}
        {hasBack && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: 'rgba(15, 23, 42, 0.98)',
              border: `1px solid ${info.color}60`,
              borderRadius: size === 'sm' ? '0.25rem' : '0.5rem',
              padding: size === 'sm' ? '4px' : '8px',
              overflow: 'auto',
              minWidth: size === 'lg' ? 200 : 160,
              minHeight: size === 'lg' ? 180 : 120,
            }}
          >
            <div style={{ fontSize: '0.65rem', color: info.color, fontWeight: 700, marginBottom: 4 }}>
              Level {info.level}: {info.name}
            </div>

            {processSteps && processSteps.length > 0 && (
              <ol style={{ margin: 0, padding: '0 0 0 14px', fontSize: '0.6rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                {processSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            )}

            {(soloEarning || crewEarning) && (
              <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {soloEarning && (
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Solo:</span> {soloEarning}
                  </div>
                )}
                {crewEarning && (
                  <div style={{ fontSize: '0.6rem', color: '#94a3b8' }}>
                    <span style={{ color: '#22d3ee', fontWeight: 600 }}>Crew:</span> {crewEarning}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ElbowGreaseBadge;
