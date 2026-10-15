from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app import models, deps
import random

client = TestClient(app)

def test_guidance_task():
    db = SessionLocal()
    suffix = random.randint(1000, 9999)
    
    advisor = models.User(
        name="Test Advisor",
        email=f"advisor{suffix}@test.com",
        type=models.TypeUser.ADVISOR,
        hashed_password="hash"
    )
    student = models.User(
        name="Test Student",
        email=f"student{suffix}@test.com",
        type=models.TypeUser.STUDENT,
        hashed_password="hash"
    )
    db.add_all([advisor, student])
    db.commit()
    db.refresh(advisor)
    db.refresh(student)

    guidance = models.Guidance(
        theme="Test Guidance",
        advisor_id=advisor.id,
        student_id=student.id
    )
    db.add(guidance)
    db.commit()
    db.refresh(guidance)

    app.dependency_overrides[deps.get_current_user] = lambda: advisor

    try:
        task = client.post("/tasks/", json={
            "title": "Test Task",
            "guidance_id": guidance.id,
            "order": 1
        })
        assert task.status_code == 200
        assert task.json()["status"] == "pending"
        task_id = task.json()["id"]

        updated_task = client.patch(f"/tasks/{task_id}/status", json={"status": "completed"})
        assert updated_task.status_code == 200
        assert updated_task.json()["status"] == "completed"
    finally:
        app.dependency_overrides.clear()
        db.close()
