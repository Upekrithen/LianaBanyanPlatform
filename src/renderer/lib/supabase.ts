// Renderer-side Supabase client — BP087 Wave 3 SEG-F2/G2
// Uses VITE_-prefixed env vars (mirroring platform/src/integrations/supabase/client.ts)
// Auth tokens persist via localStorage (same as platform SPA pattern)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
