from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/kanban", tags=["kanban"])


def verify_guidance_access(guidance: models.Guidance, user_id: int):
    if not guidance or (guidance.advisor_id != user_id and guidance.student_id != user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para acessar esta orientação."
        )


def verify_advisor_access(guidance: models.Guidance, user_id: int):
    if not guidance or guidance.advisor_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas o orientador tem permissão para gerenciar as colunas do Kanban."
        )


@router.get("/guidance/{guidance_id}/columns", response_model=List[schemas.KanbanColumnResponse])
def get_guidance_columns(
    guidance_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")
    verify_guidance_access(guidance, current_user.id)
    return crud.get_kanban_columns_by_guidance(db, guidance_id)


@router.post("/guidance/{guidance_id}/columns", response_model=schemas.KanbanColumnResponse, status_code=status.HTTP_201_CREATED)
def create_column(
    guidance_id: int,
    column_in: schemas.KanbanColumnCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
    if not guidance:
        raise HTTPException(status_code=404, detail="Orientação não encontrada.")
    verify_advisor_access(guidance, current_user.id)

    if not column_in.title or not column_in.title.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="O título da coluna é obrigatório."
        )

    return crud.create_kanban_column(db, guidance_id, column_in)


@router.put("/columns/{column_id}", response_model=schemas.KanbanColumnResponse)
def update_column(
    column_id: int,
    column_in: schemas.KanbanColumnUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    column = crud.get_kanban_column_by_id(db, column_id)
    if not column:
        raise HTTPException(status_code=404, detail="Coluna não encontrada.")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == column.guidance_id).first()
    verify_advisor_access(guidance, current_user.id)

    updated = crud.update_kanban_column(db, column_id, column_in)
    return updated


@router.delete("/columns/{column_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_column(
    column_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    column = crud.get_kanban_column_by_id(db, column_id)
    if not column:
        raise HTTPException(status_code=404, detail="Coluna não encontrada.")
    guidance = db.query(models.Guidance).filter(models.Guidance.id == column.guidance_id).first()
    verify_advisor_access(guidance, current_user.id)

    success, error_msg = crud.delete_kanban_column(db, column_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    return None
