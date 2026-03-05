"""
database.py — Configuración SQLite + modelos SQLAlchemy
Tablas: sensor_readings, predictions, irrigation_events, alerts
"""

from sqlalchemy import (
    create_engine, Column, Integer, Float, String, Boolean,
    DateTime, Text, JSON, func
)
from sqlalchemy.orm import DeclarativeBase, Session
from datetime import datetime

DATABASE_URL = "sqlite:///./invernadero.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}   # necesario para SQLite en FastAPI
)


class Base(DeclarativeBase):
    pass


# ─────────────────────────────────────────────────────────────
# Tabla 1: Lecturas de sensores
# ─────────────────────────────────────────────────────────────
class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id                = Column(Integer, primary_key=True, index=True)
    timestamp         = Column(DateTime, default=datetime.utcnow, index=True)
    source            = Column(String(20), default="simulated")   # "real" | "simulated"

    # Sensores internos
    temperature       = Column(Float, nullable=False)   # °C
    air_humidity      = Column(Float, nullable=False)   # %
    soil_humidity     = Column(Float, nullable=False)   # %
    light             = Column(Float, nullable=False)   # lux
    co2               = Column(Float, nullable=False)   # ppm

    # Datos climáticos externos (nullable: pueden no estar disponibles)
    weather_temp      = Column(Float, nullable=True)
    weather_humidity  = Column(Float, nullable=True)
    weather_rain_prob = Column(Float, nullable=True)    # 0-100
    weather_wind      = Column(Float, nullable=True)    # km/h
    weather_clouds    = Column(Float, nullable=True)    # %
    weather_temp_24h  = Column(Float, nullable=True)    # pronóstico +24 h


# ─────────────────────────────────────────────────────────────
# Tabla 2: Predicciones del modelo ML
# ─────────────────────────────────────────────────────────────
class Prediction(Base):
    __tablename__ = "predictions"

    id                    = Column(Integer, primary_key=True, index=True)
    timestamp             = Column(DateTime, default=datetime.utcnow, index=True)
    sensor_reading_id     = Column(Integer, nullable=True)   # FK lógica (no enforced)

    # Resultado del modelo
    should_irrigate       = Column(Boolean, nullable=False)
    confidence            = Column(Float, nullable=False)    # 0-1
    urgency               = Column(String(10), nullable=False)  # "none"|"low"|"medium"|"high"
    estimated_duration_min= Column(Integer, nullable=True)

    # Factores explicativos (JSON)
    sensor_factors        = Column(JSON, default=list)
    weather_factors       = Column(JSON, default=list)

    # Metadata del modelo
    model_version         = Column(String(20), default="v1")
    model_algorithm       = Column(String(40), default="RandomForest")
    model_accuracy        = Column(Float, nullable=True)


# ─────────────────────────────────────────────────────────────
# Tabla 3: Eventos de riego
# ─────────────────────────────────────────────────────────────
class IrrigationEvent(Base):
    __tablename__ = "irrigation_events"

    id                = Column(Integer, primary_key=True, index=True)
    started_at        = Column(DateTime, default=datetime.utcnow, index=True)
    ended_at          = Column(DateTime, nullable=True)
    duration_min      = Column(Float, nullable=True)

    trigger           = Column(String(20), default="manual")  # "manual" | "automatic"
    triggered_by      = Column(String(40), default="user")    # "user" | "ml_model"
    prediction_id     = Column(Integer, nullable=True)         # FK lógica

    zone              = Column(String(40), default="general")
    flow_liters       = Column(Float, nullable=True)
    notes             = Column(Text, nullable=True)
    active            = Column(Boolean, default=True)


# ─────────────────────────────────────────────────────────────
# Tabla 4: Alertas
# ─────────────────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id                = Column(Integer, primary_key=True, index=True)
    created_at        = Column(DateTime, default=datetime.utcnow, index=True)
    resolved_at       = Column(DateTime, nullable=True)

    sensor_type       = Column(String(30), nullable=False)
    severity          = Column(String(10), nullable=False)   # "info"|"warning"|"critical"
    message           = Column(String(255), nullable=False)
    value             = Column(Float, nullable=True)
    threshold         = Column(Float, nullable=True)
    resolved          = Column(Boolean, default=False)


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────
def create_tables():
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency para FastAPI (yields Session)."""
    with Session(engine) as db:
        yield db
