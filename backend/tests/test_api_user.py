from fastapi.testclient import TestClient
from app.main import app
import random
import io

client = TestClient(app)

def create_authenticated_student():
    email = f"student_{random.randint(10000, 99999)}@example.com"
    client.post("/users/", json={
        "name": "Aluno Teste",
        "email": email,
        "type": "student",
        "password": "initialpassword123"
    })
    login_resp = client.post("/auth/login", data={"username": email, "password": "initialpassword123"})
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return email, headers

def test_create_user():
    email = f"user_{random.randint(1000, 9999)}@example.com"
    response = client.post("/users/", json={
        "name": "Api User",
        "email": email,
        "type": "advisor",
        "password": "strongpassword123"
    })
    assert response.status_code == 200
    assert response.json()["email"] == email
    assert "id" in response.json()

def test_read_and_update_user_me():
    email, headers = create_authenticated_student()
    me_resp = client.get("/users/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["email"] == email

    update_resp = client.put("/users/me", headers=headers, json={
        "name": "Aluno Atualizado",
        "phone": "(11) 98765-4321",
        "password": "newpassword123"
    })
    assert update_resp.status_code == 200
    data = update_resp.json()
    assert data["name"] == "Aluno Atualizado"
    assert data["phone"] == "(11) 98765-4321"

    login_new = client.post("/auth/login", data={"username": email, "password": "newpassword123"})
    assert login_new.status_code == 200

def test_avatar_crud_me():
    _, headers = create_authenticated_student()
    fake_image = io.BytesIO(b"fake image bytes")
    upload_resp = client.post(
        "/users/me/avatar",
        headers=headers,
        files={"file": ("avatar.png", fake_image, "image/png")}
    )
    assert upload_resp.status_code == 200
    assert upload_resp.json()["avatar_path"] is not None

    delete_resp = client.delete("/users/me/avatar", headers=headers)
    assert delete_resp.status_code == 200
    assert delete_resp.json()["avatar_path"] is None

def test_delete_user_me():
    email, headers = create_authenticated_student()
    del_resp = client.delete("/users/me", headers=headers)
    assert del_resp.status_code == 204

    login_resp = client.post("/auth/login", data={"username": email, "password": "initialpassword123"})
    assert login_resp.status_code == 401