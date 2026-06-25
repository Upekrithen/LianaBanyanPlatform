---
eblet_id: canon_member_proof_submission_vetting_via_substrate_provenance_not_social_platform_gate_bp094
session: BP094-S4
minted_by: Sonnet 4.6 SEG (Knight)
minted_at: 2026-06-25T00:00:00Z
canon_class: OPERATIONAL_DOCTRINE
status: CANDIDATE -- Founder ratification required before binding
tags:
  - member-proof-submission
  - wildfire-viral
  - substrate-provenance
  - social-platform-gate
  - cooperative-class
---

# Canon Eblet: Member Proof Submission Vetting via Substrate Provenance, Not Social-Platform Gate

## Statement

When a cooperative member submits a proof-of-run result (harness receipt, signature, hash), the platform vets authenticity via **substrate provenance** - cryptographic signature verification against the member's registered public key - NOT via social-platform gate (Twitter follower count, email domain, LinkedIn verification, or third-party identity provider approval).

## Binding Rules

1. **No social-platform gate.** A member's submitted proof is VALID if and only if:
   - The Ed25519 signature in the submission verifies against the member's registered public key in `member_proof_submissions.public_key`.
   - The result hash matches the harness manifest (SHA-256 of `validate-relay.mjs` + `smoke_2q_bp093.json` bundle).
   - The submission timestamp is within 30 days of the harness bundle release date.

2. **No follower-count gate.** Marks are awarded for verified substrate participation, not for social reach. A member with 0 followers earns the same Marks as a member with 1,000,000 followers for the same verified run.

3. **Substrate-provenance vetting.** The `verify-member-proof` edge function (deployed to project ruuxzilgmuwddcofqecc) performs the cryptographic vetting. Human moderator approval is NOT required for a cryptographically sound submission.

4. **Spot-check queue.** A random sample (5%) of submissions is queued for human spot-check via `spot_check_queue`. Spot-checks verify run integrity (timing plausibility, hardware fingerprint if available) but cannot overturn a cryptographically sound submission without Founder sign-off.

5. **Truth-Always on partial runs.** If a member's run achieves less than 83.3% accuracy, the submission is ACCEPTED but the Marks award is 0. The platform records the empirical result honestly. A run that fails the threshold is NOT a cheating event - it is data.

## Origin

BP094 Session 4 (2026-06-24 / 2026-06-25). Mamba 3 member proof submission system build. The substrate-provenance doctrine is necessary because:
- Social-platform gates create dependency on third-party identity providers whose policies are outside cooperative control.
- Cryptographic signature verification is deterministic, auditable, and requires no external API call.
- The cooperative's credibility rests on verifiable claims, not on social-graph authority.

## Implementation Reference

- Edge function: `platform/supabase/functions/verify-member-proof/index.ts`
- Schema: `supabase/migrations/20260624_member_proof_submissions_bp094.sql`
- Harness bundle: `Cephas/cephas-hugo/static/harness/mmlu-pro-bp094.tar.gz`
- Manifest: `Cephas/cephas-hugo/static/harness/manifest-mmlu-pro-bp094.json`
- Run-and-sign script: `tools/mesh-validation/run-and-sign.sh`
