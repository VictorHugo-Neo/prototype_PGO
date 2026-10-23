from datetime import datetime
from typing import List
from reportlab.pdfgen import canvas
from .constants import (
    COLOR_BORDER,
    COLOR_BORDER_LIGHT,
    COLOR_TEXT_LIGHT,
    MARGIN_HORIZONTAL,
    PAGE_HEIGHT,
    PAGE_WIDTH,
)


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states: List[dict] = []
        self._generation_time = datetime.now()

    def showPage(self) -> None:
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self) -> None:
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_decorations(self, page_count: int) -> None:
        self.saveState()
        margin = MARGIN_HORIZONTAL
        width = PAGE_WIDTH
        height = PAGE_HEIGHT

        if self._pageNumber > 1:
            self.setFont("Helvetica", 8)
            self.setFillColor(COLOR_TEXT_LIGHT)
            self.drawString(margin, height - 24, "PGO • Relatório de Acompanhamento do Quadro Kanban")
            self.setStrokeColor(COLOR_BORDER_LIGHT)
            self.setLineWidth(0.5)
            self.line(margin, height - 28, width - margin, height - 28)

        self.setStrokeColor(COLOR_BORDER)
        self.setLineWidth(0.5)
        self.line(margin, 30, width - margin, 30)

        self.setFont("Helvetica", 8)
        self.setFillColor(COLOR_TEXT_LIGHT)
        timestamp = self._generation_time.strftime("%d/%m/%Y às %H:%M")
        self.drawString(
            margin,
            18,
            f"PGO - Plataforma de Gestão de Orientação • Gerado eletronicamente em {timestamp}",
        )
        page_indicator = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(width - margin, 18, page_indicator)
        self.restoreState()
