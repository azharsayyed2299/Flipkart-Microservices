#!/usr/bin/env python3
"""Small Markdown-to-PDF builder used for workspace documentation.

It supports headings, bullets, ordered steps, fenced code blocks, simple pipe tables,
and normal paragraphs. It is intentionally dependency-light and uses ReportLab.
"""
from __future__ import annotations

import argparse
import html
import re
import textwrap
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Paragraph, PageBreak, Preformatted, SimpleDocTemplate, Spacer, Table, TableStyle

PAGE_WIDTH, PAGE_HEIGHT = A4
LEFT_MARGIN = 0.62 * inch
RIGHT_MARGIN = 0.62 * inch
TOP_MARGIN = 0.72 * inch
BOTTOM_MARGIN = 0.65 * inch
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=26, leading=32, alignment=TA_CENTER, textColor=colors.HexColor("#0B3D91"), spaceAfter=18))
styles.add(ParagraphStyle(name="CoverSubtitle", parent=styles["BodyText"], fontSize=12, leading=17, alignment=TA_CENTER, textColor=colors.HexColor("#333333"), spaceAfter=10))
styles.add(ParagraphStyle(name="H1Custom", parent=styles["Heading1"], fontName="Helvetica-Bold", fontSize=17, leading=21, textColor=colors.HexColor("#0B3D91"), spaceBefore=14, spaceAfter=9))
styles.add(ParagraphStyle(name="H2Custom", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=13.5, leading=17, textColor=colors.HexColor("#1F5FBF"), spaceBefore=10, spaceAfter=6))
styles.add(ParagraphStyle(name="H3Custom", parent=styles["Heading3"], fontName="Helvetica-Bold", fontSize=11.2, leading=14.5, textColor=colors.HexColor("#27364A"), spaceBefore=8, spaceAfter=5))
styles.add(ParagraphStyle(name="BodyCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.1, leading=12.5, spaceAfter=5))
styles.add(ParagraphStyle(name="BulletCustom", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.0, leading=12.2, leftIndent=18, firstLineIndent=-10, spaceAfter=3.2))
styles.add(ParagraphStyle(name="CodeCustom", parent=styles["Code"], fontName="Courier", fontSize=7.1, leading=8.8, leftIndent=6, rightIndent=6, backColor=colors.HexColor("#F5F7FA"), borderColor=colors.HexColor("#D8DEE9"), borderWidth=0.4, borderPadding=5, spaceBefore=5, spaceAfter=7))
styles.add(ParagraphStyle(name="TableCell", parent=styles["BodyText"], fontName="Helvetica", fontSize=7.5, leading=9.1))
styles.add(ParagraphStyle(name="TableHeader", parent=styles["TableCell"], fontName="Helvetica-Bold", textColor=colors.white))
styles.add(ParagraphStyle(name="Note", parent=styles["BodyText"], fontName="Helvetica-Oblique", fontSize=8.7, leading=11.8, leftIndent=10, rightIndent=10, textColor=colors.HexColor("#444444"), backColor=colors.HexColor("#FFF7E6"), borderColor=colors.HexColor("#F2B84B"), borderWidth=0.5, borderPadding=6, spaceBefore=5, spaceAfter=7))


def inline_markup(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"`([^`]+)`", r"<font face='Courier'>\1</font>", text)
    return text


def is_table_separator(line: str) -> bool:
    stripped = line.strip()
    if not (stripped.startswith("|") and stripped.endswith("|")):
        return False
    body = stripped.strip("|").strip()
    return bool(body) and all(set(part.strip()) <= set("-:") for part in body.split("|"))


def parse_table(lines: list[str]):
    rows = []
    for line in lines:
        if is_table_separator(line):
            continue
        rows.append([cell.strip() for cell in line.strip().strip("|").split("|")])
    if not rows:
        return Spacer(1, 1)
    max_cols = max(len(row) for row in rows)
    for row in rows:
        row.extend([""] * (max_cols - len(row)))
    data = []
    for idx, row in enumerate(rows):
        style_name = "TableHeader" if idx == 0 else "TableCell"
        data.append([Paragraph(inline_markup(cell), styles[style_name]) for cell in row])
    table = Table(data, colWidths=[CONTENT_WIDTH / max_cols] * max_cols, repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3D91")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#CBD5E1")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    return table


def code_block(text: str):
    wrapped = []
    for raw in text.rstrip("\n").splitlines():
        wrapped.extend(textwrap.wrap(raw, width=96, replace_whitespace=False, drop_whitespace=False) or [""])
    return Preformatted("\n".join(wrapped) if wrapped else " ", styles["CodeCustom"], maxLineLength=96)


def build_story(markdown_text: str, title: str, subtitle: str):
    story = [Spacer(1, 1.25 * inch), Paragraph(inline_markup(title), styles["CoverTitle"])]
    if subtitle:
        story += [Paragraph(inline_markup(subtitle), styles["CoverSubtitle"])]
    story += [Spacer(1, 0.35 * inch), Paragraph("Flipkart Clone Microservices Workspace", styles["CoverSubtitle"]), PageBreak()]

    lines = markdown_text.splitlines()
    in_code = False
    code_lines: list[str] = []
    table_lines: list[str] = []
    para_lines: list[str] = []

    def flush_para():
        nonlocal para_lines
        if para_lines:
            text = " ".join(x.strip() for x in para_lines).strip()
            if text:
                if text.startswith(">"):
                    story.append(Paragraph(inline_markup(text.lstrip("> ")), styles["Note"]))
                else:
                    story.append(Paragraph(inline_markup(text), styles["BodyCustom"]))
            para_lines = []

    def flush_table():
        nonlocal table_lines
        if table_lines:
            story.append(parse_table(table_lines))
            story.append(Spacer(1, 7))
            table_lines = []

    for line in lines:
        stripped = line.strip()
        if stripped.startswith("```"):
            flush_para(); flush_table()
            if in_code:
                story.append(code_block("\n".join(code_lines)))
                code_lines = []
                in_code = False
            else:
                in_code = True
            continue
        if in_code:
            code_lines.append(line)
            continue
        if stripped.startswith("|") and stripped.endswith("|"):
            flush_para(); table_lines.append(line); continue
        else:
            flush_table()
        if not stripped:
            flush_para(); story.append(Spacer(1, 3)); continue
        if stripped == "---":
            flush_para(); story.append(Spacer(1, 8)); continue
        if stripped.startswith("# "):
            flush_para()
            heading = stripped[2:].strip()
            if heading.upper().startswith("PART ") or heading.upper().startswith("LAB "):
                story.append(PageBreak())
            story.append(Paragraph(inline_markup(heading), styles["H1Custom"]))
            continue
        if stripped.startswith("## "):
            flush_para(); story.append(Paragraph(inline_markup(stripped[3:].strip()), styles["H2Custom"])); continue
        if stripped.startswith("### "):
            flush_para(); story.append(Paragraph(inline_markup(stripped[4:].strip()), styles["H3Custom"])); continue
        if re.match(r"^[-*]\s+", stripped):
            flush_para(); item = re.sub(r"^[-*]\s+", "", stripped); story.append(Paragraph("• " + inline_markup(item), styles["BulletCustom"])); continue
        if re.match(r"^\d+\.\s+", stripped):
            flush_para(); story.append(Paragraph(inline_markup(stripped), styles["BulletCustom"])); continue
        para_lines.append(line)
    flush_para(); flush_table()
    return story


def decorate(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.drawString(LEFT_MARGIN, PAGE_HEIGHT - 0.42 * inch, doc.title or "Flipkart Clone Documentation")
    canvas.drawRightString(PAGE_WIDTH - RIGHT_MARGIN, 0.38 * inch, f"Page {canvas.getPageNumber()}")
    canvas.setStrokeColor(colors.HexColor("#E2E8F0"))
    canvas.line(LEFT_MARGIN, PAGE_HEIGHT - 0.48 * inch, PAGE_WIDTH - RIGHT_MARGIN, PAGE_HEIGHT - 0.48 * inch)
    canvas.restoreState()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--title", default=None)
    parser.add_argument("--subtitle", default="")
    args = parser.parse_args()
    title = args.title or args.input.stem.replace("_", " ").title()
    story = build_story(args.input.read_text(encoding="utf-8"), title, args.subtitle)
    doc = SimpleDocTemplate(str(args.output), pagesize=A4, rightMargin=RIGHT_MARGIN, leftMargin=LEFT_MARGIN, topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN, title=title)
    doc.build(story, onFirstPage=decorate, onLaterPages=decorate)
    print(args.output)


if __name__ == "__main__":
    main()
