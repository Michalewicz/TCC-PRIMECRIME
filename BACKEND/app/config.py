from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    db_host: str = "localhost"
    db_port: int = 3306
    db_user: str
    db_password: str
    db_name: str
    db_pool_minsize: int = 1
    db_pool_maxsize: int = 10
    cors_origins: list[str] = ["http://localhost:3000"]
    host: str = "0.0.0.0"
    port: int = 8000


@lru_cache
def get_settings() -> Settings:
    return Settings()
