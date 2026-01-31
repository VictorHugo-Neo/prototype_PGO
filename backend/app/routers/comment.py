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
    # 1. Cria o comentário normal
    db_comment = models.Comment(
        content=comment.content,
        task_id=comment.task_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    

    # Cria a notificação para o outro usuário envolvido na orientação
    task = db.query(models.Task).filter(models.Task.id == comment.task_id).first()
    if task and task.guidance:
        # Se quem comentou foi o ALUNO, notifica o ORIENTADOR
        # Se quem comentou foi o ORIENTADOR, notifica o ALUNO
        if current_user.id == task.guidance.student_id:
            recipient_id = task.guidance.advisor_id
            msg = f"Aluno {current_user.name} comentou na tarefa: {task.title}"
        else:
            recipient_id = task.guidance.student_id
            msg = f"Orientador {current_user.name} comentou na tarefa: {task.title}"
        
        # Cria a notificação no banco
        new_notif = models.Notification(
            user_id=recipient_id,
            message=msg,
            link=f"/guidance/{task.guidance_id}" # Link para o front saber onde ir
        )
        db.add(new_notif)
        db.commit()
    
    # Retorna o comentário criado
    return schemas.CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        created_at=db_comment.created_at,
        user_name=current_user.name,
        user_id=current_user.id
    )