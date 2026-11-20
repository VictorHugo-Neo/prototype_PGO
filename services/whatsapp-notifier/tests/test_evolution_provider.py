import pytest
from unittest.mock import patch, MagicMock
import httpx
from app.providers.evolution_provider import (
    EvolutionWhatsAppProvider,
    normalize_phone_number,
)

@pytest.fixture
def anyio_backend():
    return "asyncio"

def test_normalize_phone_number():
    assert normalize_phone_number("11999998888") == "5511999998888"
    assert normalize_phone_number("(11) 98765-4321") == "5511987654321"
    assert normalize_phone_number("5511999998888") == "5511999998888"
    assert normalize_phone_number("+55 (21) 91234-5678") == "5521912345678"

@pytest.mark.anyio
async def test_evolution_provider_dispatches_message_successfully():
    provider = EvolutionWhatsAppProvider(
        api_url="http://evolution-test:8080",
        api_key="secret-api-key",
        instance_id="pgo",
    )

    mock_response = MagicMock(status_code=200)
    mock_response.json.return_value = {
        "key": {
            "remoteJid": "5511999998888@s.whatsapp.net",
            "fromMe": True,
            "id": "BAE5ABCD1234",
        },
        "status": "PENDING",
    }

    with patch("httpx.AsyncClient.post", return_value=mock_response) as mock_post:
        res = await provider.send_message("11999998888", "Olá aluno!")
        
        assert res["success"] is True
        assert res["message_id"] == "BAE5ABCD1234"
        assert res["provider"] == "evolution"

        mock_post.assert_called_once()
        call_args, call_kwargs = mock_post.call_args
        assert call_args[0] == "http://evolution-test:8080/message/sendText/pgo"
        assert call_kwargs["json"]["number"] == "5511999998888"
        assert call_kwargs["json"]["text"] == "Olá aluno!"
        assert call_kwargs["headers"]["apikey"] == "secret-api-key"

@pytest.mark.anyio
async def test_evolution_provider_handles_http_failure():
    provider = EvolutionWhatsAppProvider(
        api_url="http://evolution-test:8080",
        api_key="secret-api-key",
        instance_id="pgo",
    )

    mock_response = MagicMock(status_code=400, text="Instance not found")
    with patch("httpx.AsyncClient.post", return_value=mock_response):
        res = await provider.send_message("11999998888", "Mensagem de teste")
        assert res["success"] is False
        assert "HTTP 400" in res["error"]

@pytest.mark.anyio
async def test_evolution_provider_handles_connection_error():
    provider = EvolutionWhatsAppProvider(
        api_url="http://evolution-test:8080",
        api_key="secret-api-key",
        instance_id="pgo",
    )

    with patch("httpx.AsyncClient.post", side_effect=httpx.ConnectError("Connection refused")):
        res = await provider.send_message("11999998888", "Mensagem de teste")
        assert res["success"] is False
        assert "inacessível" in res["error"]

@pytest.mark.anyio
async def test_evolution_provider_health_check_states():
    provider = EvolutionWhatsAppProvider(
        api_url="http://evolution-test:8080",
        api_key="secret-api-key",
        instance_id="pgo",
    )

    mock_open = MagicMock(status_code=200)
    mock_open.json.return_value = {"instance": {"instanceName": "pgo", "state": "open"}}
    with patch("httpx.AsyncClient.get", return_value=mock_open):
        assert await provider.check_health() is True

    mock_closed = MagicMock(status_code=200)
    mock_closed.json.return_value = {"instance": {"instanceName": "pgo", "state": "close"}}
    with patch("httpx.AsyncClient.get", return_value=mock_closed):
        assert await provider.check_health() is False

    with patch("httpx.AsyncClient.get", side_effect=httpx.ConnectError("Connection refused")):
        assert await provider.check_health() is False
