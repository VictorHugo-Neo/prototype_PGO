from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str
    API_V1_STR: str
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    WHATSAPP_SERVICE_URL: str = "http://localhost:8001"
    WHATSAPP_TIMEOUT_SECONDS: float = 3.0
    model_config = ConfigDict(
        env_file=".env",
        extra ="ignore"
    )
    
@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()