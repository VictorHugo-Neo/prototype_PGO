import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import httpx
from sqlalchemy.orm import Session
from ..config import settings
from .. import models

logger = logging.getLogger("backend.services.whatsapp_client")

def is_whatsapp_service_online() -> bool:
    try:
        with httpx.Client(timeout=1.5) as client:
            response = client.get(f"{settings.WHATSAPP_SERVICE_URL.rstrip('/')}/health/live")
            return response.status_code == 200
    except Exception as exc:
        logger.debug("Microserviço WhatsApp inacessível: %s", exc)
        return False

def dispatch_whatsapp_notification(
    task_id: int,
    task_title: str,
    student_name: str,
    student_phone: str,
    due_date_str: str,
    guidance_theme: Optional[str] = None,
    urgency_level: str = "warning",
) -> Dict[str, Any]:
    if not student_phone or not student_phone.strip():
        logger.info("Aluno %s não possui telefone cadastrado. WhatsApp ignorado.", student_name)
        return {"success": False, "reason": "no_phone"}

    payload = {
        "task_id": task_id,
        "task_title": task_title,
        "student_name": student_name,
        "student_phone": student_phone,
        "due_date": due_date_str,
        "guidance_theme": guidance_theme or "Orientação Acadêmica",
        "urgency_level": urgency_level,
    }

    url = f"{settings.WHATSAPP_SERVICE_URL.rstrip('/')}/notify/deadline"

    try:
        with httpx.Client(timeout=settings.WHATSAPP_TIMEOUT_SECONDS) as client:
            response = client.post(url, json=payload)
            if response.status_code == 200:
                data = response.json()
                logger.info(
                    "WhatsApp notificado com sucesso para tarefa %s (status: %s)",
                    task_id, data.get("status")
                )
                return {"success": True, "data": data}
            else:
                logger.warning(
                    "Microserviço WhatsApp retornou HTTP %s para tarefa %s: %s",
                    response.status_code, task_id, response.text
                )
                return {"success": False, "status_code": response.status_code}
    except (httpx.ConnectError, httpx.TimeoutException) as exc:
        logger.warning(
            "Microserviço WhatsApp indisponível ou timeout (%s). Operação prossegue normalmente.",
            exc.__class__.__name__
        )
        return {"success": False, "reason": "service_unavailable"}
    except Exception as exc:
        logger.error("Erro inesperado ao contactar microserviço WhatsApp: %s", exc)
        return {"success": False, "reason": "unexpected_error", "error": str(exc)}

def check_and_notify_upcoming_deadlines(
    db: Session,
    hours_ahead: int = 48,
    guidance_id: Optional[int] = None,
) -> Dict[str, Any]:
    now = datetime.utcnow()
    deadline_threshold = now + timedelta(hours=hours_ahead)

    query = db.query(models.Task).filter(
        models.Task.status != "completed",
        models.Task.time_estimate.isnot(None),
        models.Task.time_estimate <= deadline_threshold,
    )

    if guidance_id:
        query = query.filter(models.Task.guidance_id == guidance_id)

    tasks_to_notify: List[models.Task] = query.all()

    processed_count = 0
    notified_count = 0
    skipped_no_phone = 0
    failed_count = 0

    for task in tasks_to_notify:
        processed_count += 1
        guidance = task.guidance
        if not guidance or not guidance.student:
            continue

        student = guidance.student
        due_date_str = task.time_estimate.strftime("%d/%m/%Y às %H:%M") if task.time_estimate else "Em breve"

        urgency = "warning"
        if task.time_estimate and task.time_estimate < now:
            urgency = "overdue"
        elif task.time_estimate and task.time_estimate <= now + timedelta(hours=12):
            urgency = "urgent"

        if student.phone:
            dispatch_result = dispatch_whatsapp_notification(
                task_id=task.id,
                task_title=task.title,
                student_name=student.name,
                student_phone=student.phone,
                due_date_str=due_date_str,
                guidance_theme=guidance.theme,
                urgency_level=urgency,
            )
            if dispatch_result.get("success"):
                notified_count += 1
            else:
                failed_count += 1
        else:
            skipped_no_phone += 1

        internal_msg = f"A tarefa '{task.title}' vence em {due_date_str}."
        existing_notif = db.query(models.Notification).filter(
            models.Notification.user_id == student.id,
            models.Notification.message == internal_msg,
        ).first()

        if not existing_notif:
            db.add(models.Notification(
                user_id=student.id,
                message=internal_msg,
                link=f"/guidance/{guidance.id}",
            ))

    db.commit()

    return {
        "tasks_analyzed": processed_count,
        "whatsapp_dispatched": notified_count,
        "skipped_no_phone": skipped_no_phone,
        "service_online": is_whatsapp_service_online(),
    }
