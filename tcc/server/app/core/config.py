from __future__ import annotations
import os
from functools import lru_cache
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

def _default_db_path() -> str:
    server_root = Path(__file__).resolve().parents[2]
    for p in [
        server_root / "data" / "alimentos.sqlite",
        server_root / "app" / "data" / "alimentos.sqlite",
    ]:
        if p.exists():
            return str(p)
    return str(server_root / "data" / "alimentos.sqlite")

class Settings(BaseModel):
    DB_PATH: str = os.getenv("DB_PATH", _default_db_path())

    # nomes (caso diferentes no seu .sqlite)
    TABLE_NAME: str = os.getenv("TABLE_NAME", "alimentos")
    COL_ID: str = os.getenv("COL_ID", "id")
    COL_DESC: str = os.getenv("COL_DESC", "description")
    COL_CAT: str = os.getenv("COL_CAT", "category")

    # CORS: inclua explicitamente portas do Expo Web
    CORS_ORIGINS: list[str] = [
        "http://localhost:8081",
        "http://127.0.0.1:8081",
        "http://localhost:19006",
        "http://127.0.0.1:19006",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",
    ]

@lru_cache
def get_settings() -> Settings:
    return Settings()