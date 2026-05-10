# B86 Drekaskip Cross-OS Deployment Receipt — macOS 14+ Sonoma

**Bushel:** B86
**Session:** BP034/BP035
**Knight:** Sonnet 4.6
**Date:** 2026-05-09
**Author:** Knight (Cursor), BP035

---

## STATUS: DEFERRED

All macOS 14+ G-gates are **DEFERRED** pending access to macOS hardware or a macOS VM.

The current Knight execution environment is Windows 11 (bare-metal dev box with WSL2).
No macOS hardware, UTM VM, or Parallels VM is available in this environment.

---

```yaml
b86_receipt:
  os: "macOS 14+ Sonoma — DEFERRED"
  hardware_class: "DEFERRED"
  cpu: "DEFERRED"
  ram_gb: "DEFERRED"
  vm_type: "DEFERRED (UTM or Parallels required)"
  tested_date: "PENDING"

  g_gates:
    G1_fresh_install: DEFERRED
    G2_node_git_npm: DEFERRED
    G3_typescript_build: DEFERRED
    G4_daemon_starts: DEFERRED
    G5_healthcheck: DEFERRED
    G6_inaugural_wave: DEFERRED
    G7_speedup_ratio: DEFERRED
    G8_persistence: DEFERRED
    G9_mcp_tools: DEFERRED
    G10_fan_in_merge: DEFERRED
    G11_discard_infinity: DEFERRED
    G12_yoke_format: DEFERRED

  deferred_reason: >
    No macOS 14+ hardware or VM available in the current Knight execution environment
    (Windows 11 dev box + WSL2). macOS testing requires one of:
      (a) A physical Mac (MacBook Pro/Air, Mac Mini, Mac Studio) running macOS 14 Sonoma
          or later — preferably M-series (Class B = 4-core, 8GB for member-machine receipt)
      (b) UTM VM on a Mac host running macOS 14+ guest
      (c) Parallels VM on a Mac host running macOS 14+ guest

  anticipated_coroner_advisory: >
    Based on Ubuntu findings (B86-CSA-001), the FullSessionEvidenceMap type gap
    in grader.ts at commit 42ecdcd is EXPECTED to block the macOS build as well.
    macOS uses a case-insensitive filesystem by default, but TypeScript type checking
    is language-level (not filesystem-level), so TS2724 will occur on macOS just as
    it did on Ubuntu. The same 2-line fix should be applied.

  anticipated_node_install: >
    Recommended path: brew install node@20 OR nvm install 20. Accept Xcode CLT
    prompt (Step 3) BEFORE npm install to prevent native dep compile failures.
    Command: xcode-select --install

  anticipated_g3_note: >
    macOS filesystem is case-insensitive by default, so any Linux-specific
    case-sensitivity issues (import path casing) should not surface. However,
    the FullSessionEvidenceMap TypeScript error (B86-CSA-001) WILL surface on macOS
    since it is a type-level error, not a filesystem-level error.

  completion_owner: "Founder or designee with macOS hardware"
  completion_deadline: "Before B83 Hearth Conjunction Window member-machine deployment (HL-1)"

  speedup_receipt:
    t_wave_ms: "PENDING"
    t_serial_est_ms: "PENDING"
    speedup_ratio_canonical: "PENDING (expected ≥1.5x based on W11=2.080x, Ubuntu=2.034x)"
    parallel_beats_serial: "PENDING"
    g7_threshold_15x_met: "PENDING"

  soak_test:
    duration_min: "PENDING"
    daemon_stable: "PENDING"
    any_crashes: "PENDING"

  screenshots_taken: false
  notes: >
    PARTIAL LANDED declared for B86: Windows 11 and Ubuntu receipts are complete.
    macOS receipt is DEFERRED. Per B86 spec §CLOSING DIRECTIVE:
    "Partial Yoke after each OS LANDED is preferred over waiting for all 3."
    macOS is tracked as an open item in the B86 docket.
```

---

## What macOS Testing Requires

### Prerequisites
1. macOS 14 Sonoma (UTM VM or bare metal)
2. `xcode-select --install` (Step 3 — do FIRST before Node install)
3. `brew install node@20` or `nvm install 20`
4. `git config --global user.email "knight@lb.local"`

### Steps
Follow the B86 12-step checklist identically to Ubuntu receipt.

### Expected differences from Ubuntu
- Startup log line 2 will show `K30 §10 config` (at B61A commit) ✓
- FullSessionEvidenceMap type gap (B86-CSA-001) WILL occur — apply same 2-line fix
- Native npm deps should compile without issues (Xcode CLT provides clang)
- No case-sensitivity filesystem issues expected (macOS is case-insensitive by default)
- Port 7461 should be free on a fresh macOS install

### Expected speedup ratio
Based on W11 (2.080x) and Ubuntu (2.034x), macOS is expected to achieve ≥2.0x
on modern Apple Silicon (M-series) or ≥1.6x on older Intel Mac hardware.
G7 threshold (≥1.5x) expected PASS on all macOS hardware classes.

---

*Authored: Knight (Sonnet 4.6), BP035, 2026-05-09*
*Status: DEFERRED — macOS hardware required*
