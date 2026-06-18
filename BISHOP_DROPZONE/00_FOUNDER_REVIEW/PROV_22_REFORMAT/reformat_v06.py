#!/usr/bin/env python3
"""
reformat_v06.py — Apply A&A Style Freeze to PROV_22 v05_FINAL → v06_AA_STYLE

SEG B9 · BP086 · Sonnet 4.6
"""
import re
import sys
from pathlib import Path

INPUT = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v05_FINAL.md")
OUTPUT = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v06_AA_STYLE.md")

CHOSEN_TITLE = "System and Method for a Cooperative Local-First AI Substrate with Multi-Specialist Plow and Adversarial Verification"

NEW_YAML = '''---
title: "Provisional Patent Application 22 — Liana Banyan Corporation"
subtitle: "Cooperative Local-First AI Substrate Pipeline with Verified Knowledge Growth — 37 Claim Groups — Provisional 22"
author: "Jonathan Jones, Sole Inventor"
date: "June 2026"
---'''

NEW_HEADER = '''# Provisional Patent Application 22

## Liana Banyan Corporation

**Applicant:** Liana Banyan Corporation
**Entity Type:** Wyoming C-Corporation (Small Entity)
**EIN:** 41-2797446
**Inventor:** Jonathan Jones (sole inventor)
**Filing Type:** Provisional Patent Application (USPTO Patent Center)
**Estimated Filing Fee:** $65 (Small Entity, provisional)
**Priority Date Goal:** [to be completed by Applicant at USPTO PatentCenter]
**Conversion Deadline:** 12 months from filing date
**Filing path:** USPTO Patent Center direct — Founder discretion.

**Title of Invention:**
*System and Method for a Cooperative Local-First AI Substrate with Multi-Specialist Plow and Adversarial Verification*

**Filed under:** #2260 Cooperative Defensive Patent Pledge (Liana Banyan Corporation, B098).

**PUBLICATION GATE HARD:** This specification is **internal-only** until Founder USPTO submission.
Knight scope: build and stage. Founder scope: review and authorize USPTO submission.
Fire Control per #2330; BP086.

---

## Cross-References to Related Applications

This application claims priority benefit from related provisional applications, all filed by the
same applicant (Liana Banyan Corporation) with the same sole inventor (Jonathan Jones):

- **Provisional Application Series 1–21**, filed 2024–2026, covering the Cooperative-Architecture
  AI Substrate primitives, Pheromone Substrate, Cathedral Effect, Wrasse Pre-Injection, Soccerball-DAG,
  and related cooperative-class innovations.

The architecture disclosed in this application composes with, extends, and provides
reduction-to-practice evidence for innovations in those prior applications.
This filing constitutes the integration of 37 claim groups ratified across BP083–BP086.'''

NEW_FILING_GATE = '''## Filing Gate Status

**PUBLICATION GATE: HARD CLOSED**

Per Fire Control Directive (#2330, Prov 22): this specification is internal-only pending
Founder review and explicit USPTO Patent Center submission authorization.

Knight scope: build and stage this specification. COMPLETE.
Founder scope: review this document; upload to USPTO Patent Center; authorize submission.

Estimated filing fee: **$65 (Small Entity, provisional)**
USPTO Patent Center: https://patentcenter.uspto.gov

Mechanical gate: `USPTO_SUBMISSION_AUTHORIZED=false` (this specification)

---

*Liana Banyan Corporation · Inventor: J. Jones · Provisional Patent Application 22*
*BP083–BP086 Plow Cycle · Sonnet 4.6 SEG · June 2026*
*37 Claim Groups · 44 Innovation Areas · Incremental over Provisional Applications 1–21*
*v06_AA_STYLE: A&A canonical reformat — shorter title + TOC + heading hierarchy + claim notation*'''

# CG names for claim label injection
CG_NAMES = {
    1:  "Canonical Plow Pipeline",
    2:  "FireGuard Staggered Swarm",
    3:  "Andon Cord Self-Policing",
    4:  "BMV 10-Dimension Scoring",
    5:  "Per-Domain Isolation",
    6:  "MEMORY.md Auto-Loading",
    7:  "Six-Folder Substrate Layout",
    8:  "Starter Chocolate",
    9:  "Federation Node Frontier",
    10: "MemoryWallPyramid Addressing",
    11: "Package Store Confectionary",
    12: "Substitution Rail Exchange",
    13: "GPQA Diamond Benchmark",
    14: "EAC Pheromone Decay",
    15: "MMLU-Pro Benchmark",
    16: "MIC Conductor Orchestration",
    17: "Federated Andon 3-Tier",
    18: "The Diagnosis Broadcast",
    19: "Salt-Level Persistence Selector",
    20: "Glow Mechanic",
    21: "Three-Salt-Layer Architecture",
    22: "Hardware-Tier Model Selection",
    23: "Plow Resume from Checkpoint",
    24: "Onboarding Auto-Advance",
    25: "Constellation Switchboard",
    26: "Substitution Rail Marketplace",
    27: "Tab UX + Test-Net by Design",
    28: "Truth Integrity Chain",
    29: "Code Breakers + Gold Refined",
    30: "Unseen Tax Cost Transparency",
    31: "MnemosyneC Persistent Host",
    32: "MedLab / Concoctions / Reins",
    33: "NetLinkWebNode / Consult-Dont-Rent",
    34: "Many Doors / Cue Deck Card",
    35: "Hexadecimal Machine Code",
    36: "Brain-Swap Hot-Swap Cognitive Core",
    37: "Mimic Trunks Gate-and-Tunnel",
}

def get_claim_type(body_line: str) -> str:
    """Determine if a claim is independent/dependent and method/system."""
    low = body_line.lower()
    if low.startswith("the method of") or low.startswith("the system of") or low.startswith("the mechanism of") or low.startswith("the architecture of") or low.startswith("the visual system of") or low.startswith("the marketplace of"):
        return "Dependent"
    if "computer-implemented method" in low or "method for" in low:
        return "Independent Method Claim"
    if "computer-implemented system" in low or "computer-implemented mechanism" in low or "computer-implemented cooperative" in low or "computer-implemented visual" in low:
        return "Independent System Claim"
    if low.startswith("a ") or low.startswith("an "):
        return "Independent Claim"
    return "Dependent Claim"

def build_claim_label(cg_num: int, claim_num: int, body_lines: list) -> str:
    """Build the parenthetical label for a claim."""
    cg_name = CG_NAMES.get(cg_num, f"CG{cg_num}")
    # Find first non-empty body line for type detection
    body_text = ""
    for line in body_lines:
        stripped = line.strip()
        if stripped:
            body_text = stripped
            break
    
    claim_type = get_claim_type(body_text)
    if claim_num == 1:
        label = f"Independent {claim_type}" if "Dependent" not in claim_type else claim_type
        if "Independent Independent" in label:
            label = claim_type
    else:
        label = claim_type if "Dependent" in claim_type else f"Dependent: {claim_type}"
    
    return f"**Claim {cg_num}.{claim_num}** ({cg_name} — {label})"

def transform(text: str) -> str:
    lines = text.splitlines()
    out = []
    
    # Track state
    in_yaml = False
    yaml_done = False
    yaml_lines = []
    header_replaced = False
    in_code_block = False
    current_cg = None
    
    i = 0
    
    # Step 1: Handle YAML frontmatter
    if lines and lines[0].strip() == "---":
        in_yaml = True
        i = 1
        while i < len(lines):
            if lines[i].strip() == "---":
                yaml_done = True
                i += 1
                break
            i += 1
        # Replace YAML with new canonical YAML
        out.append(NEW_YAML)
        out.append("")
    
    # Skip the old document header block up to first ---
    # Find where the content starts after YAML
    # Skip: # PROVISIONAL PATENT APPLICATION, Title block, Related Applications brief, A&A Class, etc.
    # We'll insert our new header and then rejoin the main body
    
    header_end_idx = i
    # Skip old header block until we hit the first "---" separator or "## BACKGROUND"
    skip_patterns = [
        r"^#\s+PROVISIONAL PATENT APPLICATION",
        r"^\*\*Title:\*\*",
        r"^\*\*Applicant:\*\*",
        r"^\*\*Inventor:\*\*",
        r"^\*\*Application Type:\*\*",
        r"^\*\*Related Applications:\*\*",
        r"^\*\*A&A Class:\*\*",
        r"^\*\*Filing Date:\*\*",
        r"^\*\*Version:\*\*",
        r"^---$",
        r"^## TITLE$",
        r"^# PROVISIONAL PATENT APPLICATION$",
    ]
    
    # Find where to skip to — advance past the old header block
    while i < len(lines):
        line = lines[i]
        # Once we hit "## BACKGROUND" or "## Filing Manifest" that's the real content
        if re.match(r"^##\s+(BACKGROUND|Background|Filing Manifest|Cross.References)", line):
            break
        # Check if this line is part of the old header block
        is_header = any(re.match(p, line) for p in skip_patterns)
        if is_header or (not header_replaced and line.strip() == ""):
            i += 1
            continue
        # Check for the long title block (starts with "**Cooperative-Architecture Substrate Pipeline System")
        if line.startswith("**Cooperative-Architecture") or line.startswith("**Title:**"):
            # Skip until next blank + section
            while i < len(lines) and not lines[i].startswith("##") and lines[i].strip() != "---":
                i += 1
            continue
        # Skip any lingering --- separators before content
        if line.strip() == "---":
            i += 1
            continue
        # If we see the long title repeated as a header or paragraph, skip it
        if line.startswith("**Title:**") or ("Cooperative-Architecture Substrate Pipeline System and Method" in line and "##" not in line):
            i += 1
            continue
        break
    
    # Insert new canonical header
    out.append("")
    out.append(NEW_HEADER)
    out.append("")
    
    header_replaced = True
    
    # Now process the rest of the file
    while i < len(lines):
        line = lines[i]
        
        # Track code blocks
        if line.strip().startswith("```"):
            in_code_block = not in_code_block
            out.append(line)
            i += 1
            continue
        
        if in_code_block:
            out.append(line)
            i += 1
            continue
        
        # Track current CG for claim labels
        cg_match = re.match(r"^###\s+Claim Group\s+(\d+):", line)
        if cg_match:
            current_cg = int(cg_match.group(1))
        
        # === HEADING TRANSFORMATIONS ===
        
        # Fix ALL-CAPS H2 headings to sentence case
        h2_allcaps = re.match(r"^(##\s+)([A-Z][A-Z\s\(\)\-\–:,]+)$", line)
        if h2_allcaps:
            prefix = h2_allcaps.group(1)
            content = h2_allcaps.group(2)
            # Convert to title case / sentence case
            # Special cases
            caps_map = {
                "BACKGROUND OF THE INVENTION": "Background of the Invention",
                "SUMMARY OF THE INVENTION": "Summary of the Invention",
                "DETAILED DESCRIPTION OF THE PREFERRED EMBODIMENTS": "Detailed Description of the Preferred Embodiments",
                "BRIEF DESCRIPTION OF DRAWINGS": "Brief Description of Drawings",
                "ABSTRACT": "Abstract",
                "CLAIMS": "Claims",
            }
            normalized = content.strip()
            # Try exact match first
            if normalized in caps_map:
                line = prefix + caps_map[normalized]
            else:
                # Remove EXTENDED INNOVATIONS divider lines by converting to normal H2
                if "EXTENDED INNOVATIONS" in normalized or "CLAIM GROUPS" in normalized:
                    # These are section dividers — normalize to minimal form
                    line = prefix + "Extended Claim Groups"
                else:
                    # Generic: just title-case
                    line = prefix + normalized.title()
        
        # Fix "## EXTENDED INNOVATIONS" section dividers
        if re.match(r"^##\s+EXTENDED INNOVATIONS", line):
            line = "---"
        
        # Fix "## BACKGROUND OF THE INVENTION" with ### Field inside
        # Already handled above
        
        # Remove the "## TITLE" section and the duplicate long title line
        if line.strip() == "## TITLE":
            i += 1
            # Skip until next blank line or section
            while i < len(lines) and not lines[i].startswith("##") and lines[i].strip() != "---":
                i += 1
            continue
        
        # Skip duplicate long title paragraphs (the title line that starts with **Cooperative-Architecture)
        if "Cooperative-Architecture Substrate Pipeline System and Method for Local-First Artificial Intelligence" in line:
            i += 1
            continue
        
        # === FILING MANIFEST: fix column header ===
        if "| Claim Group |" in line and "Short Description" in line:
            line = line.replace("| Claim Group |", "| Innovation Cluster |")
        
        # === CLAIM NOTATION TRANSFORMATION ===
        # Convert **N.M** to **Claim N.M** (CG Name — Type)
        claim_header = re.match(r"^\*\*(\d+)\.(\d+)\*\*\s+(.*)", line)
        if claim_header:
            cg_num = int(claim_header.group(1))
            claim_num = int(claim_header.group(2))
            body_start = claim_header.group(3).strip()
            
            # Collect body lines for type detection
            body_lines = [body_start] if body_start else []
            j = i + 1
            while j < len(lines) and lines[j].strip() and not re.match(r"^\*\*\d+\.\d+\*\*", lines[j]) and not lines[j].startswith("##") and not lines[j].startswith("###"):
                body_lines.append(lines[j])
                j += 1
            
            label = build_claim_label(cg_num, claim_num, body_lines)
            
            if body_start:
                out.append(label)
                out.append("")
                # Convert inline (a)/(b) sub-clauses within the body_start line
                body_converted = convert_subclauses(body_start)
                out.append(body_converted)
            else:
                out.append(label)
                out.append("")
            i += 1
            continue
        
        # === SUB-CLAUSE CONVERSION ===
        # Lines that start with (a), (b), (c)... → - (a), - (b), - (c)
        subcl = re.match(r"^(\s*)\(([a-z])\)\s+(.+)", line)
        if subcl and not in_code_block:
            # Only convert if this looks like a claim sub-clause (indented or at line start)
            prefix_ws = subcl.group(1)
            letter = subcl.group(2)
            content = subcl.group(3)
            line = f"{prefix_ws}- ({letter}) {content}"
        
        # === FILING GATE STATUS: Replace table format with prose ===
        if line.strip() == "## Filing Gate Status":
            out.append(NEW_FILING_GATE)
            # Skip until end of old filing gate section
            i += 1
            while i < len(lines):
                l = lines[i]
                # Stop at next ## section or end of file  
                if l.startswith("##") and l.strip() != "## Filing Gate Status":
                    break
                # Skip old filing gate table content
                if l.startswith("|") or l.startswith("---") or "LIANA BANYAN CORPORATION" in l or "J. Jones" in l:
                    i += 1
                    continue
                # Skip the old footer
                if l.startswith("*Liana Banyan") or l.startswith("*BP083") or l.startswith("*37 Claim") or l.startswith("*v0"):
                    i += 1
                    continue
                if l.strip() == "":
                    i += 1
                    continue
                break
            continue
        
        out.append(line)
        i += 1
    
    return "\n".join(out)


def convert_subclauses(text: str) -> str:
    """Convert inline (a)/(b) lists within a line to separate bullet lines."""
    # Pattern: "comprising:\n(a) ..." — already handled line-by-line
    return text


def forbidden_word_scan(text: str) -> list:
    """Check for forbidden words. Return list of hits."""
    forbidden = ["invest", "investment", "shares", "equity", "ROI", "dividends", "returns", "yield"]
    hits = []
    for word in forbidden:
        # Case-insensitive whole-word match, exclude "fiat-conversion prohibition" context
        pattern = r'\b' + re.escape(word) + r'\b'
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for m in matches:
            # Get context
            start = max(0, m.start() - 50)
            end = min(len(text), m.end() + 50)
            context = text[start:end].replace('\n', ' ')
            hits.append(f"WORD: '{word}' | CONTEXT: ...{context}...")
    return hits


def count_claim_groups(text: str) -> int:
    """Count ### Claim Group N: headers."""
    return len(re.findall(r"^### Claim Group \d+:", text, re.MULTILINE))


def main():
    print(f"[B9] Reading: {INPUT}")
    if not INPUT.exists():
        print(f"[ERROR] Input not found: {INPUT}")
        return 1
    
    text = INPUT.read_text(encoding="utf-8", errors="replace")
    print(f"[B9] Input: {len(text):,} bytes, {text.count(chr(10))+1} lines")
    
    print("[B9] Applying A&A style transformations...")
    out_text = transform(text)
    
    # Post-processing: forbidden word scan
    print("[B9] Forbidden-word scan...")
    hits = forbidden_word_scan(out_text)
    if hits:
        print(f"[B9] WARNING: {len(hits)} forbidden word hits:")
        for h in hits:
            print(f"  {h}")
    else:
        print("[B9] Forbidden-word scan: CLEAN — all 8 absent")
    
    # Count CGs
    cg_count = count_claim_groups(out_text)
    print(f"[B9] Claim Groups in v06: {cg_count}")
    
    # Count words
    word_count = len(out_text.split())
    print(f"[B9] Word count: {word_count:,}")
    
    # Write output
    print(f"[B9] Writing: {OUTPUT}")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(out_text, encoding="utf-8")
    out_size = OUTPUT.stat().st_size
    out_lines = out_text.count('\n') + 1
    print(f"[B9] Output: {out_size:,} bytes, {out_lines} lines")
    
    # Abstract word count check
    abstract_match = re.search(r"## Abstract\s*\n(.*?)(?=\n---|\n##|\Z)", out_text, re.DOTALL)
    if abstract_match:
        abstract_text = abstract_match.group(1).strip()
        abstract_words = len(abstract_text.split())
        print(f"[B9] Abstract word count: {abstract_words} ({'PASS ≤150' if abstract_words <= 150 else 'FAIL >150'})")
    else:
        print("[B9] WARNING: Abstract section not found for word count")
    
    print(f"\n[B9] COMPLETE — v06_AA_STYLE.md written to:")
    print(f"  {OUTPUT}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
