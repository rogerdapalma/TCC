from __future__ import annotations
from fastapi import APIRouter, Header, HTTPException, Query, Response
from fastapi.responses import JSONResponse
from ..state.cache import get_cache

router = APIRouter(prefix="/v1", tags=["foods"])

def _split_csv(v: str | None) -> list[str]:
    if not v:
        return []
    return [p.strip() for p in v.split(",") if p.strip()]

@router.get("/foods/all")
def all_foods(
    response: Response,
    columns: str | None = Query(None, description="CSV de colunas adicionais"),
    category: str | None = Query(None),
    search: str | None = Query(None, description="Filtro por trecho na descrição"),
    limit: int | None = Query(None, ge=1, le=10000),
    offset: int = Query(0, ge=0),
    if_none_match: str | None = Header(None, convert_underscores=True),
):
    cache = get_cache()
    cache.refresh_if_dirty()
    etag = cache.etag
    if if_none_match and if_none_match.strip('"') == etag:
        return Response(status_code=304)
    rows, cols = cache.get_all(
        columns=_split_csv(columns), category=category, search=search, limit=limit, offset=offset
    )
    resp = JSONResponse({"items": rows, "columns": cols})
    resp.headers["ETag"] = etag
    resp.headers["Cache-Control"] = "public, max-age=3600"
    return resp

@router.head("/foods/all")
def head_all_foods():
    cache = get_cache()
    cache.refresh_if_dirty()
    return Response(headers={"ETag": cache.etag, "Cache-Control": "public, max-age=3600"})

@router.get("/foods/{food_id}")
@router.get("/foods/{food_id}/detail")
def alias_food_detail(food_id: int, columns: str | None = Query(None)):
    cache = get_cache()
    cache.refresh_if_dirty()
    row, cols = cache.get_one(food_id, columns=_split_csv(columns))
    if not row:
        raise HTTPException(404, detail=f"Alimento {food_id} não encontrado")
    return {"item": row, "columns": cols}

