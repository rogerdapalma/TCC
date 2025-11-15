from __future__ import annotations
from pydantic import BaseModel
from typing import List

class ColumnsOut(BaseModel):
    columns: List[str]

class CategoriesOut(BaseModel):
    categories: List[str]

class FoodItem(BaseModel):
    id: int
    description: str

class FoodsOut(BaseModel):
    category: str
    items: List[FoodItem]