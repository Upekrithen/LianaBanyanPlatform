"""
Rebuild the 7th provisional patent application PDF with embedded fonts.
USPTO Patent Center requires all fonts to be embedded in the PDF.
Uses Times New Roman TTF from Windows fonts instead of built-in PDF base fonts.
"""
import os
import re
import glob
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import black

FONTS_DIR = r"C:\Windows\Fonts"
pdfmetrics.registerFont(TTFont("TNR", os.path.join(FONTS_DIR, "times.ttf")))
pdfmetrics.registerFont(TTFont("TNR-Bold", os.path.join(FONTS_DIR, "timesbd.ttf")))
pdfmetrics.registerFont(TTFont("TNR-Italic", os.path.join(FONTS_DIR, "timesi.ttf")))
pdfmetrics.registerFont(TTFont("TNR-BoldItalic", os.path.join(FONTS_DIR, "timesbi.ttf")))
pdfmetrics.registerFontFamily("TNR", normal="TNR", bold="TNR-Bold", italic="TNR-Italic", boldItalic="TNR-BoldItalic")

TITLE_STYLE = ParagraphStyle("Title", fontName="TNR-Bold", fontSize=16, leading=20, spaceAfter=12, alignment=1)
HEADING_STYLE = ParagraphStyle("Heading", fontName="TNR-Bold", fontSize=13, leading=16, spaceAfter=8, spaceBefore=16)
SUBHEAD_STYLE = ParagraphStyle("SubHead", fontName="TNR-Bold", fontSize=11, leading=14, spaceAfter=6, spaceBefore=10)
BODY_STYLE = ParagraphStyle("Body", fontName="TNR", fontSize=11, leading=14, spaceAfter=8, firstLineIndent=36)
BODY_NO_INDENT = ParagraphStyle("BodyNoIndent", fontName="TNR", fontSize=11, leading=14, spaceAfter=8)
TABLE_STYLE = ParagraphStyle("Table", fontName="TNR", fontSize=10, leading=12)
SMALL_STYLE = ParagraphStyle("Small", fontName="TNR", fontSize=9, leading=11, spaceAfter=4)

BISHOP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "BISHOP_DROPZONE")

BATCH_FILES = sorted(glob.glob(os.path.join(BISHOP_DIR, "SPEC_EXPANSION_BATCH_*.md")))
ADDENDUM_FILE = os.path.join(BISHOP_DIR, "PROVISIONAL_ADDENDUM_1600_1662.md")
OUTPUT_PDF = os.path.join(BISHOP_DIR, "PROVISIONAL_APPLICATION_7_FULL_SPECS.pdf")

PRIOR_APPS = [
    ("63/925,672", "November 25-26, 2025", "123 claims"),
    ("63/927,674", "November 30, 2025", "72 claims"),
    ("63/938,216", "December 10, 2025", "397 claims"),
    ("63/967,200", "January 23-24, 2026", "292 claims"),
    ("63/969,601", "January 28, 2026", "44 claims"),
    ("63/989,913", "February 24, 2026", "408 claims"),
]


def parse_innovations_from_batch(filepath):
    """Parse innovation entries from a spec expansion batch .md file."""
    innovations = []
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"##\s+Innovation\s+#(\d+)\s*[—–-]\s*(.+?)(?:\n\n|\n\*\*)"
    matches = list(re.finditer(pattern, content))

    for i, m in enumerate(matches):
        num = int(m.group(1))
        title = m.group(2).strip()
        start = m.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        block = content[start:end]

        spec_match = re.search(r"A system (?:and method )?comprises?:?\s*(.+?)(?=\n---|\n##|\Z)", block, re.DOTALL)
        if spec_match:
            spec = "A system comprises: " + spec_match.group(1).strip()
        else:
            sys_match = re.search(r"(A system (?:and method )?(?:for |comprises).+?)(?=\n---|\n##|\Z)", block, re.DOTALL)
            spec = sys_match.group(1).strip() if sys_match else None

        if spec:
            spec = re.sub(r"\s+", " ", spec).strip()
            if len(spec) > 50:
                innovations.append((num, title, spec))

    return innovations


def parse_innovations_from_addendum(filepath):
    """Parse innovation entries from the addendum .md file."""
    innovations = []
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"###\s+Innovation\s+#(\d+)\s*[—–-]\s*(.+?)(?:\n\n)"
    matches = list(re.finditer(pattern, content))

    for i, m in enumerate(matches):
        num = int(m.group(1))
        title = m.group(2).strip()
        start = m.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(content)
        block = content[start:end].strip()

        spec = re.sub(r"\s+", " ", block).strip()
        if len(spec) > 50:
            innovations.append((num, title, spec))

    return innovations


def escape_xml(text):
    """Escape XML special characters for reportlab Paragraph."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


def build_pdf(innovations, output_path):
    """Build the full provisional patent application PDF."""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=1 * inch,
        rightMargin=1 * inch,
        topMargin=1 * inch,
        bottomMargin=1 * inch,
    )

    story = []

    # Cover page
    story.append(Spacer(1, 2 * inch))
    story.append(Paragraph("PROVISIONAL PATENT APPLICATION", TITLE_STYLE))
    story.append(Spacer(1, 24))
    story.append(Paragraph("COOPERATIVE COMMERCE PLATFORM INNOVATIONS", HEADING_STYLE))
    story.append(Paragraph("Innovations #1001-#1662 (Single Provisional Filing)", SUBHEAD_STYLE))
    story.append(Spacer(1, 36))

    cover_data = [
        ["Applicant:", "Liana Banyan Corporation"],
        ["Inventor:", "Jonathan W. Jones"],
        ["Entity Status:", "Micro Entity"],
        ["Filing Date:", "March 15, 2026"],
        ["Total Innovations:", f"{len(innovations)}"],
    ]
    t = Table(cover_data, colWidths=[2 * inch, 4 * inch])
    t.setStyle(TableStyle([
        ("FONTNAME", (0, 0), (0, -1), "TNR-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "TNR"),
        ("FONTSIZE", (0, 0), (-1, -1), 11),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    story.append(t)

    story.append(PageBreak())

    # Cross-reference
    story.append(Paragraph("CROSS-REFERENCE TO RELATED APPLICATIONS", HEADING_STYLE))
    cross_ref = ("This application claims the benefit of the following provisional patent applications, "
                 "all assigned to Liana Banyan Corporation:")
    story.append(Paragraph(cross_ref, BODY_NO_INDENT))

    for app_num, filed_date, claims in PRIOR_APPS:
        story.append(Paragraph(
            f"U.S. Provisional Application No. {app_num}, filed {filed_date} ({claims})",
            BODY_NO_INDENT
        ))

    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "The present application covers innovations not previously included in the above applications, "
        "specifically innovations numbered #1001-#1049, #1141-#1227, #1330-#1594, and #1600-#1662, "
        "totaling the innovations enumerated below.",
        BODY_NO_INDENT
    ))

    story.append(Spacer(1, 12))

    # Technical field
    story.append(Paragraph("TECHNICAL FIELD", HEADING_STYLE))
    story.append(Paragraph(
        "The present disclosure relates to cooperative commerce platform systems and methods, "
        "including but not limited to: cooperative economic architectures with cost-plus-percentage "
        "pricing models; distributed manufacturing and supply chain coordination; gamified engagement "
        "and reputation systems; human-AI collaboration frameworks; community governance and "
        "stewardship protocols; food delivery pipeline optimization; physical game piece systems "
        "with hydraulic, pneumatic, and compliant mechanism integration; and multi-currency "
        "economic systems for cooperative platforms.",
        BODY_STYLE
    ))

    story.append(Spacer(1, 12))

    # Background
    story.append(Paragraph("BACKGROUND", HEADING_STYLE))
    story.append(Paragraph(
        "Existing commercial platforms typically extract 30-50% of transaction value from creators "
        "and workers. The Liana Banyan cooperative commerce platform addresses this by implementing "
        "a constitutionally locked Cost+20% pricing model where creators retain 83.3% of every "
        "transaction. The innovations described herein extend the platform across 16 integrated "
        "initiatives spanning food, healthcare, finance, manufacturing, education, gaming, and "
        "community safety. The system has been in continuous development since 1989, with formal "
        "documentation beginning in 2003 and active software/hardware prototyping since 2015.",
        BODY_STYLE
    ))

    story.append(Spacer(1, 12))

    # Summary
    story.append(Paragraph("SUMMARY OF THE INVENTION", HEADING_STYLE))
    story.append(Paragraph(
        f"This provisional application discloses {len(innovations)} innovations extending the "
        "Liana Banyan cooperative commerce platform. Each innovation is described below with a "
        "full specification paragraph identifying the system components, their interactions, and "
        "the novel technical contribution. The innovations are organized by innovation number "
        "and cover the following domains: home business economics, equipment lifecycle management, "
        "sponsorship systems, mechanical game systems, AI governance, discovery systems, community "
        "engagement, food delivery pipelines, taste-prediction systems, stewardship protocols, "
        "creator recruitment, modular manufacturing, experience scoring, delegation protocols, "
        "and physical game piece engineering.",
        BODY_STYLE
    ))

    story.append(PageBreak())

    # Detailed description
    story.append(Paragraph("DETAILED DESCRIPTION OF THE INVENTIONS", HEADING_STYLE))
    story.append(Spacer(1, 12))

    for num, title, spec in sorted(innovations, key=lambda x: x[0]):
        safe_title = escape_xml(title)
        safe_spec = escape_xml(spec)

        story.append(Paragraph(
            f"<b>Innovation #{num} -- {safe_title}</b>",
            SUBHEAD_STYLE
        ))
        story.append(Paragraph(safe_spec, BODY_STYLE))
        story.append(Spacer(1, 6))

    story.append(PageBreak())

    # Claims statement
    story.append(Paragraph("CLAIMS", HEADING_STYLE))
    story.append(Paragraph(
        "The specific claims for these innovations will be presented in the non-provisional "
        "application. This provisional application establishes priority for all innovations "
        "described herein.",
        BODY_STYLE
    ))

    story.append(Spacer(1, 24))

    # Abstract
    story.append(Paragraph("ABSTRACT", HEADING_STYLE))
    story.append(Paragraph(
        f"A cooperative commerce platform system comprising {len(innovations)} innovations "
        "extending a member-owned economic ecosystem. The platform implements a constitutionally "
        "locked Cost+20% pricing model ensuring creators retain 83.3% of transaction value. "
        "Innovations span cooperative meal delivery with distributed cold-storage networks, "
        "taste-prediction influence systems, human-AI collaboration role frameworks, project "
        "stewardship with pledged escrow mechanics, creator recruitment with timestamp-verified "
        "attribution, modular manufacturing with self-claim role selection, physical game piece "
        "systems with hydraulic computing and diceless combat mechanics, and multiplicative "
        "experience scoring with third-party verification gates. The system integrates 16 "
        "cooperative initiatives across food, healthcare, finance, manufacturing, education, "
        "gaming, and community safety domains.",
        BODY_STYLE
    ))

    doc.build(story)
    return len(innovations)


def main():
    all_innovations = []

    print("Parsing spec expansion batches...")
    for batch_file in BATCH_FILES:
        fname = os.path.basename(batch_file)
        innov = parse_innovations_from_batch(batch_file)
        print(f"  {fname}: {len(innov)} innovations parsed")
        all_innovations.extend(innov)

    print(f"\nParsing addendum...")
    if os.path.exists(ADDENDUM_FILE):
        addendum_innov = parse_innovations_from_addendum(ADDENDUM_FILE)
        print(f"  Addendum: {len(addendum_innov)} innovations parsed")
        all_innovations.extend(addendum_innov)
    else:
        print(f"  WARNING: Addendum file not found at {ADDENDUM_FILE}")

    seen = set()
    unique = []
    for num, title, spec in all_innovations:
        if num not in seen:
            seen.add(num)
            unique.append((num, title, spec))

    print(f"\nTotal unique innovations: {len(unique)}")
    print(f"Range: #{min(n for n, _, _ in unique)} to #{max(n for n, _, _ in unique)}")

    print(f"\nBuilding PDF with embedded fonts...")
    count = build_pdf(unique, OUTPUT_PDF)
    size_kb = os.path.getsize(OUTPUT_PDF) / 1024
    print(f"\nDone! {count} innovations written to:")
    print(f"  {OUTPUT_PDF}")
    print(f"  Size: {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
