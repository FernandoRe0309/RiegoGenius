"""
schemas.py — Modelos Pydantic (validación de request/response)
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ─────────────────────────────────────────────────────────────
# Sensores
# ─────────────────────────────────────────────────────────────
class SensorReadingCreate(BaseModel):
    source: str = "simulated"
    temperature: float = Field(..., ge=-10, le=60)
    air_humidity: float = Field(..., ge=0, le=100)
    soil_humidity: float = Field(..., ge=0, le=100)
    light: float = Field(..., ge=0, le=120_000)
    co2: float = Field(..., ge=300, le=5000)
    weather_temp: Optional[float] = None
    weather_humidity: Optional[float] = None
    weather_rain_prob: Optional[float] = Field(None, ge=0, le=100)
    weather_wind: Optional[float] = Field(None, ge=0)
    weather_clouds: Optional[float] = Field(None, ge=0, le=100)
    weather_temp_24h: Optional[float] = None


class SensorReadingOut(SensorReadingCreate):
    id: int
    timestamp: datetime

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Predicciones
# ─────────────────────────────────────────────────────────────
class PredictionOut(BaseModel):
    id: int
    timestamp: datetime
    should_irrigate: bool
    confidence: float
    urgency: str
    estimated_duration_min: Optional[int]
    sensor_factors: List[str]
    weather_factors: List[str]
    model_version: str
    model_algorithm: str
    model_accuracy: Optional[float]

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Riego
# ─────────────────────────────────────────────────────────────
class IrrigationToggle(BaseModel):
    active: bool
    trigger: str = "manual"
    triggered_by: str = "user"
    zone: str = "general"
    prediction_id: Optional[int] = None
    notes: Optional[str] = None


class IrrigationEventOut(BaseModel):
    id: int
    started_at: datetime
    ended_at: Optional[datetime]
    duration_min: Optional[float]
    trigger: str
    triggered_by: str
    zone: str
    flow_liters: Optional[float]
    notes: Optional[str]
    active: bool

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────
# Alertas
# ─────────────────────────────────────────────────────────────
class AlertOut(BaseModel):
    id: int
    created_at: datetime
    resolved_at: Optional[datetime]
    sensor_type: str
    severity: str
    message: str
    value: Optional[float]
    threshold: Optional[float]
    resolved: bool

    model_config = {"from_attributes": True}
