from __future__ import annotations
from fastapi import APIRouter
from pathlib import Path
from ..db.connection import get_connection
from ..utils.sql import quote_ident
from ..core.config import get_settings
from ..repositories.food_repository import FoodRepository

router = APIRouter(prefix="/debug", tags=["debug"])
repo = FoodRepository()

@router.get("/db")
def debug_db():
    s = get_settings()
    with get_connection() as conn:
        tables = [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")]
        meta = {}
        for t in tables:
            cols = conn.execute(f"PRAGMA table_info({quote_ident(t)});").fetchall()
            meta[t] = [c[1] for c in cols]
        sample = {}
        try:
            qt = quote_ident(repo.table)
            qcat = quote_ident(repo.col_cat)
            cur = conn.execute(f"SELECT DISTINCT {qcat} FROM {qt} WHERE {qcat} IS NOT NULL LIMIT 10;")
            sample["categories"] = [r[0] for r in cur.fetchall()]
        except Exception as e:
            sample["categories_error"] = str(e)

    return {
        "db_path": str(Path(s.DB_PATH).resolve()),
        "config": {"table": repo.table, "id": repo.col_id, "desc": repo.col_desc, "cat": repo.col_cat},
        "tables": tables,
        "columns": meta,
        "samples": sample,
    }