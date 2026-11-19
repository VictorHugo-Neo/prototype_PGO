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
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    guidance = task.guidance
    comments = db.query(models.Comment).filter(models.Comment.task_id == task_id).all()

    def get_user_role(u_id: int) -> str | None:
        if not guidance:
            return None
        if u_id == guidance.advisor_id:
            return "advisor"
        if u_id == guidance.coadvisor_id:
            return "coadvisor"
        if u_id == guidance.student_id:
            return "student"
        return None
    
    return [
        schemas.CommentResponse(
            id=c.id,
            content=c.content,
            created_at=c.created_at,
            user_name=c.user.name,
            user_id=c.user.id,
            user_role=get_user_role(c.user.id)
        ) for c in comments
    ]

@router.post("/", response_model=schemas.CommentResponse)
def create_comment(
    comment: schemas.CommentCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(deps.get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == comment.task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Tarefa não encontrada")

    guidance = task.guidance
    if guidance and current_user.id not in (guidance.advisor_id, guidance.coadvisor_id, guidance.student_id):
        raise HTTPException(status_code=403, detail="Você não tem permissão para comentar nesta tarefa")

    db_comment = models.Comment(
        content=comment.content,
        task_id=comment.task_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    role = "student" if (guidance and current_user.id == guidance.student_id) else (
        "coadvisor" if (guidance and current_user.id == guidance.coadvisor_id) else "advisor"
    )
    role_label = "Aluno" if role == "student" else ("Coorientador" if role == "coadvisor" else "Orientador")
    msg = f"{role_label} {current_user.name} comentou na tarefa: {task.title}"

    if guidance:
        participants = {guidance.advisor_id, guidance.student_id}
        if guidance.coadvisor_id:
            participants.add(guidance.coadvisor_id)
        recipients = participants - {current_user.id}
        for recipient_id in recipients:
            if recipient_id:
                db.add(models.Notification(
                    user_id=recipient_id,
                    message=msg,
                    link=f"/guidance/{task.guidance_id}"
                ))
        db.commit()

    return schemas.CommentResponse(
        id=db_comment.id,
        content=db_comment.content,
        created_at=db_comment.created_at,
        user_name=current_user.name,
        user_id=current_user.id,
        user_role=role
    )