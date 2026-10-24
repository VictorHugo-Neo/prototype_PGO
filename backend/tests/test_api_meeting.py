import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)


def setup_meeting_test_data():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name="Advisor Meeting",
        email=f"advisor_meeting_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Student Meeting",
        email=f"student_meeting_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    other_user = models.User(
        name="Other User",
        email=f"other_user_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor, student, other_user])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)
    db.refresh(other_user)

    guidance = models.Guidance(
        theme="Test Guidance Meeting",
        advisor_id=advisor.id,
        student_id=student.id
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    return db, advisor, student, other_user, guidance


def test_meeting_crud_full_flow():
    db, advisor, student, other_user, guidance = setup_meeting_test_data()

    try:
        meeting_time = (datetime.now() + timedelta(days=2)).isoformat()

        app.dependency_overrides[deps.get_current_user] = lambda: other_user
        res_unauthorized = client.post("/meetings/", json={
            "date": meeting_time,
            "topic": "Reunião de Alinhamento",
            "guidance_id": guidance.id
        })
        assert res_unauthorized.status_code == 403

        app.dependency_overrides[deps.get_current_user] = lambda: student
        res_create = client.post("/meetings/", json={
            "date": meeting_time,
            "topic": "Alinhamento de Escopo",
            "guidance_id": guidance.id
        })
        assert res_create.status_code == 200
        created = res_create.json()
        assert created["topic"] == "Alinhamento de Escopo"
        assert created["status"] == "pending"
        assert created["guidance_id"] == guidance.id
        meeting_id = created["id"]

        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res_list = client.get(f"/meetings/guidance/{guidance.id}")
        assert res_list.status_code == 200
        meetings = res_list.json()
        assert any(m["id"] == meeting_id for m in meetings)

        res_get = client.get(f"/meetings/{meeting_id}")
        assert res_get.status_code == 200
        assert res_get.json()["id"] == meeting_id
        assert res_get.json()["topic"] == "Alinhamento de Escopo"

        new_time = (datetime.now() + timedelta(days=3)).isoformat()
        res_update = client.put(f"/meetings/{meeting_id}", json={
            "topic": "Alinhamento de Escopo e Metodologia",
            "date": new_time
        })
        assert res_update.status_code == 200
        assert res_update.json()["topic"] == "Alinhamento de Escopo e Metodologia"

        res_status = client.patch(f"/meetings/{meeting_id}/status", json={
            "status": "confirmed"
        })
        assert res_status.status_code == 200
        assert res_status.json()["status"] == "confirmed"

        res_delete = client.delete(f"/meetings/{meeting_id}")
        assert res_delete.status_code == 204

        res_get_deleted = client.get(f"/meetings/{meeting_id}")
        assert res_get_deleted.status_code == 404

    finally:
        app.dependency_overrides.clear()
        db.close()


def test_meeting_not_found_and_errors():
    db, advisor, student, other_user, guidance = setup_meeting_test_data()

    try:
        app.dependency_overrides[deps.get_current_user] = lambda: advisor

        res_not_found_guidance = client.post("/meetings/", json={
            "date": datetime.now().isoformat(),
            "topic": "Ghost Meeting",
            "guidance_id": 999999
        })
        assert res_not_found_guidance.status_code == 404

        assert client.get("/meetings/999999").status_code == 404
        assert client.put("/meetings/999999", json={"topic": "Ghost"}).status_code == 404
        assert client.patch("/meetings/999999/status", json={"status": "confirmed"}).status_code == 404
        assert client.delete("/meetings/999999").status_code == 404

    finally:
        app.dependency_overrides.clear()
        db.close()
