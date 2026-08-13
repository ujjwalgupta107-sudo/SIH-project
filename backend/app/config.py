from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    ai_service_url: str | None = None
    cors_origins: str = 'http://localhost:5173,http://localhost:5174'
    development_ai_mode: bool = True
    model_config = SettingsConfigDict(env_file='../.env', extra='ignore')

settings = Settings()
