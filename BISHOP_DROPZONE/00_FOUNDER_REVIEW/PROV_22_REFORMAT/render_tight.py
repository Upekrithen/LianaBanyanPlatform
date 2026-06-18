#!/usr/bin/env python3
"""Tight CSS re-render for v06. SEG B10 iteration 2."""
import subprocess, re, os
from pathlib import Path

PROV_DIR = Path(r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083")
IN_MD = PROV_DIR / "PROV_22_DRAFT_v06_AA_STYLE.md"
OUT_HTML = PROV_DIR / "PROV_22_DRAFT_v06_AA_STYLE.html"
OUT_PDF = PROV_DIR / "PROV_22_FILING_PDF_v06_AA_STYLE.pdf"
TITLE = "Provisional Patent Application 22 - Liana Banyan Corporation"

TIGHT_CSS = """<style>
@page { margin: 1in; size: letter; }
body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.25; margin: 0; color: #000; }
h1 { font-size: 14pt; margin-top: 10pt; margin-bottom: 4pt; }
h2 { font-size: 13pt; margin-top: 8pt; margin-bottom: 3pt; }
h3 { font-size: 12pt; font-weight: bold; margin-top: 6pt; margin-bottom: 2pt; }
h4 { font-size: 11pt; font-style: italic; margin-top: 4pt; margin-bottom: 1pt; }
p { margin: 2pt 0; }
table { border-collapse: collapse; width: 100%; margin: 4pt 0; font-size: 9pt; }
th, td { border: 1px solid #999; padding: 2pt 4pt; }
th { background: #eee; font-weight: bold; }
code { font-family: "Courier New", monospace; font-size: 9pt; }
pre { font-family: "Courier New", monospace; font-size: 8pt; background: #f5f5f5;
      padding: 3pt; margin: 3pt 0; border-left: 2px solid #ccc;
      overflow-x: auto; page-break-inside: avoid; white-space: pre-wrap; }
blockquote { border-left: 2px solid #999; margin-left: 10pt; padding-left: 5pt;
             color: #444; margin-top: 2pt; margin-bottom: 2pt; }
ul, ol { margin: 1pt 0 1pt 14pt; padding: 0; }
li { margin-bottom: 0pt; line-height: 1.25; }
hr { border: none; border-top: 1px solid #ccc; margin: 5pt 0; }
#TOC { font-size: 9pt; margin-bottom: 10pt; line-height: 1.2; }
#TOC a { text-decoration: none; color: #000; }
</style>"""


def find_chrome():
    candidates = [
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
        Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/Application/chrome.exe",
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
        Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
    ]
    return next((c for c in candidates if c.exists()), None)


def main():
    # pandoc MD → HTML
    cmd = [
        "pandoc", str(IN_MD), "-o", str(OUT_HTML),
        "--standalone", "--toc", "--toc-depth=2",
        f"--metadata=title:{TITLE}",
        "--from=markdown+raw_tex", "--to=html5"
    ]
    print(f"[B10-2] pandoc ...")
    r = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if r.returncode != 0:
        print(f"pandoc FAILED: {r.stderr[:400]}")
        return 1
    print(f"HTML: {OUT_HTML.stat().st_size:,} bytes")

    # Inject tight CSS
    html = OUT_HTML.read_text(encoding="utf-8", errors="replace")
    html = html.replace("</head>", TIGHT_CSS + "\n</head>")
    OUT_HTML.write_text(html, encoding="utf-8")
    print("CSS injected")

    # Chrome headless → PDF
    chrome = find_chrome()
    if not chrome:
        print("ERROR: No Chrome/Edge found")
        return 1
    file_url = "file:///" + str(OUT_HTML.resolve()).replace("\\", "/")
    print(f"Chrome: {chrome.name} ...")
    r2 = subprocess.run(
        [str(chrome), "--headless=new", "--disable-gpu", "--no-sandbox",
         f"--print-to-pdf={OUT_PDF}", "--print-to-pdf-no-header", file_url],
        capture_output=True, text=True, timeout=180
    )
    if r2.returncode != 0:
        print(f"Chrome FAILED: {r2.stderr[:400]}")
        return 1
    sz = OUT_PDF.stat().st_size
    print(f"PDF: {sz:,} bytes")

    # Estimate pages
    content = OUT_PDF.read_bytes()
    pages = content.count(b"/Type /Page")
    if pages == 0:
        pages = len(re.findall(rb"/Page\b", content))
    print(f"Estimated pages: {pages}")
    if 95 <= pages <= 100:
        print("PAGE GATE: PASS")
    elif pages < 95:
        print(f"PAGE GATE: LOW ({pages} pages) - may need line-height bump")
    else:
        print(f"PAGE GATE: HIGH ({pages} pages) - need to trim or tighten CSS")

    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
