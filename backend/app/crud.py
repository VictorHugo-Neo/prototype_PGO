from sqlalchemy.orm import Session
from . import models, schemas

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        name=user.name,
        email=user.email,
        type=user.type
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_guidance(db: Session, guidance_date: dict):
    db_guidance = models.Guidance(**guidance_date)
    db.add(db_guidance)
    db.commit()
    db.refresh(db_guidance)
    return db_guidance

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(**task.model_dumb())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task_by_guidance(db: Session, guidance_id: int):
    return db.query(models.Task).filter(models.Task.guidance_id == guidance_id).all()

def update_status_task(db: Session, task_id: int, new_status: models.StatusTask):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if task:
        task.status = new_status
        db.commit()
        db.refresh(task)
    return task 