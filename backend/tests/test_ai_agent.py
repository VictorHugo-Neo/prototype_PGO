from unittest.mock import patch, MagicMock
from app.services.ai_agent import generate_response

def test_generate_response_success():
    
    with patch("app.services.ai_agent.chain") as mock_chain:
        mock_chain.invoke.return_value = "Resposta teste da IA"
        resultado = generate_response("pergunta", "contexto")
        assert resultado == "Resposta teste da IA"
        mock_chain.invoke.assert_called_once()

def test_generate_response_error_handling():
    with patch("app.services.ai_agent.chain") as mock_chain:
        
        mock_chain.invoke.side_effect = Exception("Erro simulado na IA")
        resultado = generate_response("pergunta teste", "contexto")

        
        msg_esperada = "Desculpe, estou tendo dificuldades para pensar agora. Verifique se o Ollama está rodando."
        assert resultado == msg_esperada