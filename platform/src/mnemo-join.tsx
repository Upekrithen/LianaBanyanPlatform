import React from 'react';
import ReactDOM from 'react-dom/client';
import './mnemo-join.css';

// Read config from Hugo data attributes on mount root
declare global {
  interface Window {
    __MNEMO_ENV__?: Record<string, string>;
  }
}

// M20: Door-aware post-payment routing
type DoorId = "direct" | "download" | "order" | "invite" | "bounty" | "crown";

interface DoorContext {
  door: DoorId;
  refs?: {
    download_version?: string;
    order_ref?: string;
    inviter_user_id?: string;
    bounty_id?: string;
    crown_id?: string;
  };
}

function readDoorContext(root: HTMLElement): DoorContext {
  const door = (root.dataset.door ?? "direct") as DoorId;
  return {
    door,
    refs: {
      download_version: root.dataset.doorRefVersion,
      order_ref: root.dataset.doorRefOrder,
      inviter_user_id: root.dataset.doorRefInviter,
      bounty_id: root.dataset.doorRefBounty,
      crown_id: root.dataset.doorRefCrown,
    },
  };
}

const BASE_MNEMO = "https://mnemosynec.org";
const BASE_LB    = "https://lianabanyan.com";

function computeSuccessUrl(ctx: DoorContext): string {
  switch (ctx.door) {
    case "direct":
      return `${BASE_LB}/pathways/?just_joined=1`;
    case "download": {
      const v = ctx.refs?.download_version ?? "";
      return `${BASE_MNEMO}/download/?member_unlock=1${v ? `&version=${v}` : ""}`;
    }
    case "order": {
      const ref = ctx.refs?.order_ref ?? "";
      return ref
        ? `${BASE_MNEMO}/order/${ref}/?member_unlock=1`
        : `${BASE_MNEMO}/order/?member_unlock=1`;
    }
    case "invite": {
      const uid = ctx.refs?.inviter_user_id ?? "";
      return `${BASE_LB}/welcome/?inviter=${uid}`;
    }
    case "bounty": {
      const bid = ctx.refs?.bounty_id ?? "";
      return `${BASE_LB}/bounty/${bid}/?member_unlock=1`;
    }
    case "crown": {
      const cid = ctx.refs?.crown_id ?? "";
      return `${BASE_LB}/welcome/?crown=${cid}`;
    }
    default:
      return `${BASE_MNEMO}/join/success/`;
  }
}

function computeCancelUrl(ctx: DoorContext): string {
  switch (ctx.door) {
    case "direct":   return `${BASE_MNEMO}/join/`;
    case "download": return `${BASE_MNEMO}/download/`;
    case "order":    return ctx.refs?.order_ref
                       ? `${BASE_MNEMO}/order/${ctx.refs.order_ref}/`
                       : `${BASE_MNEMO}/order/`;
    case "invite":   return `${BASE_LB}/`;
    case "bounty":   return ctx.refs?.bounty_id
                       ? `${BASE_LB}/bounty/${ctx.refs.bounty_id}/`
                       : `${BASE_LB}/`;
    case "crown":    return `${BASE_LB}/`;
    default:         return `${BASE_MNEMO}/join/`;
  }
}

function MnemoJoin() {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const rootEl = document.getElementById('mnemo-join-root');
  const supabaseUrl = rootEl?.getAttribute('data-supabase-url') || '';
  const supabaseAnonKey = rootEl?.getAttribute('data-supabase-anon-key') || '';
  const priceId = rootEl?.getAttribute('data-price-id') || 'price_1TlDLIRlWRgRXQ3YHfH6Jjmi';

  // M20: derive success/cancel URLs from door context
  // data-success-url / data-cancel-url act as manual overrides if present
  const doorCtx = rootEl ? readDoorContext(rootEl) : { door: "direct" as DoorId };
  const successUrl = rootEl?.getAttribute('data-success-url') || computeSuccessUrl(doorCtx);
  const cancelUrl  = rootEl?.getAttribute('data-cancel-url')  || computeCancelUrl(doorCtx);

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
