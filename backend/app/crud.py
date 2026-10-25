import re
import unicodedata
from sqlalchemy.orm import Session, joinedload
from . import models, schemas, security
from .security import get_password_hash

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

def create_task(db: Session, task: schemas.TaskCreate, creator_id: int | None = None):
    columns = get_kanban_columns_by_guidance(db, task.guidance_id)
    valid_slugs = {c.slug for c in columns}
    task_dict = task.model_dump()
    if creator_id is not None:
        task_dict["creator_id"] = creator_id
    elif task_dict.get("creator_id") is None and getattr(task, "creator_id", None) is not None:
        task_dict["creator_id"] = task.creator_id
    if task_dict.get("status") not in valid_slugs and columns:
        task_dict["status"] = columns[0].slug
    db_task = models.Task(**task_dict)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def get_task_by_id(db: Session, task_id: int):
    return (
        db.query(models.Task)
        .options(joinedload(models.Task.creator))
        .filter(models.Task.id == task_id)
        .first()
    )

def get_task_by_guidance(db: Session, guidance_id: int):
    columns = get_kanban_columns_by_guidance(db, guidance_id)
    valid_slugs = {c.slug for c in columns}
    tasks = (
        db.query(models.Task)
        .options(joinedload(models.Task.creator))
        .filter(models.Task.guidance_id == guidance_id)
        .order_by(models.Task.order.asc(), models.Task.id.asc())
        .all()
    )

    needs_commit = False
    if columns:
        first_slug = columns[0].slug
        for t in tasks:
            if t.status not in valid_slugs:
                t.status = first_slug
                needs_commit = True
    if needs_commit:
        db.commit()
        for t in tasks:
            db.refresh(t)

    return tasks

def update_task(db: Session, task_id: int, task_data: dict):
    task = get_task_by_id(db, task_id)
    if not task:
        return None
    for field, value in task_data.items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task

def update_status_task(db: Session, task_id: int, new_status: str):
    task = get_task_by_id(db, task_id)
    if task:
        task.status = str(new_status)
        db.commit()
        db.refresh(task)
    return task

def generate_column_slug(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    cleaned = re.sub(r'[^\w\s-]', '', normalized).strip().lower()
    slug = re.sub(r'[-\s]+', '_', cleaned)
    return slug or "coluna"

def get_kanban_columns_by_guidance(db: Session, guidance_id: int):
    columns = db.query(models.KanbanColumn).filter(
        models.KanbanColumn.guidance_id == guidance_id
    ).order_by(models.KanbanColumn.order.asc(), models.KanbanColumn.id.asc()).all()

    if not columns:
        default_columns = [
            models.KanbanColumn(guidance_id=guidance_id, title="A Fazer", slug="pending", color="bg-gray-100", order=0),
            models.KanbanColumn(guidance_id=guidance_id, title="Em Andamento", slug="in_progress", color="bg-blue-50", order=1),
            models.KanbanColumn(guidance_id=guidance_id, title="Concluído", slug="completed", color="bg-green-50", order=2),
        ]
        db.add_all(default_columns)
        db.commit()
        for col in default_columns:
            db.refresh(col)
        return default_columns

    return columns

def create_kanban_column(db: Session, guidance_id: int, column_in: schemas.KanbanColumnCreate):
    existing_columns = get_kanban_columns_by_guidance(db, guidance_id)
    base_slug = generate_column_slug(column_in.title)
    existing_slugs = {c.slug for c in existing_columns}
    
    slug = base_slug
    counter = 2
    while slug in existing_slugs:
        slug = f"{base_slug}_{counter}"
        counter += 1

    if column_in.order is not None:
        col_order = column_in.order
    else:
        col_order = max([c.order for c in existing_columns], default=-1) + 1

    db_column = models.KanbanColumn(
        guidance_id=guidance_id,
        title=column_in.title.strip(),
        slug=slug,
        color=column_in.color or "bg-purple-50",
        order=col_order,
    )
    db.add(db_column)
    db.commit()
    db.refresh(db_column)
    return db_column

def get_kanban_column_by_id(db: Session, column_id: int):
    return db.query(models.KanbanColumn).filter(models.KanbanColumn.id == column_id).first()

def update_kanban_column(db: Session, column_id: int, column_in: schemas.KanbanColumnUpdate):
    column = get_kanban_column_by_id(db, column_id)
    if not column:
        return None
    
    update_data = column_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            if field == "title":
                value = value.strip()
            setattr(column, field, value)
    
    db.commit()
    db.refresh(column)
    return column

def reorder_kanban_columns(db: Session, guidance_id: int, column_ids: list[int]):
    columns = db.query(models.KanbanColumn).filter(
        models.KanbanColumn.guidance_id == guidance_id
    ).all()
    col_map = {col.id: col for col in columns}

    for new_order, col_id in enumerate(column_ids):
        if col_id in col_map:
            col_map[col_id].order = new_order

    db.commit()
    return get_kanban_columns_by_guidance(db, guidance_id)

def delete_kanban_column(db: Session, column_id: int, target_column_id: int | None = None):
    column = get_kanban_column_by_id(db, column_id)
    if not column:
        return False, "Coluna não encontrada."
    
    total_columns = db.query(models.KanbanColumn).filter(
        models.KanbanColumn.guidance_id == column.guidance_id
    ).count()

    if total_columns <= 1:
        return False, "Não é possível excluir todas as colunas. O quadro deve possuir pelo menos uma coluna."

    tasks_count = db.query(models.Task).filter(
        models.Task.guidance_id == column.guidance_id,
        models.Task.status == column.slug
    ).count()

    if tasks_count > 0:
        if not target_column_id:
            return False, "Mova as tarefas antes de excluí-la ou informe a etapa de destino."

        if target_column_id == column_id:
            return False, "A etapa de destino não pode ser a mesma coluna a ser excluída."

        target_column = get_kanban_column_by_id(db, target_column_id)
        if not target_column or target_column.guidance_id != column.guidance_id:
            return False, "Etapa de destino inválida."

        db.query(models.Task).filter(
            models.Task.guidance_id == column.guidance_id,
            models.Task.status == column.slug
        ).update({models.Task.status: target_column.slug}, synchronize_session="fetch")

    db.delete(column)
    db.commit()
    return True, None

def delete_task(db: Session, task_id: int):
    task = get_task_by_id(db, task_id)
    if not task:
        return False
    db.delete(task)
    db.commit()
    return True 

def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    if user_update.name:
        db_user.name = user_update.name
    if user_update.email:
        db_user.email = user_update.email
    if user_update.password:
        db_user.hashed_password = security.get_password_hash(user_update.password)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email=email)
    if not user:
        return False
    
    if not security.verify_password(password, user.hashed_password):
        return False
    
    return user


def create_meeting(db: Session, meeting: schemas.MeetingCreate):
    db_meeting = models.Meeting(
        date=meeting.date,
        topic=meeting.topic,
        guidance_id=meeting.guidance_id,
        status="pending"
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def get_meeting_by_id(db: Session, meeting_id: int):
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()


def get_meetings_by_guidance(db: Session, guidance_id: int):
    return (
        db.query(models.Meeting)
        .filter(models.Meeting.guidance_id == guidance_id)
        .order_by(models.Meeting.date.asc())
        .all()
    )


def update_meeting(db: Session, meeting_id: int, meeting_data: dict):
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        return None
    for field, value in meeting_data.items():
        if value is not None:
            setattr(meeting, field, value)
    db.commit()
    db.refresh(meeting)
    return meeting


def update_meeting_status(db: Session, meeting_id: int, status: str):
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        return None
    meeting.status = status
    db.commit()
    db.refresh(meeting)
    return meeting


def delete_meeting(db: Session, meeting_id: int):
    meeting = get_meeting_by_id(db, meeting_id)
    if not meeting:
        return False
    db.delete(meeting)
    db.commit()
    return True
