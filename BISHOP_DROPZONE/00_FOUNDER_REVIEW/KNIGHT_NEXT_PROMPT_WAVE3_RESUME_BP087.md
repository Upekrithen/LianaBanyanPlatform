# Knight Next Prompt · BP087 Wave 3 Resume

(Founder pastes this to the Knight session that landed Wave 3 to resume from where SEG-A2 stalled, OR to a fresh Knight session to continue.)

## Status

Bishop closed all four AMBER items from your Wave 3 close-out:

1. SEG-A2 EMPIRICALLY UNBLOCKED (resources/supabase_public.env now has legacy JWT eyJh.. 208 chars; assert exit 0). Bishop pulled the JWT directly from Supabase Management API per Statute §15 -- Founder was never asked to open Supabase Studio.
2. D1 pearl_share RLS APPLIED with USING (true) (mesh-shared substrate, no status column).
3. D3 entity_memberships RLS APPLIED with corrected column name entity_type (not node_type as the yoke spec said).
4. D4 Scrambler directory FOUND at C:\Users\Administrator\Documents\LianaBanyanPlatform\librarian-mcp\scrambler\ -- what you could not find was reconcile.py specifically (the directory itself was correct, just the missing source file). __pycache__ shows .pyc compiled artifacts for the modules that existed at some point -- reconcile.py + the other source .py files may have been deleted or never written. Follow-on Knight task: reconstruct reconcile.py from canon or from the .pyc bytecode.

All 4 RLS migrations applied · 12 policies live in pg_policies (gadget-verified).

## What Knight does next

Use ONLY Sonnet 4.6 SEGs.

### IMMEDIATE (sequential -- gates Yoke 2):

1. Re-run SEG-A2 from Yoke 1: cd /c/Users/Administrator/Documents/LianaBanyanPlatform && npm run dist:win
   - assert-supabase-anon-key.mjs now exits 0 (verified)
   - Build will succeed
2. Run SEG-A3 from Yoke 1: copy installer + latest.yml to Cephas/cephas-hugo/static/download/ + Hugo build with config-mnemosynec.toml + firebase deploy --only hosting:mnemosyne + 4-curl check on mnemosynec.ai/download/{latest.yml, MnemosyneC-Setup-0.5.13.exe, .blockmap, /} -- all 200
3. Confirm v0.5.13 live on mnemosynec.ai/download/latest.yml -- auto-update will deliver to peers within 4 hours OR on next app launch (one-click Download per peer per auto_updater.ts:138 autoDownload=false safety)

### AFTER v0.5.13 LIVE (Yoke 2 prep · gated on peer install):

Bishop has Yoke 2 pre-fire gate-check infrastructure:
- noop_test broadcast confirms peer listener installed
- fleet_warmup gemma4:12b broadcast populates capabilities.active_model
- health_snapshot confirms homogeneity

Wait for Founder verbal confirmation that peers have installed v0.5.13 (auto-update prompt + one click per peer + relaunch). Then Bishop fires Yoke 2 pre-fire MIC broadcasts, then validate-relay.mjs 70Q paired Pass A + Pass B.

### FOLLOW-ON (low priority):

- D4 Scrambler reconcile.py reconstruction: librarian-mcp/scrambler/ exists; reconstruct reconcile.py from compiled .pyc files in __pycache__ or from canon spec. Document what reconcile.py is supposed to do.

## Statutes binding

Use segs Sonnet 4.6 verbatim. Brick Wall pre-authorized for the SEG-A2 / SEG-A3 build-and-deploy scope. §14 gadget-first before asking anything verifiable. §15 Bishop applies any new DB ops directly via psql -- Knight ships .sql, Bishop applies.

## Cross-reference

See also for triangulation:
- C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_UNBLOCK_SEG_A2_PASTE.txt
- C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_DROPZONE\00_FOUNDER_REVIEW\KNIGHT_SEG_A2_UNBLOCKED_RE_AMPLIFY_BP087_WAVE3.txt

-- Bishop, BP087, 2026-06-20
