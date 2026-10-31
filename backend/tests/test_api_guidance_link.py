import random
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps

client = TestClient(app)

def test_available_students_and_guidance_link():
    db = SessionLocal()
    suffix = random.randint(10000, 99999)

    advisor = models.User(
        name="Prof. Orientador Test",
        email=f"advisor_{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student1 = models.User(
        name="Beatriz Aluna",
        email=f"beatriz_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    student2 = models.User(
        name="Carlos Estudante",
        email=f"carlos_{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor, student1, student2])
    db.commit()
    db.refresh(advisor)
    db.refresh(student1)
    db.refresh(student2)

    try:
        # Non-advisor cannot query available students
        app.dependency_overrides[deps.get_current_user] = lambda: student1
        res = client.get("/guidances/available-students")
        assert res.status_code == 403

        # Advisor queries available students
        app.dependency_overrides[deps.get_current_user] = lambda: advisor
        res = client.get("/guidances/available-students")
        assert res.status_code == 200
        data = res.json()
        student1_entry = next((s for s in data if s["id"] == student1.id), None)
        assert student1_entry is not None
        assert student1_entry["is_already_linked"] is False

        # Filter query
        res_filter = client.get(f"/guidances/available-students?q={student2.email}")
        assert res_filter.status_code == 200
        filtered_data = res_filter.json()
        assert len(filtered_data) == 1
        assert filtered_data[0]["id"] == student2.id

        # Link student1 with optional defense_date
        target_defense = (datetime.utcnow() + timedelta(days=90)).isoformat()
        link_res = client.post("/guidances/link", json={
            "student_email": student1.email,
            "theme": "Inteligência Artificial Aplicada a Redes Neurais",
            "defense_date": target_defense
        })
        assert link_res.status_code == 200
        link_data = link_res.json()
        assert link_data["theme"] == "Inteligência Artificial Aplicada a Redes Neurais"
        new_guidance_id = link_data["id"]

        # Default kanban columns were created
        kanban_res = client.get(f"/kanban/guidance/{new_guidance_id}/columns")
        assert kanban_res.status_code == 200
        columns = kanban_res.json()
        assert len(columns) == 3
        assert [c["slug"] for c in columns] == ["pending", "in_progress", "completed"]

        # Query available-students again: student1 is now marked as already linked
        res_after = client.get("/guidances/available-students")
        assert res_after.status_code == 200
        data_after = res_after.json()
        student1_after = next((s for s in data_after if s["id"] == student1.id), None)
        assert student1_after is not None
        assert student1_after["is_already_linked"] is True
        assert student1_after["active_theme"] == "Inteligência Artificial Aplicada a Redes Neurais"

        # Attempt to link again fails with 400
        dup_res = client.post("/guidances/link", json={
            "student_email": student1.email,
            "theme": "Outro Tema"
        })
        assert dup_res.status_code == 400

    finally:
        app.dependency_overrides.clear()
        db.close()
