import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/tasks", tags=["tasks"])


def verify_guidance_access(guidance: models.Guidance, user_id: int):
    if not guidance or (guidance.advisor_id != user_id and guidance.student_id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta orientação"
        )


@router.get("/guidance/{guidance_id}", response_model=List[schemas.TaskResponse])
def read_tasks_by_guidance(
    guidance_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    verify_guidance_access(guidance, current_user.id)
    return crud.get_task_by_guidance(db, guidance_id)


@router.get("/{task_id}", response_model=schemas.TaskResponse)
def read_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == task.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)
    return task


@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == task.guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada")
    verify_guidance_access(guidance, current_user.id)
    return crud.create_task(db, task, creator_id=current_user.id)


@router.put("/{task_id}", response_model=schemas.TaskResponse)
def update_task(
    task_id: int,
    task_update: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == task.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)
    
    update_data = task_update.model_dump(exclude_unset=True)
    updated = crud.update_task(db, task_id, update_data)
    return updated


@router.patch("/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == task.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)
        
    return crud.update_status_task(db, task_id, status_update.status)


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == task.guidance_id).first()
    verify_guidance_access(guidance, current_user.id)
    
    for att in task.attachments:
        if att.file_path and os.path.exists(att.file_path):
            try:
                os.remove(att.file_path)
            except OSError:
                pass
                
    crud.delete_task(db, task_id)
    return None