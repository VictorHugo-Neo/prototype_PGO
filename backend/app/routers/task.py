from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

# 1. ADICIONAMOS O PREFIXO AQUI
# Assim todas as rotas abaixo começarão automaticamente com "/tasks"
router = APIRouter(prefix="/tasks", tags=["tasks"])

# Rota final: GET /tasks/guidance/{id}
@router.get("/guidance/{guidance_id}", response_model=List[schemas.TaskResponse])
def read_tasks_by_guidance(
    guidance_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    tasks = db.query(models.Task).filter(models.Task.guidance_id == guidance_id).all()
    return tasks

# Rota final: POST /tasks/
@router.post("/", response_model=schemas.TaskResponse)
def create_task(
    task: schemas.TaskCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    # Cria a tarefa no banco
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# Rota final: PATCH /tasks/{id}/status
@router.patch("/{task_id}/status", response_model=schemas.TaskResponse)
def update_task_status(
    task_id: int,
    status_update: schemas.TaskUpdateStatus,
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")
        
    task.status = status_update.status
    db.commit()
    db.refresh(task)
    return task