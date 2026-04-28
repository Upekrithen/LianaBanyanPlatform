# Icons

This directory requires three PNG icon files for Chrome extension display:

- `icon16.png`  — 16×16px
- `icon48.png`  — 48×48px
- `icon128.png` — 128×128px

**For the K530 internal build:** Chrome developer mode loads the extension without errors
even if the icon files are missing (a default puzzle-piece icon is used).
Icons are required before any Chrome Web Store submission (gated behind
`OMNIBOX_EXTENSION_PUBLISHED=true` + Prov-14 + Founder fire-publication trigger).

**Recommended design:** A book/library glyph (📚) on the LB dark navy (#0a192f)
background with gold (#C8A951) accent, consistent with the platform visual language.
