/**
 * ScrollToTop — Global route-change scroll behavior
 * ===================================================
 * On every route change:
 * 1. If URL has a #hash → scroll to that anchor, show anchor indicator + "from X" back link
 * 2. If no hash → scroll to top of page
 *
 * Fixes the issue where pages load mid-scroll instead of at the top.
 */

import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';

export function ScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const navigate = useNavigate();
  const [anchorInfo, setAnchorInfo] = useState<{ id: string; fromPath: string; fromLabel: string } | null>(null);
  const previousPath = useRef<string>('/');
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any pending hide timeout
    if (hideTimeout.current) {
      clearTimeout(hideTimeout.current);
      hideTimeout.current = null;
    }

    if (hash) {
      // Has anchor — scroll to it after a short delay for render
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Show anchor indicator with "from" link
          const fromPath = previousPath.current;
          const fromLabel = fromPath === '/'
            ? 'Home'
            : fromPath.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'previous page';

          setAnchorInfo({ id, fromPath, fromLabel });

          // Auto-hide after 6 seconds
          hideTimeout.current = setTimeout(() => {
            setAnchorInfo(null);
          }, 6000);
        }
      }, 100);
    } else {
      // No anchor — scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      setAnchorInfo(null);
    }

    // Track previous path for "from X" link
    previousPath.current = pathname;
  }, [pathname, hash, key]);

  if (!anchorInfo) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300"
    >
      <div className="flex items-center gap-3 bg-slate-900/95 backdrop-blur-sm border border-amber-500/30 rounded-full px-4 py-2 shadow-lg shadow-amber-500/10">
        <LinkIcon className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-xs text-white/70">
          #{anchorInfo.id}
        </span>
        <span className="text-xs text-white/30">·</span>
        <button
          onClick={() => {
            navigate(anchorInfo.fromPath);
            setAnchorInfo(null);
          }}
          className="text-xs text-amber-400/80 hover:text-amber-300 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3 w-3" />
          from {anchorInfo.fromLabel}
        </button>
        <button
          onClick={() => setAnchorInfo(null)}
          className="text-white/30 hover:text-white/60 text-xs ml-1"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
