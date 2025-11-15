from __future__ import annotations
import sqlite3
from pathlib import Path
from threading import RLock
from typing import Any, Dict, Iterable, List, Optional, Tuple

from ..core.config import get_settings

BASE_COLS = ("id", "description", "category")

class FoodsCache:
    """Cache em memória da tabela inteira de alimentos.

    Por quê: evita rajada de GETs por item ao abrir o bloco "Todos".
    """

    def __init__(self) -> None:
        s = get_settings()
        self._db_path = Path(s.DB_PATH).resolve()
        self._table = s.TABLE_NAME
        self._col_id = s.COL_ID
        self._col_desc = s.COL_DESC
        self._col_cat = s.COL_CAT  # <- corrige para o nome existente no Settings
        self._lock = RLock()
        self._rows: Dict[int, Dict[str, Any]] = {}
        self._columns: List[str] = []
        self._etag: str = ""
        self._db_mtime: float = 0.0

    @property
    def etag(self) -> str:
        with self._lock:
            return self._etag

    @property
    def columns(self) -> List[str]:
        with self._lock:
            return list(self._columns)

    def warm(self) -> None:
        """Carrega toda a tabela (idempotente)."""
        with self._lock:
            con = self._connect()
            try:
                cols = self._list_columns(con)
                rows = self._load_all(con, cols)
            finally:
                con.close()
            self._columns = cols
            self._rows = rows
            self._db_mtime = self._mtime()
            self._etag = self._calc_etag()

    def refresh_if_dirty(self) -> bool:
        m = self._mtime()
        with self._lock:
            if not self._rows or m != self._db_mtime:
                self.warm()
                return True
            return False

    def get_all(
        self,
        columns: Optional[Iterable[str]] = None,
        category: Optional[str] = None,
        limit: Optional[int] = None,
        offset: int = 0,
        search: Optional[str] = None,
    ) -> Tuple[List[Dict[str, Any]], List[str]]:
        with self._lock:
            rows_iter = self._rows.values()
            if category:
                rows_iter = (r for r in rows_iter if (r.get("category") or "").lower() == category.lower())
            if search:
                q = search.lower()
                rows_iter = (r for r in rows_iter if q in str(r.get("description", "")).lower())

            rows = list(rows_iter)
            if offset:
                rows = rows[offset:]
            if limit is not None:
                rows = rows[: max(0, limit)]

            sel_cols = self._select_columns(columns)
            out_cols = list(BASE_COLS) + [c for c in sel_cols if c not in BASE_COLS]
            out = [{c: r.get(c) for c in out_cols} for r in rows]
            return out, out_cols

    def get_one(self, food_id: int, columns: Optional[Iterable[str]] = None) -> Tuple[Dict[str, Any], List[str]]:
        with self._lock:
            r = self._rows.get(int(food_id))
            if not r:
                return {}, []
            sel_cols = self._select_columns(columns)
            out_cols = list(BASE_COLS) + [c for c in sel_cols if c not in BASE_COLS]
            return {c: r.get(c) for c in out_cols}, out_cols

    # ---------------- internals ----------------
    def _connect(self) -> sqlite3.Connection:
        if not self._db_path.exists():
            raise FileNotFoundError(f"DB não encontrado em {self._db_path}")
        return sqlite3.connect(str(self._db_path), check_same_thread=False)

    def _list_columns(self, con: sqlite3.Connection) -> List[str]:
        rs = con.execute(f'PRAGMA table_info("{self._table}")').fetchall()
        phys_cols = [r[1] for r in rs]
        # normaliza para nomes lógicos esperados pela API
        col_map = {self._col_id: "id", self._col_desc: "description", self._col_cat: "category"}
        return [col_map.get(c, c) for c in phys_cols]

    def _load_all(self, con: sqlite3.Connection, logical_cols: List[str]) -> Dict[int, Dict[str, Any]]:
        # monta SELECT com alias das três bases
        sel_exprs: List[str] = []
        for c in logical_cols:
            if c == "id":
                sel_exprs.append(f'"{self._col_id}" AS "id"')
            elif c == "description":
                sel_exprs.append(f'"{self._col_desc}" AS "description"')
            elif c == "category":
                sel_exprs.append(f'"{self._col_cat}" AS "category"')
            else:
                sel_exprs.append(f'"{c}"')
        sql = f'SELECT {", ".join(sel_exprs)} FROM "{self._table}";'

        rows: Dict[int, Dict[str, Any]] = {}
        for tup in con.execute(sql):
            obj = {logical_cols[i]: tup[i] for i in range(len(logical_cols))}
            fid = int(obj.get("id"))
            rows[fid] = obj
        return rows

    def _mtime(self) -> float:
        try:
            return self._db_path.stat().st_mtime
        except Exception:
            return 0.0

    def _calc_etag(self) -> str:
        import hashlib
        h = hashlib.sha1()
        h.update(str(self._db_mtime).encode())
        h.update(str(len(self._rows)).encode())
        if self._rows:
            ids = sorted(self._rows.keys())
            h.update(str(ids[0]).encode())
            h.update(str(ids[-1]).encode())
        return h.hexdigest()

    def _select_columns(self, columns: Optional[Iterable[str]]) -> List[str]:
        if columns is None:
            return [c for c in self._columns if c not in BASE_COLS]
        wanted = [c.strip() for c in columns if c and c.strip()]
        valid_set = set(self._columns)
        return [c for c in wanted if c in valid_set]
