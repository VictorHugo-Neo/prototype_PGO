from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import ConfigDict

class Settings(BaseSettings):
    PROJETC_NAME: str
    API_V1_STR: str
    DATABASE_URL: str
    
    model_config = ConfigDict(
        env_file=".env",
        extra ="ignore"
    )
    
@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()