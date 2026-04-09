# Dispatch Crewman Episode Operations

## Timeout protection and pacing model

`dispatch-crewman-episode` now uses a two-phase burst model per platform:

1. Select burst size from `battery_dispatch_platform_config` (`min_burst_size..max_burst_size`)
2. Dispatch only an immediate cap (`DISPATCH_MAX_IMMEDIATE_POSTS_PER_PLATFORM`)
3. Defer the rest by updating `crewman_episodes.scheduled_for` with cumulative randomized jitter from `min_spacing_seconds..max_spacing_seconds`

This preserves pacing while avoiding long in-function wait loops that can hit edge timeouts.

## Recommended cap by environment

- `dev`: `4`
- `staging`: `3`
- `production`: `2`

Use `2` as the production baseline until post APIs and chapter volume are stable under live traffic.

## Secret management

Set the cap value:

```powershell
supabase secrets set DISPATCH_MAX_IMMEDIATE_POSTS_PER_PLATFORM=2 --project-ref ruuxzilgmuwddcofqecc
```

Verify it exists:

```powershell
supabase secrets list --project-ref ruuxzilgmuwddcofqecc | Select-String "DISPATCH_MAX_IMMEDIATE_POSTS_PER_PLATFORM"
```

## Rollout guidance

1. Keep production at `2` for 24 hours while observing function execution times and error rates.
2. If stable and there is no 5xx/timeout increase, test `3` in staging first.
3. Only raise production to `3` if staging remains stable and queue latency warrants it.
4. If timeouts reappear, lower the cap immediately and leave jitter/config unchanged.
