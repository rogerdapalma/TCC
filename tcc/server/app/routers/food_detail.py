from fastapi import APIRouter, HTTPException, Query
from typing import List, Dict, Any
from ..core.config import get_settings
from ..db.connection import get_connection

router = APIRouter(prefix="/v1", tags=["foods"])

def _split_csv(v: str | None) -> List[str]:
    if not v:
        return []
    return [p.strip() for p in v.split(",") if p.strip()]

@router.get("/food/{food_id}")
def get_food_detail(
    food_id: int,
    columns: str | None = Query(
        None,
        description="Lista separada por vírgula; serão validadas contra colunas numéricas disponíveis.",
    ),
):
    """
    Retorna um alimento (por id) incluindo as colunas solicitadas.
    Sempre retorna id/description/category, mais as colunas válidas informadas.
    """
    settings = get_settings()
    base_cols = [settings.COL_ID, settings.COL_DESC, settings.COL_CAT]

    req_cols = _split_csv(columns)
    with get_connection() as con:
        # Descobrir colunas numéricas válidas a partir do PRAGMA
        pragma = con.execute(f"PRAGMA table_info('{settings.TABLE_NAME}')").fetchall()
        all_cols = [r[1] for r in pragma]
        # mantém somente colunas existentes
        valid_cols = [c for c in req_cols if c in all_cols and c not in base_cols]
        sel_cols = base_cols + valid_cols
        cols_sql = ", ".join([f'"{c}"' for c in sel_cols])
        row = con.execute(
            f'SELECT {cols_sql} FROM "{settings.TABLE_NAME}" WHERE "{settings.COL_ID}" = ?',
            (food_id,),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail=f"Alimento {food_id} não encontrado")

        data = {col: row[idx] for idx, col in enumerate(sel_cols)}
        return {"item": data, "columns": sel_cols}