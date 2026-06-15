"""
gen_prov22_pdf.py -- Generate Provisional 22 PDF from markdown source
BP083 · Sonnet 4.6
"""
import re
import os

SRC = r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v01.md"
OUT = r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PATENTS\PROVISIONAL_22_BP083\PROV_22_DRAFT_v01.pdf"

with open(SRC, "r", encoding="utf-8-sig") as f:
    content = f.read()
content = content.replace('\ufeff', '')

from fpdf import FPDF

class PatentPDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 8)
        self.set_text_color(120, 120, 120)
        w = self.epw
        self.set_x(self.l_margin)
        self.multi_cell(w, 7, "LIANA BANYAN CORPORATION -- PROVISIONAL PATENT APPLICATION -- PROV 22 -- BP083", align="C")
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y() + 1, 200, self.get_y() + 1)
        self.ln(4)

    def footer(self):
        self.set_y(-15)
        self.set_font("Arial", "I", 8)
        self.set_text_color(128, 128, 128)
        self.set_x(self.l_margin)
        self.multi_cell(self.epw, 10, f"Page {self.page_no()}", align="C")

def clean_md(text):
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'`(.+?)`', r"'\1'", text)
    text = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', text)
    text = text.replace('\u00b7', '-').replace('\u2014', '--').replace('\u2013', '-')
    text = text.replace('\u2019', "'").replace('\u201c', '"').replace('\u201d', '"')
    text = text.replace('\u00ae', '(R)').replace('\u2122', '(TM)')
    # Remove any remaining non-latin-1 chars
    text = text.encode('latin-1', errors='replace').decode('latin-1')
    return text

pdf = PatentPDF()
pdf.add_font("Arial", fname=r"C:\Windows\Fonts\arial.ttf")
pdf.add_font("Arial", style="B", fname=r"C:\Windows\Fonts\arialbd.ttf")
pdf.add_font("Arial", style="I", fname=r"C:\Windows\Fonts\ariali.ttf")
pdf.set_margins(18, 25, 18)
pdf.set_auto_page_break(True, margin=20)
pdf.add_page()

def mc(pdf_obj, txt, h=5):
    """Safe multi_cell wrapper that always resets x to left margin."""
    pdf_obj.set_x(pdf_obj.l_margin)
    pdf_obj.multi_cell(pdf_obj.epw, h, txt)

lines = content.split("\n")
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()

    if stripped.startswith("# ") and not stripped.startswith("## "):
        pdf.set_font("Arial", "B", 13)
        pdf.set_text_color(20, 20, 80)
        mc(pdf, clean_md(stripped[2:]), 8)
        pdf.ln(2)
    elif stripped.startswith("## "):
        pdf.set_font("Arial", "B", 11)
        pdf.set_text_color(30, 30, 120)
        pdf.ln(3)
        mc(pdf, clean_md(stripped[3:]), 7)
        pdf.ln(1)
    elif stripped.startswith("### "):
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(50, 50, 150)
        pdf.ln(2)
        mc(pdf, clean_md(stripped[4:]), 6)
        pdf.ln(1)
    elif stripped == "---":
        pdf.ln(2)
        pdf.set_draw_color(180, 180, 180)
        pdf.line(18, pdf.get_y(), 192, pdf.get_y())
        pdf.ln(3)
    elif stripped == "":
        pdf.ln(1.5)
    elif stripped.startswith("- "):
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(40, 40, 40)
        mc(pdf, "  - " + clean_md(stripped[2:]))
    elif re.match(r'^\d+\. ', stripped):
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(40, 40, 40)
        mc(pdf, clean_md(stripped))
    elif stripped.startswith("**") and stripped.endswith("**") and len(stripped) < 120:
        pdf.set_font("Arial", "B", 10)
        pdf.set_text_color(50, 50, 50)
        pdf.ln(1)
        mc(pdf, clean_md(stripped), 6)
    else:
        pdf.set_font("Arial", "", 9)
        pdf.set_text_color(40, 40, 40)
        txt = clean_md(stripped)
        if txt:
            mc(pdf, txt)

    i += 1

pdf.output(OUT)
pages = pdf.page
size_kb = os.path.getsize(OUT) / 1024
print(f"PDF created: {OUT}")
print(f"Pages: {pages}")
print(f"Size: {size_kb:.1f} KB")
if pages > 100:
    print(f"WARNING: {pages} pages > 100 limit")
else:
    print(f"OK: {pages} pages <= 100")
