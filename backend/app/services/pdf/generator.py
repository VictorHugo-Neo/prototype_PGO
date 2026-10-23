from io import BytesIO
from typing import List
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Spacer
from ... import models
from .canvas import NumberedCanvas
from .components import (
    build_header_table,
    build_kanban_columns_section,
    build_kanban_summary,
    build_meetings_section,
    build_meta_table,
    build_validation_section,
    identify_completion_column,
)
from .constants import MARGIN_HORIZONTAL
from .styles import get_report_styles


def generate_guidance_report_pdf(
    guidance: models.Guidance,
    columns: List[models.KanbanColumn],
    tasks: List[models.Task],
    meetings: List[models.Meeting],
) -> BytesIO:
    styles = get_report_styles()
    completion_col = identify_completion_column(columns)

    elements = [
        build_header_table(guidance, styles),
        Spacer(1, 8),
        build_meta_table(guidance, styles),
        Spacer(1, 8),
        *build_kanban_summary(columns, tasks, meetings, completion_col, styles),
        Spacer(1, 12),
        *build_kanban_columns_section(columns, tasks, completion_col, styles),
        Spacer(1, 10),
        *build_meetings_section(meetings, styles),
        Spacer(1, 12),
        build_validation_section(guidance, styles),
    ]

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=MARGIN_HORIZONTAL,
        rightMargin=MARGIN_HORIZONTAL,
        topMargin=36,
        bottomMargin=44,
    )
    doc.build(elements, canvasmaker=NumberedCanvas)
    buffer.seek(0)
    return buffer
