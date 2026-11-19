from app.config import settings

def test_config_settings():
    assert "PGO" in settings.PROJECT_NAME
    assert settings.API_V1_STR == "/api/v1"
    assert any(driver in settings.DATABASE_URL for driver in ["postgresql", "sqlite"])