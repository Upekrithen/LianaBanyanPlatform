/**
 * OverlayReviewPanel — Before/after comparison + voting for submitted overlays.
 * Auto-promotion: 10 upvotes → voting, 25 upvotes + <5 downvotes → approved.
 */
import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Eye, EyeOff, Award, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useDesignVote, useMyVotes, type ElementOverlay } from '@/hooks/useDesignDemocracy';

interface OverlayReviewPanelProps {
  overlays: ElementOverlay[];
  onClose: () => void;
}

const statusColors: Record<string, { bg: string; border: string; text: string; label: string }> = {
  pending: { bg: 'rgba(100, 116, 139, 0.1)', border: 'rgba(100, 116, 139, 0.3)', text: '#94a3b8', label: 'Pending' },
  voting: { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa', label: 'Voting' },
  approved: { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80', label: 'Approved' },
  rejected: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171', label: 'Rejected' },
  featured: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', text: '#fbbf24', label: 'Featured' },
};

const StatusIcon = ({ status }: { status: string }) => {
  const s = { width: 12, height: 12 };
  switch (status) {
    case 'featured': return <Award style={{ ...s, color: '#fbbf24' }} />;
    case 'approved': return <CheckCircle style={{ ...s, color: '#4ade80' }} />;
    case 'rejected': return <XCircle style={{ ...s, color: '#f87171' }} />;
    case 'voting': return <Eye style={{ ...s, color: '#60a5fa' }} />;
    default: return <Clock style={{ ...s, color: '#94a3b8' }} />;
  }
};

export function OverlayReviewPanel({ overlays, onClose }: OverlayReviewPanelProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showBefore, setShowBefore] = useState(true);
  const voteMutation = useDesignVote();
  const ids = overlays.map((o) => o.id);
  const { data: myVotes = {} } = useMyVotes('element_overlay', ids);

  if (overlays.length === 0) return null;
  const current = overlays[selectedIdx];
  const sc = statusColors[current.status] ?? statusColors.pending;

  const handleVote = (overlayId: string, vote: -1 | 1) => {
    voteMutation.mutate({ voteable_type: 'element_overlay', voteable_id: overlayId, vote });
  };

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.98)',
        border: '1px solid rgba(34, 211, 238, 0.4)',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        width: '380px',
        maxHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '0.6rem 0.75rem',
          borderBottom: '1px solid rgba(34, 211, 238, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Eye style={{ width: 14, height: 14, color: 'rgba(34, 211, 238, 0.8)' }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0' }}>
            Overlay Reviews ({overlays.length})
          </span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148, 163, 184, 0.6)', fontSize: '0.75rem' }}
        >
          ✕
        </button>
      </div>

      {/* Overlay selector tabs */}
      {overlays.length > 1 && (
        <div style={{ display: 'flex', gap: '0.25rem', padding: '0.4rem 0.75rem', overflowX: 'auto' }}>
          {overlays.map((o, i) => (
            <button
              key={o.id}
              onClick={() => setSelectedIdx(i)}
              style={{
                padding: '0.2rem 0.5rem',
                background: i === selectedIdx ? 'rgba(34, 211, 238, 0.15)' : 'rgba(30, 41, 59, 0.6)',
                border: `1px solid ${i === selectedIdx ? 'rgba(34, 211, 238, 0.4)' : 'rgba(100, 116, 139, 0.15)'}`,
                borderRadius: '0.25rem',
                color: i === selectedIdx ? '#67e8f9' : '#94a3b8',
                fontSize: '0.6rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              #{i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Current overlay detail */}
      <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1 }}>
        {/* Status badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
          <StatusIcon status={current.status} />
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 700,
              color: sc.text,
              background: sc.bg,
              border: `1px solid ${sc.border}`,
              padding: '0.1rem 0.4rem',
              borderRadius: '9999px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {sc.label}
          </span>
          <span style={{ fontSize: '0.55rem', color: '#64748b', marginLeft: 'auto' }}>
            {current.overlay_type}
          </span>
        </div>

        {/* Before/After toggle */}
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.4rem' }}>
            <button
              onClick={() => setShowBefore(true)}
              style={{
                flex: 1,
                padding: '0.25rem',
                background: showBefore ? 'rgba(100, 116, 139, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${showBefore ? 'rgba(100, 116, 139, 0.4)' : 'rgba(100, 116, 139, 0.1)'}`,
                borderRadius: '0.25rem',
                color: showBefore ? '#cbd5e1' : '#475569',
                fontSize: '0.6rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
              }}
            >
              <EyeOff style={{ width: 10, height: 10 }} /> Original
            </button>
            <button
              onClick={() => setShowBefore(false)}
              style={{
                flex: 1,
                padding: '0.25rem',
                background: !showBefore ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                border: `1px solid ${!showBefore ? 'rgba(245, 158, 11, 0.4)' : 'rgba(100, 116, 139, 0.1)'}`,
                borderRadius: '0.25rem',
                color: !showBefore ? '#fbbf24' : '#475569',
                fontSize: '0.6rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem',
              }}
            >
              <Eye style={{ width: 10, height: 10 }} /> Overlay
            </button>
          </div>

          {/* Preview area */}
          <div
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(100, 116, 139, 0.2)',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              minHeight: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {showBefore ? (
              current.screenshot_before ? (
                <img src={current.screenshot_before} alt="Original" style={{ maxWidth: '100%', borderRadius: '0.25rem' }} />
              ) : (
                <span style={{ fontSize: '0.65rem', color: '#475569', fontStyle: 'italic' }}>
                  No original screenshot captured
                </span>
              )
            ) : (
              <div style={{ width: '100%' }}>
                {current.overlay_type === 'text' && (
                  <p style={{ color: '#e2e8f0', fontSize: '0.8rem', textAlign: 'center' }}>{current.overlay_content}</p>
                )}
                {current.overlay_type === 'image' && (
                  <img src={current.overlay_content} alt="Overlay" style={{ maxWidth: '100%', borderRadius: '0.25rem' }} />
                )}
                {(current.overlay_type === 'svg' || current.overlay_type === 'html') && (
                  <div dangerouslySetInnerHTML={{ __html: current.overlay_content }} />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Vote buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => handleVote(current.id, 1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3rem 0.6rem',
              background: myVotes[current.id] === 1 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${myVotes[current.id] === 1 ? 'rgba(34, 197, 94, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.375rem',
              color: myVotes[current.id] === 1 ? '#4ade80' : '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ThumbsUp style={{ width: 12, height: 12 }} />
            {current.upvotes}
          </button>
          <button
            onClick={() => handleVote(current.id, -1)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              padding: '0.3rem 0.6rem',
              background: myVotes[current.id] === -1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.6)',
              border: `1px solid ${myVotes[current.id] === -1 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(100, 116, 139, 0.2)'}`,
              borderRadius: '0.375rem',
              color: myVotes[current.id] === -1 ? '#f87171' : '#94a3b8',
              fontSize: '0.65rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <ThumbsDown style={{ width: 12, height: 12 }} />
            {current.downvotes}
          </button>

          <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: '#475569' }}>
            {new Date(current.created_at).toLocaleDateString()}
          </span>
        </div>

        {/* Auto-promotion thresholds info */}
        {current.status === 'pending' && (
          <div
            style={{
              marginTop: '0.5rem',
              padding: '0.35rem 0.5rem',
              background: 'rgba(59, 130, 246, 0.06)',
              border: '1px solid rgba(59, 130, 246, 0.15)',
              borderRadius: '0.375rem',
            }}
          >
            <span style={{ fontSize: '0.55rem', color: '#60a5fa' }}>
              10 upvotes → enters voting &nbsp;|&nbsp; 25 upvotes + &lt;5 downvotes → auto-approved
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverlayReviewPanel;
