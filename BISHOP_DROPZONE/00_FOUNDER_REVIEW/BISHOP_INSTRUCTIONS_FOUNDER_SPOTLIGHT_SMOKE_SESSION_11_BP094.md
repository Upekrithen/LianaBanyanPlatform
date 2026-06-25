# Founder Spotlight Smoke -- Session 11 Instructions
# BP094 . 2026-06-25

## What Knight fixed this session

Mountain 1 substrate priming now sends DIFFERENT priming to each peer tier (ultra/full/core).
Previously all 5 peers got the same string --> variance=0% --> Andon never had a chance to fire.
Now peers diverge in reasoning approach, producing real variance.

## How to fire the smoke

Step 1: Open PowerShell as Administrator.

Step 2: Navigate to mesh-validation:
  cd C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation

Step 3: Run the spotlight launcher:
  .\FIRE_M13c_SMOKE_3Q_FOUNDER_SPOTLIGHT_BP094.ps1

Step 4: Watch for these 6 critical lines (they will be colored Green or Red):

  LINE 1 (Service key):
    "Service key loaded (length=219)"
    Green = key loaded. Red = key missing, smoke will fail.

  LINE 2 (Per-tier Mountain 1):
    "[MOUNTAIN1] domain=X primed - ultra:N tokens, full:N tokens, core:N tokens"
    Green = per-tier priming is active. If you see "unfair_bundle=N tokens" (old format) = Block A not applied.

  LINE 3 (Variance per Q):
    "variance=N%" in fast-consensus or Andon line
    Green if > 0%. Red if 0% (means identical priming still injected, Block A failed).

  LINE 4 (Andon header):
    "Andon-escalate: star-chamber"
    Green = escalation path armed. If "none" = wrong flag passed.

  LINE 5 (Escalation fire):
    "[ENSEMBLE_ABSTAIN]" or "ANDON:" or "[POSSE] swarm dispatched"
    Green if any of these appear = escalation path reached.

  LINE 6 (Q02 answer):
    "Q02" answer line near end of run
    Green if final answer = I (correct). Red if E (same failure as before).

Step 5: Paste FULL output back to Bishop (not just summary lines).
