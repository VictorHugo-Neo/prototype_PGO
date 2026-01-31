from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, deps
from ..database import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Pega as últimas 20 notificações do usuário logado
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .limit(20)\
        .all()

@router.patch("/{id}/read")
def mark_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    notif = db.query(models.Notification)\
        .filter(models.Notification.id == id, models.Notification.user_id == current_user.id)\
        .first()
    
    if not notif:
        raise HTTPException(status_code=404, detail="Notificação não encontrada")
    
    notif.read = True
    db.commit()
    return {"ok": True}