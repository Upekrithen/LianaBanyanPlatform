# Knight Prompt — Session 9A
## Date: March 12, 2026
## From: Bishop (Claude Desktop)

---

## MANDATORY FIRST STEP — DO THIS BEFORE ANYTHING ELSE

```bash
git fetch origin && git reset --hard origin/main
```

**Why**: In Session 8M, `git filter-repo` was run to shrink `.git` from 32GB to 187MB. Your local repo has the OLD 32GB history. If you don't reset, you will have merge conflicts and broken state. The current HEAD on origin/main is `6c337cf`.

After reset, verify:
```bash
git log --oneline -3
# Should show 6c337cf at HEAD
```

---

## SESSION 8M CONTEXT (What Happened)

A `git filter-repo` command accidentally deleted ~40GB of untracked files from the working tree (Asteroid-Proof Vault 3D models, 37 directories, 108 root files). Everything was recovered from Windows Volume Shadow Copies. The git repo now ONLY tracks:
- `platform/`
- `.github/`
- `.cursor/`
- `.gitignore`

All other directories (letters/, BISHOP_DROPZONE/, Cephas/, Asteroid-ProofVault/, etc.) exist on disk but are NOT in git. **Do not attempt to add them to git.**

---

## SESSION 8J STATUS CHECK

Before starting new work, verify whether Session 8J tasks were completed. Check:

1. **Crow's Nest Sweet Sixteen content** — Were the 5 items removed and 5 added in `platform/src/data/crowsNestItems.ts`?
2. **Lovable reference cleanup** — Was line 922 of `platform/public/LIANA_BANYAN_BUSINESS_PLAN.md` changed from "Lovable Cloud" to "Firebase (8 targets) + Supabase"?
3. **Internal `equity` → `participation` renames** — Were the variable renames done with TODO(SEC-RENAME) comments?
4. **Proteus Anchor stub** — Was this stretch goal attempted?

If any Session 8J tasks are incomplete, finish them first.

---

## NEW TASKS (Session 9A)

### Task 1: Tom Simon Crown Letter (CONTENT NEEDED)
- **File**: `platform/src/data/crown-letters/LOCKED_TOM_SIMON_CFO.md`
- This is currently a STUB — it needs real content
- This is a crown letter to Tom Simon, CFO
- Check other crown letters in the same directory for format/tone reference
- Flag to Founder if you need specific content direction

### Task 2: Innovation Count Propagation
- The count is now **1,594 total** (1,560 filed + 34 pending)
- Previous docs may show 1,555 or 1,560
- Update all references across platform and docs to reflect 1,594
- Key files to check:
  - `platform/public/LIANA_BANYAN_BUSINESS_PLAN.md`
  - Any landing page copy referencing innovation counts
  - `SWEET_SIXTEEN_CANONICAL.md`

### Task 3: Build & Deploy
- After completing tasks, run build, verify no errors
- Commit and push to origin/main
- Deploy to Firebase if platform/ files changed

---

## COMING NEXT (FROM FOUNDER)

The Founder will give you `PROMPT_KNIGHT_SESSION5_FOLLOWUPS_AND_SESSION6.md` separately. That document covers:
- Session 5 follow-up tasks (Certification Flow, Mentee Grid, Contingency Operator Templates, Treasure Map weighting)
- Session 6 Reviewer Pipeline ("The Harper's Eye")
- Patriotic Interdependentalist page
- Front page self-funding copy

**Do NOT start those tasks until the Founder delivers that prompt.**

---

## DELIVERABLE

When done, write `KNIGHT_HANDOFF_SESSION_9A.md` in BISHOP_DROPZONE with:
- What was completed
- What was blocked or deferred
- Current git commit hash
- Any questions for Bishop or Founder

---

*Knight, welcome back. The repo is clean, the vault is restored, and we're back on track. — Bishop*
