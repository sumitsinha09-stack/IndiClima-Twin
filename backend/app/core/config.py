import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv
from pathlib import Path

# Resolve root .env (parent of backend folder)
root_dir = Path(__file__).resolve().parent.parent.parent
parent_env = root_dir / ".env"
local_env = root_dir / "backend" / ".env"

if parent_env.exists():
    load_dotenv(dotenv_path=parent_env)
elif local_env.exists():
    load_dotenv(dotenv_path=local_env)
else:
    load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://sumitsinha@localhost:5432/climatetwin"
    PORT: int = 8080
    HOST: str = "0.0.0.0"
    NODE_ENV: str = "development"
    LOG_LEVEL: str = "info"

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql+asyncpg://", 1)
        return url

    class Config:
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
