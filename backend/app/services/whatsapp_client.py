import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
import httpx
from sqlalchemy.orm import Session
from ..config import settings
from .. import models

logger = logging.getLogger("backend.services.whatsapp_client")


def normalize_phone_number(phone: str) -> str:
    cleaned = "".join(filter(str.isdigit, phone or ""))
    if cleaned.startswith("0"):
        cleaned = cleaned.lstrip("0")
    if len(cleaned) in (10, 11) and not cleaned.startswith("55"):
        cleaned = f"55{cleaned}"
    return cleaned


def format_deadline_message(
    task_title: str,
    student_name: str,
    due_date_str: str,
    guidance_theme: Optional[str] = None,
    urgency_level: str = "warning",
) -> str:
    urgency_emojis = {
        "warning": "⚠️",
        "urgent": "🚨",
        "overdue": "⏰",
    }
    emoji = urgency_emojis.get(urgency_level or "warning", "⚠️")
    theme_line = f"no tema *{guidance_theme}*" if guidance_theme else "do seu TCC"
    return (
        f"🔔 *PGO - Lembrete de Tarefa*\n\n"
        f"Olá, *{student_name}*!\n\n"
        f"{emoji} Sua atividade *\"{task_title}\"* {theme_line} "
        f"está se aproximando do limite de conclusão:\n"
        f"📅 *Prazo: {due_date_str}*\n\n"
        f"Acesse o seu quadro Kanban no PGO para atualizar o status e manter o cronograma em dia com seu orientador!\n"
        f"👉 https://pgo.edu.br"
    )


def format_custom_message(
    advisor_name: str,
    student_name: str,
    message: str,
    title: Optional[str] = None,
    guidance_theme: Optional[str] = None,
) -> str:
    title_block = f"📌 *{title.strip()}*\n\n" if title and title.strip() else ""
    theme_block = f"📚 Orientação: *{guidance_theme.strip()}*\n\n" if guidance_theme and guidance_theme.strip() else ""
    return (
        f"🔔 *PGO - Notificação da Orientação*\n\n"
        f"Olá, *{student_name}*! Seu orientador *{advisor_name}* enviou uma notificação:\n\n"
        f"{title_block}"
        f"{message.strip()}\n\n"
        f"{theme_block}"
        f"Acesse a plataforma PGO para responder ou conferir suas atividades:\n"
        f"👉 https://pgo.edu.br"
    )


def send_evolution_api_direct(phone: str, message: str) -> Dict[str, Any]:
    cleaned_phone = normalize_phone_number(phone)
    if not cleaned_phone:
        return {"success": False, "reason": "no_phone"}

    api_url = getattr(settings, "WHATSAPP_API_URL", "").rstrip("/")
    if not api_url:
        return {"success": False, "reason": "no_evolution_url"}

    api_key = getattr(settings, "WHATSAPP_API_KEY", "")
    instance_id = getattr(settings, "WHATSAPP_INSTANCE_ID", "pgo")
    timeout = getattr(settings, "WHATSAPP_TIMEOUT_SECONDS", 5.0)

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["apikey"] = api_key
        headers["Authorization"] = f"Bearer {api_key}"

    payload = {"number": cleaned_phone, "text": message}
    url = f"{api_url}/message/sendText/{instance_id}"

    try:
        with httpx.Client(timeout=timeout) as client:
            response = client.post(url, json=payload, headers=headers)
            if response.status_code in (200, 201):
                data = response.json()
                msg_id = (
                    data.get("key", {}).get("id")
                    or data.get("id")
                    or data.get("messageId")
                    or "evolution_msg_ok"
                )
                logger.info(
                    "WhatsApp despachado com sucesso via Evolution API direto para %s (ID: %s)",
                    cleaned_phone,
                    msg_id,
                )
                return {
                    "success": True,
                    "data": data,
                    "message_id": str(msg_id),
                    "provider": "evolution_direct",
                }
            else:
                err_msg = f"HTTP {response.status_code}: {response.text}"
                logger.warning("Falha ao despachar via Evolution API direto (%s): %s", url, err_msg)
                return {"success": False, "status_code": response.status_code, "error": err_msg}
    except Exception as exc:
        logger.warning("Erro ao contactar Evolution API direto: %s", exc)
        return {"success": False, "reason": "service_unavailable", "error": str(exc)}


def is_whatsapp_service_online() -> bool:
    # 1. Tentar microserviço notifier
    service_url = getattr(settings, "WHATSAPP_SERVICE_URL", "").rstrip("/")
    if service_url:
        try:
            with httpx.Client(timeout=1.5) as client:
                response = client.get(f"{service_url}/health/live")
                if response.status_code == 200:
                    return True
        except Exception:
            pass

    # 2. Tentar diretamente Evolution API
    api_url = getattr(settings, "WHATSAPP_API_URL", "").rstrip("/")
    if api_url:
        api_key = getattr(settings, "WHATSAPP_API_KEY", "")
        instance_id = getattr(settings, "WHATSAPP_INSTANCE_ID", "pgo")
        headers = {}
        if api_key:
            headers["apikey"] = api_key
            headers["Authorization"] = f"Bearer {api_key}"
        try:
            with httpx.Client(timeout=2.0) as client:
                res = client.get(f"{api_url}/instance/connectionState/{instance_id}", headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    state = data.get("instance", {}).get("state") or data.get("state")
                    return state == "open"
                root_res = client.get(f"{api_url}/", headers=headers)
                return root_res.status_code == 200
        except Exception:
            pass

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

    service_url = getattr(settings, "WHATSAPP_SERVICE_URL", "").rstrip("/")
    if service_url:
        url = f"{service_url}/notify/deadline"
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
        except (httpx.ConnectError, httpx.TimeoutException):
            logger.info("Microserviço em %s inacessível. Tentando envio direto via Evolution API...", service_url)
        except Exception as exc:
            logger.error("Erro inesperado ao contactar microserviço WhatsApp: %s", exc)

    # Fallback direto via Evolution API
    formatted_msg = format_deadline_message(
        task_title=task_title,
        student_name=student_name,
        due_date_str=due_date_str,
        guidance_theme=guidance_theme,
        urgency_level=urgency_level,
    )
    direct_res = send_evolution_api_direct(student_phone, formatted_msg)
    if direct_res.get("success"):
        return direct_res
    return direct_res if "error" in direct_res else {"success": False, "reason": "service_unavailable"}


def dispatch_whatsapp_custom_message(
    advisor_name: str,
    student_name: str,
    student_phone: str,
    message: str,
    title: Optional[str] = None,
    guidance_theme: Optional[str] = None,
) -> Dict[str, Any]:
    if not student_phone or not student_phone.strip():
        logger.info("Aluno %s não possui telefone cadastrado. WhatsApp ignorado.", student_name)
        return {"success": False, "reason": "no_phone"}

    payload = {
        "advisor_name": advisor_name,
        "student_name": student_name,
        "student_phone": student_phone,
        "message": message,
        "title": title,
        "guidance_theme": guidance_theme,
    }

    service_url = getattr(settings, "WHATSAPP_SERVICE_URL", "").rstrip("/")
    if service_url:
        url = f"{service_url}/notify/custom"
        try:
            with httpx.Client(timeout=settings.WHATSAPP_TIMEOUT_SECONDS) as client:
                response = client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    logger.info("WhatsApp custom enviado com sucesso para %s via microserviço", student_name)
                    return {"success": True, "data": data}
                else:
                    logger.warning("Microserviço retornou HTTP %s para %s: %s", response.status_code, student_name, response.text)
        except (httpx.ConnectError, httpx.TimeoutException):
            logger.info("Microserviço em %s inacessível. Tentando envio direto via Evolution API...", service_url)
        except Exception as exc:
            logger.error("Erro inesperado ao contactar microserviço WhatsApp: %s", exc)

    # Fallback direto via Evolution API
    formatted_msg = format_custom_message(
        advisor_name=advisor_name,
        student_name=student_name,
        message=message,
        title=title,
        guidance_theme=guidance_theme,
    )
    direct_res = send_evolution_api_direct(student_phone, formatted_msg)
    if direct_res.get("success"):
        return direct_res
    return direct_res if "error" in direct_res else {"success": False, "reason": "service_unavailable"}


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
        "failed_dispatched": failed_count,
        "service_online": is_whatsapp_service_online(),
    }
