---
title: BP078 Download Page Fix Receipt
date: 2026-06-09
agent: SEG-DEPLOY (Sonnet 4.6, Statute §3)
---

# BP078 Download Page Fix -- LANDED

## Changes
- SHA updated: 58A9FFC7 -> B1FFA2A606AD9F439464B22EE1E38EC25939C79F14EFB555C9EFD4F24E3A7D8F
- "What is FULL?" accordion: present (from b00a8e0)
- Stale FULL SFX link: removed

## Commits
- SHA fix commit (bp078-cohesion-ship-ready, inline paragraph): e10fa0d
- SHA fix commit (main, technical table second occurrence): bc57a8e
- Merge commit (bp078-cohesion-ship-ready -> main): 1235e53

## Deploy
- Firebase deploy timestamp: 2026-06-09T05:19 UTC-5 (approx)
- Firebase project: lianabanyan-403dc
- Targets deployed: cephas-lianabanyan, lianabanyan-museum, mnemosyne-lianabanyan
- Live verification: B1FFA2A6 present / "What is FULL" present / 58A9FFC7 absent / GitHub release 200 OK

## Live Verification Results
- [PASS] B1FFA2A606AD9F439464B22EE1E38EC25939C79F14EFB555C9EFD4F24E3A7D8F found at mnemosynec.ai/download/ (both inline and technical table)
- [PASS] "What is FULL?" accordion present at mnemosynec.ai/download/
- [PASS] 58A9FFC7 NOT found at mnemosynec.ai/download/
- [PASS] GitHub release URL https://github.com/liana-banyan/mnemosynec-releases/releases/download/v0.1.27/MnemosyneC-Setup-0.1.27.exe returned 200

Truth-Always.
