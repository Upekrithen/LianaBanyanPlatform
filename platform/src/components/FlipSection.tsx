/**
 * FlipSection — Reusable 3D CSS flip component for entire sections.
 * Uses CSS perspective + rotateY for a smooth card-flip effect.
 * Front and back content are both rendered; backface-visibility hides the inactive side.
 */
import React from 'react';

interface FlipSectionProps {
  isFlipped: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
}

export function FlipSection({ isFlipped, front, back, className = '' }: FlipSectionProps) {
  return (
    <div className={`flip-section-perspective ${className}`} style={{ perspective: '1200px' }}>
      <div
        className="flip-section-inner relative w-full transition-transform duration-[600ms] ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front face */}
        <div
          className="flip-section-front w-full"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {front}
        </div>
        {/* Back face */}
        <div
          className="flip-section-back w-full absolute top-0 left-0"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            // When not flipped, back is hidden and should not block interaction
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

export default FlipSection;
