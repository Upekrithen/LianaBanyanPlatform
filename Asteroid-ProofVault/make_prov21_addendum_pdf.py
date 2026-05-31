"""
Generates PROV_21_ADDENDUM_EMPIRICAL_BP067.pdf using ReportLab.
USPTO-spec formatting: 11pt body, 1.4 line spacing, 1-inch margins.
Truth-Always: no confabulated mechanisms included.
"""

import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import KeepTogether
from reportlab.lib import colors

output_path = r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PROV_21_ADDENDUM_EMPIRICAL_BP067.pdf"
input_md = r"C:\Users\Administrator\Documents\LianaBanyanPlatform\Asteroid-ProofVault\PROV_21_ADDENDUM_EMPIRICAL_BP067.md"

# USPTO-spec: 11pt, 1.4 leading = ~15.4pt, 1-inch margins
MARGIN = 1 * inch
FONT_SIZE = 11
LINE_LEADING = FONT_SIZE * 1.4  # 15.4pt
SMALL_LEADING = 9 * 1.3

doc = SimpleDocTemplate(
    output_path,
    pagesize=letter,
    leftMargin=MARGIN,
    rightMargin=MARGIN,
    topMargin=MARGIN,
    bottomMargin=MARGIN,
)

styles = getSampleStyleSheet()

title_style = ParagraphStyle(
    "Title",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=13,
    leading=16,
    spaceBefore=0,
    spaceAfter=12,
    alignment=TA_CENTER,
)

h1_style = ParagraphStyle(
    "H1",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=12,
    leading=16,
    spaceBefore=18,
    spaceAfter=6,
)

h2_style = ParagraphStyle(
    "H2",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=FONT_SIZE,
    leading=LINE_LEADING,
    spaceBefore=14,
    spaceAfter=4,
)

h3_style = ParagraphStyle(
    "H3",
    parent=styles["Normal"],
    fontName="Helvetica-BoldOblique",
    fontSize=FONT_SIZE,
    leading=LINE_LEADING,
    spaceBefore=10,
    spaceAfter=4,
)

body_style = ParagraphStyle(
    "Body",
    parent=styles["Normal"],
    fontName="Helvetica",
    fontSize=FONT_SIZE,
    leading=LINE_LEADING,
    spaceBefore=0,
    spaceAfter=6,
)

code_style = ParagraphStyle(
    "Code",
    parent=styles["Normal"],
    fontName="Courier",
    fontSize=9,
    leading=12,
    spaceBefore=2,
    spaceAfter=2,
    leftIndent=18,
)

bold_style = ParagraphStyle(
    "Bold",
    parent=body_style,
    fontName="Helvetica-Bold",
)

notice_style = ParagraphStyle(
    "Notice",
    parent=body_style,
    fontName="Helvetica-BoldOblique",
    leftIndent=12,
    rightIndent=12,
    fontSize=FONT_SIZE,
    leading=LINE_LEADING,
)

meta_style = ParagraphStyle(
    "Meta",
    parent=styles["Normal"],
    fontName="Courier",
    fontSize=9,
    leading=12,
    spaceBefore=0,
    spaceAfter=3,
)

TABLE_STYLE = TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), HexColor("#2d3748")),
    ("TEXTCOLOR", (0, 0), (-1, 0), white),
    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), 8),
    ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [HexColor("#f7fafc"), HexColor("#edf2f7")]),
    ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#cbd5e0")),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("TOPPADDING", (0, 0), (-1, -1), 4),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
])

WARNING_STYLE = TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), HexColor("#fff5f5")),
    ("TEXTCOLOR", (0, 0), (-1, -1), HexColor("#c53030")),
    ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
    ("FONTSIZE", (0, 0), (-1, -1), FONT_SIZE),
    ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ("BOX", (0, 0), (-1, -1), 1.5, HexColor("#c53030")),
])

def escape_xml(text):
    """Escape & < > for ReportLab Paragraph."""
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text

def parse_inline(text):
    """Convert basic markdown inline to ReportLab XML."""
    # Bold+italic: ***text*** or ___text___
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    # Bold: **text**
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    # Italic: *text* or _text_
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    # Code: `text`
    text = re.sub(r"`([^`]+)`", r'<font name="Courier" size="9">\1</font>', text)
    return text

def md_to_story(md_text):
    story = []
    lines = md_text.split("\n")
    i = 0
    
    # Skip YAML front matter
    if lines[0].strip() == "---":
        i = 1
        while i < len(lines) and lines[i].strip() != "---":
            i += 1
        i += 1  # skip closing ---
    
    # Track table state
    in_table = False
    table_rows = []
    table_colwidths = None
    
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()
        
        # Empty line
        if not stripped:
            if in_table:
                # Flush table
                if table_rows:
                    page_width = letter[0] - 2 * MARGIN
                    cols = len(table_rows[0]) if table_rows else 1
                    col_w = page_width / cols
                    col_widths = [col_w] * cols
                    
                    tbl_data = []
                    for row in table_rows:
                        tbl_data.append([Paragraph(parse_inline(escape_xml(cell.strip())), 
                                          ParagraphStyle("tc", parent=styles["Normal"], 
                                                        fontSize=8, leading=11, fontName="Helvetica"))
                                         for cell in row])
                    
                    tbl = Table(tbl_data, colWidths=col_widths)
                    tbl.setStyle(TABLE_STYLE)
                    story.append(Spacer(1, 6))
                    story.append(tbl)
                    story.append(Spacer(1, 6))
                table_rows = []
                in_table = False
            else:
                story.append(Spacer(1, 6))
            i += 1
            continue
        
        # Horizontal rule
        if re.match(r"^---+$", stripped):
            from reportlab.platypus import HRFlowable
            if in_table:
                if table_rows:
                    page_width = letter[0] - 2 * MARGIN
                    cols = len(table_rows[0]) if table_rows else 1
                    col_w = page_width / cols
                    col_widths = [col_w] * cols
                    tbl_data = []
                    for row in table_rows:
                        tbl_data.append([Paragraph(parse_inline(escape_xml(cell.strip())), 
                                          ParagraphStyle("tc", parent=styles["Normal"], 
                                                        fontSize=8, leading=11, fontName="Helvetica"))
                                         for cell in row])
                    tbl = Table(tbl_data, colWidths=col_widths)
                    tbl.setStyle(TABLE_STYLE)
                    story.append(tbl)
                table_rows = []
                in_table = False
            story.append(Spacer(1, 4))
            story.append(HRFlowable(width="100%", thickness=0.5, color=HexColor("#718096")))
            story.append(Spacer(1, 4))
            i += 1
            continue
        
        # Table row
        if stripped.startswith("|") and stripped.endswith("|"):
            cells = [c for c in stripped.split("|")[1:-1]]
            # Skip separator rows like |---|---|
            if all(re.match(r"^[-:]+$", c.strip()) for c in cells if c.strip()):
                i += 1
                continue
            in_table = True
            table_rows.append(cells)
            i += 1
            continue
        
        # Flush table if we hit non-table content
        if in_table and table_rows:
            page_width = letter[0] - 2 * MARGIN
            cols = len(table_rows[0]) if table_rows else 1
            col_w = page_width / cols
            col_widths = [col_w] * cols
            tbl_data = []
            for row in table_rows:
                tbl_data.append([Paragraph(parse_inline(escape_xml(cell.strip())), 
                                  ParagraphStyle("tc", parent=styles["Normal"], 
                                                fontSize=8, leading=11, fontName="Helvetica"))
                                 for cell in row])
            tbl = Table(tbl_data, colWidths=col_widths)
            tbl.setStyle(TABLE_STYLE)
            story.append(Spacer(1, 6))
            story.append(tbl)
            story.append(Spacer(1, 6))
            table_rows = []
            in_table = False
        
        # H1
        m = re.match(r"^# (.+)$", stripped)
        if m:
            story.append(Paragraph(escape_xml(m.group(1)), title_style))
            i += 1
            continue
        
        # H2
        m = re.match(r"^## (.+)$", stripped)
        if m:
            story.append(Paragraph(escape_xml(m.group(1)), h1_style))
            i += 1
            continue
        
        # H3
        m = re.match(r"^### (.+)$", stripped)
        if m:
            story.append(Paragraph(escape_xml(m.group(1)), h2_style))
            i += 1
            continue
        
        # H4
        m = re.match(r"^#### (.+)$", stripped)
        if m:
            story.append(Paragraph(escape_xml(m.group(1)), h3_style))
            i += 1
            continue
        
        # Bold line (entire line is **bold**)
        m = re.match(r"^\*\*(.+)\*\*$", stripped)
        if m:
            story.append(Paragraph(f"<b>{escape_xml(m.group(1))}</b>", body_style))
            i += 1
            continue
        
        # Bullet point
        m = re.match(r"^[-*] (.+)$", stripped)
        if m:
            content = parse_inline(escape_xml(m.group(1)))
            bullet_style = ParagraphStyle(
                "Bullet", parent=body_style,
                leftIndent=18, firstLineIndent=-12,
                spaceBefore=2, spaceAfter=2,
            )
            story.append(Paragraph(f"• {content}", bullet_style))
            i += 1
            continue
        
        # Numbered list
        m = re.match(r"^\d+\. (.+)$", stripped)
        if m:
            content = parse_inline(escape_xml(m.group(1)))
            num_style = ParagraphStyle(
                "Numbered", parent=body_style,
                leftIndent=18, firstLineIndent=-12,
                spaceBefore=2, spaceAfter=2,
            )
            story.append(Paragraph(content, num_style))
            i += 1
            continue
        
        # Regular paragraph
        content = parse_inline(escape_xml(stripped))
        story.append(Paragraph(content, body_style))
        i += 1
    
    # Flush any remaining table
    if in_table and table_rows:
        page_width = letter[0] - 2 * MARGIN
        cols = len(table_rows[0]) if table_rows else 1
        col_w = page_width / cols
        col_widths = [col_w] * cols
        tbl_data = []
        for row in table_rows:
            tbl_data.append([Paragraph(parse_inline(escape_xml(cell.strip())), 
                              ParagraphStyle("tc", parent=styles["Normal"], 
                                            fontSize=8, leading=11, fontName="Helvetica"))
                             for cell in row])
        tbl = Table(tbl_data, colWidths=col_widths)
        tbl.setStyle(TABLE_STYLE)
        story.append(tbl)
    
    return story

with open(input_md, "r", encoding="utf-8") as f:
    md_content = f.read()

story = md_to_story(md_content)

# Build the PDF and count pages
from reportlab.platypus import SimpleDocTemplate
doc.build(story)

# Count pages by reading the built PDF
import subprocess
result = subprocess.run(
    ["python", "-c", 
     f"import re; content = open(r'{output_path}', 'rb').read(); pages = len(re.findall(b'/Type /Page[^s]', content)); print(f'Page count: {{pages}}')"],
    capture_output=True, text=True
)
print(result.stdout.strip())
print(result.stderr.strip())
print(f"PDF generated: {output_path}")
