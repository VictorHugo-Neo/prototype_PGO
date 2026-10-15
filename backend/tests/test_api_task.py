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
            "description": "Initial Description",
            "guidance_id": guidance.id,
            "order": 1
        })
        assert task.status_code == 200
        assert task.json()["status"] == "pending"
        assert task.json()["guidance_id"] == guidance.id
        task_id = task.json()["id"]

        get_res = client.get(f"/tasks/{task_id}")
        assert get_res.status_code == 200
        assert get_res.json()["title"] == "Test Task"

        put_res = client.put(f"/tasks/{task_id}", json={
            "title": "Updated Task Title",
            "description": "Updated Description"
        })
        assert put_res.status_code == 200
        assert put_res.json()["title"] == "Updated Task Title"
        assert put_res.json()["description"] == "Updated Description"
        
        updated_task = client.patch(f"/tasks/{task_id}/status", json={"status": "completed"})
        assert updated_task.status_code == 200
        assert updated_task.json()["status"] == "completed"

        del_res = client.delete(f"/tasks/{task_id}")
        assert del_res.status_code == 204

        get_deleted = client.get(f"/tasks/{task_id}")
        assert get_deleted.status_code == 404
    finally:
        app.dependency_overrides.clear()
        db.close()
