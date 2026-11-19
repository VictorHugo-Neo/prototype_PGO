import uuid
import logging
from typing import Dict, Any
from .base import WhatsAppProvider

logger = logging.getLogger("whatsapp_notifier.mock")

class MockWhatsAppProvider(WhatsAppProvider):
    def __init__(self):
        self.sent_messages: list[Dict[str, Any]] = []

    async def send_message(self, phone: str, message: str) -> Dict[str, Any]:
        msg_id = f"mock_{uuid.uuid4().hex[:12]}"
        record = {
            "message_id": msg_id,
            "phone": phone,
            "message": message,
            "provider": "mock",
            "status": "delivered",
        }
        self.sent_messages.append(record)
        
        logger.info(
            "\n%s\n[MOCK WHATSAPP DISPATCHED]\nPara: %s\nID: %s\nConteúdo:\n%s\n%s",
            "=" * 50,
            phone,
            msg_id,
            message,
            "=" * 50,
        )
        return {
            "success": True,
            "message_id": msg_id,
            "provider": "mock",
            "status": "sent",
        }

    async def check_health(self) -> bool:
        return True
