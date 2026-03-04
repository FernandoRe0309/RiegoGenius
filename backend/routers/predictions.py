"""
routers/predictions.py
POST /predictions/predict   — corre el modelo RF y guarda resultado
GET  /predictions/          — historial de predicciones
GET  /predictions/latest    — última predicción
GET  /predictions/model-info — metadata del modelo
POST /predictions/retrain   — fuerza reentrenamiento
"""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
import logging

from database import get_db, SensorReading, Prediction as PredictionModel
from schemas import PredictionOut
from ml_model import predict_irrigation, train_model, get_metadata, FEATURE_COLS

router = APIRouter(prefix="/predictions", tags=["predictions"])
logger = logging.getLogger(__name__)


@router.post("/predict", response_model=PredictionOut, status_code=201)
def run_prediction(
    body: dict,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    sensor_reading_id = body.get("sensor_reading_id")
    if sensor_reading_id:
        row = db.get(SensorReading, sensor_reading_id)
        if not row:
            raise HTTPException(404, f"SensorReading id={sensor_reading_id} no encontrado")
        features = {col: getattr(row, col) for col in FEATURE_COLS}
    else:
        features = {col: body.get(col) for col in FEATURE_COLS}

    result = predict_irrigation(features)
    meta   = get_metadata()

    db_pred = PredictionModel(
        sensor_reading_id      = sensor_reading_id,
        should_irrigate        = result["should_irrigate"],
        confidence             = result["confidence"],
        urgency                = result["urgency"],
        estimated_duration_min = result["estimated_duration_min"],
        sensor_factors         = result["sensor_factors"],
        weather_factors        = result["weather_factors"],
        model_version          = meta.get("version", "v1"),
        model_algorithm        = meta.get("algorithm", "RandomForest"),
        model_accuracy         = meta.get("accuracy"),
    )
    db.add(db_pred)
    db.commit()
    db.refresh(db_pred)

    background_tasks.add_task(_check_retrain, db)
    return db_pred


@router.get("/latest", response_model=PredictionOut | None)
def get_latest_prediction(db: Session = Depends(get_db)):
    return db.execute(
        select(PredictionModel).order_by(desc(PredictionModel.timestamp)).limit(1)
    ).scalar_one_or_none()


@router.get("/", response_model=list[PredictionOut])
def list_predictions(limit: int = 50, db: Session = Depends(get_db)):
    return db.execute(
        select(PredictionModel).order_by(desc(PredictionModel.timestamp)).limit(limit)
    ).scalars().all()


@router.get("/model-info")
def model_info():
    meta = get_metadata()
    if not meta:
        return {"status": "no_model", "message": "El modelo no ha sido entrenado aún"}
    return {
        "status"         : "ok",
        "algorithm"      : meta.get("algorithm"),
        "version"        : meta.get("version"),
        "accuracy"       : meta.get("accuracy"),
        "cv_mean"        : meta.get("cv_mean"),
        "cv_std"         : meta.get("cv_std"),
        "trained_at"     : meta.get("trained_at"),
        "n_train_samples": meta.get("n_train_samples"),
        "n_features"     : meta.get("n_features"),
        "feature_names"  : meta.get("feature_names"),
        "has_real_data"  : meta.get("has_real_data", False),
        "classes"        : meta.get("classes"),
    }


@router.post("/retrain")
def force_retrain(db: Session = Depends(get_db)):
    import pandas as pd
    rows = db.execute(select(SensorReading)).scalars().all()
    extra_df = None
    if rows:
        records  = [{col: getattr(r, col) for col in FEATURE_COLS} for r in rows]
        extra_df = pd.DataFrame(records)

    meta = train_model(extra_df)
    import ml_model
    ml_model._pipeline = None
    ml_model._metadata = {}
    return {
        "status"    : "retrained",
        "accuracy"  : meta["accuracy"],
        "cv_mean"   : meta["cv_mean"],
        "samples"   : meta["n_train_samples"],
        "trained_at": meta["trained_at"],
    }


_readings_since_last_train = 0

def _check_retrain(db: Session):
    global _readings_since_last_train
    from ml_model import RETRAIN_EVERY
    import pandas as pd

    _readings_since_last_train += 1
    if _readings_since_last_train < RETRAIN_EVERY:
        return

    logger.info(f"Reentrenando modelo…")
    rows = db.execute(select(SensorReading)).scalars().all()
    extra_df = None
    if rows:
        records  = [{col: getattr(r, col) for col in FEATURE_COLS} for r in rows]
        extra_df = pd.DataFrame(records)

    try:
        import ml_model
        train_model(extra_df)
        ml_model._pipeline = None
        ml_model._metadata = {}
        _readings_since_last_train = 0
        logger.info("Reentrenamiento completado")
    except Exception as e:
        logger.error(f"Error en reentrenamiento: {e}")
