# Engagement Ingestion Runbook (K289 / B076)

This runbook covers credentials, webhook setup, polling workers, and verification for ingesting social engagement into `chapter_engagement_events`.

## 1) Required Secrets

Set these in Supabase project secrets / Vault (never in migrations or git-tracked env files):

- `X_WEBHOOK_SECRET`
- `THREADS_WEBHOOK_SECRET`
- `LINKEDIN_WEBHOOK_SECRET`
- `META_WEBHOOK_SECRET`
- `X_BEARER_TOKEN` (or `TWITTER_BEARER_TOKEN`)
- `META_ACCESS_TOKEN`
- `LINKEDIN_ACCESS_TOKEN`

## 2) New Tables and Views

Migration: `platform/supabase/migrations/20260404000038_engagement_ingestion_b076.sql`

- `social_post_mapping` maps platform post IDs to vote-gate chapter IDs.
- `engagement_ingestion_worker_status` tracks poll/webhook health.
- `engagement_events_per_platform_hour` shows hourly ingest rate.
- `engagement_ingestion_coverage_gaps` shows mapped posts with no events in last 72h.

## 3) Edge Functions

Webhooks:

- `webhook-x-engagement`
- `webhook-threads-engagement`
- `webhook-linkedin-engagement`
- `webhook-meta-engagement`

Pollers:

- `poll-x-engagement` (15m)
- `poll-threads-engagement` (30m)
- `poll-linkedin-engagement` (60m)
- `poll-meta-engagement` (30m)

## 4) Scheduling

The migration schedules polling with `pg_cron` + `pg_net`.

Also ensure these functions are present in `platform/supabase/config.toml` with `verify_jwt = false`:

- all webhook and poll functions listed above

## 5) Mapping Requirement (Critical)

Engagement events can only be attributed when `social_post_mapping` has a row for the platform post ID.

`dispatch-crewman-episode` now writes mapping rows after posting:

- platform
- external post ID
- vote-gate `chapter_id` (resolved by chapter number)
- episode number

## 6) Verification Steps

1. Deploy migration and all new functions.
2. Dispatch a BST episode and verify `social_post_mapping` receives a row.
3. Trigger a poll function manually (or use `/staff/engagement-ingestion` > Manual Re-poll).
4. Verify rows are inserted into `chapter_engagement_events`.
5. Verify `chapter_unlock_progress` moves upward when weighted threshold is crossed.
6. Trigger the same poll again and verify dedupe prevents duplicate inserts.

## 7) Staff Monitor

Path: `/staff/engagement-ingestion`

Shows:

- worker status and error counts
- events per platform (last 24h)
- coverage gaps (last 72h)
- manual re-poll trigger
