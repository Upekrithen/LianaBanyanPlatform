# MnemosyneC Release Process

App: MnemosyneC (package name: amplify-computer)
Update feed: https://mnemosynec.ai/download/latest.yml
Publish config: `package.json` > `build.publish` (provider: generic, url: https://mnemosynec.ai/download/, channel: latest)

---

## Pre-release checklist

- [ ] Version bumped in `package.json` (top-level `version` field)
- [ ] Changelog entry written
- [ ] All tests passing
- [ ] No outstanding linter errors in `src/main/`

---

## Step 1 -- Build the installer

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform
npm run dist:win
```

Artifacts land in `release/`:
- `MnemosyneC-Setup-<version>.exe` (NSIS installer)
- `latest.yml` (update manifest -- contains relative URL at this stage, must be patched below)
- `MnemosyneC-Setup-<version>.exe.blockmap`

> **Note (v0.1.35+):** Portable target removed as of v0.1.35. Ship Setup + blockmap only.
> If a user needs portable, they unzip the asar from a Setup install.
> The `"portable"` target has been removed from `package.json > build.win.target`.

---

## Step 2 -- Create the GitHub release

1. Go to: https://github.com/liana-banyan/mnemosynec-releases/releases/new
2. Tag: `v<version>` (e.g. `v0.1.33`)
3. Title: `MnemosyneC v<version>`
4. Upload: `MnemosyneC-Setup-<version>.exe` and `MnemosyneC-Setup-<version>.exe.blockmap`
5. Publish the release. Do NOT upload any Portable artifact.
6. Note the direct download URL: `https://github.com/liana-banyan/mnemosynec-releases/releases/download/v<version>/MnemosyneC-Setup-<version>.exe`

---

## Step 3 -- Patch latest.yml with absolute URL (CRITICAL)

The `release/latest.yml` produced by electron-builder contains a **relative URL** for the installer.
electron-updater running on a user's machine with a generic-provider feed resolves this URL relative to the
feed base (`https://mnemosynec.ai/download/`), which would send users to mnemosynec.ai instead of GitHub.
You must patch the URL to an absolute GitHub URL before uploading.

### Values needed

- `<version>`: e.g. `0.1.33`
- `<sha512>`: the sha512 value already in `release/latest.yml` (do NOT recompute -- copy it verbatim)
- `<size>`: the byte count already in `release/latest.yml` (copy verbatim)
- `<releaseDate>`: use current UTC ISO-8601 timestamp, e.g. `'2026-06-10T01:43:32.994Z'`

### Final latest.yml shape

```yaml
version: <version>
files:
  - url: https://github.com/liana-banyan/mnemosynec-releases/releases/download/v<version>/MnemosyneC-Setup-<version>.exe
    sha512: <sha512>
    size: <size>
path: MnemosyneC-Setup-<version>.exe
sha512: <sha512>
releaseDate: '<releaseDate>'
```

Note: `path` remains the bare filename (no URL). Only the `files[].url` field must be absolute.

---

## Step 4 -- Upload latest.yml to the Cephas download directory

The feed URL is `https://mnemosynec.ai/download/latest.yml`.
This is served from the Cephas Hugo site.

File to update: `Cephas/cephas-hugo/static/download/latest.yml`

Replace the contents with the patched latest.yml from Step 3, then deploy Cephas:

```powershell
cd C:\Users\Administrator\Documents\LianaBanyanPlatform\Cephas\cephas-hugo
hugo --minify
firebase deploy
```

Verify the live feed after deploy:

```powershell
Invoke-WebRequest -Uri "https://mnemosynec.ai/download/latest.yml" -UseBasicParsing | Select-Object -ExpandProperty Content
```

Confirm:
- `version:` matches the new version
- `files[].url:` starts with `https://github.com/liana-banyan/...`
- `sha512:` is non-empty

---

## Step 5 -- Verify GitHub release asset is reachable

```powershell
$r = Invoke-WebRequest -Uri "https://github.com/liana-banyan/mnemosynec-releases/releases/download/v<version>/MnemosyneC-Setup-<version>.exe" -Method Head -UseBasicParsing
$r.StatusCode   # expect 200
```

---

## Step 6 -- Manual end-to-end smoke test (cannot be scripted)

Founder or QA must perform manually:

1. Download `MnemosyneC-Setup-<version>.exe` from the GitHub release page.
2. Install it on a clean Windows machine (or uninstall the previous version first).
3. Open MnemosyneC.
4. Click Help > Check for Updates in the tray menu (or wait for the startup auto-check after 30 s).
5. Expected result (when releasing to same version as latest.yml): "No updates available."
6. To confirm autoUpdater fires correctly: bump `latest.yml` to a higher version and repeat -- expect the update notification to appear.

---

## How the autoUpdater is wired

- Feed URL source of truth: `package.json` > `build.publish.url` = `https://mnemosynec.ai/download/`
- Channel: `latest` (resolves to `https://mnemosynec.ai/download/latest.yml`)
- electron-updater reads the baked-in `app-update.yml` from the asar (set at build time from package.json).
- There is NO runtime `setFeedURL` call in `src/main/auto_updater.ts`. The baked-in URL is the single source of truth.
- If the feed URL ever changes, update `package.json > build.publish.url` and rebuild. Do NOT add a runtime override.

---

## Security notes (pending)

- Windows EV code-signing: PENDING (requires EV cert -- see `docs/azure-signing-setup.md`)
- Signed update manifest: PENDING (latest.yml private-key signing not yet configured)
- SHA-512 verification of installer bytes: ACTIVE (electron-updater performs this automatically)

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| autoUpdater reports no update even when a newer version exists | latest.yml still has relative URL or old version | Re-patch latest.yml, redeploy Cephas |
| autoUpdater downloads from mnemosynec.ai instead of GitHub | `files[].url` in latest.yml is relative | Patch to absolute GitHub URL (Step 3) |
| GitHub asset 404 | Release not published or wrong tag | Check release is public at github.com/liana-banyan/mnemosynec-releases |
| CDN serving stale latest.yml | Firebase CDN cache | Wait a few minutes or add cache-busting header to firebase.json |
