<!-- FIRE INSTRUCTIONS -->
<!-- Platform: Reddit → r/programming -->
<!-- Post as: FounderDenken -->
<!-- Format: New Post. Title → Title field. Body → Text field (Markdown mode). -->
<!-- FIRE GATE: Replace all {{ M12_* }} placeholders with confirmed M12 receipt values. -->
<!-- NYT EXCLUSIVITY: No essay prose, no May-30 stats, no "Art of Losing" frame. CLEAR. -->
<!-- Truth-Always: 42Q stratified preview · full 70Q definitive 2026-06-25 -->

---

**Title:**
We built a free local cooperative AI mesh on consumer hardware. SSPL-licensed. Here's the receipt.

---

**Body:**

Last night a 4-peer cooperative mesh finished an overnight LONGHAUL run on TIGER-Lab MMLU-Pro (42Q stratified preview). Result: **{{ M12_ENSEMBLE }}%**. Per-domain: {{ M12_PER_DOMAIN }}. Escalations: {{ M12_ESCALATION_FIRED_COUNT }}.

Here's how it works technically, because that's what matters.

---

**The mesh topology**

Four consumer machines. All traffic routes through a public relay (`relay.lianabanyan.com`). We explicitly avoid LAN shortcuts — the test runs on actual WAN roundtrips so we catch TLS/CDN/relay/auth issues that a LAN-local test misses. Dragon Harness coordinates the 4-peer ensemble.

---

**The per-domain architecture**

Each MMLU-Pro domain (math, physics, chemistry, law, etc.) runs independently through a 12-pass Plow Loop before cross-domain connections form. The Individual Domain Pattern prevents cross-contamination of reasoning between domains. After 12 loops:

- If confidence clears threshold → answer finalizes.
- If it doesn't → per-domain timeout fires, question escalates to Star Chamber.

**Star Chamber** is a 4-agent multi-vendor double-blind layer. Variance-to-risk scoring: `H = Variance / 100`. High variance = high risk = escalation. {{ M12_ESCALATION_FIRED_COUNT }} questions hit this path last night.

---

**The 12-pass Plow Loop (what it actually does)**

Not magic. Twelve sequential verification passes:
- Passes 1–9: standard adversarial reasoning over the substrate
- Pass 10: CONSEQUENCE_TRACE — follow downstream logic from the proposed answer
- Pass 11: ELIMINATION_VERIFICATION — constrain the answer space by what is provably false
- Pass 12: DEPENDENCY_PROPAGATION — flag stale claims if their upstream knowledge has changed

What survives 12 loops earns a confidence classification. Below-threshold survivors escalate.

---

**The license**

SSPL v1. Pledge #2260 (Cooperative Defensive Patent Pledge) — patents protect the cooperative against incumbents, not against members or contributors. USPTO Provisional 64/095,518 filed (PROV_22, 100pp, 22 provisional claims).

---

**Reproducibility**

Corpus is public: `TIGER-Lab/MMLU-Pro` on HuggingFace, commit `80cd33a`. The `lb-reproducibility-pack` releases alongside the 70Q definitive run on 2026-06-25.

This is a 42Q stratified preview. The full 70Q definitive receipt is 2026-06-25. We're telling you that clearly so you can calibrate how much weight to put on the overnight number.

Base mesh participation: free. Full cooperative membership: $5/year. No venture capital. No flagship API costs passed to you.

mnemosynec.org

---
*Truth-Always: 42Q stratified preview · full 70Q definitive receipt target 2026-06-25*
