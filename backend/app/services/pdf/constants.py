from typing import Dict
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4

PAGE_WIDTH, PAGE_HEIGHT = A4
MARGIN_HORIZONTAL = 36
CONTENT_WIDTH = PAGE_WIDTH - (MARGIN_HORIZONTAL * 2)

COLOR_PRIMARY = colors.HexColor("#1E3A8A")
COLOR_PRIMARY_DARK = colors.HexColor("#172554")
COLOR_PRIMARY_LIGHT = colors.HexColor("#EFF6FF")
COLOR_ACCENT = colors.HexColor("#2563EB")
COLOR_TEXT_MAIN = colors.HexColor("#0F172A")
COLOR_TEXT_MUTED = colors.HexColor("#475569")
COLOR_TEXT_LIGHT = colors.HexColor("#64748B")
COLOR_BORDER = colors.HexColor("#CBD5E1")
COLOR_BORDER_LIGHT = colors.HexColor("#E2E8F0")
COLOR_BG_CARD = colors.HexColor("#F8FAFC")
COLOR_WHITE = colors.white

KANBAN_PALETTE_MAP: Dict[str, Dict[str, colors.HexColor]] = {
    "bg-purple-50": {
        "bg": colors.HexColor("#FAF5FF"),
        "border": colors.HexColor("#D8B4FE"),
        "header": colors.HexColor("#6B21A8"),
        "text": colors.HexColor("#581C87"),
    },
    "bg-blue-50": {
        "bg": colors.HexColor("#EFF6FF"),
        "border": colors.HexColor("#93C5FD"),
        "header": colors.HexColor("#1D4ED8"),
        "text": colors.HexColor("#1E3A8A"),
    },
    "bg-emerald-50": {
        "bg": colors.HexColor("#ECFDF5"),
        "border": colors.HexColor("#6EE7B7"),
        "header": colors.HexColor("#059669"),
        "text": colors.HexColor("#065F46"),
    },
    "bg-green-50": {
        "bg": colors.HexColor("#F0FDF4"),
        "border": colors.HexColor("#86EFAC"),
        "header": colors.HexColor("#16A34A"),
        "text": colors.HexColor("#166534"),
    },
    "bg-amber-50": {
        "bg": colors.HexColor("#FFFBEB"),
        "border": colors.HexColor("#FCD34D"),
        "header": colors.HexColor("#D97706"),
        "text": colors.HexColor("#92400E"),
    },
    "bg-rose-50": {
        "bg": colors.HexColor("#FFF1F2"),
        "border": colors.HexColor("#FDA4AF"),
        "header": colors.HexColor("#E11D48"),
        "text": colors.HexColor("#9F1239"),
    },
    "bg-indigo-50": {
        "bg": colors.HexColor("#EEF2FF"),
        "border": colors.HexColor("#A5B4FC"),
        "header": colors.HexColor("#4F46E5"),
        "text": colors.HexColor("#3730A3"),
    },
    "bg-cyan-50": {
        "bg": colors.HexColor("#ECFEFF"),
        "border": colors.HexColor("#67E8F9"),
        "header": colors.HexColor("#0891B2"),
        "text": colors.HexColor("#155E75"),
    },
    "bg-gray-100": {
        "bg": colors.HexColor("#F3F4F6"),
        "border": colors.HexColor("#D1D5DB"),
        "header": colors.HexColor("#4B5563"),
        "text": colors.HexColor("#1F2937"),
    },
}

DEFAULT_PALETTE = {
    "bg": colors.HexColor("#F8FAFC"),
    "border": colors.HexColor("#CBD5E1"),
    "header": colors.HexColor("#1E3A8A"),
    "text": colors.HexColor("#0F172A"),
}

MEETING_STATUS_MAP = {
    "confirmed": {"label": "Confirmada", "color": "#15803D"},
    "pending": {"label": "Pendente", "color": "#B45309"},
    "rejected": {"label": "Cancelada", "color": "#B91C1C"},
}
