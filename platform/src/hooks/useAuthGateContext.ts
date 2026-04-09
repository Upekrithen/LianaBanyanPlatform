/**
 * useAuthGateContext — Reads context message set by a gated route.
 * ================================================================
 * ProtectedRoute / CaptainRoute may set sessionStorage[AUTH_GATE_CONTEXT_KEY]
 * when redirecting an unauthenticated member to /auth. The Auth page uses
 * this hook to retrieve that context and pass it to <MascotAuthGate />,
 * so the mascot explanation bubble can say:
 *
 *   "To {gateContext}, you'll need to sign in so we know it's you."
 *
 * The value is cleared after read so stale contexts don't bleed between
 * unrelated auth prompts.
 *
 * Introduced B080.
 */

import { useEffect, useState } from 'react';
import { AUTH_GATE_CONTEXT_KEY } from '@/components/ProtectedRoute';

export function useAuthGateContext(): string | undefined {
  const [context, setContext] = useState<string | undefined>(undefined);

  useEffect(() => {
    const stored = sessionStorage.getItem(AUTH_GATE_CONTEXT_KEY);
    if (stored) {
      setContext(stored);
      sessionStorage.removeItem(AUTH_GATE_CONTEXT_KEY);
    }
  }, []);

  return context;
}
