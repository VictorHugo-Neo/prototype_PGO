from app.config import settings

def test_config_settings():
    assert "PGO" in settings.PROJECT_NAME
    assert settings.API_V1_STR == "/api/v1"
    assert "postgresql" in settings.DATABASE_URL