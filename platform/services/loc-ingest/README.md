# LOC Ingest Service (BP039)

Daily ingestion service for Library of Congress legislative data feeds.

## Overview

The LOC Ingest Service polls federal legislative data sources (Congress.gov, Federal Register, etc.) on a daily schedule, classifies items by topic, and routes them to Novacula for bounty generation.

## Architecture

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚  Congress.gov   â”‚
â”‚  Federal Reg    â”‚  â†’ Fetch â†’ Dedupe â†’ Classify â†’ Route to Novacula
â”‚  (Other feeds)  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
        â†“
   Manifest + DB

## Database Schema

### `loc_ingest_manifests`
One record per daily ingest run with summary statistics.

### `loc_ingest_items`
Individual legislative items (bills, regulations) with content hash for deduplication.

## Topic Classes

Items are routed to one of 8 Novacula topic classes:

1. **healthcare** - Health policy, Medicare, Medicaid
2. **education** - K-12, higher ed, student loans
3. **housing** - Affordable housing, zoning, HUD programs
4. **cooperative-finance** - Credit unions, co-op banking, community finance
5. **civic-infra-voting** - Elections, voting rights, civic participation
6. **worker-protection** - Labor rights, OSHA, wage policy
7. **climate-energy** - Climate policy, renewable energy, EPA
8. **justice-sovereignty** - Criminal justice, tribal sovereignty, civil rights

## Usage

import { dailyLocIngest } from './services/loc-ingest';

const result = await dailyLocIngest();
console.log(`Ingested ${result.new_items} new items`);

## Manifest Storage

Daily manifests are written to:
~/.lb_substrate/loc_ingest/manifests/YYYY-MM-DD.manifest.json

Each manifest includes:
- Date and SHA256 hash
- Total polled, new, amended, deduped counts
- Full item list with classification

## Scheduler Integration

TODO: Wire into platform daily cron (runs at 06:00 UTC).

## Development Status

- âœ… Schema migration
- âœ… Service scaffold
- â³ Congress.gov API integration (follow-up)
- â³ Federal Register API integration (follow-up)
- â³ Topic classification ML model (follow-up)
- â³ Supabase persistence (follow-up)
- â³ Novacula routing (follow-up)

## Related Tickets

- BP038: Novacula service foundation
- BP040: Congress.gov API client (TBD)
- BP041: Topic classification model (TBD)
