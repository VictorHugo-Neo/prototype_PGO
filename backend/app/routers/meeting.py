from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/meetings", tags=["meetings"])


def verify_guidance_access(guidance: models.Guidance, user_id: int):
    if not guidance or (
        guidance.advisor_id != user_id
        and guidance.coadvisor_id != user_id
        and guidance.student_id != user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta orientação"
        )


def format_meeting_response(
    meeting: models.Meeting,
    guidance: models.Guidance | None = None,
) -> schemas.MeetingResponse:
    target_guidance = guidance or meeting.guidance
    role = None
    if meeting.creator_id and target_guidance:
        if meeting.creator_id == target_guidance.advisor_id:
            role = "advisor"
        elif meeting.creator_id == target_guidance.coadvisor_id:
            role = "coadvisor"
        elif meeting.creator_id == target_guidance.student_id:
            role = "student"
        elif meeting.creator:
            role = meeting.creator.type
    resp = schemas.MeetingResponse.model_validate(meeting)
    resp.creator_role = role
    return resp


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
    created = crud.create_meeting(db, meeting, creator_id=current_user.id)
    return format_meeting_response(created, guidance)


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
    meetings = crud.get_meetings_by_guidance(db, guidance_id)
    return [format_meeting_response(m, guidance) for m in meetings]


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
    return format_meeting_response(meeting, guidance)


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
    updated = crud.update_meeting(db, meeting_id, update_data)
    return format_meeting_response(updated, guidance)


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

    updated = crud.update_meeting_status(db, meeting_id, status_update.status)
    return format_meeting_response(updated, guidance)


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
