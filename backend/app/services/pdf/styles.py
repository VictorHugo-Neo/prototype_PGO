from datetime import datetime
from typing import Dict, Optional
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from .constants import (
    COLOR_PRIMARY,
    COLOR_TEXT_MAIN,
    COLOR_TEXT_MUTED,
    COLOR_TEXT_LIGHT,
    COLOR_WHITE,
)


def format_date(date_val: Optional[datetime], include_time: bool = False) -> str:
    if not date_val:
        return "Sem prazo"
    fmt = "%d/%m/%Y às %H:%M" if include_time else "%d/%m/%Y"
    return date_val.strftime(fmt)


def get_report_styles() -> Dict[str, ParagraphStyle]:
    sample = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "DocTitle",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=COLOR_WHITE,
        ),
        "header_meta": ParagraphStyle(
            "HeaderMeta",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            alignment=2,
            textColor=colors.HexColor("#E0E7FF"),
        ),
        "section_title": ParagraphStyle(
            "SectionTitle",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10.5,
            leading=14,
            textColor=COLOR_PRIMARY,
            keepWithNext=True,
        ),
        "meta_text": ParagraphStyle(
            "MetaText",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            textColor=COLOR_TEXT_MAIN,
        ),
        "table_header": ParagraphStyle(
            "TableHeader",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=8,
            leading=10,
            textColor=COLOR_WHITE,
        ),
        "table_cell": ParagraphStyle(
            "TableCell",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=COLOR_TEXT_MAIN,
        ),
        "card_number": ParagraphStyle(
            "CardNumber",
            parent=sample["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=14,
            alignment=1,
            textColor=COLOR_PRIMARY,
        ),
        "card_label": ParagraphStyle(
            "CardLabel",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9,
            alignment=1,
            textColor=COLOR_TEXT_LIGHT,
        ),
        "empty_message": ParagraphStyle(
            "EmptyMessage",
            parent=sample["Normal"],
            fontName="Helvetica-Oblique",
            fontSize=8,
            leading=11,
            alignment=1,
            textColor=COLOR_TEXT_MUTED,
        ),
        "signature_text": ParagraphStyle(
            "SignatureText",
            parent=sample["Normal"],
            fontName="Helvetica",
            fontSize=8.5,
            leading=12,
            alignment=1,
            textColor=COLOR_TEXT_MAIN,
        ),
    }
