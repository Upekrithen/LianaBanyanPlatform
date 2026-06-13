Knight, micro-yoke unblock. Bishop bridge. Pull.
Speed-priority. No em-dashes. Truth-Always.

---

You have been in a screenshot capture loop for 30+ minutes. STOP. The canon (feedback-ux-seg-screenshot-mandatory-bp078) is amended (see memory file). Dev-mode browser screenshots are acceptable for layout/copy/styling SEGs. Founder packaged-install verify is acceptable for IPC/runtime SEGs. You do NOT need to wrestle Cursor + Electron + PowerShell focus-capture for 30 minutes per SEG.

For the v0.1.37 wave specifically:

- SEG-V-2 (Google's prefix copy): dev-mode browser screenshot SUFFICES. You already have one showing "Google's Gemma 4 12B MMLU-Pro Benchmark" rendered. Ship it.
- SEG-V-3 (all-cards-flippable): dev-mode browser screenshot of one card front + back SUFFICES per card.
- SEG-V-4 (model selector screen): dev-mode browser screenshot SUFFICES.
- SEG-V-1 (P0 IPC fix): this DOES need packaged-build verify because IPC behavior under contextIsolation:true sandbox:true is different from dev mode. Source-verify the fix THEN release packaged installer and flag in yoke return as 'awaiting Founder packaged-install verify' for SEG-V-6 ship gate.
- SEG-V-7 (subline copy): dev-mode browser screenshot SUFFICES.

Update KNIGHT_USER_REALITY_VERIFY_CHECKLIST.md (commit) with the new rule: 'cheapest-acceptable-screenshot-form, max 10 min per SEG, switch paths if capture is failing.'

Ship the work. Founder will verify the packaged install on his machine. That is the canonical acceptable verification for IPC and runtime behaviors.

---

Hard bindings: SEG mandatory. No em-dashes. Truth-Always.

End.
