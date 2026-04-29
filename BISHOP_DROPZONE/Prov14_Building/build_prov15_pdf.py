#!/usr/bin/env python3
"""
build_prov15_pdf.py — Compile Provisional Patent Application 15 specification PDF.

Unlike Prov 14 (which assembled from many separate AA formal files), Prov 15's B132-B133
cluster innovations do not yet have individual AA formal files. The master MD is the
canonical source of truth — this script converts it to HTML + PDF for counsel review.

Input:  BISHOP_DROPZONE/Prov14_Building/PROV_15_FILING_SPECIFICATION_B133.md
Output: BISHOP_DROPZONE/Prov14_Building/PROV_15_FILING_SPECIFICATION_B133.html
        BISHOP_DROPZONE/Prov14_Building/PROV_15_FILING_SPECIFICATION_B133.pdf

Filed: B133, 2026-04-29 (K-Prov-15-Spec-Consolidation).
Publication gate: HARD — internal only pending Founder + counsel review.
"""

import os
import subprocess
import sys
from pathlib import Path

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform")
OUT_DIR = REPO / "BISHOP_DROPZONE" / "Prov14_Building"
IN_MD = OUT_DIR / "PROV_15_FILING_SPECIFICATION_B133.md"
OUT_HTML = OUT_DIR / "PROV_15_FILING_SPECIFICATION_B133.html"
OUT_PDF = OUT_DIR / "PROV_15_FILING_SPECIFICATION_B133.pdf"


def chrome_to_pdf(html_path: Path, pdf_path: Path) -> bool:
    candidates = [
        Path("C:/Program Files/Google/Chrome/Application/chrome.exe"),
        Path("C:/Program Files (x86)/Google/Chrome/Application/chrome.exe"),
        Path(os.environ.get("LOCALAPPDATA", "")) / "Google/Chrome/Application/chrome.exe",
        Path("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"),
        Path("C:/Program Files/Microsoft/Edge/Application/msedge.exe"),
    ]
    chrome = next((c for c in candidates if c.exists()), None)
    if not chrome:
        print("[BUILD ERROR] No Chrome/Edge found for headless print-to-PDF.", file=sys.stderr)
        return False
    file_url = "file:///" + str(html_path.resolve()).replace("\\", "/")
    print(f"[BUILD] Using {chrome.name} headless ...")
    try:
        subprocess.run(
            [
                str(chrome),
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                f"--print-to-pdf={pdf_path}",
                "--print-to-pdf-no-header",
                file_url,
            ],
            check=True,
            timeout=120,
        )
        print(f"[BUILD] PDF written via headless browser: {pdf_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[BUILD ERROR] headless PDF generation failed: {e}", file=sys.stderr)
        return False


def main() -> int:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    if not IN_MD.exists():
        print(f"[BUILD ERROR] Input not found: {IN_MD}", file=sys.stderr)
        return 1

    print(f"[BUILD] Input MD: {IN_MD}")
    print(f"[BUILD] Output HTML: {OUT_HTML}")
    print(f"[BUILD] Output PDF:  {OUT_PDF}")

    # MD -> HTML via pandoc
    print("[BUILD] Converting MD -> HTML via pandoc ...")
    try:
        subprocess.run(
            [
                "pandoc", str(IN_MD),
                "-o", str(OUT_HTML),
                "--standalone",
                "--toc", "--toc-depth=2",
                "--metadata",
                "title=Provisional Patent Application 15 - Liana Banyan Corporation",
                "-V", "geometry:margin=1in",
                "--from=markdown+raw_tex",
                "--to=html5",
            ],
            check=True,
        )
        print(f"[BUILD] HTML written: {OUT_HTML}")
    except subprocess.CalledProcessError as e:
        print(f"[BUILD ERROR] pandoc HTML conversion failed: {e}", file=sys.stderr)
        return 1
    except FileNotFoundError:
        print("[BUILD ERROR] pandoc not found on PATH.", file=sys.stderr)
        return 1

    # HTML -> PDF via available engine
    pdf_engine_cmd = None
    for engine in ["wkhtmltopdf", "weasyprint", "xelatex"]:
        if subprocess.run(["where", engine], capture_output=True, shell=False).returncode == 0:
            pdf_engine_cmd = engine
            break

    if pdf_engine_cmd:
        print(f"[BUILD] Found PDF engine: {pdf_engine_cmd}; converting MD -> PDF via pandoc ...")
        try:
            subprocess.run(
                [
                    "pandoc", str(IN_MD),
                    "-o", str(OUT_PDF),
                    "--toc", "--toc-depth=2",
                    f"--pdf-engine={pdf_engine_cmd}",
                    "-V", "geometry:margin=1in",
                ],
                check=True,
            )
            print(f"[BUILD] PDF written: {OUT_PDF}")
        except subprocess.CalledProcessError as e:
            print(f"[BUILD WARN] pandoc PDF conversion failed: {e}", file=sys.stderr)
            chrome_to_pdf(OUT_HTML, OUT_PDF)
    else:
        print("[BUILD] No PDF engine on PATH; using Chrome/Edge headless print-to-PDF ...")
        chrome_to_pdf(OUT_HTML, OUT_PDF)

    pdf_status = OUT_PDF.exists()
    html_status = OUT_HTML.exists()
    print(f"\n[BUILD] Done.")
    print(f"  MD:   {IN_MD} ({'EXISTS' if IN_MD.exists() else 'MISSING'})")
    print(f"  HTML: {OUT_HTML} ({'EXISTS' if html_status else 'MISSING'})")
    print(f"  PDF:  {OUT_PDF} ({'EXISTS' if pdf_status else 'MISSING / FAILED'})")
    return 0 if html_status else 1


if __name__ == "__main__":
    sys.exit(main())
