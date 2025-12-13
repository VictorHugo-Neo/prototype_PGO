from app.config import settings


def test_config_settings():
    assert settings.PROJETC_NAME == "Prototype PGO"
    assert settings.API_V1_STR == "/api/v1"
    assert "postgresql" in settings.DATABASE_URL
    