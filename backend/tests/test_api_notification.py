import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest.mock import patch

from app.main import app
from app.database import Base, get_db
from app import models, security

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client():
    return TestClient(app)

def create_user(db, name, email, user_type, phone=None):
    user = models.User(
        name=name,
        email=email,
        hashed_password=security.get_password_hash("secret123"),
        type=user_type,
        phone=phone,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_guidance(db, advisor_id, student_id, theme="TCC Teste"):
    guidance = models.Guidance(
        theme=theme,
        advisor_id=advisor_id,
        student_id=student_id,
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)
    return guidance

def make_auth_headers(user):
    token = security.create_access_token(
        data={"sub": user.email, "id": user.id, "type": user.type.value if hasattr(user.type, "value") else str(user.type)}
    )
    return {"Authorization": f"Bearer {token}"}

def test_send_notification_individual_platform(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Carlos", "advisor@test.com", models.TypeUser.ADVISOR)
    student = create_user(db, "Aluno João", "student@test.com", models.TypeUser.STUDENT, phone="5511988887777")
    create_guidance(db, advisor.id, student.id)

    headers = make_auth_headers(advisor)
    payload = {
        "target_type": "individual",
        "student_id": student.id,
        "channel": "platform",
        "title": "Aviso de Reunião",
        "message": "Nossa reunião semanal será antecipada para as 10h.",
    }

    res = client.post("/notifications/send", json=payload, headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_targeted"] == 1
    assert data["platform_count"] == 1
    assert data["whatsapp_count"] == 0
    assert data["results"][0]["platform_success"] is True

    student_headers = make_auth_headers(student)
    notif_res = client.get("/notifications/", headers=student_headers)
    assert notif_res.status_code == 200
    notifs = notif_res.json()
    assert len(notifs) == 1
    assert notifs[0]["title"] == "Aviso de Reunião"
    assert notifs[0]["sender_name"] == "Prof. Carlos"
    assert notifs[0]["read"] is False
    db.close()

def test_send_notification_all_simultaneously_both_channels(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Maria", "maria@test.com", models.TypeUser.ADVISOR)
    student1 = create_user(db, "Aluno 1", "aluno1@test.com", models.TypeUser.STUDENT, phone="5511999991111")
    student2 = create_user(db, "Aluno 2", "aluno2@test.com", models.TypeUser.STUDENT, phone=None)
    create_guidance(db, advisor.id, student1.id, "Tema 1")
    create_guidance(db, advisor.id, student2.id, "Tema 2")

    headers = make_auth_headers(advisor)
    payload = {
        "target_type": "all",
        "channel": "both",
        "title": "Entrega de Versão Parcial",
        "message": "Lembrem-se de submeter a versão preliminar até sexta-feira.",
    }

    with patch("app.routers.notification.dispatch_whatsapp_custom_message") as mock_wp:
        mock_wp.return_value = {"success": True, "data": {"status": "sent"}}

        res = client.post("/notifications/send", json=payload, headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total_targeted"] == 2
        assert data["platform_count"] == 2
        assert data["whatsapp_count"] == 1
        assert data["whatsapp_skipped_no_phone_count"] == 1
        assert mock_wp.call_count == 1
    db.close()

def test_send_notification_forbidden_for_student(client):
    db = TestingSessionLocal()
    student = create_user(db, "Aluno Lucas", "lucas@test.com", models.TypeUser.STUDENT)

    headers = make_auth_headers(student)
    payload = {
        "target_type": "all",
        "channel": "platform",
        "message": "Tentando enviar notificação",
    }

    res = client.post("/notifications/send", json=payload, headers=headers)
    assert res.status_code == 403
    db.close()

def test_send_notification_forbidden_for_unrelated_student(client):
    db = TestingSessionLocal()
    advisor1 = create_user(db, "Prof. Um", "prof1@test.com", models.TypeUser.ADVISOR)
    advisor2 = create_user(db, "Prof. Dois", "prof2@test.com", models.TypeUser.ADVISOR)
    student = create_user(db, "Aluno Alheio", "alheio@test.com", models.TypeUser.STUDENT)
    create_guidance(db, advisor2.id, student.id)

    headers = make_auth_headers(advisor1)
    payload = {
        "target_type": "individual",
        "student_id": student.id,
        "channel": "platform",
        "message": "Mensagem para aluno não orientado",
    }

    res = client.post("/notifications/send", json=payload, headers=headers)
    assert res.status_code in (400, 403)
    db.close()

def test_mark_all_notifications_as_read(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Roberto", "roberto@test.com", models.TypeUser.ADVISOR)
    student = create_user(db, "Aluno Teste", "alunoteste@test.com", models.TypeUser.STUDENT)
    create_guidance(db, advisor.id, student.id)

    db.add(models.Notification(user_id=student.id, message="Notif 1", read=False))
    db.add(models.Notification(user_id=student.id, message="Notif 2", read=False))
    db.commit()

    headers = make_auth_headers(student)
    res = client.patch("/notifications/read-all", headers=headers)
    assert res.status_code == 200
    assert res.json() == {"ok": True}

    list_res = client.get("/notifications/", headers=headers)
    assert list_res.status_code == 200
    for notif in list_res.json():
        assert notif["read"] is True
    db.close()

def test_get_sent_notifications_by_advisor(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Beatriz", "beatriz@test.com", models.TypeUser.ADVISOR)
    student = create_user(db, "Aluno Clara", "clara@test.com", models.TypeUser.STUDENT)
    create_guidance(db, advisor.id, student.id)

    headers = make_auth_headers(advisor)
    client.post("/notifications/send", json={
        "target_type": "individual",
        "student_id": student.id,
        "channel": "platform",
        "title": "Envio Histórico",
        "message": "Mensagem arquivada",
    }, headers=headers)

    sent_res = client.get("/notifications/sent", headers=headers)
    assert sent_res.status_code == 200
    sent_list = sent_res.json()
    assert len(sent_list) == 1
    assert sent_list[0]["title"] == "Envio Histórico"
    db.close()

def test_get_whatsapp_status(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Gilberto", "gilberto@test.com", models.TypeUser.ADVISOR)
    headers = make_auth_headers(advisor)

    with patch("app.services.whatsapp_client.is_whatsapp_service_online", return_value=True):
        res = client.get("/notifications/whatsapp-status", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["online"] is True
        assert "instance_id" in data
        assert "service_url" in data
    db.close()

def test_notify_deadlines_endpoint(client):
    db = TestingSessionLocal()
    advisor = create_user(db, "Prof. Helena", "helena@test.com", models.TypeUser.ADVISOR)
    student = create_user(db, "Aluno Gabriel", "gabriel@test.com", models.TypeUser.STUDENT, phone="5511999990000")
    guidance = create_guidance(db, advisor.id, student.id, "Bioinformática")

    headers = make_auth_headers(advisor)
    with patch("app.services.whatsapp_client.check_and_notify_upcoming_deadlines") as mock_check:
        mock_check.return_value = {
            "tasks_analyzed": 2,
            "whatsapp_dispatched": 1,
            "skipped_no_phone": 0,
            "failed_dispatched": 0,
            "service_online": True,
        }
        res = client.post(f"/notifications/notify-deadlines?guidance_id={guidance.id}", headers=headers)
        assert res.status_code == 200
        data = res.json()
        assert data["tasks_analyzed"] == 2
        assert data["whatsapp_dispatched"] == 1
    db.close()

