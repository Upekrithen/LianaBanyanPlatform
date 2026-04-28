/**
 * HelmAtFrame — Tier 2 Helm personalization panel on lianabanyan.com Frame
 * =========================================================================
 * K534 / B131 — LB Frame Cross-Portal Unification
 *
 * Renders when a member is authenticated on lianabanyan.com (the Frame).
 * Shows: member name, last-3 Helm activities (deck cards), Marks balance.
 * Dismissable per session. Does NOT render for unauthenticated visitors.
 *
 * Tier 2 — per Founder ratification B131:
 *   - Name + "Welcome back"
 *   - Last 3 Helm cards (title + subtitle)
 *   - Marks balance
 * Tier 3 (pathway suggestions, active Bridges) is The Feed territory — deferred.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useHelmCards } from '@/hooks/useHelmCards';
import { X, Anchor, ChevronRight } from 'lucide-react';

export function HelmAtFrame() {
  const { user } = useAuth();
  const { cards, loading } = useHelmCards();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem('lb_helm_at_frame_dismissed') === 'true'
  );

  if (!user || dismissed) return null;

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Member';

  // Stats card is always first; take up to 3 cards total (stats + 2 activity)
  const previewCards = cards.slice(0, 3);

  // Marks balance from the stats card (type === 'stats')
  const statsCard = cards.find(c => c.type === 'stats');
  const marksBalance = statsCard?.frontData?.['Total Marks'] ?? 0;

  const handleDismiss = () => {
    sessionStorage.setItem('lb_helm_at_frame_dismissed', 'true');
    setDismissed(true);
  };

  return (
    <div
      data-xray-id="helm-at-frame"
      style={{
        background: 'linear-gradient(135deg, rgba(10,22,40,0.97) 0%, rgba(18,36,64,0.97) 100%)',
        border: '1px solid rgba(200,169,81,0.2)',
        borderRadius: '0.875rem',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        position: 'relative',
        backdropFilter: 'blur(8px)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.35)',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss Helm panel"
        style={{
          position: 'absolute',
          top: '0.625rem',
          right: '0.625rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(160,174,192,0.5)',
          padding: '0.25rem',
          display: 'flex',
          alignItems: 'center',
          borderRadius: '4px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = '#a0aec0')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(160,174,192,0.5)')}
      >
        <X size={14} />
      </button>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.75rem' }}>
        <Anchor size={16} style={{ color: '#C8A951', flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: '#faf5eb', fontSize: '0.85rem', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
            Welcome back, {displayName}
          </p>
          <p style={{ color: '#a0aec0', fontSize: '0.72rem', margin: 0, lineHeight: 1.3 }}>
            {Number(marksBalance) > 0
              ? `${marksBalance} Marks · Your Helm`
              : 'Your Helm'}
          </p>
        </div>
        <button
          onClick={() => navigate('/the-helm')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.3rem 0.75rem',
            background: 'rgba(200,169,81,0.12)',
            border: '1px solid rgba(200,169,81,0.3)',
            borderRadius: '9999px',
            color: '#C8A951',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,169,81,0.22)')}
          onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,169,81,0.12)')}
        >
          Open Helm <ChevronRight size={12} />
        </button>
      </div>

      {/* Card strip */}
      {loading ? (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[0, 1, 2].map(i => (
            <div
              key={i}
              style={{
                flex: 1,
                height: '52px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '0.5rem',
                border: '1px solid rgba(255,255,255,0.06)',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ) : previewCards.length === 0 ? (
        <p style={{ color: '#718096', fontSize: '0.78rem', margin: 0 }}>
          No Helm activity yet —{' '}
          <button
            onClick={() => navigate('/the-helm')}
            style={{ background: 'none', border: 'none', color: '#C8A951', cursor: 'pointer', fontSize: '0.78rem', padding: 0, fontFamily: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}
          >
            open your Helm
          </button>{' '}
          to get started.
        </p>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {previewCards.map(card => (
            <button
              key={card.id}
              onClick={() => navigate('/the-helm')}
              style={{
                flex: '1 1 0',
                minWidth: '100px',
                textAlign: 'left',
                padding: '0.5rem 0.625rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(200,169,81,0.08)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(200,169,81,0.25)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <p style={{ color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600, margin: '0 0 0.15rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {card.icon} {card.title}
              </p>
              <p style={{ color: '#718096', fontSize: '0.68rem', margin: 0, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {card.subtitle}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
