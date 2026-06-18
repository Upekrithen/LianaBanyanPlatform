#!/usr/bin/env python3
"""Final gate verification for B10. SEG B10."""
from pathlib import Path
import re

f = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v06_AA_STYLE.md")
pdf = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_FILING_PDF_v06_AA_STYLE.pdf")
html_f = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v06_AA_STYLE.html")

text = f.read_text(encoding="utf-8", errors="replace")
pdf_bytes = pdf.read_bytes()

print("=== GATE VERIFICATION B10 ===")
print()

# CG count
cgs = re.findall(r"^### Claim Group (\d+):", text, re.MULTILINE)
print(f"CG count: {len(cgs)} ({'PASS' if len(cgs)==37 else 'FAIL'})")

# CG35/36/37 mandatory
for cg_n in [35, 36, 37]:
    present = f"### Claim Group {cg_n}:" in text
    print(f"  CG{cg_n}: {'PRESENT' if present else 'MISSING'}")

# Forbidden words
forbidden = ["invest", "investment", "shares", "equity", "ROI", "dividends", "returns", "yield"]
hits = [w for w in forbidden if re.search(r"\b" + re.escape(w) + r"\b", text, re.IGNORECASE)]
print(f"\nForbidden words: {'CLEAN' if not hits else 'FAIL: ' + str(hits)}")

# Abstract word count
abstract_match = re.search(r"## Abstract\s*\n+(.*?)(?=\n---|\n##|\Z)", text, re.DOTALL)
abstract_words = 0
if abstract_match:
    abstract_words = len(abstract_match.group(1).strip().split())
print(f"Abstract words: {abstract_words} ({'PASS' if abstract_words <= 150 else 'FAIL >150'})")

# PDF pages
pages = pdf_bytes.count(b"/Type /Page")
pdf_sz = pdf.stat().st_size
print(f"\nPDF: {pdf_sz:,} bytes, estimated {pages} pages ({'PASS' if 95<=pages<=100 else 'FAIL'})")

# Claim notation
claim_headers = re.findall(r"^\*\*Claim \d+\.\d+\*\*", text, re.MULTILINE)
old_format = re.findall(r"^\*\*\d+\.\d+\*\*\s+[^(]", text, re.MULTILINE)
print(f"\nClaim headers (Claim N.M format): {len(claim_headers)}")
print(f"Old-format remaining (should be 0): {len(old_format)}")

# TOC in HTML
if html_f.exists():
    html_text = html_f.read_text(encoding="utf-8", errors="replace")
    toc_present = 'id="TOC"' in html_text or "table-of-contents" in html_text.lower()
    print(f"\nTOC in HTML: {'PRESENT' if toc_present else 'NOT DETECTED'}")

# Header check
short_title = "System and Method for a Cooperative Local-First AI Substrate"
print(f"\nShort title in v06: {'PRESENT' if short_title in text else 'MISSING'}")

# Section summary
print("\n=== GATE SUMMARY ===")
gates = {
    "CG count = 37": len(cgs) == 37,
    "CG35 present": "### Claim Group 35:" in text,
    "CG36 present": "### Claim Group 36:" in text,
    "CG37 present": "### Claim Group 37:" in text,
    "Forbidden words CLEAN": not hits,
    "Abstract <= 150 words": abstract_words <= 150,
    "PDF pages 95-100": 95 <= pages <= 100,
    "Claim notation updated": len(old_format) == 0,
    "Short title applied": short_title in text,
}
all_pass = True
for gate, result in gates.items():
    print(f"  {'PASS' if result else 'FAIL'} | {gate}")
    if not result:
        all_pass = False

print(f"\nOVERALL: {'ALL GATES PASS' if all_pass else 'SOME GATES FAILED'}")
print(f"\nV06 file: {f}")
print(f"PDF file: {pdf}")
