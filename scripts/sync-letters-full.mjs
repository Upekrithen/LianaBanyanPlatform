// Designed-to-be-Copied
/**
 * BP077 — sync-letters-full.mjs
 *
 * Orchestrator: runs the full two-phase letter sync pipeline in sequence.
 *
 *   Phase 1 — sync-letters-to-supabase:
 *     Reads letters/*.md → upserts into Supabase outreach_letters table.
 *     ALL letters (all states) are synced to Supabase. Supabase is the source
 *     of truth for letter state, metadata, and content.
 *
 *   Phase 2 — sync-letters-to-cephas:
 *     Queries Supabase WHERE state='dispatched' → writes Hugo content files
 *     to Cephas/cephas-hugo/content/letters/{slug}.md
 *     FOUNDER-RATIFY GATE is enforced here: only dispatched letters go public.
 *
 * Usage:
 *   SUPABASE_URL=https://... SUPABASE_SERVICE_KEY=... node scripts/sync-letters-full.mjs
 *
 * npm script (from package.json):
 *   "sync:letters": "node scripts/sync-letters-full.mjs"
 *
 * Env vars required:
 *   SUPABASE_URL         — Supabase project URL
 *   SUPABASE_SERVICE_KEY — service role key (never anon key)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * GIT HOOK WIRING (post-commit)
 * ─────────────────────────────────────────────────────────────────────────────
 * To auto-sync whenever letters/ changes, wire this script as a git post-commit hook.
 *
 * Option A — Manual hook file (.git/hooks/post-commit):
 *
 *   #!/usr/bin/env bash
 *   # Only run if letters/ was touched in this commit
 *   if git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -q '^letters/'; then
 *     echo "[post-commit] letters/ changed — running sync-letters-full.mjs"
 *     SUPABASE_URL="$SUPABASE_URL" \
 *     SUPABASE_SERVICE_KEY="$SUPABASE_SERVICE_KEY" \
 *     node "$(git rev-parse --show-toplevel)/scripts/sync-letters-full.mjs"
 *   fi
 *
 *   Install: copy above to .git/hooks/post-commit && chmod +x .git/hooks/post-commit
 *   (Never commit .git/hooks/ — it's outside version control by design.)
 *
 * Option B — GitHub Actions (.github/workflows/sync-letters.yml):
 *
 *   on:
 *     push:
 *       paths: ['letters/**']
 *   jobs:
 *     sync:
 *       runs-on: ubuntu-latest
 *       steps:
 *         - uses: actions/checkout@v4
 *         - uses: actions/setup-node@v4
 *           with: { node-version: '20' }
 *         - run: npm install @supabase/supabase-js
 *         - run: node scripts/sync-letters-full.mjs
 *           env:
 *             SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
 *             SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { main as syncToSupabase } from './sync-letters-to-supabase.mjs';
import { main as syncToCephas } from './sync-letters-to-cephas.mjs';

const ts = () => new Date().toISOString();

async function main() {
  console.log(`[${ts()}] ════════════════════════════════════════`);
  console.log(`[${ts()}] BP077 sync-letters-full PIPELINE START`);
  console.log(`[${ts()}] ════════════════════════════════════════`);

  // ── Phase 1: letters/ → Supabase ─────────────────────────────────────────
  console.log(`[${ts()}] ── Phase 1: letters/ → Supabase outreach_letters`);
  let phase1;
  try {
    phase1 = await syncToSupabase();
  } catch (err) {
    console.error(`[${ts()}] FATAL Phase 1 error: ${err.message}`);
    process.exit(1);
  }

  // ── Phase 2: Supabase (dispatched) → Cephas Hugo ─────────────────────────
  console.log(`[${ts()}] ── Phase 2: Supabase dispatched → Cephas Hugo`);
  let phase2;
  try {
    phase2 = await syncToCephas();
  } catch (err) {
    console.error(`[${ts()}] FATAL Phase 2 error: ${err.message}`);
    process.exit(1);
  }

  console.log(`[${ts()}] ════════════════════════════════════════`);
  console.log(`[${ts()}] PIPELINE COMPLETE`);
  console.log(`[${ts()}]   Phase 1 — Supabase upserts: ${phase1.successCount} ok, ${phase1.errorCount} errors`);
  console.log(`[${ts()}]   Phase 2 — Cephas files:     ${phase2.writtenCount} written, ${phase2.errorCount} errors`);
  console.log(`[${ts()}] ════════════════════════════════════════`);

  const totalErrors = (phase1.errorCount || 0) + (phase2.errorCount || 0);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main();
