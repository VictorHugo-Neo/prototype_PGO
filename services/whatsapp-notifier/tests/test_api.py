import pytest
import httpx
from app.main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.anyio
async def test_health_live_endpoint():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res = await client.get("/health/live")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "live"
        assert "pgo-whatsapp-notifier" in data["service"]

@pytest.mark.anyio
async def test_notify_endpoint_requires_phone():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "task_id": 1,
            "task_title": "Tarefa sem telefone",
            "student_name": "Fulano",
            "student_phone": "",
            "due_date": "2026-11-30",
        }
        res = await client.post("/notify/deadline", json=payload)
        assert res.status_code == 400

@pytest.mark.anyio
async def test_notify_endpoint_successful_dispatch_and_metrics():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        payload = {
            "task_id": 99,
            "task_title": "Redação Final",
            "student_name": "Mariana",
            "student_phone": "5511977776666",
            "due_date": "2026-11-28",
            "guidance_theme": "Computação em Nuvem",
        }
        res = await client.post("/notify/deadline", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert data["status"] in ("sent", "skipped_duplicate")

        metrics_res = await client.get("/metrics")
        assert metrics_res.status_code == 200
        metrics = metrics_res.json()
        assert metrics["total_processed"] >= 1

@pytest.mark.anyio
async def test_notify_custom_endpoint_validation_and_dispatch():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        res_empty_phone = await client.post("/notify/custom", json={
            "student_name": "Carlos",
            "student_phone": "",
            "advisor_name": "Prof. Silva",
            "message": "Favor revisar o capítulo 2."
        })
        assert res_empty_phone.status_code == 400

        res_empty_message = await client.post("/notify/custom", json={
            "student_name": "Carlos",
            "student_phone": "5511912345678",
            "advisor_name": "Prof. Silva",
            "message": "   "
        })
        assert res_empty_message.status_code == 400

        res_ok = await client.post("/notify/custom", json={
            "student_name": "Carlos",
            "student_phone": "5511912345678",
            "advisor_name": "Prof. Silva",
            "title": "Aviso Urgente",
            "message": "Reunião extraordinária confirmada para amanhã às 14h.",
            "guidance_theme": "Segurança da Informação"
        })
        assert res_ok.status_code == 200
        data = res_ok.json()
        assert data["success"] is True
        assert data["status"] == "sent"
        assert data["recipient"] == "5511912345678"
