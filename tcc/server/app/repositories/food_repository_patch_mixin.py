
from __future__ import annotations
from typing import List, Dict, Any
from ..db.connection import get_connection
from ..utils.sql import quote_ident
from ..core.config import get_settings

class FoodRepositoryPatchMixin:
    """Utilitários extras para o endpoint de similares."""

    def get_values_for_ids(self, ids: List[int], cols: List[str]) -> Dict[int, Dict[str, Any]]:
        if not ids or not cols:
            return {}
        s = get_settings()
        table = quote_ident(getattr(self, "table", s.TABLE_NAME))
        qid = quote_ident(getattr(self, "col_id", s.COL_ID))
        qcols = ", ".join(quote_ident(c) for c in cols)
        placeholders = ", ".join(["?"] * len(ids))

        out: Dict[int, Dict[str, Any]] = {}
        with get_connection() as conn:
            cur = conn.execute(
                f"SELECT {qid}, {qcols} FROM {table} WHERE {qid} IN ({placeholders});",
                tuple(ids),
            )
            names = [desc[0] for desc in cur.description]
            for row in cur.fetchall():
                rid = int(row[0])
                data: Dict[str, Any] = {}
                for name, val in zip(names[1:], row[1:]):
                    try:
                        data[name] = None if val is None or val == "" else float(val)
                    except Exception:
                        data[name] = None
                out[rid] = data
        return out
