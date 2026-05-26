# Anecdote Eblet Schema

**Version:** 1.0
**Session:** BP058 W15
**Date:** 2026-05-26

## Overview

The **AnecdoteEblet** is a schema for member-authored first-person experience stories tied to Sweet Sixteen cooperative initiatives. Anecdotes are the human substrate — "people ARE the substrate" (Founder voice, BP058 W15 BLOOD canon).

## Core Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `anecdote_id` | string | ✓ | Unique ID: `anecdote_<uuid-short>` |
| `member_id` | string | ✓ | Cooperative member ID (opaque, not PII) |
| `initiative` | SweetSixteenInitiative | ✓ | Which of the 16 initiatives this anecdote concerns |
| `experience_text` | string | ✓ | First-person narrative (max 2,000 chars) |
| `emotion_tag` | EmotionTag | ✓ | Primary emotional quality |
| `food_class_tag` | FoodClassTag | ✓ | Pantry / Bundle / Hard-Candy |
| `date_experienced` | string (ISO 8601) | ✓ | When the experience happened |
| `date_submitted` | string (ISO 8601) | ✓ | When the member submitted |
| `ratify_status` | RatifyStatus | ✓ | draft / pending / ratified / returned / archived |
| `is_public` | boolean | ✓ | Member consent for public display |
| `schema_version` | 1 | ✓ | Fixed at 1 |

## Food-Class Taxonomy

The three-tier classification mirrors the cooperative food economy canon:

| Tag | Meaning | Example |
|-----|---------|---------|
| `pantry` | Staple / recurring / foundational experience | "My grocery co-op saves me $80/mo every month" |
| `bundle` | Grouped / cooperative / shared experience | "We made dinner together with five families" |
| `hard_candy` | Special / memorable / high-impact experience | "The health accord covered my surgery I couldn't afford" |

## Sweet Sixteen Initiatives

All 16 canonical initiatives are supported:
`lets_make_dinner`, `lets_get_groceries`, `lets_go_shopping`, `household_concierge`,
`the_family_table`, `tatiana_schlossburg_health_accords`, `msa`, `defense_klaus`,
`rally_group`, `vsl`, `lets_make_bread`, `harper_guild`, `jukebox`, `didasko`,
`power_to_the_people`, `brass_tacks`

## Ratification Workflow

```
draft → pending → ratified
  ↓          ↓
 (abandoned) returned → (member revises) → pending → ratified
                                                     ↓
                                                  archived
```

## Substrate Integration

Once ratified, an AnecdoteEblet can be Pearl-anchored:
- `pearl_id`: Pearl ID if SSPS-compressed into the substrate
- `soccerball_id`: Soccerball handle if bundled with other anecdotes via V15.1 codec

## Scope Notes (V15)

- **MENUS integration**: deferred to V16 (requires platform/src changes)
- **Phoebe UI surface**: deferred to V16 (member-facing form component)
- **Supabase migration**: deferred — schema ready for migration authoring

## Usage

```typescript
import { createAnecdoteDraft, validateAnecdote } from "./anecdote_eblet.js";

const draft = createAnecdoteDraft({
  anecdote_id: "anecdote_a1b2c3d4",
  member_id: "member_xyz789",
  initiative: "lets_make_dinner",
  experience_text: "The neighborhood dinner co-op changed everything for our family...",
  emotion_tag: "belonging",
  food_class_tag: "bundle",
  date_experienced: "2026-04-15",
  is_public: true,
});

const validated = validateAnecdote(draft); // throws AnecdoteValidationError if invalid
```
