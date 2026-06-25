---
title: "Run the MMLU-Pro Harness"
description: "Download, run, and submit your cryptographically provable accuracy result."
date: 2026-06-24
layout: harness
---

## What is the harness?

The LianaB MMLU-Pro harness is a downloadable test suite that runs the same 70-question benchmark used to evaluate the cooperative substrate. You run it on your hardware with your models. Your result is signed with your Ring Bearer Ed25519 key. The substrate verifies the signature. The Posse re-runs 10% of your questions to confirm the result. No Reddit gate. No Discord gate. **The substrate IS the vetting.**

## Download

- [mmlu-pro-bp094.tar.gz](/harness/mmlu-pro-bp094.tar.gz)
- [SHA-256 manifest](/harness/mmlu-pro-bp094.sha256) - verify your download before running
- [LB signature](/harness/mmlu-pro-bp094.sig) - confirms this bundle was signed by the cooperative

## Prerequisites

- Node.js 18+
- An Ollama or OpenAI-compatible endpoint with at least one model loaded
- Your Ring Bearer Ed25519 key pair (issued at member signup - find it at `~/.lb/ring-bearer/`)

If you do not have a Ring Bearer key, log in to your member account and generate one at [lianabanyan.com/settings/keys](/settings/keys).

## Steps

**1. Download and verify the bundle**

```sh
wget https://lianabanyan.com/harness/mmlu-pro-bp094.tar.gz
wget https://lianabanyan.com/harness/mmlu-pro-bp094.sha256
sha256sum -c mmlu-pro-bp094.sha256
```

Expected output: `mmlu-pro-bp094.tar.gz: OK`

**2. Extract**

```sh
tar -xzf mmlu-pro-bp094.tar.gz
cd mmlu-pro-bp094
```

**3. Configure your model endpoint**

```sh
cp .env.example .env
# Edit .env:
# LB_MODEL_ENDPOINT=http://localhost:11434
# LB_MODEL_NAME=llama3.3:70b
```

**4. Run the harness**

```sh
./run-and-sign.sh
```

The harness will:
- Run 70 MMLU-Pro questions through your model
- Compute your accuracy
- Sign the result with your Ring Bearer key
- Write `result.json`, `result.json.sha256`, and `result.json.sig` to `./output/`

**5. Review your result**

```sh
cat ./output/result.json
```

Fields: `questions_attempted`, `questions_correct`, `accuracy`, `wall_clock_seconds`, `per_question[]`.

**6. Submit to the Wall of Member Proofs**

1. Go to [lianabanyan.com/proofs/wall](/proofs/wall) (you must be logged in as a member)
2. Click "Submit Your MMLU-Pro Result"
3. Upload `./output/result.json` (or the full tarball)
4. The substrate verifies your Ed25519 signature automatically
5. The Posse runs 10% of your questions independently to confirm your result
6. Once verified, your result appears on the Wall

## What is the cryptographic provenance?

Your Ring Bearer Ed25519 key is yours. No one else can forge your signature. When you sign your result, you are making a verifiable claim: "I ran these questions, I got these answers, my key attests to it."

The Posse cross-check is the second layer: the cooperative substrate re-runs a sample of your questions through the mesh. If the Posse result matches yours within 5%, your submission is marked "Verified" and anchored to the IP Ledger with a permanent stamp.

**This is what "substrate IS the vetting" means.** The infrastructure that verifies the cooperative's own results is the same infrastructure that verifies yours.

## Questions?

Visit [lianabanyan.com/court](/court) to connect with the cooperative community.
