# THUNDERCLAP Trial {TRIAL_ID} -- Paired Receipt
## Pass A: {PASS_A_FLAGSHIP_TIER} (flagship or claude)
## Pass B: {PASS_B_FLAGSHIP_TIER} (gemma or local)
Session: BP087
Fire date: {FIRE_DATE}

## Side-by-Side Comparison

| Metric                  | Pass A ({PASS_A_MODEL})  | Pass B ({PASS_B_MODEL})  |
|-------------------------|--------------------------|--------------------------|
| Ensemble accuracy       | {PASS_A_ACCURACY}/70     | {PASS_B_ACCURACY}/70     |
| Wall-clock total        | {PASS_A_WALL_CLOCK_MIN}m | {PASS_B_WALL_CLOCK_MIN}m |
| Per-token cost (est.)   | ${PASS_A_COST_USD}       | $0.00 (local)            |
| TTFT delta (first token)| {PASS_A_TTFT_MS}ms       | {PASS_B_TTFT_MS}ms       |
| Anthropic API calls     | {PASS_A_API_CALLS}       | 0 (SKIPPED)              |

## Domain Breakdown

| Domain      | Pass A Score | Pass B Score |
|-------------|--------------|--------------|
| {DOMAIN_01} | {A_D01}/5    | {B_D01}/5    |
| {DOMAIN_02} | {A_D02}/5    | {B_D02}/5    |
| {DOMAIN_03} | {A_D03}/5    | {B_D03}/5    |
| {DOMAIN_04} | {A_D04}/5    | {B_D04}/5    |
| {DOMAIN_05} | {A_D05}/5    | {B_D05}/5    |
| {DOMAIN_06} | {A_D06}/5    | {B_D06}/5    |
| {DOMAIN_07} | {A_D07}/5    | {B_D07}/5    |
| {DOMAIN_08} | {A_D08}/5    | {B_D08}/5    |
| {DOMAIN_09} | {A_D09}/5    | {B_D09}/5    |
| {DOMAIN_10} | {A_D10}/5    | {B_D10}/5    |
| {DOMAIN_11} | {A_D11}/5    | {B_D11}/5    |
| {DOMAIN_12} | {A_D12}/5    | {B_D12}/5    |
| {DOMAIN_13} | {A_D13}/5    | {B_D13}/5    |
| {DOMAIN_14} | {A_D14}/5    | {B_D14}/5    |

## Inequality Trinity Check
Free WITH Substrate > Flagship WITHOUT Substrate
(Pass B gemma-on-substrate accuracy vs flagship accuracy baseline: see scores above)
Flagship WITH Substrate = BROKE THE SOUND BARRIER

## Peer Topology (LAN-as-WAN per canon)
Relay: relay.lianabanyan.com
Peers: M0 -- M1 -- M2 -- M3 -- M4
All traffic via WAN roundtrip (LAN-direct optimization deferred)

## Verdict
Pass A: {PASS_A_VERDICT}
Pass B: {PASS_B_VERDICT}
