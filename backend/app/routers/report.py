import re
from urllib.parse import quote
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from .. import crud, deps, models
from ..database import get_db
from ..services.pdf import generate_guidance_report_pdf

router = APIRouter(prefix="/report", tags=["report"])


def _build_content_disposition(student_name: str, preview: bool) -> str:
    clean_name = re.sub(r"[^\w\s-]", "", student_name).strip().replace(" ", "_")
    raw_filename = f"Relatorio_Orientacao_{clean_name}.pdf"
    # RFC 5987 / RFC 6266: suporte a cabeçalhos ASCII e UTF-8 codificados.
    ascii_safe = raw_filename.encode("ascii", "ignore").decode("ascii") or "relatorio.pdf"
    encoded_utf8 = quote(raw_filename)
    disposition_type = "inline" if preview else "attachment"
    return f"{disposition_type}; filename=\"{ascii_safe}\"; filename*=UTF-8''{encoded_utf8}"


@router.get("/{guidance_id}")
def generate_pdf_report(
    guidance_id: int,
    preview: bool = Query(False, description="Se True, exibe o PDF inline; se False, força download."),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")

    is_advisor = guidance.advisor_id == current_user.id
    is_student = guidance.student_id == current_user.id
    if not is_advisor and not is_student:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para acessar o relatório desta orientação.",
        )

    columns = crud.get_kanban_columns_by_guidance(db, guidance_id)
    tasks = crud.get_task_by_guidance(db, guidance_id)
    active_slugs = {col.slug for col in columns}
    kanban_tasks = [t for t in tasks if t.status in active_slugs]

    meetings = (
        db.query(models.Meeting)
        .filter(models.Meeting.guidance_id == guidance_id)
        .order_by(models.Meeting.date.desc())
        .all()
    )

    pdf_buffer = generate_guidance_report_pdf(
        guidance=guidance,
        columns=columns,
        tasks=kanban_tasks,
        meetings=meetings,
    )

    content_disposition = _build_content_disposition(guidance.student.name, preview)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": content_disposition,
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    )
