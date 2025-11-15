from __future__ import annotations
import sqlite3
from pathlib import Path
from fastapi import HTTPException
from ..core.config import get_settings

def get_connection() -> sqlite3.Connection:
    db_path = Path(get_settings().DB_PATH).resolve()
    if not db_path.exists():
        # Por quê: erro explícito acelera diagnóstico
        raise HTTPException(status_code=500, detail=f"Banco não encontrado em: {db_path}")
    return sqlite3.connect(str(db_path), check_same_thread=False)