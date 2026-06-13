
---
<!-- bishop-yoke-task 2026-06-10T17:00:00Z -->

## BISHOP -> KNIGHT - TASK - STEP 3 GRANULAR PROGRESS UI (v0.1.39 HOTFIX) - USE SONNET 4.6 SEGs (Statute Section 3)

**Pinned-class task. Pin-marker: BP079_STEP3_PROGRESS_2026-06-10T17:00:00Z**

### TL;DR

Founder installed v0.1.38 on M1 today. Bedrock fix works (Welcome -> Just use it -> Step 3 reached, no crash). But Step 3 ("SETTING UP FULL TIER...") is heartbeat-only UX: spinner + the words "Finalizing your setup..." with no granular indicator. Founder verbatim:

> "I would prefer a progress bar that shows 1 of 12, or whatever, so I can see what is happening, and don't just have to wait and twiddle my thumbs without seeing anything. I don't KNOW that it's doing anything. I *THINK* it is, but.. who knows?"

This is `feedback_long_running_progress_heartbeat_canon_bp078` firing on the FOUNDER's own install. Canon: "any operation >3s wall-clock shows progress: real bar > step-by-step > heartbeat. Silence is broken." Step 3 is the gemma4:12b pull (~7 GB) -- multi-minute on a fast connection, longer on slow. Heartbeat is the worst tier; user assumes the app froze.

### Screenshot evidence

`C:\Users\Administrator\Pictures\BeanSprouts\Screenshot 2026-06-10 114838.png` -- v0.1.38 title bar, "JUST USE IT" panel, "STEP 3 OF 3: SETTING UP FULL TIER..." heading, single spinner + "Finalizing your setup..." text only.

### The data is already available -- it just needs to be surfaced

`preload.ts` already exposes `onOllamaPullProgress(cb)` to the renderer (verified earlier today in compiled asar dump). Ollama's pull stream emits granular events:
- "pulling manifest"
- "downloading <layer-sha>" with `completed` + `total` byte counts
- "verifying sha256 digest"
- "writing manifest"
- "success"

The IPC stream already carries this. Step 3 just renders the spinner without consuming it.

### Required UX shape

Below the "Finalizing your setup..." line, render:

1. **Sub-step indicator** -- "Step X of N: <human-readable>" (e.g., "Step 2 of 5: Downloading model layer 3/12")
2. **Progress bar** -- real percentage from completed/total bytes when in a download phase
3. **Bytes counter** -- "412 MB of 7.04 GB" (locale-formatted; SI units)
4. **ETA** -- "~3 minutes remaining" (compute from rolling-average throughput last 5s; refresh every 1s)
5. **Phase name** -- one of: "Connecting to model server" / "Downloading model (layer X of N)" / "Verifying integrity" / "Finalizing"
6. **Cancel-safe** -- if user closes window, partial download resumes on next launch (ollama handles this natively -- just don't reset state)

If ANY rolling-average data not yet available (first 2-3s), show "Calculating..." rather than a misleading "0:00 remaining."

### Why this should already exist

This violates a binding BP078 canon (Founder-direct ratify). The canon was minted because Founder hit a silent screen on a prior install. v0.1.38 reaches Step 3 specifically because v0.1.32-v0.1.37 never got that far (preload was broken). So this is the FIRST install that surfaces the UX gap empirically. Not a regression; an unbuilt feature now visible.

### SEG fan-out (Sonnet 4.6 mandatory)

- **SEG-S3-1 (Sonnet 4.6) -- Recon:** Find the Step 3 renderer component (likely `src/renderer/components/FirstLaunchModelDownload.tsx` or `FirstStepsView.tsx` Step 3 panel -- you wired both in BP078 Scope 6.5 commit b00a8e0). Identify exactly where "Finalizing your setup..." is rendered and what state it reads from. Report: file path + component name + lines + current state shape.
- **SEG-S3-2 (Sonnet 4.6) -- IPC audit:** Confirm `onOllamaPullProgress(cb)` payload shape. Read main-process emitter (likely `src/main/ollama_manager.ts` or `ai_dispatch_ipc.ts`). Capture the event payload schema and any rolling-throughput state. If payload is missing required fields (phase name, layer index/count), enhance the main-process emitter to include them -- single source of truth.
- **SEG-S3-3 (Sonnet 4.6) -- Renderer wire-up:** Subscribe to `onOllamaPullProgress` in the Step 3 component. Render the 5-element UX shape above. Use the project's existing progress-bar primitive if one exists (search components/ for `ProgressBar`, `<progress>`, or `LinearProgress`). If none, build a minimal one inline -- don't pull in a new dependency.
- **SEG-S3-4 (Sonnet 4.6) -- ETA logic:** Implement rolling-throughput average (last 5s window) and ETA calc. Edge cases: throughput zero -> "Calculating..."; total bytes not yet known -> show bytes-downloaded only without percent; download stalled >30s -> "Resuming..." with throbber.
- **SEG-S3-5 (Sonnet 4.6) -- Packaged-install screenshot verify (BINDING per `feedback_ux_seg_screenshot_mandatory_bp078`):** Build v0.1.39 installer locally, install it on your machine, capture screenshot of Step 3 mid-pull showing the new UI. Embed screenshot in Yoke-return. SOURCE-VERIFIED IS NOT ENOUGH per canon (three verify-without-exercising failures in 24 hours -- this canon is binding because of those failures).
- **SEG-S3-6 (Sonnet 4.6) -- Ship v0.1.39:** Standard `npm run publish:win`. Both new guards (`assert-preload-sandbox.mjs` corrected version + `assert-preload-source-no-declare-const.mjs`) must pass. Confirm 142/142 IPC channels still PASS. Push commit + tag.

### Reply contract

Yoke-return as one consolidated response:
- File paths touched (with line counts)
- IPC payload schema before/after
- Screenshot of Step 3 mid-pull on packaged v0.1.39 install (path + brief description)
- v0.1.39 release URL + SHA-256 + commit
- Cephas page bump task (separate Yoke incoming if Founder ratifies after v0.1.39 ships)

### Truth-Always footnote

If the data ISN'T actually available from ollama's pull stream (because you wrapped it differently than I'm assuming), surface honestly -- don't fake granularity from a timer. Real progress from real signal or no progress UI at all (then this becomes a "wrap ollama-pull with a streaming bytecount" task instead, which is bigger).

If "Finalizing your setup..." is rendered AFTER the download completes (i.e., it's the post-download Ollama warmup phase rather than the download itself), then the heartbeat there is briefly acceptable -- but the download phase BEFORE it MUST have the granular UI. Clarify in Yoke-return which case applies.

### Paste-ready Founder wake-up

> Knight, NEW Yoke at `C:\Users\Administrator\Documents\LianaBanyanPlatform\BISHOP_YOKE_STEP3_PROGRESS_2026-06-10.md`. v0.1.38 boots clean on Founder M1 -- bedrock fix verified empirically (screenshot proves window.amplify functional). But Step 3 UX is heartbeat-only ("Finalizing your setup..." + spinner), violates `feedback_long_running_progress_heartbeat_canon_bp078`. v0.1.39 hotfix: surface the ollama-pull progress that's already in the IPC stream. Sonnet 4.6 SEGs mandatory (Statute Section 3). PACKAGED-INSTALL SCREENSHOT VERIFY MANDATORY per `feedback_ux_seg_screenshot_mandatory_bp078` (source-only verify is binding-violation). Yoke-return consolidated.

- Bishop - BP079 - pinned 2026-06-10T17:00:00Z

---
