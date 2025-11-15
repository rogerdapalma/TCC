from __future__ import annotations
from ..cache.foods_cache import FoodsCache

_cache: FoodsCache | None = None

def get_cache() -> FoodsCache:
    """Singleton do cache; faz warm no primeiro uso."""
    global _cache
    if _cache is None:
        _cache = FoodsCache()
        _cache.warm()
    return _cache