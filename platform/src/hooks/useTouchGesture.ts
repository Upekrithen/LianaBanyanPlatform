import { useCallback, useRef } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  /** Minimum px distance before a swipe is registered. Default 50. */
  threshold?: number;
}

/**
 * Attaches swipe gesture handlers to any touch element.
 * Returns { touchHandlers } spread onto the target element.
 * Keeps pointer events minimal — no preventDefault unless threshold exceeded.
 */
export function useTouchGesture(options: TouchGestureOptions) {
  const { onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50 } = options;
  const startRef = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.changedTouches[0];
    startRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!startRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;
    startRef.current = null;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx < threshold && absDy < threshold) return; // too short

    if (absDx >= absDy) {
      // Horizontal swipe
      if (dx < 0 && onSwipeLeft) onSwipeLeft();
      if (dx > 0 && onSwipeRight) onSwipeRight();
    } else {
      // Vertical swipe
      if (dy < 0 && onSwipeUp) onSwipeUp();
      if (dy > 0 && onSwipeDown) onSwipeDown();
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return {
    touchHandlers: {
      onTouchStart,
      onTouchEnd,
    } as Pick<React.HTMLAttributes<HTMLElement>, 'onTouchStart' | 'onTouchEnd'>,
  };
}
