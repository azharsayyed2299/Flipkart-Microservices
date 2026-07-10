#!/usr/bin/env python3
from pathlib import Path
import html
import re
import textwrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    PageBreak,
    Preformatted,
    Table,
    TableStyle,
    KeepTogether,
)

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "AWS_CONSOLE_ONLY_SETUP_GUIDE.md"
OUTPUT = ROOT / "docs" / "AWS_CONSOLE_ONLY_SETUP_GUIDE.pdf"

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 0.62 * inch
RIGHT_MARGIN = 0.62 * inch
TOP_MARGIN = 0.72 * inch
BOTTOM_MARGIN = 0.65 * inch
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverTitle",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=28,
    leading=34,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#0B3D91"),
    spaceAfter=18,
))
styles.add(ParagraphStyle(
    name="CoverSubtitle",
    parent=styles["BodyText"],
    fontSize=13,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#333333"),
    spaceAfter=10,
))
styles.add(ParagraphStyle(
    name="H1Custom",
    parent=styles["Heading1"],
    fontName="Helvetica-Bold",
    fontSize=18,
    leading=22,
    textColor=colors.HexColor("#0B3D91"),
    spaceBefore=14,
    spaceAfter=9,
))
styles.add(ParagraphStyle(
    name="H2Custom",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=14,
    leading=18,
    textColor=colors.HexColor("#1F5FBF"),
    spaceBefore=10,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="H3Custom",
    parent=styles["Heading3"],
    fontName="Helvetica-Bold",
    fontSize=11.5,
    leading=15,
    textColor=colors.HexColor("#27364A"),
    spaceBefore=8,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="BodyCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.2,
    leading=12.8,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="BulletCustom",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=9.1,
    leading=12.4,
    leftIndent=18,
    firstLineIndent=-10,
    spaceAfter=3.2,
))
styles.add(ParagraphStyle(
    name="CodeCustom",
    parent=styles["Code"],
    fontName="Courier",
    fontSize=7.2,
    leading=9.0,
    leftIndent=6,
    rightIndent=6,
    backColor=colors.HexColor("#F5F7FA"),
    borderColor=colors.HexColor("#D8DEE9"),
    borderWidth=0.4,
    borderPadding=5,
    spaceBefore=5,
    spaceAfter=7,
))
styles.add(ParagraphStyle(
    name="TableCell",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=7.6,
    leading=9.2,
))
styles.add(ParagraphStyle(
    name="TableHeader",
    parent=styles["TableCell"],
    fontName="Helvetica-Bold",
    textColor=colors.white,
))
styles.add(ParagraphStyle(
    name="Note",
    parent=styles["BodyText"],
    fontName="Helvetica-Oblique",
    fontSize=8.8,
    leading=12,
    leftIndent=10,
    rightIndent=10,
    textColor=colors.HexColor("#444444"),
    backColor=colors.HexColor("#FFF7E6"),
    borderColor=colors.HexColor("#F2B84B"),
    borderWidth=0.5,
    borderPadding=6,
    spaceBefore=5,
    spaceAfter=7,
))


def inline_markup(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='Courier'>\1</font>", text)
    return text


def para(text: str, style="BodyCustom"):
    return Paragraph(inline_markup(text), styles[style])


def is_table_separator(line: str) -> bool:
    stripped = line.strip()
    if not (stripped.startswith("|") and stripped.endswith("|")):
        return False
    body = stripped.strip("|").strip()
    return bool(body) and all(set(part.strip()) <= set("-:") for part in body.split("|"))


def parse_table(lines):
    rows = []
    for line in lines:
        if is_table_separator(line):
            continue
        cells = [c.strip() for c in line.strip().strip("|").split("|")]
        rows.append(cells)
    if not rows:
        return Spacer(1, 1)
    max_cols = max(len(row) for row in rows)
    for row in rows:
        row.extend([""] * (max_cols - len(row)))

    data = []
    for r_index, row in enumerate(rows):
        style_name = "TableHeader" if r_index == 0 else "TableCell"
        data.append([Paragraph(inline_markup(cell), styles[style_name]) for cell in row])

    col_widths = [CONTENT_WIDTH / max_cols] * max_cols
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3D91")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("BACKGROUND", (0, 1), (-1, -1), colors.white),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    return table


def code_block(text: str):
    wrapped_lines = []
    for raw_line in text.rstrip("\n").splitlines():
        if len(raw_line) <= 96:
            wrapped_lines.append(raw_line)
        else:
            wrapped_lines.extend(textwrap.wrap(raw_line, width=96, replace_whitespace=False, drop_whitespace=False) or [""])
    safe = "\n".join(wrapped_lines) if wrapped_lines else " "
    return Preformatted(safe, styles["CodeCustom"], maxLineLength=96)


def build_story(markdown_text: str):
    story = []

    # Cover page
    story.append(Spacer(1, 1.2 * inch))
    story.append(Paragraph("AWS Console-Only Setup Guide", styles["CoverTitle"]))
    story.append(Paragraph("Flipkart Clone Microservices Deployment", styles["CoverTitle"]))
    story.append(Spacer(1, 0.18 * inch))
    story.append(Paragraph("Complete single PDF: ECS Fargate, ECR, DocumentDB, ALB, Cloud Map, CloudWatch, WAF, CI/CD, Redis, CloudFront and monitoring.", styles["CoverSubtitle"]))
    story.append(Spacer(1, 0.22 * inch))
    story.append(Paragraph("Region: us-east-1 · Architecture: React + Node.js microservices + MongoDB-compatible DocumentDB", styles["CoverSubtitle"]))
    story.append(Spacer(1, 0.5 * inch))
    story.append(Table(
        [[Paragraph("Prepared for the Flipkart Clone workspace project", styles["TableCell"])],
         [Paragraph("Use this as a deployment lab manual and production checklist.", styles["TableCell"])]],
        colWidths=[CONTENT_WIDTH * 0.72],
        hAlign="CENTER",
        style=TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F7FA")),
            ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#CBD5E1")),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("PADDING", (0, 0), (-1, -1), 10),
        ])
    ))
    story.append(PageBreak())

    lines = markdown_text.splitlines()
    i = 0
    in_code = False
    code_lines = []
    table_lines = []
    paragraph_lines = []
    first_real_h1 = True

    def flush_paragraph():
        nonlocal paragraph_lines
        if paragraph_lines:
            text = " ".join(line.strip() for line in paragraph_lines).strip()
            if text:
                if text.startswith(">"):
                    text = text.lstrip("> ").strip()
                    story.append(para(text, "Note"))
                else:
                    story.append(para(text))
            paragraph_lines = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            story.append(parse_table(table_lines))
            story.append(Spacer(1, 7))
            table_lines = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            flush_paragraph()
            flush_table()
            if not in_code:
                in_code = True
                code_lines = []
            else:
                in_code = False
                story.append(code_block("\n".join(code_lines)))
                code_lines = []
            i += 1
            continue

        if in_code:
            code_lines.append(line)
            i += 1
            continue

        if stripped.startswith("|") and stripped.endswith("|"):
            flush_paragraph()
            table_lines.append(line)
            i += 1
            continue
        else:
            flush_table()

        if not stripped:
            flush_paragraph()
            story.append(Spacer(1, 3))
            i += 1
            continue

        if stripped == "---":
            flush_paragraph()
            story.append(Spacer(1, 8))
            i += 1
            continue

        if stripped.startswith("# "):
            flush_paragraph()
            heading = stripped[2:].strip()
            if heading.startswith("AWS Console-Only Setup Guide"):
                # Already represented on cover; still include as document heading after cover.
                story.append(Paragraph(inline_markup(heading), styles["H1Custom"]))
            else:
                if heading.startswith("LAB "):
                    story.append(PageBreak())
                story.append(Paragraph(inline_markup(heading), styles["H1Custom"]))
            first_real_h1 = False
            i += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph()
            story.append(Paragraph(inline_markup(stripped[3:].strip()), styles["H2Custom"]))
            i += 1
            continue

        if stripped.startswith("### "):
            flush_paragraph()
            story.append(Paragraph(inline_markup(stripped[4:].strip()), styles["H3Custom"]))
            i += 1
            continue

        if re.match(r"^[-*]\s+", stripped):
            flush_paragraph()
            item = re.sub(r"^[-*]\s+", "", stripped)
            story.append(Paragraph("• " + inline_markup(item), styles["BulletCustom"]))
            i += 1
            continue

        if re.match(r"^\d+\.\s+", stripped):
            flush_paragraph()
            story.append(Paragraph(inline_markup(stripped), styles["BulletCustom"]))
            i += 1
            continue

        paragraph_lines.append(line)
        i += 1

    flush_paragraph()
    flush_table()
    return story


class NumberedCanvas:
    def __init__(self, canvas, doc):
        self.canvas = canvas
        self.doc = doc

    def __call__(self, canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 7.5)
        canvas.setFillColor(colors.HexColor("#64748B"))
        page = canvas.getPageNumber()
        header = "AWS Console-Only Setup Guide for Flipkart Microservices"
        canvas.drawString(LEFT_MARGIN, PAGE_HEIGHT - 0.42 * inch, header)
        canvas.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, 0.38 * inch, f"Page {page}")
        canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
        canvas.line(LEFT_MARGIN, PAGE_HEIGHT - 0.48 * inch, PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 0.48 * inch)
        canvas.restoreState()


def main():
    markdown_text = SOURCE.read_text(encoding="utf-8")
    story = build_story(markdown_text)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        rightMargin=RIGHT_MARGIN,
        leftMargin=LEFT_MARGIN,
        topMargin=TOP_MARGIN,
        bottomMargin=BOTTOM_MARGIN,
        title="AWS Console-Only Setup Guide for Flipkart Microservices",
        author="Arena.ai Agent Mode",
        subject="Flipkart Clone AWS ECS Deployment Guide",
    )
    page_decorator = NumberedCanvas(None, None)
    doc.build(story, onFirstPage=page_decorator, onLaterPages=page_decorator)
    print(OUTPUT)


if __name__ == "__main__":
    main()
