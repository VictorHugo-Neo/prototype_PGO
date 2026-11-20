from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from .. import models, schemas, deps
from ..database import get_db
from ..services.whatsapp_client import dispatch_whatsapp_custom_message

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[schemas.NotificationResponse])
def get_my_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    notifications = db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .limit(30)\
        .all()
    
    sender_ids = {n.sender_id for n in notifications if n.sender_id}
    senders = {}
    if sender_ids:
        users = db.query(models.User).filter(models.User.id.in_(sender_ids)).all()
        senders = {u.id: u.name for u in users}

    result = []
    for n in notifications:
        result.append(schemas.NotificationResponse(
            id=n.id,
            message=n.message,
            read=n.read,
            created_at=n.created_at,
            link=n.link,
            sender_id=n.sender_id,
            sender_name=senders.get(n.sender_id) if n.sender_id else None,
            title=n.title,
            channel=n.channel,
        ))
    return result

@router.patch("/read-all")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id, models.Notification.read.is_(False))\
        .update({"read": True}, synchronize_session=False)
    db.commit()
    return {"ok": True}

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

@router.get("/sent", response_model=List[schemas.NotificationResponse])
def get_sent_notifications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas orientadores podem consultar notificações enviadas.")

    notifications = db.query(models.Notification)\
        .filter(models.Notification.sender_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .limit(50)\
        .all()

    return [
        schemas.NotificationResponse(
            id=n.id,
            message=n.message,
            read=n.read,
            created_at=n.created_at,
            link=n.link,
            sender_id=n.sender_id,
            sender_name=current_user.name,
            title=n.title,
            channel=n.channel,
        )
        for n in notifications
    ]

@router.post("/send", response_model=schemas.NotificationSendSummaryResponse)
def send_notification(
    payload: schemas.NotificationSendRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Apenas orientadores podem criar e enviar notificações.")

    if not payload.message or not payload.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="A mensagem não pode ser vazia.")

    guidances = db.query(models.Guidance)\
        .filter(
            or_(
                models.Guidance.advisor_id == current_user.id,
                models.Guidance.coadvisor_id == current_user.id
            )
        )\
        .all()

    student_guidance_map = {}
    for g in guidances:
        if g.student and g.student_id:
            student_guidance_map[g.student_id] = (g.student, g)

    if not student_guidance_map:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Você não possui nenhum orientando vinculado no momento.")

    target_pairs = []
    if payload.target_type == "individual":
        if not payload.student_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Identificador do estudante é obrigatório para envio individual.")
        
        pair = student_guidance_map.get(payload.student_id)
        if not pair:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="O aluno informado não faz parte das suas orientações.")
        target_pairs.append(pair)
    elif payload.target_type == "all":
        target_pairs = list(student_guidance_map.values())
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tipo de destinatário inválido. Escolha 'individual' ou 'all'.")

    results: List[schemas.RecipientDispatchResult] = []
    clean_message = payload.message.strip()
    clean_title = payload.title.strip() if payload.title and payload.title.strip() else None

    for student, guidance in target_pairs:
        platform_success = False
        whatsapp_success = False
        whatsapp_skipped = False
        whatsapp_error = None

        if payload.channel in ("platform", "both"):
            notif = models.Notification(
                user_id=student.id,
                sender_id=current_user.id,
                title=clean_title,
                message=clean_message,
                channel=payload.channel,
                link=f"/guidance/{guidance.id}",
            )
            db.add(notif)
            platform_success = True

        if payload.channel in ("whatsapp", "both"):
            if student.phone and student.phone.strip():
                wp_res = dispatch_whatsapp_custom_message(
                    advisor_name=current_user.name,
                    student_name=student.name,
                    student_phone=student.phone,
                    message=clean_message,
                    title=clean_title,
                    guidance_theme=guidance.theme,
                )
                if wp_res.get("success"):
                    whatsapp_success = True
                else:
                    whatsapp_error = wp_res.get("error") or wp_res.get("reason") or "Falha no envio do WhatsApp"
            else:
                whatsapp_skipped = True

        results.append(schemas.RecipientDispatchResult(
            student_id=student.id,
            student_name=student.name,
            student_phone=student.phone,
            platform_success=platform_success,
            whatsapp_success=whatsapp_success,
            whatsapp_skipped_no_phone=whatsapp_skipped,
            whatsapp_error=whatsapp_error,
        ))

    db.commit()

    platform_count = sum(1 for r in results if r.platform_success)
    whatsapp_count = sum(1 for r in results if r.whatsapp_success)
    whatsapp_skipped_count = sum(1 for r in results if r.whatsapp_skipped_no_phone)
    whatsapp_failed_count = sum(
        1 for r in results
        if not r.whatsapp_success and not r.whatsapp_skipped_no_phone and payload.channel in ("whatsapp", "both")
    )

    return schemas.NotificationSendSummaryResponse(
        total_targeted=len(results),
        platform_count=platform_count,
        whatsapp_count=whatsapp_count,
        whatsapp_skipped_no_phone_count=whatsapp_skipped_count,
        whatsapp_failed_count=whatsapp_failed_count,
        results=results,
    )


@router.get("/whatsapp-status")
def get_whatsapp_status(
    current_user: models.User = Depends(deps.get_current_user),
):
    from ..services.whatsapp_client import is_whatsapp_service_online
    from ..config import settings
    return {
        "online": is_whatsapp_service_online(),
        "service_url": getattr(settings, "WHATSAPP_SERVICE_URL", "http://localhost:8001"),
        "api_url": getattr(settings, "WHATSAPP_API_URL", "http://localhost:8080"),
        "instance_id": getattr(settings, "WHATSAPP_INSTANCE_ID", "pgo"),
        "provider": getattr(settings, "WHATSAPP_PROVIDER", "evolution"),
    }


@router.post("/notify-deadlines")
def notify_deadlines(
    guidance_id: int | None = None,
    hours_ahead: int = 48,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user),
):
    if current_user.type != models.TypeUser.ADVISOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Apenas orientadores podem disparar notificações de prazos."
        )

    if guidance_id:
        guidance = db.query(models.Guidance).filter(models.Guidance.id == guidance_id).first()
        if not guidance:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Orientação não encontrada.")
        if guidance.advisor_id != current_user.id and guidance.coadvisor_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Você não tem acesso a esta orientação.")

    from ..services.whatsapp_client import check_and_notify_upcoming_deadlines
    return check_and_notify_upcoming_deadlines(db, hours_ahead=hours_ahead, guidance_id=guidance_id)

