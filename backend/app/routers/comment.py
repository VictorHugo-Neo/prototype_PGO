from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/comments", tags=["comments"])

@router.get("/task/{task_id}", response_model=List[schemas.CommentResponse])
def read_comments(
    task_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    comments = db.query(models.Comment).filter(models.Comment.task_id == task_id).all()
    
    # Monta a resposta com o nome do usuário
    return [
        schemas.CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            user_name=c.user.name,
            user_id=c.user.id
        ) for c in comments
    ]

@router.post("/", response_model=schemas.CommentResponse)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    # Cria o comentário vinculado ao usuário logado
    db_comment = models.Comment(
        content=comment.content,
        task_id=comment.task_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return schemas.CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        created_at=db_comment.created_at,
        user_name=current_user.name,
        user_id=current_user.id
    )