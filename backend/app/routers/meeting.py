from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])

# 1. Solicitar Reunião (Aluno ou Professor)
@router.post("/", response_model=schemas.MeetingResponse)
def create_meeting(
    meeting: schemas.MeetingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Verifica se a orientação existe
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    
    # Cria o pedido
    db_meeting = models.Meeting(
        date=meeting.date,
        topic=meeting.topic,
        guidance_id=meeting.guidance_id,
        status="pending"
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    
    # (Opcional: Aqui você poderia adicionar uma Notificação automática para o outro usuário!)
    
    return db_meeting

# 2. Listar Reuniões de uma Orientação
@router.get("/guidance/{guidance_id}", response_model=List[schemas.MeetingResponse])
def get_meetings_by_guidance(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    return db.query(models.Meeting)\
        .filter(models.Meeting.guidance_id == guidance_id)\
        .order_by(models.Meeting.date.asc())\
        .all()

# 3. Confirmar ou Rejeitar (Apenas Orientador deveria confirmar, mas deixaremos aberto por enquanto)
@router.patch("/{meeting_id}/status", response_model=schemas.MeetingResponse)
def update_meeting_status(
    meeting_id: int,
    status_update: schemas.MeetingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunião não encontrada")
        
    meeting.status = status_update.status
    db.commit()
    db.refresh(meeting)
    return meeting