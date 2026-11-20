import logging
import httpx
from typing import Dict, Any
from .base import WhatsAppProvider

logger = logging.getLogger("whatsapp_notifier.webhook")

class WebhookWhatsAppProvider(WhatsAppProvider):
    def __init__(self, api_url: str, api_key: str = "", instance_id: str = "", timeout: float = 5.0):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.instance_id = instance_id.strip() if instance_id else ""
        self.timeout = timeout

    async def send_message(self, phone: str, message: str) -> Dict[str, Any]:
        cleaned_phone = "".join(filter(str.isdigit, phone))
        if len(cleaned_phone) in (10, 11) and not cleaned_phone.startswith("55"):
            cleaned_phone = f"55{cleaned_phone}"

        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["apikey"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "number": cleaned_phone,
            "text": message,
            "message": message,
        }

        url = f"{self.api_url}/message/sendText/{self.instance_id}" if self.instance_id else f"{self.api_url}/message/sendText"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    url,
                    json=payload,
                    headers=headers,
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "success": True,
                    "message_id": str(data.get("id") or data.get("key", {}).get("id") or "external_id"),
                    "provider": "webhook",
                    "status": "sent",
                }
        except Exception as exc:
            logger.error("Erro ao despachar WhatsApp via gateway externo: %s", exc)
            return {
                "success": False,
                "message_id": "",
                "provider": "webhook",
                "status": "failed",
                "error": str(exc),
            }

    async def check_health(self) -> bool:
        if not self.api_url:
            return False
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.api_url}/health")
                return res.status_code == 200
        except Exception:
            return False
