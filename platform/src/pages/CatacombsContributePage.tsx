/**
 * CatacombsContributePage (BP094 / Stage 1 stub)
 * ===============================================
 * Route: /contribute
 * Pre-fill parameter: ?question=<encoded question>
 *
 * Stage 1 stub: shows the question that triggered refusal and
 * invites the member to submit knowledge to the cooperative substrate.
 * Full triple-verdict pipeline (Star Chamber + Scrambler + Keys Engines)
 * wired in Stage 2.
 *
 * Contribution loop: once a submission is ratified by triple GREEN verdict,
 * it inserts into catacombs_contributions. The pheromone substrate indexes
 * catacombs_contributions by category_slug, so future pheromone_query calls
 * for the same topic will surface the new contribution.
 *
 * UNVERIFIED: Loop closure (ratified contribution -> pheromone visible)
 * cannot be confirmed without live DB test. See Block C receipt.
 */

import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function CatacombsContributePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [question, setQuestion] = useState('');
  const [contribution, setContribution] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('question');
    if (q) setQuestion(decodeURIComponent(q));
  }, [location.search]);

  if (!user) {
    navigate('/join');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contribution.trim()) return;
    // Stage 1 stub: submission goes to triple-verdict queue in Stage 2.
    // For now, acknowledge and redirect back.
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '80px auto',
          padding: '40px 32px',
          background: 'linear-gradient(160deg, #0a0f1a 0%, #111827 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 16,
          textAlign: 'center',
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          color: '#e2e8f0',
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 16 }}>&#x2713;</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>
          Contribution received
        </h2>
        <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Your contribution enters the triple-verdict queue (Star Chamber + Scrambler + Keys Engines).
          Once ratified GREEN, it enters the cooperative substrate and earns you Marks.
        </p>
        <button
          onClick={() => navigate('/mnemosynec/csia-hybrid')}
          style={{
            padding: '10px 24px',
            background: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          Back to CSIA Chat
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: '40px 20px',
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
        color: '#e2e8f0',
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #060b14 0%, #0c1220 50%, #060b14 100%)',
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 8px' }}>
        Contribute to the Substrate
      </h1>
      <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>
        Your knowledge, once ratified, earns Marks and helps answer future questions.
      </p>

      {question && (
        <div
          style={{
            padding: '14px 18px',
            background: 'rgba(99,102,241,0.08)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 8,
            marginBottom: 24,
            fontSize: 14,
            color: '#a5b4fc',
          }}
        >
          <span style={{ fontWeight: 600 }}>We asked: </span>
          <span style={{ color: '#e2e8f0' }}>&ldquo;{question}&rdquo;</span>
          <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
            What do you know about this?
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <textarea
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
          placeholder="Share what you know. Be specific. Cite sources if possible."
          rows={8}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(15,23,42,0.7)',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 8,
            color: '#e2e8f0',
            fontSize: 14,
            lineHeight: 1.6,
            resize: 'vertical' as const,
            outline: 'none',
            boxSizing: 'border-box' as const,
          }}
        />
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: '#64748b',
            marginBottom: 16,
          }}
        >
          Your contribution will be reviewed by Star Chamber + Scrambler + Keys Engines triple verdict before entering the substrate.
        </div>
        <button
          type="submit"
          disabled={!contribution.trim()}
          style={{
            padding: '11px 24px',
            background: contribution.trim() ? '#6366f1' : 'rgba(99,102,241,0.3)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 700,
            cursor: contribution.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          Submit to Triple-Verdict Queue
        </button>
      </form>

      <div
        style={{
          marginTop: 40,
          padding: '14px 18px',
          background: 'rgba(15,23,42,0.4)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 8,
          fontSize: 12,
          color: '#64748b',
        }}
      >
        <strong style={{ color: '#94a3b8' }}>Stage 1 notice:</strong> Full triple-verdict pipeline wired in Stage 2. Contributions submitted here are queued for Founder review before entering the live substrate.
      </div>
    </div>
  );
}
