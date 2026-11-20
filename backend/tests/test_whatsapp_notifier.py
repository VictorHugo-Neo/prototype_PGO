from unittest.mock import patch, MagicMock
from datetime import datetime, timedelta
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app import models
from app.services.whatsapp_client import (
    dispatch_whatsapp_notification,
    dispatch_whatsapp_custom_message,
    check_and_notify_upcoming_deadlines,
    is_whatsapp_service_online,
    normalize_phone_number,
    format_deadline_message,
    format_custom_message,
    send_evolution_api_direct,
)

@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine)
    session = TestingSession()
    yield session
    session.close()

def test_dispatch_whatsapp_skips_when_no_phone():
    res = dispatch_whatsapp_notification(
        task_id=1,
        task_title="Capítulo 1",
        student_name="Carlos",
        student_phone="",
        due_date_str="25/11/2026",
    )
    assert res["success"] is False
    assert res["reason"] == "no_phone"

def test_dispatch_whatsapp_success_when_service_responds():
    with patch("httpx.Client.post") as mock_post:
        mock_post.return_value = MagicMock(
            status_code=200,
            json=lambda: {"success": True, "message_id": "msg_123", "status": "sent"}
        )
        res = dispatch_whatsapp_notification(
            task_id=2,
            task_title="Capítulo 2",
            student_name="Ana",
            student_phone="5511999991111",
            due_date_str="26/11/2026",
            guidance_theme="Machine Learning",
        )
        assert res["success"] is True
        assert res["data"]["message_id"] == "msg_123"

def test_dispatch_whatsapp_graceful_degradation_when_offline():
    import httpx
    with patch("httpx.Client.post", side_effect=httpx.ConnectError("Connection refused")):
        res = dispatch_whatsapp_notification(
            task_id=3,
            task_title="Capítulo 3",
            student_name="Bruno",
            student_phone="5511988882222",
            due_date_str="27/11/2026",
        )
        assert res["success"] is False
        assert res["reason"] == "service_unavailable"

def test_check_and_notify_upcoming_deadlines(db_session):
    advisor = models.User(
        name="Prof. Santos",
        email="santos@pgo.edu.br",
        hashed_password="hash",
        type=models.TypeUser.ADVISOR,
    )
    student = models.User(
        name="Lucas Silva",
        email="lucas@pgo.edu.br",
        phone="5511977773333",
        hashed_password="hash",
        type=models.TypeUser.STUDENT,
    )
    db_session.add_all([advisor, student])
    db_session.commit()

    guidance = models.Guidance(
        theme="IA na Saúde",
        advisor_id=advisor.id,
        student_id=student.id,
    )
    db_session.add(guidance)
    db_session.commit()

    task_due_soon = models.Task(
        title="Entrega de Resultados",
        status="in_progress",
        time_estimate=datetime.utcnow() + timedelta(hours=12),
        guidance_id=guidance.id,
    )
    task_completed = models.Task(
        title="Introdução Concluída",
        status="completed",
        time_estimate=datetime.utcnow() + timedelta(hours=6),
        guidance_id=guidance.id,
    )
    task_far_away = models.Task(
        title="Defesa Final",
        status="pending",
        time_estimate=datetime.utcnow() + timedelta(days=5),
        guidance_id=guidance.id,
    )

    db_session.add_all([task_due_soon, task_completed, task_far_away])
    db_session.commit()

    with patch("app.services.whatsapp_client.dispatch_whatsapp_notification") as mock_dispatch:
        mock_dispatch.return_value = {"success": True, "data": {"status": "sent"}}

        result = check_and_notify_upcoming_deadlines(db_session, hours_ahead=24)

        assert result["tasks_analyzed"] == 1
        assert result["whatsapp_dispatched"] == 1
        mock_dispatch.assert_called_once()

        notif = db_session.query(models.Notification).filter_by(user_id=student.id).first()
        assert notif is not None
        assert "Entrega de Resultados" in notif.message

def test_health_check_returns_boolean():
    with patch("httpx.Client.get") as mock_get:
        mock_get.return_value = MagicMock(status_code=200)
        assert is_whatsapp_service_online() is True

    with patch("httpx.Client.get", side_effect=Exception("Timeout")):
        assert is_whatsapp_service_online() is False


def test_normalize_phone_number_in_backend():
    assert normalize_phone_number("11999998888") == "5511999998888"
    assert normalize_phone_number("(11) 98765-4321") == "5511987654321"
    assert normalize_phone_number("011987654321") == "5511987654321"
    assert normalize_phone_number("5511999998888") == "5511999998888"
    assert normalize_phone_number("") == ""


def test_format_messages():
    deadline_msg = format_deadline_message(
        task_title="Revisão Bibliográfica",
        student_name="Fernanda",
        due_date_str="25/11/2026 às 18:00",
        guidance_theme="Inteligência Artificial",
        urgency_level="urgent",
    )
    assert "Revisão Bibliográfica" in deadline_msg
    assert "Fernanda" in deadline_msg
    assert "Inteligência Artificial" in deadline_msg
    assert "🚨" in deadline_msg

    custom_msg = format_custom_message(
        advisor_name="Prof. Santos",
        student_name="Lucas",
        message="Por favor, atualizar o Kanban antes da nossa reunião.",
        title="Aviso Urgente",
        guidance_theme="Sistemas Embarcados",
    )
    assert "Prof. Santos" in custom_msg
    assert "Lucas" in custom_msg
    assert "Aviso Urgente" in custom_msg
    assert "Sistemas Embarcados" in custom_msg


def test_direct_evolution_fallback_when_microservice_offline():
    import httpx

    def mock_post_side_effect(url, **kwargs):
        if ":8001" in url:
            raise httpx.ConnectError("Microserviço 8001 offline")
        elif ":8080" in url:
            return MagicMock(
                status_code=200,
                json=lambda: {"key": {"id": "direct_evo_123"}, "status": "sent"}
            )
        return MagicMock(status_code=404)

    with patch("httpx.Client.post", side_effect=mock_post_side_effect):
        res = dispatch_whatsapp_custom_message(
            advisor_name="Prof. Santos",
            student_name="Mariana",
            student_phone="11988887777",
            message="Mensagem enviada com fallback direto para Evolution API",
            title="Aviso de Teste",
        )
        assert res["success"] is True
        assert res["message_id"] == "direct_evo_123"
        assert res["provider"] == "evolution_direct"


def test_evolution_direct_online_detection():
    def mock_get_side_effect(url, **kwargs):
        if ":8001" in url:
            raise Exception("Microserviço offline")
        elif "/instance/connectionState/" in url:
            return MagicMock(status_code=200, json=lambda: {"instance": {"state": "open"}})
        return MagicMock(status_code=404)

    with patch("httpx.Client.get", side_effect=mock_get_side_effect):
        assert is_whatsapp_service_online() is True

