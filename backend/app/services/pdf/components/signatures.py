from typing import Dict
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import KeepTogether, Paragraph, Spacer, Table, TableStyle
from .... import models
from ..constants import COLOR_BORDER, CONTENT_WIDTH


def build_validation_section(
    guidance: models.Guidance,
    styles: Dict[str, ParagraphStyle],
) -> KeepTogether:
    remarks_box = Table([[""]], colWidths=[CONTENT_WIDTH], rowHeights=[40])
    remarks_box.setStyle(
        TableStyle(
            [
                ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FAFAFA")),
            ]
        )
    )

    col_w = (CONTENT_WIDTH - 20) / 2.0
    sig_content = [
        [
            Paragraph(
                f"________________________________________<br/>"
                f"<b>{guidance.student.name}</b><br/>"
                f"<font size='7.5' color='#475569'>Discente / Orientando(a)<br/>Data: _____/_____/_________</font>",
                styles["signature_text"],
            ),
            "",
            Paragraph(
                f"________________________________________<br/>"
                f"<b>{guidance.advisor.name}</b><br/>"
                f"<font size='7.5' color='#475569'>Docente / Orientador(a)<br/>Data: _____/_____/_________</font>",
                styles["signature_text"],
            ),
        ]
    ]

    sig_table = Table(sig_content, colWidths=[col_w, 20, col_w])
    sig_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )

    return KeepTogether(
        [
            Paragraph("3. Parecer e Validação Institucional", styles["section_title"]),
            Spacer(1, 3),
            Paragraph(
                "<font size='7.5' color='#64748B'>Parecer qualitativo e anotações do orientador:</font>",
                styles["table_cell"],
            ),
            Spacer(1, 3),
            remarks_box,
            Spacer(1, 5),
            Paragraph(
                "<font size='7.5' color='#475569'><i>Declaramos para os devidos fins acadêmicos que o histórico de atividades e encontros reflete o andamento da orientação.</i></font>",
                styles["table_cell"],
            ),
            Spacer(1, 8),
            sig_table,
        ]
    )
