"""
routers/sensors.py
GET  /sensors/current   — lectura actual (mock o real)
POST /sensors/          — guardar lectura en BD
GET  /sensors/history   — historial filtrado por tipo y horas
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import select
from datetime import datetime, timedelta
import random
import math

from database import get_db, SensorReading, Alert as AlertModel
from schemas import SensorReadingCreate, SensorReadingOut

router = APIRouter(prefix="/sensors", tags=["sensors"])


def _mock_reading() -> dict:
    t = datetime.utcnow()
    hour = t.hour
    base_temp = 22 + 5 * math.sin((hour - 6) * math.pi / 12)
    if 6 <= hour <= 20:
        base_light = max(0, 25000 * math.sin((hour - 6) * math.pi / 14))
    else:
        base_light = 0

    return {
        "source"       : "simulated",
        "temperature"  : round(base_temp + random.gauss(0, 0.8), 1),
        "air_humidity" : round(random.gauss(68, 5), 1),
        "soil_humidity": round(random.gauss(55, 12), 1),
        "light"        : round(max(0, base_light + random.gauss(0, 2000))),
        "co2"          : round(random.gauss(900, 80)),
    }


@router.get("/current")
def get_current_sensors():
    return {"readings": _mock_reading(), "source": "simulated"}


@router.post("/", response_model=SensorReadingOut, status_code=201)
def save_reading(reading: SensorReadingCreate, db: Session = Depends(get_db)):
    db_reading = SensorReading(**reading.model_dump())
    db.add(db_reading)
    db.commit()
    db.refresh(db_reading)
    _auto_create_alerts(db_reading, db)
    return db_reading


@router.get("/history")
def get_history(
    sensor_type: str = Query("temperature"),
    hours: int = Query(24, ge=1, le=720),
    db: Session = Depends(get_db),
):
    since = datetime.utcnow() - timedelta(hours=hours)
    col_map = {
        "temperature"  : SensorReading.temperature,
        "air_humidity" : SensorReading.air_humidity,
        "soil_humidity": SensorReading.soil_humidity,
        "light"        : SensorReading.light,
        "co2"          : SensorReading.co2,
    }
    col = col_map.get(sensor_type, SensorReading.temperature)

    rows = db.execute(
        select(SensorReading.timestamp, col)
        .where(SensorReading.timestamp >= since)
        .order_by(SensorReading.timestamp)
    ).all()

    if rows:
        return [{"timestamp": str(r[0]), "value": r[1]} for r in rows]

    return _synthetic_history(sensor_type, hours)


def _synthetic_history(sensor_type: str, hours: int) -> list:
    now = datetime.utcnow()
    means = {"temperature": 23, "air_humidity": 68, "soil_humidity": 55, "light": 12000, "co2": 900}
    stds  = {"temperature": 3,  "air_humidity": 8,  "soil_humidity": 10, "light": 5000,  "co2": 100}
    return [
        {
            "timestamp": (now - timedelta(hours=hours - i)).isoformat(),
            "value": round(random.gauss(means[sensor_type], stds[sensor_type]), 2),
        }
        for i in range(hours)
    ]


THRESHOLDS = {
    "temperature" : {"min": 15, "max": 32, "critical_min": 10, "critical_max": 38},
    "air_humidity": {"min": 50, "max": 85, "critical_min": 30, "critical_max": 95},
    "soil_humidity":{"min": 40, "max": 85, "critical_min": 25, "critical_max": 95},
    "co2"         : {"min": 400,"max": 1800,"critical_min": 300,"critical_max": 2500},
}

def _auto_create_alerts(reading: SensorReading, db: Session):
    sensor_vals = {
        "temperature" : reading.temperature,
        "air_humidity": reading.air_humidity,
        "soil_humidity": reading.soil_humidity,
        "co2"         : reading.co2,
    }
    for sensor, value in sensor_vals.items():
        th = THRESHOLDS.get(sensor)
        if not th:
            continue
        severity = msg = threshold = None
        if value < th["critical_min"] or value > th["critical_max"]:
            severity  = "critical"
            threshold = th["critical_min"] if value < th["critical_min"] else th["critical_max"]
            msg = f"{sensor} CRÍTICO: {value:.1f} (umbral: {threshold})"
        elif value < th["min"] or value > th["max"]:
            severity  = "warning"
            threshold = th["min"] if value < th["min"] else th["max"]
            msg = f"{sensor} fuera de rango: {value:.1f} (umbral: {threshold})"

        if severity:
            db.add(AlertModel(
                sensor_type=sensor, severity=severity,
                message=msg, value=value, threshold=threshold
            ))
    db.commit()
