from datetime import datetime
from typing import Dict
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from .... import models
from ..constants import (
    COLOR_BG_CARD,
    COLOR_BORDER_LIGHT,
    COLOR_PRIMARY,
    CONTENT_WIDTH,
)
from ..styles import format_date


def build_header_table(guidance: models.Guidance, styles: Dict[str, ParagraphStyle]) -> Table:
    emission = datetime.now().strftime("%d/%m/%Y %H:%M")
    left_html = (
        "<b>PGO • PLATAFORMA DE GESTÃO DE ORIENTAÇÃO</b><br/>"
        "<font size='8.5' color='#BFDBFE'>Relatório Consolidado do Quadro Kanban & Atividades</font>"
    )
    right_html = (
        f"<b>Emissão:</b> {emission}<br/>"
        f"<b>Orientação:</b> #{guidance.id}<br/>"
        "<b>Situação:</b> Ativa"
    )

    table = Table(
        [
            [
                Paragraph(left_html, styles["title"]),
                Paragraph(right_html, styles["header_meta"]),
            ]
        ],
        colWidths=[CONTENT_WIDTH * 0.68, CONTENT_WIDTH * 0.32],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLOR_PRIMARY),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return table


def build_meta_table(guidance: models.Guidance, styles: Dict[str, ParagraphStyle]) -> Table:
    defense_str = format_date(guidance.defense_date, include_time=True) if guidance.defense_date else "A definir"
    start_str = format_date(guidance.created_at, include_time=False) if guidance.created_at else "Data não registrada"

    col_w = CONTENT_WIDTH / 2.0
    content = [
        [
            Paragraph(
                f"<b>Aluno(a):</b> {guidance.student.name}<br/>"
                f"<b>E-mail:</b> {guidance.student.email}<br/>"
                f"<b>Início da Orientação:</b> {start_str}",
                styles["meta_text"],
            ),
            Paragraph(
                f"<b>Orientador(a):</b> {guidance.advisor.name}<br/>"
                f"<b>E-mail:</b> {guidance.advisor.email}<br/>"
                f"<b>Previsão de Banca:</b> {defense_str}",
                styles["meta_text"],
            ),
        ],
        [
            Paragraph(f"<b>Tema da Pesquisa:</b> {guidance.theme}", styles["meta_text"]),
            "",
        ],
    ]

    table = Table(content, colWidths=[col_w, col_w])
    table.setStyle(
        TableStyle(
            [
                ("SPAN", (0, 1), (1, 1)),
                ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
                ("BOX", (0, 0), (-1, -1), 0.75, COLOR_BORDER_LIGHT),
                ("INNERGRID", (0, 0), (-1, 0), 0.5, colors.HexColor("#F1F5F9")),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table
