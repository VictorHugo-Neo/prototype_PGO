from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app 

client = TestClient(app)

def test_chat_endpoint():
    with patch("app.services.ai_agent.chain") as mock_chain:
      
        mock_chain.invoke.return_value = "Resposta simulada da API"
        response = client.post("/chat/", json={
            "student_id": 1, 
            "message": "Como estudar python?"
        })

        assert response.status_code == 200
        assert response.json()["response"] == "Resposta simulada da API"