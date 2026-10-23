from typing import Dict, List, Optional
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle
from .... import models
from ..constants import (
    COLOR_ACCENT,
    COLOR_BG_CARD,
    COLOR_BORDER_LIGHT,
    CONTENT_WIDTH,
)


def identify_completion_column(columns: List[models.KanbanColumn]) -> Optional[models.KanbanColumn]:
    if not columns:
        return None
    for col in columns:
        if col.slug == "completed":
            return col
    for col in columns:
        low_title = col.title.lower()
        low_slug = col.slug.lower()
        if any(term in low_title or term in low_slug for term in ("conclu", "finaliz", "pronto", "done")):
            return col
    return columns[-1]


def build_kanban_summary(
    columns: List[models.KanbanColumn],
    tasks: List[models.Task],
    meetings: List[models.Meeting],
    completion_col: Optional[models.KanbanColumn],
    styles: Dict[str, ParagraphStyle],
) -> List:
    known_slugs = {col.slug for col in columns}
    kanban_tasks = [t for t in tasks if t.status in known_slugs]
    total_tasks = len(kanban_tasks)
    completed_slug = completion_col.slug if completion_col else "completed"
    completed_tasks = sum(1 for t in kanban_tasks if t.status == completed_slug)
    pct = int(round((completed_tasks / total_tasks * 100))) if total_tasks > 0 else 0

    total_meetings = len(meetings)
    confirmed_meetings = sum(1 for m in meetings if m.status == "confirmed")

    num_cols = len(columns)
    col_w = CONTENT_WIDTH / float(num_cols) if num_cols > 0 else CONTENT_WIDTH

    kpi_numbers = []
    kpi_labels = []

    for col in columns:
        count = sum(1 for t in kanban_tasks if t.status == col.slug)
        kpi_numbers.append(Paragraph(f"{count}", styles["card_number"]))
        kpi_labels.append(Paragraph(col.title, styles["card_label"]))

    kpi_table = Table([kpi_numbers, kpi_labels], colWidths=[col_w] * num_cols)
    kpi_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), COLOR_BG_CARD),
                ("BOX", (0, 0), (-1, -1), 0.75, COLOR_BORDER_LIGHT),
                ("INNERGRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER_LIGHT),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 2),
                ("TOPPADDING", (0, 1), (-1, 1), 0),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 6),
            ]
        )
    )

    overview_text = (
        f"<b>Total de Tarefas no Quadro:</b> {total_tasks} &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Etapa Final ({completion_col.title if completion_col else 'Concluído'}):</b> {completed_tasks} ({pct}%) &nbsp;&nbsp;|&nbsp;&nbsp; "
        f"<b>Reuniões Realizadas:</b> {confirmed_meetings} de {total_meetings}"
    )
    overview_p = Paragraph(overview_text, styles["table_cell"])

    w_done = max(1.0, CONTENT_WIDTH * (pct / 100.0)) if pct > 0 else 0.0
    w_rem = CONTENT_WIDTH - w_done
    bar_cells = [["", ""]] if w_done > 0 else [[""]]
    bar_widths = [w_done, w_rem] if w_done > 0 else [CONTENT_WIDTH]

    prog_bar = Table(bar_cells, colWidths=bar_widths, rowHeights=[4])
    prog_styles = [
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
    ]
    if w_done > 0:
        prog_styles.extend(
            [
                ("BACKGROUND", (0, 0), (0, 0), COLOR_ACCENT),
                ("BACKGROUND", (1, 0), (1, 0), COLOR_BORDER_LIGHT),
            ]
        )
    else:
        prog_styles.append(("BACKGROUND", (0, 0), (-1, -1), COLOR_BORDER_LIGHT))

    prog_bar.setStyle(TableStyle(prog_styles))

    return [
        Paragraph("Distribuição de Tarefas por Etapa do Kanban", styles["section_title"]),
        Spacer(1, 4),
        kpi_table,
        Spacer(1, 4),
        overview_p,
        Spacer(1, 3),
        prog_bar,
    ]
