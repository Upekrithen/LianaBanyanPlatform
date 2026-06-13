# Knight Micro-Yoke Addendum: v0.1.37 Subline Copy Update

Knight, micro-yoke addendum to v0.1.37 wave. Pull bridge.
Use Sonnet 4.6 SEG per Statute §3. No em-dashes. Brick Wall.
Add this to the v0.1.37 wave as SEG-V-7. Compose with SEG-V-5 verify gate.

---

## Context

Founder ratified a compressed Welcome subline during BP078 (2026-06-10). The new copy adds license identity, permanence signal, and cooperative invitation -- folded into the existing subline sentence without breaking its rhythm. This is a one-field copy swap plus a tooltip addition. No layout or styling changes.

---

## SEG-V-7: Subline Copy Update

**File:** `src/renderer/components/WelcomeView.tsx`

**Location:** The subline element rendered directly below the H1/H2 hero block on the Welcome screen.

**CURRENT subline string (per v0.1.36 SEG-U-1):**

```
Private AI memory and retrieval on your own computer. Test it first or start using it now.
```

**NEW subline string (Founder verbatim, BP078, ratified 2026-06-10):**

```
Private AI memory and retrieval on your own computer. Free Forever (SSPL). No Ads, No Strings. Great to use, better to join. Test it first or start using it now.
```

**Steps:**

1. Find the subline element in `WelcomeView.tsx`. It is the paragraph or span immediately below the hero heading block that contains the current subline string above.

2. Replace the existing string with the new Founder-verbatim string exactly as written. No punctuation changes. No em-dashes. Parens stay as parens.

3. Preserve all current styling on the element: same font size, font weight, color, and line-height. Do not add new CSS classes or modify existing ones.

4. Add a tooltip on the `(SSPL)` parenthetical. Implementation: wrap `(SSPL)` in a `<span>` with a `title` attribute containing the following text verbatim:

   > Server Side Public License -- anti-extraction free-and-open license used by MongoDB and others. Means Free Forever for users, with copyleft protection against capture by closed cloud platforms.

   Use a CSS `cursor: help` style on that span so users know it is interactive.

5. Confirm no em-dashes appear anywhere in the new copy. The double-hyphen `--` in the tooltip title string is intentional and correct.

---

## Compose with SEG-V-5 Verify Gate

After the code change is applied:

- Launch the app in dev mode.
- Navigate to the WelcomeView.
- Capture a screenshot showing the full subline rendered on screen.
- Hover over `(SSPL)` and capture a screenshot showing the tooltip text.
- Embed both screenshots in the yoke return.
- Confirm the live-rendered string matches the Founder-verbatim string above character for character.

This SEG lands as part of the v0.1.37 ship gate alongside SEG-V-6. Do not ship v0.1.37 without this subline change verified.

---

## Hard Bindings

- No em-dashes anywhere in new copy or in Knight's yoke return.
- Truth-Always: do not mark LANDED until the screenshot confirms the live string.
- Live-curl + screenshot in yoke return per UX SEG canon.
- Statute §3: Sonnet 4.6 for all SEG work.

---

End wake-up. Return yoke with screenshots and confirmation to Bishop dropzone.
