import time
import logging
import hashlib
from typing import Dict, Any, Optional
from datetime import datetime
from ..schemas import NotificationRequest, CustomNotificationRequest, NotificationResponse
from ..providers.base import WhatsAppProvider

logger = logging.getLogger("whatsapp_notifier.service")

class NotificationService:
    def __init__(self, provider: WhatsAppProvider, idempotency_ttl_seconds: int = 86400):
        self.provider = provider
        self.idempotency_ttl_seconds = idempotency_ttl_seconds
        self._sent_cache: Dict[str, float] = {}
        
        self.total_processed = 0
        self.total_sent = 0
        self.total_skipped = 0
        self.total_failed = 0

    def _generate_idempotency_key(self, req: NotificationRequest) -> str:
        clean_phone = "".join(filter(str.isdigit, req.student_phone))
        return f"{req.task_id}_{clean_phone}_{req.due_date[:10]}"

    def _generate_custom_idempotency_key(self, req: CustomNotificationRequest) -> str:
        if req.idempotency_key and req.idempotency_key.strip():
            return req.idempotency_key.strip()
        clean_phone = "".join(filter(str.isdigit, req.student_phone))
        msg_hash = hashlib.sha256(req.message.strip().encode("utf-8")).hexdigest()[:12]
        return f"custom_{clean_phone}_{msg_hash}"

    def _is_duplicate(self, key: str) -> bool:
        now = time.time()
        self._sent_cache = {
            k: ts for k, ts in self._sent_cache.items()
            if now - ts < self.idempotency_ttl_seconds
        }
        return key in self._sent_cache

    def format_message(self, req: NotificationRequest) -> str:
        urgency_emojis = {
            "warning": "⚠️",
            "urgent": "🚨",
            "overdue": "⏰",
        }
        emoji = urgency_emojis.get(req.urgency_level or "warning", "⚠️")
        
        theme_line = f"no tema *{req.guidance_theme}*" if req.guidance_theme else "do seu TCC"
        
        return (
            f"🔔 *PGO - Lembrete de Tarefa*\n\n"
            f"Olá, *{req.student_name}*!\n\n"
            f"{emoji} Sua atividade *\"{req.task_title}\"* {theme_line} "
            f"está se aproximando do limite de conclusão:\n"
            f"📅 *Prazo: {req.due_date}*\n\n"
            f"Acesse o seu quadro Kanban no PGO para atualizar o status e manter o cronograma em dia com seu orientador!\n"
            f"👉 https://pgo.edu.br"
        )

    def format_custom_message(self, req: CustomNotificationRequest) -> str:
        title_block = f"📌 *{req.title.strip()}*\n\n" if req.title and req.title.strip() else ""
        theme_block = f"📚 Orientação: *{req.guidance_theme.strip()}*\n\n" if req.guidance_theme and req.guidance_theme.strip() else ""

        return (
            f"🔔 *PGO - Notificação da Orientação*\n\n"
            f"Olá, *{req.student_name}*! Seu orientador *{req.advisor_name}* enviou uma notificação:\n\n"
            f"{title_block}"
            f"{req.message.strip()}\n\n"
            f"{theme_block}"
            f"Acesse a plataforma PGO para responder ou conferir suas atividades:\n"
            f"👉 https://pgo.edu.br"
        )

    async def notify_deadline(self, req: NotificationRequest) -> NotificationResponse:
        self.total_processed += 1
        key = self._generate_idempotency_key(req)

        if self._is_duplicate(key):
            self.total_skipped += 1
            return NotificationResponse(
                success=True,
                message_id=f"duplicate_{key}",
                recipient=req.student_phone,
                status="skipped_duplicate",
                detail="Mensagem já enviada nas últimas 24h para este prazo.",
            )

        message_text = self.format_message(req)
        result = await self.provider.send_message(req.student_phone, message_text)

        if result.get("success"):
            self._sent_cache[key] = time.time()
            self.total_sent += 1
            return NotificationResponse(
                success=True,
                message_id=result.get("message_id", "msg_ok"),
                recipient=req.student_phone,
                status="sent",
                detail="Notificação despachada com sucesso.",
            )
        else:
            self.total_failed += 1
            return NotificationResponse(
                success=False,
                message_id="",
                recipient=req.student_phone,
                status="failed",
                detail=result.get("error", "Falha no envio da mensagem."),
            )

    async def notify_custom(self, req: CustomNotificationRequest) -> NotificationResponse:
        self.total_processed += 1
        key = self._generate_custom_idempotency_key(req)

        if self._is_duplicate(key):
            self.total_skipped += 1
            return NotificationResponse(
                success=True,
                message_id=f"duplicate_{key}",
                recipient=req.student_phone,
                status="skipped_duplicate",
                detail="Mensagem idêntica já enviada recentemente para este destinatário.",
            )

        message_text = self.format_custom_message(req)
        result = await self.provider.send_message(req.student_phone, message_text)

        if result.get("success"):
            self._sent_cache[key] = time.time()
            self.total_sent += 1
            return NotificationResponse(
                success=True,
                message_id=result.get("message_id", "msg_ok"),
                recipient=req.student_phone,
                status="sent",
                detail="Notificação despachada com sucesso via WhatsApp.",
            )
        else:
            self.total_failed += 1
            return NotificationResponse(
                success=False,
                message_id="",
                recipient=req.student_phone,
                status="failed",
                detail=result.get("error", "Falha no envio da mensagem."),
            )
