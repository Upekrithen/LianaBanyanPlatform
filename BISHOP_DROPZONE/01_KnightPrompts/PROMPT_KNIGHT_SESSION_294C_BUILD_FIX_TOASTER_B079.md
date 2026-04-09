# KNIGHT SESSION 294C — Build Fix: Restore toaster import
## Bishop B079 | April 5, 2026 | Phase 1 gate

---

## MISSION

`npm run build` in `platform/` fails with unresolved import `@/components/ui/toaster` from `platform/src/BusinessApp.tsx`. This is a pre-existing issue discovered during K294 foundation delivery. It blocks every downstream v2 page dispatch (K295+).

Restore the toaster component so the build passes cleanly.

---

## CONTEXT

- K294 landed foundation primitives cleanly (lints pass, no new errors)
- Build fails on a path that pre-dates K294
- Likely root cause: shadcn/ui toaster component was scaffolded in sidebar/chat app but never added to `platform/src/components/ui/`
- Sibling Sonner toaster or shadcn toaster may already exist under a different path

---

## DELIVERABLES

1. **Identify current state**
   - Locate any existing toaster: `grep -r "toaster\|Toaster\|use-toast" platform/src/components/ui/`
   - Check `platform/package.json` for shadcn or sonner deps
   - Check `BusinessApp.tsx` line referencing `@/components/ui/toaster` to understand expected API (named vs default export, which hook)

2. **Restore the component**
   - If shadcn Toaster is the pattern in use elsewhere: create `platform/src/components/ui/toaster.tsx` matching shadcn canonical template, plus `platform/src/hooks/use-toast.ts` if missing
   - If Sonner is already wired elsewhere: re-point `BusinessApp.tsx` to the existing Sonner wrapper instead of `@/components/ui/toaster`
   - Whichever path matches the rest of the codebase — do not introduce a new toast library

3. **Verify**
   - `npm run build` passes
   - No new TypeScript errors
   - Toast rendering tested in dev (`preview_start` + trigger a toast)

## ACCEPTANCE

- [ ] `npm run build` passes in `platform/`
- [ ] No new runtime errors in browser console
- [ ] Toaster integration consistent with the rest of `platform/`
- [ ] No new dependency added to `package.json` unless already in the broader stack

## DO NOT

- Do not install a new toast library
- Do not stub the import with an empty component — restore the real toaster
- Do not touch K294 files (shells, v2 primitives, v2-tokens.css)
- Do not skip the build with `--no-verify` or similar flags

---

*Bishop B079 — Phase 1 gate unblocker*
*Must land before K295 Welcome Gate dispatch*
*FOR THE KEEP!*
