
from __future__ import annotations
from typing import List
from pydantic import BaseModel
import pydantic as _pyd

class SimilarItem(BaseModel):
    id: int
    description: str
    category: str
    score: float

    # Permite campos de nutrientes dinâmicos no nível raiz (ex.: energy_kcal, protein_g, ...)
    if hasattr(_pyd, "ConfigDict"):
        # Pydantic v2
        model_config = _pyd.ConfigDict(extra="allow")
    else:
        # Pydantic v1
        class Config:
            extra = getattr(_pyd, "Extra", None).allow if hasattr(_pyd, "Extra") else "allow"  # type: ignore

class SimilarOut(BaseModel):
    base_id: int
    metric: str
    columns: List[str]  # colunas usadas no KNN
    items: List[SimilarItem]
