from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    ai_service_url: Optional[str] = None
    cors_origins: str = 'http://localhost:5173,http://localhost:5174'
    development_ai_mode: bool = True

    # Email notification (optional — disabled if not set)
    smtp_host: str = ''
    smtp_port: int = 587
    smtp_user: str = ''
    smtp_password: str = ''
    notify_email: str = ''

    model_config = SettingsConfigDict(env_file='../.env', extra='ignore')


settings = Settings()
