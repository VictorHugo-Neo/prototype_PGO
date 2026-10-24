from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])


def verify_guidance_access(guidance: models.Guidance, user_id: int):
    if not guidance or (guidance.advisor_id != user_id and guidance.student_id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta orientação"
        )


@router.post("/", response_model=schemas.MeetingResponse)
def create_meeting(
    meeting: schemas.MeetingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    verify_guidance_access(guidance, current_user.id)
    return crud.create_meeting(db, meeting)


@router.get("/guidance/{guidance_id}", response_model=List[schemas.MeetingResponse])
def get_meetings_by_guidance(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    verify_guidance_access(guidance, current_user.id)
    return crud.get_meetings_by_guidance(db, guidance_id)


@router.get("/{meeting_id}", response_model=schemas.MeetingResponse)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    meeting = crud.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunião não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)
    return meeting


@router.put("/{meeting_id}", response_model=schemas.MeetingResponse)
def update_meeting(
    meeting_id: int,
    meeting_update: schemas.MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    meeting = crud.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunião não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)

    update_data = meeting_update.model_dump(exclude_unset=True)
    return crud.update_meeting(db, meeting_id, update_data)


@router.patch("/{meeting_id}/status", response_model=schemas.MeetingResponse)
def update_meeting_status(
    meeting_id: int,
    status_update: schemas.MeetingUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    meeting = crud.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunião não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)

    return crud.update_meeting_status(db, meeting_id, status_update.status)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    meeting = crud.get_meeting_by_id(db, meeting_id)
    if not meeting:
        raise HTTPException(status_code=404, detail="Reunião não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == meeting.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)

    crud.delete_meeting(db, meeting_id)
    return None
