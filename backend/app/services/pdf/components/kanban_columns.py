from datetime import datetime
from typing import Dict, List, Optional
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import KeepTogether, Paragraph, Spacer, Table, TableStyle
from .... import models
from ..constants import (
    COLOR_BG_CARD,
    COLOR_BORDER,
    COLOR_BORDER_LIGHT,
    COLOR_TEXT_MUTED,
    COLOR_WHITE,
    CONTENT_WIDTH,
    DEFAULT_PALETTE,
    KANBAN_PALETTE_MAP,
)
from ..styles import format_date


def _build_column_header(col: models.KanbanColumn, count: int, palette: dict, styles: Dict[str, ParagraphStyle]) -> Table:
    header_title = f"<b><font color='{palette['header'].hexval()}'>● {col.title.upper()}</font></b>"
    header_count = f"<font color='{palette['text'].hexval()}'><b>{count} tarefa(s)</b></font>"

    table = Table(
        [[Paragraph(header_title, styles["table_cell"]), Paragraph(header_count, styles["header_meta"])]],
        colWidths=[CONTENT_WIDTH * 0.75, CONTENT_WIDTH * 0.25],
    )
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), palette["bg"]),
                ("BOX", (0, 0), (-1, -1), 0.75, palette["border"]),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )
    return table


def _build_column_tasks_table(
    col_tasks: List[models.Task],
    col: models.KanbanColumn,
    completed_slug: str,
    palette: dict,
    styles: Dict[str, ParagraphStyle],
) -> Table:
    now = datetime.now()
    rows = [
        [
            Paragraph("<b>#</b>", styles["table_header"]),
            Paragraph("<b>Tarefa / Descrição</b>", styles["table_header"]),
            Paragraph("<b>Prazo</b>", styles["table_header"]),
            Paragraph("<b>Interações</b>", styles["table_header"]),
        ]
    ]

    for idx, t in enumerate(col_tasks, 1):
        desc_snippet = ""
        if t.description and t.description.strip():
            clean_desc = t.description.strip().replace("\n", " ")
            if len(clean_desc) > 100:
                clean_desc = clean_desc[:97] + "..."
            desc_snippet = f"<br/><font size='7' color='#64748B'>{clean_desc}</font>"

        title_html = f"<b>{t.title}</b>{desc_snippet}"
        deadline_html = format_date(t.time_estimate, include_time=False)
        if t.time_estimate and t.time_estimate < now and col.slug != completed_slug:
            deadline_html += " <font color='#B91C1C'><b>(Atrasada)</b></font>"

        num_comments = len(t.comments) if hasattr(t, "comments") and t.comments else 0
        num_attachments = len(t.attachments) if hasattr(t, "attachments") and t.attachments else 0
        interactions_html = f"{num_comments} com. / {num_attachments} anx." if (num_comments or num_attachments) else "—"

        rows.append(
            [
                Paragraph(f"{idx}", styles["table_cell"]),
                Paragraph(title_html, styles["table_cell"]),
                Paragraph(deadline_html, styles["table_cell"]),
                Paragraph(interactions_html, styles["table_cell"]),
            ]
        )

    tasks_table = Table(
        rows,
        colWidths=[CONTENT_WIDTH * 0.06, CONTENT_WIDTH * 0.62, CONTENT_WIDTH * 0.18, CONTENT_WIDTH * 0.14],
        repeatRows=1,
    )
    tasks_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), palette["header"]),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("BOX", (0, 0), (-1, -1), 0.5, palette["border"]),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER_LIGHT),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [COLOR_WHITE, COLOR_BG_CARD]),
            ]
        )
    )
    return tasks_table


def _build_empty_column_table(styles: Dict[str, ParagraphStyle]) -> Table:
    empty_table = Table(
        [[Paragraph("Nenhuma tarefa nesta etapa do Kanban.", styles["empty_message"])]],
        colWidths=[CONTENT_WIDTH],
    )
    empty_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
                ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER_LIGHT),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return empty_table


def build_kanban_columns_section(
    columns: List[models.KanbanColumn],
    tasks: List[models.Task],
    completion_col: Optional[models.KanbanColumn],
    styles: Dict[str, ParagraphStyle],
) -> List:
    elements = [
        Paragraph("1. Detalhamento das Tarefas por Coluna do Kanban", styles["section_title"]),
        Spacer(1, 6),
    ]

    completed_slug = completion_col.slug if completion_col else "completed"

    for col in columns:
        col_tasks = [t for t in tasks if t.status == col.slug]
        palette = KANBAN_PALETTE_MAP.get(col.color, DEFAULT_PALETTE)

        col_header = _build_column_header(col, len(col_tasks), palette, styles)
        col_content = (
            _build_column_tasks_table(col_tasks, col, completed_slug, palette, styles)
            if col_tasks
            else _build_empty_column_table(styles)
        )

        elements.append(KeepTogether([col_header, col_content]))
        elements.append(Spacer(1, 8))

    return elements
