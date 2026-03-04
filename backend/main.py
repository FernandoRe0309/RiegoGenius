"""
main.py — FastAPI Application
Arranque: uvicorn main:app --reload --port 8000 --app-dir backend
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import create_tables
from ml_model import load_model
from routers import sensors, predictions, irrigation, alerts

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🌱 Iniciando API del invernadero…")
    create_tables()
    logger.info("✅ Tablas SQLite creadas / verificadas")
    load_model()
    logger.info("✅ Modelo ML listo")
    yield
    logger.info("👋 Apagando servidor…")


app = FastAPI(
    title="Invernadero IoT API",
    description="Backend para sistema de monitoreo y riego inteligente con ML",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(sensors.router)
app.include_router(predictions.router)
app.include_router(irrigation.router)
app.include_router(alerts.router)


@app.get("/", tags=["health"])
def root():
    return {
        "status": "ok",
        "service": "Invernadero IoT API",
        "version": "1.0.0",
        "endpoints": ["/sensors", "/predictions", "/irrigation", "/alerts", "/docs"],
    }


@app.get("/health", tags=["health"])
def health():
    from ml_model import get_metadata
    meta = get_metadata()
    return {
        "status": "ok",
        "model_loaded": bool(meta),
        "model_accuracy": meta.get("accuracy") if meta else None,
    }
