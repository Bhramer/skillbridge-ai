from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(_ENV_FILE, override=True)


class Settings:
    @property
    def DATABASE_URL(self) -> str:
        return os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./skillbridge.db")

    @property
    def DATABASE_URL_SYNC(self) -> str:
        return os.getenv("DATABASE_URL_SYNC", "sqlite:///./skillbridge.db")

    @property
    def REDIS_URL(self) -> str:
        return os.getenv("REDIS_URL", "")

    @property
    def JWT_SECRET(self) -> str:
        return os.getenv("JWT_SECRET", "change-me-in-production")

    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @property
    def GEMINI_API_KEY(self) -> str:
        return os.getenv("GEMINI_API_KEY", "")

    GEMINI_MODEL: str = "gemini-3.1-flash-lite-preview"

    @property
    def JOOBLE_API_KEY(self) -> str:
        return os.getenv("JOOBLE_API_KEY", "")

    @property
    def GITHUB_TOKEN(self) -> str:
        return os.getenv("GITHUB_TOKEN", "")

    CACHE_ANALYSIS_TTL: int = 86400
    CACHE_DASHBOARD_TTL: int = 300
    CACHE_GITHUB_TTL: int = 3600

    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:8000")
        return [origin.strip() for origin in origins.split(",")]

    @property
    def ENVIRONMENT(self) -> str:
        return os.getenv("ENVIRONMENT", "development")

    @property
    def IS_PRODUCTION(self) -> bool:
        return self.ENVIRONMENT == "production"


_settings = Settings()


def get_settings() -> Settings:
    return _settings
