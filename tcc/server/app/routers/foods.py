from __future__ import annotations
from fastapi import APIRouter, HTTPException, Query, Path
from ..repositories.food_repository import FoodRepository
from ..models.food import ColumnsOut, CategoriesOut, FoodItem, FoodsOut
from ..models.similarity import SimilarItem, SimilarOut
from ..services.similarity_service import knn as knn_compute

router = APIRouter(prefix="/v1", tags=["foods"])
repo = FoodRepository()


@router.get("/columns", response_model=ColumnsOut)
def get_columns():
    return {"columns": repo.get_columns()}


@router.get("/categories", response_model=CategoriesOut)
def get_categories():
    return {"categories": repo.get_categories()}


@router.get("/foods", response_model=FoodsOut)
def get_foods_by_category(category: str = Query(..., description="Nome exato da categoria")):
    cats = repo.get_categories()
    if category not in cats:
        raise HTTPException(status_code=404, detail=f"Categoria não encontrada: {category}")
    items = [FoodItem(id=i, description=d) for i, d in repo.get_foods_by_category(category)]
    return {"category": category, "items": items}


@router.get("/foods/{food_id}/similar", response_model=SimilarOut, tags=["similarity"])
def similar_foods(
    food_id: int = Path(..., description="ID do alimento base"),
    k: int = Query(10, ge=1, le=100, description="Qtd de vizinhos"),
    metric: str = Query("cosine", pattern="^(cosine|euclidean)$"),
    same_category: bool = Query(True, description="Limitar à mesma categoria do alimento base"),
    columns: str = Query("auto", description="Lista separada por vírgula; use 'auto' p/ detectar numéricas"),
):
    # detectar colunas
    if columns == "auto":
        feat_cols = repo.get_numeric_columns()
    else:
        feat_cols = [c.strip() for c in columns.split(",") if c.strip()]
    if not feat_cols:
        raise HTTPException(500, detail="Nenhuma coluna numérica encontrada. Passe ?columns=...")

    base_vec = repo.get_vector_for_id(food_id, feat_cols)
    if not base_vec:
        raise HTTPException(404, detail=f"Alimento id={food_id} não encontrado")

    others = repo.get_feature_matrix(feat_cols, same_category, pivot_id=food_id)
    scored = knn_compute(base_vec, others, k=k, metric=metric)

    items = [SimilarItem(id=fid, description=desc, category=cat, score=float(score)) for fid, desc, cat, score in scored]
    return SimilarOut(base_id=food_id, metric=metric, columns=feat_cols, items=items)