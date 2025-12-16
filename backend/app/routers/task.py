from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(tags=["tasks_guidance"])

@router.post("/guidances/", response_model=schemas.GuidanceResponse)

def create_guidance(guidance: schemas.GuidanceCreate, db: Session = Depends(get_db)):
    return crud.create_guidance(db=db, guidance_date=guidance.model_dump())

@router.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db=db, task=task)

@router.get("/guidances/{guidance_id}/tasks/",response_model=List[schemas.TaskResponse])

def read_tasks(guidance_id: int, db: Session = Depends(get_db)):
    return crud.get_tasks_by_guidance(db=db, guidance_id = guidance_id)

@router.patch("/tasks/{task_id}/status",response_model=schemas.TaskResponse)
def updated_task_status(task_id: int, status_updated: schemas.TaskUpdateStatus, db: Session = Depends(get_db)):
    updated = crud.update_status_task(db, task_id, status_updated.status)
    if not updated:
        raise HTTPException(status_code=404, detail = "Task not found")
    return updated