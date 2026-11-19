import pytest
from app.schemas import NotificationRequest
from app.providers.mock_provider import MockWhatsAppProvider
from app.services.notifier import NotificationService

@pytest.mark.anyio
async def test_mock_provider_dispatches_message():
    provider = MockWhatsAppProvider()
    res = await provider.send_message("5511999998888", "Mensagem de teste")
    assert res["success"] is True
    assert res["status"] == "sent"
    assert len(provider.sent_messages) == 1
    assert provider.sent_messages[0]["phone"] == "5511999998888"

@pytest.mark.anyio
async def test_notifier_formats_deadline_message_correctly():
    provider = MockWhatsAppProvider()
    service = NotificationService(provider=provider)

    req = NotificationRequest(
        task_id=10,
        task_title="Entrega do Capítulo 3",
        student_name="Lucas Silva",
        student_phone="5511999998888",
        due_date="2026-11-25 18:00",
        guidance_theme="Inteligência Artificial",
        urgency_level="urgent",
    )

    msg = service.format_message(req)
    assert "Lucas Silva" in msg
    assert "Entrega do Capítulo 3" in msg
    assert "Inteligência Artificial" in msg
    assert "2026-11-25 18:00" in msg
    assert "🚨" in msg

@pytest.mark.anyio
async def test_notifier_enforces_idempotency_to_prevent_spam():
    provider = MockWhatsAppProvider()
    service = NotificationService(provider=provider, idempotency_ttl_seconds=3600)

    req = NotificationRequest(
        task_id=42,
        task_title="Revisão Bibliográfica",
        student_name="Beatriz",
        student_phone="5511988887777",
        due_date="2026-11-22 14:00",
    )

    res1 = await service.notify_deadline(req)
    assert res1.success is True
    assert res1.status == "sent"
    assert len(provider.sent_messages) == 1

    res2 = await service.notify_deadline(req)
    assert res2.success is True
    assert res2.status == "skipped_duplicate"
    assert len(provider.sent_messages) == 1
