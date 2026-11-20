import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    SERVICE_NAME: str = "pgo-whatsapp-notifier"
    SERVICE_PORT: int = 8001
    SERVICE_HOST: str = "0.0.0.0"
    WHATSAPP_PROVIDER: str = "mock"
    WHATSAPP_API_URL: str = ""
    WHATSAPP_API_KEY: str = ""
    WHATSAPP_INSTANCE_ID: str = "pgo"
    REQUEST_TIMEOUT_SECONDS: float = 8.0
    IDEMPOTENCY_TTL_HOURS: int = 24
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
