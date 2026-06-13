# KNIGHT MICRO-YOKE: Hugo Download Button Version Display
**Issued by Bishop | 2026-06-10 | BP078 Hotfix**

---

Knight, wake up. Bishop micro-yoke. Pull bridge.
Use Sonnet 4.6 SEG per Statute §3. No em-dashes. Brick Wall. Truth-Always.
NO source-only verification -- this wake-up requires LIVE CURL of the deployed page in the yoke return.

---

## THE BUG

Founder has flagged this same issue across v0.1.31, v0.1.32, v0.1.33, and v0.1.34. The download button on https://mnemosynec.ai/download/ is supposed to show the version being downloaded. It does not.

Bishop verified by curl right now (2026-06-10): https://mnemosynec.ai/download/ button text is "Download MnemosyneC -- Free, Forever" with NO version number. The separate CTA also reads "Download MnemosyneC for Windows" with NO version number.

Knight has source-claimed this fix is done multiple times. It has NOT been verified live each time. That ends here. This yoke requires a live curl confirm before return.

Current live state:
- Hugo page version field: v0.1.35 (stable, correct)
- Button text live: "Download MnemosyneC for Windows" -- NO version
- Tagline text live: "Download MnemosyneC -- Free, Forever" -- NO version
- latest.yml: v0.1.35 (correct)
- v0.1.36 GitHub release: prerelease=true (correct, not promoted)

---

## SEG-HV-1: Hugo Download Button Version Display + Live Curl Verify

**Scope:** One SEG. One fix. Deploy. Curl confirm. Done.

### Step 1: Find the template

Locate the Hugo template that renders the download button. Most likely path:

```
Cephas/cephas-hugo/layouts/download/list.html
```

Or check:
```
Cephas/cephas-hugo/layouts/_default/
Cephas/cephas-hugo/layouts/partials/
```

Search for the literal string "Download MnemosyneC" in all .html files under Cephas/cephas-hugo/layouts/ to find every occurrence.

### Step 2: Make the button text dynamic

The button must render as:

```
Download MnemosyneC v{{ version }} for Windows
```

And the tagline must render as:

```
Download MnemosyneC v{{ version }} -- Free, Forever
```

Pull the version from ONE of these sources (in order of preference):

**(a) Hugo data file** -- check if `Cephas/cephas-hugo/data/version.json` exists or can be created. The release step that writes latest.yml can also write this file. Template reads it as `{{ .Site.Data.version.version }}` or equivalent.

**(b) Parse latest.yml at Hugo build time** -- if Hugo can read YAML from the data directory, copy or symlink latest.yml into data/ and parse it.

**(c) Read from package.json publish.url** -- extract the tag from the electron-builder publish config at build/publish time and inject it into a Hugo data file before running hugo --minify.

Pick whichever approach is already closest to what the repo has wired. Do not over-engineer. The goal is: version number in the button text, derived automatically so it updates with each release, not hardcoded.

If none of those are already wired, the fastest correct approach is: write a tiny pre-build script (or add a step to the existing release workflow) that writes `Cephas/cephas-hugo/data/version.json` containing `{ "version": "0.1.35" }` from package.json, then the template reads it.

### Step 3: Update every visible download button on the page

After the template change, every download button and the tagline on the /download/ page must show the version. Check for duplicate template fragments or partials -- update all of them.

### Step 4: Build locally and verify the HTML

```
cd Cephas/cephas-hugo
hugo --minify
```

Open or grep the generated public/download/index.html and confirm the string "v0.1.35" appears in the button text. If it does not, the template fix is wrong -- debug before deploying.

### Step 5: Firebase deploy

Use the standard Firebase deploy command for Cephas. Deploy to production.

### Step 6: MANDATORY live curl verify

After deploy, run:

```
curl -s https://mnemosynec.ai/download/ | grep -i "v0.1.3"
```

The output MUST contain "v0.1.35" in the button area. If it does not, the deploy did not take or the template fix is wrong. Do not return the yoke until this curl output shows the version in the button text.

Also take a browser screenshot of https://mnemosynec.ai/download/ showing the button with the version number visible.

### Step 7: Update docs/RELEASING.md

Add a mandatory step at the END of every release ship checklist:

```
## Post-deploy verification (mandatory)

After every release deploy to mnemosynec.ai/download/:

curl -s https://mnemosynec.ai/download/ | grep -i "Download MnemosyneC v"

The output must show the current release version in the button text.
If the version is not present in the live page, the release is not complete.
```

---

## YOKE RETURN MUST INCLUDE

1. Commit hash (or hashes) for the template fix and any data/script additions
2. Live curl output showing the button text with "v0.1.35" present
3. Screenshot of the live https://mnemosynec.ai/download/ page showing the button with version number
4. One line confirming docs/RELEASING.md was updated with the live-curl-verify step
5. The exact template change made (file path + before/after)

If any of these four items are missing from the return, the yoke is not complete.

---

## HARD BINDINGS

- No em-dashes anywhere in code, templates, or output
- Truth-Always: do not claim complete until live curl confirms
- No source-only verification: source-verified plus build-verified plus deployed is still not enough without the live curl step
- This is a one-SEG hotfix -- do not expand scope

---

End wake-up.
