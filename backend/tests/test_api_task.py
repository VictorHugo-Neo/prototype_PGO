from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def test_create_guidance():
    suffix = random.randint(1000,9999)
    
    advisor = client.post("/users/", json={
        "name":"Test Advisor",
        "email": f"advisor{suffix}@test.com",
        "type":"advisor"
    })
    
    student = client.post("/users/", json={
        "name": "Test Student",
        "email": f"student{suffix}@test.com",
        "type":"student"
    })
    
    guidance = client.post("/guidances/",json={
        "theme":"Test Guidance",
        "advisor_id": advisor.json()["id"],
        "student_id": student.json()["id"],
        
    })
    assert guidance.status_code == 200
    