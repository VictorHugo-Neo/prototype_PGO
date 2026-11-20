import logging
import httpx
from typing import Dict, Any
from .base import WhatsAppProvider

logger = logging.getLogger("whatsapp_notifier.evolution")

def normalize_phone_number(phone: str) -> str:
    cleaned = "".join(filter(str.isdigit, phone or ""))
    if cleaned.startswith("0"):
        cleaned = cleaned.lstrip("0")
    if len(cleaned) in (10, 11) and not cleaned.startswith("55"):
        cleaned = f"55{cleaned}"
    return cleaned

class EvolutionWhatsAppProvider(WhatsAppProvider):
    def __init__(
        self,
        api_url: str,
        api_key: str = "",
        instance_id: str = "pgo",
        timeout: float = 8.0,
    ):
        self.api_url = api_url.rstrip("/")
        self.api_key = api_key
        self.instance_id = instance_id.strip() if instance_id else "pgo"
        self.timeout = timeout

    async def send_message(self, phone: str, message: str) -> Dict[str, Any]:
        cleaned_phone = normalize_phone_number(phone)
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["apikey"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "number": cleaned_phone,
            "text": message,
        }

        url = f"{self.api_url}/message/sendText/{self.instance_id}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code in (200, 201):
                    data = response.json()
                    msg_id = (
                        data.get("key", {}).get("id")
                        or data.get("id")
                        or data.get("messageId")
                        or "evolution_msg_ok"
                    )
                    logger.info("WhatsApp despachado com sucesso via Evolution API para %s (ID: %s)", cleaned_phone, msg_id)
                    return {
                        "success": True,
                        "message_id": str(msg_id),
                        "provider": "evolution",
                        "status": "sent",
                        "data": data,
                    }
                else:
                    err_msg = f"HTTP {response.status_code}: {response.text}"
                    logger.error("Falha ao despachar WhatsApp via Evolution API (%s): %s", url, err_msg)
                    return {
                        "success": False,
                        "message_id": "",
                        "provider": "evolution",
                        "status": "failed",
                        "error": err_msg,
                    }
        except httpx.ConnectError as exc:
            logger.error("Erro de conexão ao contactar Evolution API em %s: %s", url, exc)
            return {
                "success": False,
                "message_id": "",
                "provider": "evolution",
                "status": "failed",
                "error": f"Evolution API inacessível ({exc})",
            }
        except Exception as exc:
            logger.error("Erro inesperado ao despachar WhatsApp via Evolution API: %s", exc)
            return {
                "success": False,
                "message_id": "",
                "provider": "evolution",
                "status": "failed",
                "error": str(exc),
            }

    async def check_health(self) -> bool:
        if not self.api_url:
            return False

        headers = {}
        if self.api_key:
            headers["apikey"] = self.api_key
            headers["Authorization"] = f"Bearer {self.api_key}"

        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                state_url = f"{self.api_url}/instance/connectionState/{self.instance_id}"
                res = await client.get(state_url, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    state = data.get("instance", {}).get("state") or data.get("state")
                    if state == "open":
                        return True
                    logger.warning("Instância '%s' do Evolution API conectada mas estado é '%s' (não está 'open')", self.instance_id, state)
                    return False

                root_res = await client.get(f"{self.api_url}/", headers=headers)
                return root_res.status_code == 200
        except Exception as exc:
            logger.debug("Evolution API health check falhou: %s", exc)
            return False
