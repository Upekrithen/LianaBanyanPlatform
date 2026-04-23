/**
 * Cathedral-schema Supabase query helper (K438a)
 * ==============================================
 * PostgREST serves the `public` schema by default. To access cathedral.*
 * tables, the Supabase project must expose the `cathedral` schema:
 *   Dashboard → Settings → API → Exposed schemas → add "cathedral"
 *
 * Use cathedral() instead of supabase for all member-Cathedral queries.
 *
 * See:
 *   - platform/supabase/migrations/20260423020001_k438_cathedral_schema.sql
 *   - BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2268_*_B117.md
 *   - BISHOP_DROPZONE/12_Innovations_AA/AA_FORMAL_2270_*_B117.md
 */
import { supabase } from "@/integrations/supabase/client";

export function cathedral() {
  return supabase.schema("cathedral");
}

// ---- Shared TypeScript types (mirror migration schema) --------------------

export type CathedralTier = "free" | "paid";

export type ShareLevel = "private" | "guild" | "tribe" | "commons";

export type ScribeAdjacent = {
  level: number; // 2..12 — 2-3 PhD-adjacent, 4-6 junior-adjacent, 7-12 ancillary
  field: string;
};

export type MemberCathedralRow = {
  member_id: string;
  created_at: string;
  tier: CathedralTier;
  last_sync_at: string | null;
  export_count: number;
  export_last_at: string | null;
  professional_domain: string | null;
  updated_at: string;
};

export type MemberScribeRow = {
  scribe_id: string;
  member_id: string;
  name: string;
  primary_field: string;
  adjacents: ScribeAdjacent[];
  keywords: string[];
  active: boolean;
  share_level: ShareLevel;
  share_target_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ScribeEntryRow = {
  entry_id: string;
  scribe_id: string;
  member_id: string;
  ts: string;
  session_id: string | null;
  observation: string;
  source: string;
  canonical_ref: string | null;
  tags: string[];
  shared_level: ShareLevel;
  shared: boolean;
};

export type CathedralHealthRow = {
  member_id: string;
  tier: CathedralTier;
  cathedral_created_at: string;
  last_sync_at: string | null;
  export_count: number;
  export_last_at: string | null;
  professional_domain: string | null;
  scribe_count: number;
  active_scribe_count: number;
  entry_count: number;
  last_entry_at: string | null;
};
