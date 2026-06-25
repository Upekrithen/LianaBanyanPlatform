# M13c THUNDERCLAP v0.6.0 launcher
# Runs validate-relay.mjs and logs to file
Set-Location "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation"

$logFile = "C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\thunderclap_m24_refire_r3.log"
"" | Out-File $logFile -Encoding utf8

node validate-relay.mjs `
  --questions=42 `
  --mode=smoke `
  --routing=tier-aware `
  "--answer-tier-config=ultra:cb4ef450cc4a18c3,full:d0b47bd08633385b+88cbf6bdd6f74587" `
  "--mic-tier-config=core:c532e74069e137bc+49f3e5971518a064" `
  "--question-difficulty-routing=hard:ultra+full,medium:ultra+full+core,short:all" `
  --andon-escalate=star-chamber `
  --andon-threshold=15 `
  --wire=hex-mcode `
  --plow=mesh-12-blade `
  --flagship-tier=mixed-tiered `
  "--trial-id=TRIAL_M24_BP092_42Q_POSSE_TIER2_V070_R3" `
  --pass=A `
  --fleet-composition-receipt=true `
  "--per-domain-timeout=C:\Users\Administrator\Documents\LianaBanyanPlatform\tools\mesh-validation\per_domain_timeout_config.json" `
  --abstain-protocol=true `
  --contested-cascade=tier123 `
  --tier2-flagship=true 2>&1 | Tee-Object -FilePath $logFile
