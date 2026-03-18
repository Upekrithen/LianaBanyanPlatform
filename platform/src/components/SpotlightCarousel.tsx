import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import type { SpotlightCard } from '@/lib/spotlightAlgorithm';

interface SpotlightCarouselProps {
  cards: SpotlightCard[];
  category: string;
  categories: { id: string; label: string; icon?: string }[];
  onCategoryChange: (cat: string) => void;
  onCardClick: (card: SpotlightCard) => void;
  activeCardId?: string | null;
  className?: string;
}

export default function SpotlightCarousel({
  cards,
  category,
  categories,
  onCategoryChange,
  onCardClick,
  activeCardId,
  className = '',
}: SpotlightCarouselProps) {
  const [scrollIndex, setScrollIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);
  const autoRotateRef = useRef<ReturnType<typeof setInterval>>();

  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
  const maxIndex = Math.max(0, cards.length - visibleCount);

  const scrollLeft = useCallback(() => {
    setScrollIndex(i => Math.max(0, i - 1));
  }, []);

  const scrollRight = useCallback(() => {
    setScrollIndex(i => i >= maxIndex ? 0 : i + 1);
  }, [maxIndex]);

  useEffect(() => {
    if (isPaused || cards.length <= visibleCount) return;
    autoRotateRef.current = setInterval(scrollRight, 8000);
    return () => clearInterval(autoRotateRef.current);
  }, [isPaused, scrollRight, cards.length, visibleCount]);

  useEffect(() => {
    setScrollIndex(0);
  }, [category]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      if (delta > 0) scrollRight();
      else scrollLeft();
    }
  };

  if (cards.length === 0) return null;

  return (
    <div
      className={className}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Category selector */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '1rem',
      }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => onCategoryChange(cat.id)}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: category === cat.id ? 700 : 500,
              background: category === cat.id ? 'rgba(56,161,105,0.2)' : 'transparent',
              border: `1px solid ${category === cat.id ? 'rgba(56,161,105,0.5)' : 'rgba(250,245,235,0.15)'}`,
              color: category === cat.id ? '#38a169' : 'rgba(250,245,235,0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat.icon && <span style={{ marginRight: '0.25rem' }}>{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>

      {/* Carousel container */}
      <div style={{ position: 'relative' }}>
        {/* Left arrow */}
        {scrollIndex > 0 && (
          <button
            onClick={scrollLeft}
            style={{
              position: 'absolute',
              left: '-0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(10,22,40,0.9)',
              border: '1px solid rgba(250,245,235,0.2)',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#faf5eb',
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right arrow */}
        {scrollIndex < maxIndex && (
          <button
            onClick={scrollRight}
            style={{
              position: 'absolute',
              right: '-0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10,
              background: 'rgba(10,22,40,0.9)',
              border: '1px solid rgba(250,245,235,0.2)',
              borderRadius: '50%',
              width: '2rem',
              height: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#faf5eb',
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Cards row */}
        <div
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          style={{
            display: 'flex',
            gap: '1rem',
            overflow: 'hidden',
          }}
        >
          {cards.slice(scrollIndex, scrollIndex + visibleCount).map(card => {
            const isActive = activeCardId === card.id;
            return (
              <div
                key={card.id}
                onClick={() => onCardClick(card)}
                style={{
                  flex: `1 1 ${100 / visibleCount}%`,
                  maxWidth: `${100 / visibleCount}%`,
                  background: isActive ? 'rgba(56,161,105,0.15)' : '#0a1628',
                  border: `1px solid ${isActive ? 'rgba(56,161,105,0.5)' : 'rgba(250,245,235,0.15)'}`,
                  borderRadius: '1rem',
                  padding: '1.25rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  justifyContent: 'space-between',
                }}
                onMouseOver={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(250,245,235,0.4)';
                    (e.currentTarget as HTMLDivElement).style.background = 'rgba(250,245,235,0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(250,245,235,0.15)';
                    (e.currentTarget as HTMLDivElement).style.background = '#0a1628';
                  }
                }}
              >
                <div>
                  <h4 style={{ color: '#faf5eb', fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                    {card.title}
                  </h4>
                  {card.stats ? (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                      {card.stats.map((s, i) => (
                        <span key={i} style={{ color: '#faf5eb', fontSize: '0.85rem' }}>
                          <span style={{ color: s.color || '#38a169', fontWeight: 700 }}>{s.value}</span> {s.label}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: 'rgba(250,245,235,0.7)', fontSize: '0.85rem', lineHeight: 1.6, margin: 0 }}>
                      {card.bodyPreview}
                    </p>
                  )}
                </div>
                {card.ctaLabel && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span style={{ color: '#38a169', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {card.ctaLabel} <ExternalLink style={{ width: '0.7rem', height: '0.7rem' }} />
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Dot indicators */}
        {cards.length > visibleCount && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '0.35rem',
            marginTop: '0.75rem',
          }}>
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setScrollIndex(i)}
                style={{
                  width: scrollIndex === i ? '1.25rem' : '0.4rem',
                  height: '0.4rem',
                  borderRadius: '9999px',
                  background: scrollIndex === i ? '#38a169' : 'rgba(250,245,235,0.2)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
