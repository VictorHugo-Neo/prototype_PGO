import os
import pytest

os.environ["WHATSAPP_PROVIDER"] = "mock"
os.environ["WHATSAPP_API_URL"] = ""

from app.main import app
import app.main as main_module
from app.providers.mock_provider import MockWhatsAppProvider
from app.services.notifier import NotificationService

@pytest.fixture(autouse=True)
def reset_notifier_service():
    mock_provider = MockWhatsAppProvider()
    main_module.provider = mock_provider
    main_module.notifier_service = NotificationService(provider=mock_provider)
    yield
