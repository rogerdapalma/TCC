
from __future__ import annotations
import sqlite3
from typing import List, Tuple, Optional
from fastapi import HTTPException
from ..db.connection import get_connection
from ..utils.sql import quote_ident
from ..core.config import get_settings

class FoodRepository:
    """Acesso ao SQLite (somente leitura)."""

    def __init__(self) -> None:
        s = get_settings()
        self.table = s.TABLE_NAME
        self.col_id = s.COL_ID
        self.col_desc = s.COL_DESC
        self.col_cat = s.COL_CAT

    # -- internos --
    def _conn(self) -> sqlite3.Connection:
        return get_connection()

    def _list_tables(self, conn: sqlite3.Connection) -> List[str]:
        return [r[0] for r in conn.execute("SELECT name FROM sqlite_master WHERE type='table'")]

    def _get_columns_for(self, conn: sqlite3.Connection, table: str) -> List[str]:
        cur = conn.execute(f"PRAGMA table_info({quote_ident(table)});")
        return [r[1] for r in cur.fetchall()]

    def _ensure_schema(self, conn: sqlite3.Connection) -> List[str]:
        tables = self._list_tables(conn)
        if self.table not in tables:
            raise HTTPException(500, detail=f"Tabela '{self.table}' não encontrada. Tabelas: {tables}")
        cols = self._get_columns_for(conn, self.table)
        missing = [c for c in [self.col_id, self.col_desc, self.col_cat] if c not in cols]
        if missing:
            raise HTTPException(500, detail=f"Colunas ausentes em '{self.table}': {missing} (cols: {cols})")
        return cols

    # -- API pública --
    def get_columns(self) -> List[str]:
        with self._conn() as conn:
            return self._get_columns_for(conn, self.table)

    def get_categories(self) -> List[str]:
        with self._conn() as conn:
            self._ensure_schema(conn)
            qt = quote_ident(self.table)
            qcat = quote_ident(self.col_cat)
            cur = conn.execute(
                f"SELECT DISTINCT {qcat} FROM {qt} WHERE {qcat} IS NOT NULL ORDER BY {qcat};"
            )
            return [str(r[0]) for r in cur.fetchall()]

    def get_foods_by_category(self, category: str) -> List[Tuple[int, str]]:
        with self._conn() as conn:
            self._ensure_schema(conn)
            qt = quote_ident(self.table)
            qcat = quote_ident(self.col_cat)
            qid = quote_ident(self.col_id)
            qdesc = quote_ident(self.col_desc)
            cur = conn.execute(
                f"SELECT {qid}, {qdesc} FROM {qt} WHERE {qcat}=? ORDER BY {qdesc};",
                (category,),
            )
            return [(int(r[0]), str(r[1])) for r in cur.fetchall()]

    def get_food_by_id(self, food_id: int) -> Optional[Tuple[int, str, str]]:
        with self._conn() as conn:
            self._ensure_schema(conn)
            qt = quote_ident(self.table)
            qid = quote_ident(self.col_id)
            qdesc = quote_ident(self.col_desc)
            qcat = quote_ident(self.col_cat)
            cur = conn.execute(
                f"SELECT {qid}, {qdesc}, {qcat} FROM {qt} WHERE {qid}=? LIMIT 1;",
                (food_id,),
            )
            row = cur.fetchone()
            return (int(row[0]), str(row[1]), str(row[2])) if row else None

    # -- similaridade: colunas numéricas e vetores --
    def get_numeric_columns(self) -> List[str]:
        with self._conn() as conn:
            info = conn.execute(f"PRAGMA table_info({quote_ident(self.table)});").fetchall()
            numeric_cols: List[str] = []
            for _, name, coltype, *_ in info:
                if name in (self.col_id, self.col_desc, self.col_cat):
                    continue
                t = (coltype or "").upper()
                if any(x in t for x in ("INT", "REAL", "NUM", "DEC", "DOUBLE", "FLOAT")):
                    numeric_cols.append(name)
            return numeric_cols

    def get_feature_matrix(
        self, columns: List[str], same_category: bool, pivot_id: int
    ) -> List[Tuple[int, str, str, List[float]]]:
        if not columns:
            return []
        with self._conn() as conn:
            self._ensure_schema(conn)
            qt = quote_ident(self.table)
            qid, qdesc, qcat = quote_ident(self.col_id), quote_ident(self.col_desc), quote_ident(self.col_cat)
            sel_cols = ",".join([quote_ident(c) for c in columns])

            params: List[object] = [pivot_id]
            where = f"WHERE {qid} != ?"

            if same_category:
                cat = conn.execute(f"SELECT {qcat} FROM {qt} WHERE {qid}=?", (pivot_id,)).fetchone()
                if cat is None:
                    return []
                where += f" AND {qcat} = ?"
                params.append(cat[0])

            cur = conn.execute(
                f"SELECT {qid}, {qdesc}, {qcat}, {sel_cols} FROM {qt} {where};",
                tuple(params),
            )
            rows = cur.fetchall()
            out: List[Tuple[int, str, str, List[float]]] = []
            for r in rows:
                fid = int(r[0])
                desc = str(r[1])
                cat = str(r[2])
                vec = []
                for x in r[3:]:
                    try:
                        vec.append(0.0 if (x is None or x == "") else float(x))
                    except Exception:
                        vec.append(0.0)
                out.append((fid, desc, cat, vec))
            return out

    def get_vector_for_id(self, food_id: int, columns: List[str]) -> List[float]:
        if not columns:
            return []
        with self._conn() as conn:
            qt = quote_ident(self.table)
            qid = quote_ident(self.col_id)
            sel_cols = ",".join([quote_ident(c) for c in columns])
            row = conn.execute(
                f"SELECT {sel_cols} FROM {qt} WHERE {qid}=? LIMIT 1;",
                (food_id,),
            ).fetchone()
            if not row:
                return []
            vec: List[float] = []
            for x in row:
                try:
                    vec.append(0.0 if (x is None or x == "") else float(x))
                except Exception:
                    vec.append(0.0)
            return vec
