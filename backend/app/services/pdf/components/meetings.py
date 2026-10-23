from typing import Dict, List
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from .... import models
from ..constants import (
    COLOR_BG_CARD,
    COLOR_BORDER,
    COLOR_BORDER_LIGHT,
    COLOR_PRIMARY,
    COLOR_WHITE,
    CONTENT_WIDTH,
    MEETING_STATUS_MAP,
)
from ..styles import format_date


def build_meetings_section(
    meetings: List[models.Meeting],
    styles: Dict[str, ParagraphStyle],
) -> List:
    elements = [
        Paragraph("2. Registro de Reuniões e Alinhamentos", styles["section_title"]),
        Spacer(1, 5),
    ]

    if not meetings:
        empty_table = Table(
            [[Paragraph("Nenhuma reunião registrada até o momento.", styles["empty_message"])]],
            colWidths=[CONTENT_WIDTH],
        )
        empty_table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
                    ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER_LIGHT),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        elements.append(empty_table)
        return elements

    rows = [
        [
            Paragraph("<b>Data e Horário</b>", styles["table_header"]),
            Paragraph("<b>Pauta / Assunto Discutido</b>", styles["table_header"]),
            Paragraph("<b>Status</b>", styles["table_header"]),
        ]
    ]

    for m in meetings:
        cfg = MEETING_STATUS_MAP.get(m.status, {"label": m.status.title(), "color": "#475569"})
        status_html = f"<font color='{cfg['color']}'><b>{cfg['label']}</b></font>"
        rows.append(
            [
                Paragraph(format_date(m.date, include_time=True), styles["table_cell"]),
                Paragraph(m.topic, styles["table_cell"]),
                Paragraph(status_html, styles["table_cell"]),
            ]
        )

    col_widths = [CONTENT_WIDTH * 0.23, CONTENT_WIDTH * 0.57, CONTENT_WIDTH * 0.20]
    table = Table(rows, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), COLOR_PRIMARY),
                ("TOPPADDING", (0, 0), (-1, -1), 4.5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4.5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER_LIGHT),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [COLOR_WHITE, COLOR_BG_CARD]),
            ]
        )
    )
    elements.append(table)
    return elements
