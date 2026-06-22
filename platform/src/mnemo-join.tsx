import React from 'react';
import ReactDOM from 'react-dom/client';
import './mnemo-join.css';

// Read config from Hugo data attributes on mount root
declare global {
  interface Window {
    __MNEMO_ENV__?: Record<string, string>;
  }
}

function MnemoJoin() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const rootEl = document.getElementById('mnemo-join-root');
  const supabaseUrl = rootEl?.getAttribute('data-supabase-url') || '';
  const supabaseAnonKey = rootEl?.getAttribute('data-supabase-anon-key') || '';
  const successUrl = rootEl?.getAttribute('data-success-url') || 'https://mnemosynec.org/join/success/';
  const cancelUrl = rootEl?.getAttribute('data-cancel-url') || 'https://mnemosynec.org/join/';
  const priceId = rootEl?.getAttribute('data-price-id') || 'price_1SIXWsDMOngHJB3UxKPFmXZE';

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const resp = await fetch(`${supabaseUrl}/functions/v1/create-membership-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({
          email,
          priceId,
          successUrl,
          cancelUrl,
        }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${resp.status}`);
      }
      const { url } = await resp.json();
      if (!url) throw new Error('No checkout URL returned.');
      window.location.href = url;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mnemo-join-widget">
      <div className="mnemo-join-card">
        <div className="mnemo-join-header">
          <h2 className="mnemo-join-title">Join the Cooperative</h2>
          <p className="mnemo-join-price">$5 / year</p>
        </div>
        <ul className="mnemo-join-benefits">
          <li>One vote. One voice. Full cooperative membership.</li>
          <li>Access to all 16 substrate initiative folders.</li>
          <li>83.3% of every dollar you earn stays with you.</li>
          <li>No algorithms. No ads. No extraction.</li>
        </ul>
        <form onSubmit={handleJoin} className="mnemo-join-form">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="mnemo-join-input"
            disabled={loading}
          />
          {error && <p className="mnemo-join-error">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mnemo-join-btn"
          >
            {loading ? 'Opening checkout…' : 'Join for $5 →'}
          </button>
        </form>
        <p className="mnemo-join-fine-print">
          Secure checkout via Stripe. Cancel any time.
        </p>
      </div>
    </div>
  );
}

function mount() {
  const el = document.getElementById('mnemo-join-root');
  if (!el) return;
  ReactDOM.createRoot(el).render(
    <React.StrictMode>
      <MnemoJoin />
    </React.StrictMode>
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
