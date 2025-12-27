from fastapi.testclient import TestClient
from app.main import app
import random

client = TestClient(app)

def test_login_flow():
    email = f"auth_{random.randint(1000,9999)}@teste.com"
    client.post("/usuarios/", json={
        "name": "User Auth", "email": email, "type": "aluno", "password": "123"
    })

    resp = client.post("/token", json={"email": email, "password": "123"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()

    # 3. Tentar logar (Erro)
    resp_err = client.post("/token", json={"email": email, "password": "errada"})
    assert resp_err.status_code == 401