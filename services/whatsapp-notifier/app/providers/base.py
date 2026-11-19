from abc import ABC, abstractmethod
from typing import Dict, Any

class WhatsAppProvider(ABC):
    @abstractmethod
    async def send_message(self, phone: str, message: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def check_health(self) -> bool:
        pass
