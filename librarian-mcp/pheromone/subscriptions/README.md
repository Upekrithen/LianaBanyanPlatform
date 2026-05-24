# Pheromone Subscriptions

This directory contains Class-B and Class-C pheromone subscriptions for the Liana-Banyan platform. Pheromones are event-driven triggers that monitor system state and dispatch sagas when thresholds are met.

## Subscription Format

Each subscription is defined in YAML with the following structure:

subscription_id: unique_identifier
class: B | C
description: Human-readable description of what triggers this pheromone
trigger:
  type: sql_threshold | webhook | time_based
  query: SQL query (for sql_threshold type)
  threshold: numeric threshold value
  comparison: gte | lte | eq
  poll_interval_seconds: how often to check (300 = 5 minutes)
  dedup_window_hours: prevent duplicate fires within this window
action:
  type: drekaskip_dispatch | notification | webhook
  saga_id: Target saga to dispatch (if applicable)
  gate:
    type: founder_ratification | auto_approve
    notify_path: Path to write notification file

## Pheromone Classes

- **Class-B**: High-impact thresholds requiring founder ratification before saga dispatch
- **Class-C**: Automated thresholds that can auto-dispatch with appropriate safeguards

## Active Subscriptions

### x16_council_filled
- **Class:** B
- **Trigger:** 16+ accepted/active seats on Initiative #15 (Political Expedition Council)
- **Action:** Dispatch Saga-X16-Council-Filled-Escalation (with founder gate)
- **Poll Interval:** 5 minutes (300s)
- **Dedup Window:** 7 days (168 hours)
- **Detector:** `src/detective/x16_council_detector.ts`

## Implementation Notes

### Detection Layer
Each subscription has a corresponding TypeScript detector module in `src/detective/` that:
- Implements the actual threshold logic
- Handles deduplication
- Writes notifications to Bishop dropzone
- Can be run manually for testing

### Integration Points
- **Detective Modules:** Monitor state via Supabase queries
- **Bishop Dropzone:** Notifications written to `C:\Users\Administrator\.claude\state\bishop_dropzone_inbox\`
- **DrekaSkip:** Saga dispatch system (gated by founder ratification for Class-B)

### Running Detectors

# Manual test of X16 detector
cd librarian-mcp
npx tsx src/detective/x16_council_detector.ts

# With environment variables
SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key npx tsx src/detective/x16_council_detector.ts

### Adding New Subscriptions

1. Create YAML definition in this directory
2. Implement detector module in `src/detective/`
3. Add entry to this README
4. Configure polling in orchestration layer
5. Test manually before enabling automated polling

## Security Considerations

- Class-B subscriptions MUST have founder ratification gates
- Notification files should be reviewed before saga dispatch
- Dedup windows prevent notification spam
- Service keys should never be committed to repository
