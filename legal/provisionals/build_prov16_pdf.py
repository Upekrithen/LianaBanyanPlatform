#!/usr/bin/env python3
"""
build_prov16_pdf.py — Compile Provisional Patent Application 16 specification PDF.

Input:  legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION_DRAFT.md
Output: legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.html
        legal/provisionals/PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.pdf

Filed: BP006, 2026-05-01 (KN071 K-Prov-16-Spec-Consolidation).
Publication gate: HARD — internal only pending Founder USPTO submission authorization.
"""

import os
import subprocess
import sys
from pathlib import Path

REPO = Path("C:/Users/Administrator/Documents/LianaBanyanPlatform")
OUT_DIR = REPO / "legal" / "provisionals"
IN_MD = OUT_DIR / "PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION_DRAFT.md"
OUT_HTML = OUT_DIR / "PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.html"
OUT_PDF = OUT_DIR / "PROV_16_SUBSTRATE_ROUTED_MEMORY_EXPANSION_FEDERATION.pdf"

TITLE = "Provisional Patent Application 16 - Liana Banyan Corporation"


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

    print(f"[BUILD] Input MD:   {IN_MD}")
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
                "--metadata", f"title={TITLE}",
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
            print(f"[BUILD] PDF written via pandoc+{pdf_engine_cmd}: {OUT_PDF}")
        except subprocess.CalledProcessError as e:
            print(f"[BUILD WARN] pandoc+{pdf_engine_cmd} failed: {e}; falling back to Chrome/Edge ...", file=sys.stderr)
            chrome_to_pdf(OUT_HTML, OUT_PDF)
    else:
        print("[BUILD] No PDF engine on PATH; using Chrome/Edge headless print-to-PDF ...")
        chrome_to_pdf(OUT_HTML, OUT_PDF)

    pdf_status = OUT_PDF.exists()
    html_status = OUT_HTML.exists()
    md_lines = sum(1 for _ in open(IN_MD, encoding="utf-8"))

    print(f"\n[BUILD] Summary:")
    print(f"  MD:   {IN_MD} ({md_lines} lines, {'EXISTS' if IN_MD.exists() else 'MISSING'})")
    print(f"  HTML: {OUT_HTML} ({'EXISTS' if html_status else 'MISSING'})")
    print(f"  PDF:  {OUT_PDF} ({'EXISTS' if pdf_status else 'MISSING / FAILED'})")

    if html_status and not pdf_status:
        print("[BUILD] HTML produced but PDF failed. For USPTO filing, use the HTML for PDF conversion.")
        print("[BUILD] Recommendation: open HTML in browser and Print-to-PDF manually.")

    return 0 if html_status else 1


if __name__ == "__main__":
    sys.exit(main())
