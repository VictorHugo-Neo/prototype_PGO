from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def test_login_flow():
    email = f"auth_{random.randint(1000, 9999)}@teste.com"
    reg = client.post("/users/", json={
        "name": "User Auth",
        "email": email,
        "type": "student",
        "password": "mypassword123"
    })
    assert reg.status_code == 200

    resp = client.post("/auth/login", data={"username": email, "password": "mypassword123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

    resp_err = client.post("/auth/login", data={"username": email, "password": "wrongpassword"})
    assert resp_err.status_code == 401