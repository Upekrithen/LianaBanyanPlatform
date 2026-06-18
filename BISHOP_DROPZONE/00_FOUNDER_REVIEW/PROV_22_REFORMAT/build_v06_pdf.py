#!/usr/bin/env python3
"""
build_v06_pdf.py — Render PROV_22 v06_AA_STYLE to PDF.
Canonical toolchain: pandoc --toc --toc-depth=2 → HTML → Chrome headless → PDF

SEG B10 · BP086 · Sonnet 4.6
"""
import os
import re
import subprocess
import sys
from pathlib import Path

PROV_DIR = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083")
IN_MD = PROV_DIR / "PROV_22_DRAFT_v06_AA_STYLE.md"
OUT_HTML = PROV_DIR / "PROV_22_DRAFT_v06_AA_STYLE.html"
OUT_PDF = PROV_DIR / "PROV_22_FILING_PDF_v06_AA_STYLE.pdf"
TITLE = "Provisional Patent Application 22 — Liana Banyan Corporation"

# CSS for page formatting: LH 1.38, 12pt TNR, Letter, 1in margins
CUSTOM_CSS = """
<style>
  body {
    font-family: 'Times New Roman', Times, serif;
    font-size: 12pt;
    line-height: 1.38;
    margin: 1in;
    color: #000;
    max-width: none;
  }
  h1 { font-size: 16pt; margin-top: 24pt; }
  h2 { font-size: 14pt; margin-top: 18pt; }
  h3 { font-size: 12pt; font-weight: bold; margin-top: 14pt; }
  h4 { font-size: 12pt; font-style: italic; margin-top: 10pt; }
  table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
  th, td { border: 1px solid #999; padding: 4pt 6pt; font-size: 10pt; }
  th { background: #eee; font-weight: bold; }
  code { font-family: 'Courier New', monospace; font-size: 10pt; }
  pre { font-family: 'Courier New', monospace; font-size: 9pt; background: #f5f5f5; padding: 8pt; border-left: 3px solid #ccc; overflow-x: auto; }
  blockquote { border-left: 3px solid #999; margin-left: 20pt; padding-left: 10pt; color: #444; }
  ul, ol { margin-left: 20pt; }
  li { margin-bottom: 2pt; }
  hr { border: none; border-top: 1px solid #ccc; margin: 16pt 0; }
  @media print {
    body { margin: 1in; }
    h1, h2, h3 { page-break-after: avoid; }
    pre, table { page-break-inside: avoid; }
  }
</style>
"""


def find_chrome():
    candidates = [
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
        Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/Application/chrome.exe",
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
        Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
    ]
    return next((c for c in candidates if c.exists()), None)


def pandoc_md_to_html():
    """Convert MD → HTML with --toc --toc-depth=2"""
    cmd = [
        "pandoc", str(IN_MD),
        "-o", str(OUT_HTML),
        "--standalone",
        "--toc", "--toc-depth=2",
        f"--metadata=title:{TITLE}",
        "-V", "geometry:margin=1in",
        "--from=markdown+raw_tex",
        "--to=html5",
        "--highlight-style=pygments",
    ]
    print(f"[B10] pandoc: {' '.join(cmd[:6])} ...")
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode != 0:
        print(f"[B10 ERROR] pandoc failed: {result.stderr[:500]}")
        return False
    print(f"[B10] HTML written: {OUT_HTML} ({OUT_HTML.stat().st_size:,} bytes)")
    
    # Inject custom CSS into the HTML
    html = OUT_HTML.read_text(encoding="utf-8", errors="replace")
    html = html.replace("</head>", CUSTOM_CSS + "\n</head>")
    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"[B10] CSS injected into HTML")
    return True


def chrome_html_to_pdf():
    """Convert HTML → PDF via Chrome headless"""
    chrome = find_chrome()
    if not chrome:
        print("[B10 ERROR] No Chrome/Edge found for headless print-to-PDF.")
        return False
    file_url = "file:///" + str(OUT_HTML.resolve()).replace("\\", "/")
    print(f"[B10] Chrome headless: {chrome.name} ...")
    cmd = [
        str(chrome),
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        f"--print-to-pdf={OUT_PDF}",
        "--print-to-pdf-no-header",
        file_url,
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
    if result.returncode != 0:
        print(f"[B10 ERROR] Chrome headless failed: {result.stderr[:500]}")
        return False
    if not OUT_PDF.exists():
        print("[B10 ERROR] PDF not created despite exit 0")
        return False
    print(f"[B10] PDF written: {OUT_PDF} ({OUT_PDF.stat().st_size:,} bytes)")
    return True


def count_pdf_pages(pdf_path: Path) -> int:
    """Estimate page count from PDF byte markers."""
    try:
        content = pdf_path.read_bytes()
        # Count /Page objects in PDF
        pages = content.count(b"/Type /Page")
        if pages == 0:
            # Try alternative
            pages = len(re.findall(rb"/Page\s", content))
        return pages
    except Exception:
        return -1


def verify_cg_count(md_text: str) -> int:
    """Verify 37 CGs still present in v06."""
    cgs = re.findall(r"^### Claim Group \d+:", md_text, re.MULTILINE)
    return len(cgs)


def forbidden_word_scan(text: str) -> list:
    """Check for forbidden words."""
    forbidden = ["invest", "investment", "shares", "equity", "ROI", "dividends", "returns", "yield"]
    hits = []
    for word in forbidden:
        pattern = r'\b' + re.escape(word) + r'\b'
        matches = list(re.finditer(pattern, text, re.IGNORECASE))
        if matches:
            for m in matches[:2]:
                start = max(0, m.start() - 60)
                end = min(len(text), m.end() + 60)
                ctx = text[start:end].replace('\n', ' ')
                hits.append(f"'{word}': ...{ctx}...")
    return hits


def main() -> int:
    print(f"\n[B10] PROV_22 v06 PDF Render — SEG B10 BP086")
    print(f"[B10] Input: {IN_MD}")
    
    if not IN_MD.exists():
        print(f"[B10 ERROR] Input not found: {IN_MD}")
        return 1
    
    md_text = IN_MD.read_text(encoding="utf-8", errors="replace")
    
    # Pre-render checks
    cg_count = verify_cg_count(md_text)
    print(f"[B10] CG count: {cg_count} ({'PASS' if cg_count == 37 else 'FAIL — expected 37'})")
    
    fw_hits = forbidden_word_scan(md_text)
    print(f"[B10] Forbidden words: {'CLEAN' if not fw_hits else 'FAIL — ' + str(len(fw_hits)) + ' hits'}")
    if fw_hits:
        for h in fw_hits:
            print(f"  {h}")
    
    # Step 1: pandoc MD → HTML
    if not pandoc_md_to_html():
        print("[B10] FAILED at pandoc step")
        return 1
    
    # Step 2: Chrome HTML → PDF
    if not chrome_html_to_pdf():
        print("[B10] FAILED at Chrome headless step")
        return 1
    
    # Verify page count
    pages = count_pdf_pages(OUT_PDF)
    pdf_size = OUT_PDF.stat().st_size
    print(f"\n[B10] PDF size: {pdf_size:,} bytes")
    print(f"[B10] Estimated pages: {pages}")
    
    # Gate check
    if pages < 0:
        print("[B10] WARNING: Could not verify page count — check PDF manually")
    elif 95 <= pages <= 100:
        print(f"[B10] Page count gate: PASS ({pages} pages in 95-100 range)")
    elif pages < 95:
        print(f"[B10] Page count gate: LOW ({pages} pages — expected >= 95). Check CSS line-height.")
    else:
        print(f"[B10] Page count gate: HIGH ({pages} pages — expected <= 100). Trim Background prose.")
    
    print(f"\n[B10] GATES SUMMARY:")
    print(f"  CG count (37): {'PASS' if cg_count == 37 else 'FAIL'}")
    print(f"  Forbidden words: {'CLEAN' if not fw_hits else 'FAIL'}")
    print(f"  PDF: {OUT_PDF.name}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
