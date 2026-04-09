import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

const RELAY_KEY = '_lb_auth';

/**
 * Builds a cross-portal URL with auth tokens in the hash fragment.
 * Hash fragments are never sent to servers — safe for token relay.
 */
export function buildAuthRelayUrl(targetUrl: string, session: Session | null): string {
  if (!session?.access_token || !session?.refresh_token) return targetUrl;

  const payload = btoa(JSON.stringify({
    a: session.access_token,
    r: session.refresh_token,
  }));

  const separator = targetUrl.includes('#') ? '&' : '#';
  return `${targetUrl}${separator}${RELAY_KEY}=${encodeURIComponent(payload)}`;
}

/**
 * Checks the URL hash for auth relay tokens, sets the Supabase session,
 * and cleans the URL. Call once at app boot, before AuthProvider mounts.
 */
export async function consumeAuthRelay(): Promise<boolean> {
  const hash = window.location.hash;
  if (!hash || !hash.includes(RELAY_KEY)) return false;

  try {
    const params = new URLSearchParams(hash.slice(1));
    const relay = params.get(RELAY_KEY);
    if (!relay) return false;

    const { a, r } = JSON.parse(atob(decodeURIComponent(relay)));
    if (!a || !r) return false;

    const { error } = await supabase.auth.setSession({
      access_token: a,
      refresh_token: r,
    });

    // Always clean hash — even on error, don't leave tokens in the URL
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return !error;
  } catch {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return false;
  }
}
