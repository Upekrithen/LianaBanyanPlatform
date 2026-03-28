/**
 * XRayBountyFlip — "You can do better!" flip card for X-Ray Goggles panels.
 * Uses inline styles since XRayOverlay renders via createPortal.
 */
import { useState, useRef, useEffect } from 'react';

interface XRayBountyFlipProps {
  xrayId: string;
  onOpenLark: (id: string) => void;
}

export function XRayBountyFlip({ xrayId, onOpenLark }: XRayBountyFlipProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [description, setDescription] = useState('');
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(40);

  useEffect(() => {
    const fh = frontRef.current?.scrollHeight || 40;
    const bh = backRef.current?.scrollHeight || 200;
    setHeight(isFlipped ? Math.max(bh, 180) : fh);
  }, [isFlipped]);

  const handleViewElement = () => {
    const el = document.querySelector(`[data-xray-id="${xrayId}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el as HTMLElement).style.outline = '3px solid rgba(34, 211, 238, 0.8)';
      setTimeout(() => { (el as HTMLElement).style.outline = ''; }, 3000);
    }
  };

  const handleSubmit = () => {
    onOpenLark(xrayId);
    setIsFlipped(false);
    setDescription('');
  };

  return (
    <div style={{ perspective: '1000px', overflow: 'hidden', transition: 'height 0.4s ease', height }}>
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.5s ease',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
        }}
      >
        {/* Front: "You can do better!" button */}
        <div
          ref={frontRef}
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsFlipped(true); }}
            style={{
              width: '100%',
              padding: '0.4rem 0.75rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '0.375rem',
              color: 'rgba(251, 191, 36, 0.9)',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.6)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(234, 179, 8, 0.1) 100%)'; e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)'; }}
          >
            <span style={{ fontSize: '0.85rem' }}>⚡</span>
            You can do better!
          </button>
        </div>

        {/* Back: Bounty submission */}
        <div
          ref={backRef}
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            pointerEvents: isFlipped ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '0.375rem',
              padding: '0.6rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(251, 191, 36, 0.9)' }}>
                Submit a Better Version
              </span>
              <button
                onClick={() => { setIsFlipped(false); setDescription(''); }}
                style={{ background: 'none', border: 'none', color: 'rgba(148, 163, 184, 0.6)', cursor: 'pointer', fontSize: '0.65rem', padding: '0.15rem 0.3rem' }}
              >
                ← Back
              </button>
            </div>

            <button
              onClick={handleViewElement}
              style={{
                width: '100%',
                padding: '0.3rem',
                background: 'rgba(34, 211, 238, 0.1)',
                border: '1px solid rgba(34, 211, 238, 0.2)',
                borderRadius: '0.25rem',
                color: 'rgba(34, 211, 238, 0.8)',
                fontSize: '0.65rem',
                cursor: 'pointer',
                marginBottom: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
              }}
            >
              🔍 Highlight Element on Page
            </button>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the improvement you'd make..."
              rows={3}
              style={{
                width: '100%',
                padding: '0.35rem',
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(100, 116, 139, 0.3)',
                borderRadius: '0.25rem',
                color: '#e2e8f0',
                fontSize: '0.7rem',
                resize: 'vertical',
                outline: 'none',
                marginBottom: '0.4rem',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.5)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(100, 116, 139, 0.3)'; }}
              onClick={(e) => e.stopPropagation()}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.6rem', color: 'rgba(52, 211, 153, 0.7)' }}>
                Earn Credits + Marks
              </span>
              <button
                onClick={handleSubmit}
                disabled={!description.trim()}
                style={{
                  padding: '0.25rem 0.75rem',
                  background: description.trim() ? 'rgba(34, 211, 238, 0.2)' : 'rgba(100, 116, 139, 0.1)',
                  border: `1px solid ${description.trim() ? 'rgba(34, 211, 238, 0.4)' : 'rgba(100, 116, 139, 0.2)'}`,
                  borderRadius: '0.25rem',
                  color: description.trim() ? 'rgba(34, 211, 238, 0.9)' : 'rgba(100, 116, 139, 0.4)',
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  cursor: description.trim() ? 'pointer' : 'default',
                }}
              >
                Submit Lark →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default XRayBountyFlip;
