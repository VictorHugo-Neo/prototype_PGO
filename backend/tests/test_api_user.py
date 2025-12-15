from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def test_create_user():
    email = f"user_{random.randint(1000, 9999)}@example.com"
    response = client.post("/users/", json={
        "name": "Api User",
        "email": email,
        "type": "advisor"
    })
    assert response.status_code == 200
    assert response.json()["email"] == email
    assert "id" in response.json()
    