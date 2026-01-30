from sqlalchemy.orm import Session
from . import models, schemas, security
from .security import get_password_hash
from . import utils

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pwd = get_password_hash(user.password)
    db_user = models.User(
        name=user.name,
        email=user.email,
        type=user.type,
        hashed_password=hashed_pwd
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
    db_task = models.Task(**task.model_dump())
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

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    if user_update.name:
        db_user.name = user_update.name
    if user_update.email:
        db_user.email = user_update.email
    if user_update.password:
        db_user.hashed_password = utils.get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    # Busca o usuário pelo email
    user = get_user_by_email(db, email=email)
    if not user:
        return False
    
    # Verifica se a senha bate com o hash salvo
    if not security.verify_password(password, user.hashed_password):
        return False
    
    return user