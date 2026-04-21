/**
 * PLACEHOLDER GATE COMPONENT
 * ==========================
 * A "wash me" style placeholder for hall entrance artwork.
 * Shows a basic gate outline with a call-to-action for artists.
 *
 * This is a bounty waiting to be fulfilled!
 */

import { Link } from 'react-router-dom';

interface PlaceholderGateProps {
  hallName: string;
  bountyId?: string;
  color?: string;
}

export function PlaceholderGate({
  hallName,
  bountyId = 'hall-gate-artwork',
  color = '#f59e0b' // amber by default
}: PlaceholderGateProps) {
  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4]">
      {/* SVG Gate Outline */}
      <svg
        viewBox="0 0 300 400"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))' }}
      >
        {/* Gate frame - simple arch outline */}
        <defs>
          <linearGradient id={`gateGradient-${hallName}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Outer frame */}
        <path
          d="M 40 380 L 40 120 Q 40 40 150 40 Q 260 40 260 120 L 260 380"
          fill="none"
          stroke={`url(#gateGradient-${hallName})`}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="15 8"
        />

        {/* Inner arch */}
        <path
          d="M 70 380 L 70 140 Q 70 70 150 70 Q 230 70 230 140 L 230 380"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeOpacity="0.4"
          strokeDasharray="10 5"
        />

        {/* Decorative hinges */}
        <circle cx="55" cy="150" r="8" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="55" cy="280" r="8" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="245" cy="150" r="8" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />
        <circle cx="245" cy="280" r="8" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.5" />

        {/* Keyhole */}
        <ellipse cx="150" cy="250" rx="12" ry="18" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />
        <rect x="144" y="260" width="12" height="20" fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" />

        {/* Ground line */}
        <line x1="20" y1="385" x2="280" y2="385" stroke={color} strokeWidth="2" strokeOpacity="0.3" />
      </svg>

      {/* "Wash Me" style text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
        <div
          className="text-center transform -rotate-3"
          style={{
            fontFamily: 'Comic Sans MS, cursive, sans-serif',
            textShadow: `0 0 20px ${color}40`
          }}
        >
          <p
            className="text-lg md:text-xl font-bold mb-2"
            style={{ color }}
          >
            Can you draw a gate
          </p>
          <p
            className="text-lg md:text-xl font-bold mb-4"
            style={{ color }}
          >
            for this? Please
          </p>
          <p className="text-xs text-white/40 mt-4">
            — {hallName} needs artwork! —
          </p>
        </div>
      </div>

      {/* Bounty link */}
      <Link
        to={`/cue/${bountyId}`}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-lg text-amber-300 text-sm transition-colors"
      >
        Claim this Bounty
      </Link>
    </div>
  );
}

export default PlaceholderGate;
