from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJETC_NAME: str
    API_V1_STR: str
    DATABASE_URL: str
    
    class Config:
        env_file = ".env"
settings = Settings()