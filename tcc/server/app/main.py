from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import get_settings
from .routers import health, foods
from .routers import food_detail  # novo endpoint de detalhe

# ADIÇÕES ↓↓↓
from .state.cache import get_cache            # acessor sem ciclo
from .routers import bulk                     # endpoints em lote
# ADIÇÕES ↑↑↑

def create_app() -> FastAPI:
    s = get_settings()
    app = FastAPI(title="Foods API", version="0.2.0")

    # warmup no startup (idempotente)
    @app.on_event("startup")
    def _warm_cache() -> None:
        get_cache().warm()  # evita rajada de GETs por item no "Todos"

    app.add_middleware(
        CORSMiddleware,
        allow_origins=s.CORS_ORIGINS,
        allow_credentials=False,  # por usar "*"
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(foods.router)
    app.include_router(bulk.router)       # novo
    app.include_router(food_detail.router)
    return app

app = create_app()