# Gemma 4 12B CDN Fallback — Self-Hosted Mirror Plan
**SEG-Q-5 · BP078 · v0.1.33**

## Status

- Infrastructure: **DESIGNED** (not yet populated)
- Bucket: **PENDING** — GCS bucket `gs://liana-banyan-models` or Cloudflare R2 `models.mnemosynec.ai`
- Mirror status: gemma4:12b blobs NOT yet uploaded to self-hosted CDN

Truth-Always: the actual blob upload requires Founder authorization and ~8 GB storage budget. This document is the design spec. Code support is in place; the bucket is empty.

---

## Design

### Why self-host

1. **Resilience**: Ollama registry (`registry.ollama.ai`) may be slow or unavailable in some regions.
2. **Speed**: CDN-optimized delivery from GCS/R2 may be faster than Ollama's US-based registry.
3. **Mesh future** (BP078 future): nodes that already have the model can serve to neighbors via the mesh peer-share mechanism (Cohesion Scope 5/6 in queue — not shipped in v0.1.33).

### Blob structure

Ollama stores models as:
```
~/.ollama/models/
  blobs/           # content-addressed blob files (sha256 named)
  manifests/
    registry.ollama.ai/
      library/
        gemma4/
          12b      # JSON manifest pointing to blob hashes
```

The self-hosted mirror replicates this structure at:
```
https://models.mnemosynec.ai/
  blobs/sha256:xxxxxxxx...    (each blob file)
  manifests/gemma4/12b        (JSON manifest)
```

### Ollama registry override

Ollama does not yet support a `--registry` flag per-pull. The supported approach is to:

1. Download blobs directly and place in `~/.ollama/models/blobs/`
2. Write the manifest to `~/.ollama/models/manifests/registry.ollama.ai/library/gemma4/12b`
3. Ollama will detect the model as locally available and skip the pull

This is the approach used by the `MnemosyneC CDN Pull` fallback script.

### Environment variable

`MNEMOSYNEC_MODEL_CDN_URL` — set to override the download base URL.

Examples:
```
MNEMOSYNEC_MODEL_CDN_URL=https://models.mnemosynec.ai
MNEMOSYNEC_MODEL_CDN_URL=https://storage.googleapis.com/liana-banyan-models
```

If unset, pull falls through to `registry.ollama.ai` via normal `ollama pull`.

---

## Setup Steps (when ready to populate bucket)

### Step 1 — Get model blobs from an existing installation

On a machine where gemma4:12b is already installed:
```bash
ls ~/.ollama/models/blobs/
ls ~/.ollama/models/manifests/registry.ollama.ai/library/gemma4/
```

### Step 2 — Upload to GCS

```bash
gcloud storage cp ~/.ollama/models/blobs/sha256:* gs://liana-banyan-models/blobs/
gcloud storage cp ~/.ollama/models/manifests/registry.ollama.ai/library/gemma4/12b \
  gs://liana-banyan-models/manifests/gemma4/12b
```

### Step 3 — Make public (CDN delivery)

```bash
gcloud storage buckets update gs://liana-banyan-models --uniform-bucket-level-access
gcloud storage buckets add-iam-policy-binding gs://liana-banyan-models \
  --member=allUsers --role=roles/storage.objectViewer
```

### Step 4 — Set up custom domain (optional)

Wire `models.mnemosynec.ai` CNAME to GCS or Cloudflare R2 endpoint.

---

## Fallback Pull Script

Location: `scripts/cdn-pull-gemma4.mjs`

The script downloads gemma4:12b from our CDN directly to `~/.ollama/models/` bypassing the Ollama registry. Called automatically when:
1. `MNEMOSYNEC_MODEL_CDN_URL` is set
2. Normal `ollama pull gemma4:12b` fails after 3 retries
3. User explicitly requests CDN pull via Settings

---

## Mesh-peer-share (future — NOT in v0.1.33)

Per Founder directive: nodes that already have the model can serve to neighbors over the mesh.
Design queued in Cohesion Scopes 5+6 (BP078 queue). Not shipped here.

The CDN fallback scaffolding in this document is the prerequisite. Once nodes can pull from our CDN, extending to peer-pull is a routing layer addition only.

---

*SEG-Q-5 BP078 · Knight (Cursor · Sonnet 4.6) · v0.1.33 · Truth-Always*
