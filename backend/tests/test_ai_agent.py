from unittest.mock import patch, MagicMock
from app.services.ai_agent import generate_response

def test_generate_response_success():
    # Mockamos 'chain' inteiro
    with patch("app.services.ai_agent.chain") as mock_chain:
        
        # CORREÇÃO:
        # Como você usa StrOutputParser na sua chain, o invoke retorna uma STRING direto.
        # Não precisamos criar um objeto mock com .content.
        mock_chain.invoke.return_value = "Resposta teste da IA"

        # Executa a função
        resultado = generate_response("pergunta", "contexto")

        # Verifica se o resultado é exatamente a string que definimos
        assert resultado == "Resposta teste da IA"
        
        # Verifica se o invoke foi chamado
        mock_chain.invoke.assert_called_once()

def test_generate_response_error_handling():
    with patch("app.services.ai_agent.chain") as mock_chain:
        # Simulamos o erro
        mock_chain.invoke.side_effect = Exception("Erro simulado na IA")

        resultado = generate_response("pergunta teste", "contexto")

        # Verifica a mensagem de erro amigável
        msg_esperada = "Desculpe, estou tendo dificuldades para pensar agora. Verifique se o Ollama está rodando."
        assert resultado == msg_esperada