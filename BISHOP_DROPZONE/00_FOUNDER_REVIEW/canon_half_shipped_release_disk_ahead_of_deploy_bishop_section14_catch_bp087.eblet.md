# Canon Eblet — Half-Shipped Release: Disk Ahead of Deploy

**Bound:** BP087 · I9.5
**Class:** Operational discipline · release verification
**Author:** Knight BP087

## Pattern
v0.5.8 commit in main + binary on disk + `latest.yml` not deployed to live CDN = silent regression. Peers auto-updating would re-install the broken build.

## Discipline
Every Knight "shipped" return for a desktop release MUST be followed by Bishop curl-verifying `latest.yml` on EVERY domain serving the auto-updater manifest. Match `version:` field to the claimed version verbatim. Mismatch = Bishop §14 catch; Knight redeploys before signaling peers.

## How to apply
1. Knight commits code + builds installer + copies to static dir + runs Hugo + Firebase deploy
2. Knight returns SHA512 + size + "domains verified"
3. Bishop immediately runs: `curl https://mnemosynec.ai/download/latest.yml` and `curl https://mnemosynec.org/download/latest.yml`
4. If `version:` field does NOT match Knight's claimed version → STOP · DO NOT signal relaunch · Knight executes fix-deploy (I9.5 pattern)
5. Only when Bishop curl confirms version match on ALL domains → signal peers to relaunch

## Caught at
BP087 — v0.5.8 binary on disk, `038b09d` in main, but `latest.yml` on both domains showed `version: 0.5.7`. Museum Firebase target error silently prevented download target from updating. I9.5 fix-deploys to recovery.

## Extended diagnosis (I9.5 findings)
The `mnemosyne` Firebase hosting target uses `public-mnemosynec/` as its publish directory (NOT `public/`). Hugo must be built with `--config config-mnemosynec.toml` to populate this directory. The default `hugo --minify` builds only `public/` (cephas target). If Hugo is not run with the mnemosynec config after updating `static/download/latest.yml`, `public-mnemosynec/download/latest.yml` will retain the old version.

**Two-file deploy checklist for MnemosyneC releases:**
1. Update `Cephas/cephas-hugo/static/download/latest.yml`
2. Run `hugo --minify` (cephas target)
3. Run `hugo --minify --config config-mnemosynec.toml` (mnemosyne target)
4. Run `firebase deploy --only hosting:cephas,hosting:mnemosyne` (skip museum)
5. Bishop curl-verify both domains
