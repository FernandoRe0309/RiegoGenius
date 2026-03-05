"""
ml_model.py — Modelo de Machine Learning REAL con scikit-learn
───────────────────────────────────────────────────────────────
Algoritmo   : Random Forest Classifier
Target      : Decisión de riego (no_irrigation / irrigate / urgent_irrigation)
Features    : 11 variables (5 sensores + 6 clima)
Entrenamiento inicial: datos sintéticos realistas de jitomate en invernadero
Reentrenamiento: automático cada 500 lecturas reales acumuladas en DB
"""

import os
import json
import logging
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from pathlib import Path
from typing import Optional

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

logger = logging.getLogger(__name__)

MODEL_PATH    = Path("models/rf_irrigation.joblib")
METADATA_PATH = Path("models/model_metadata.json")
RETRAIN_EVERY = 500   # lecturas reales antes de reentrenar

# Etiquetas del clasificador
CLASSES = ["no_irrigation", "irrigate", "urgent_irrigation"]


# ─────────────────────────────────────────────────────────────
# 1. Generación de datos sintéticos de entrenamiento
# ─────────────────────────────────────────────────────────────
def _generate_training_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Genera un dataset sintético realista para jitomate en invernadero.
    Las reglas agronómicas se basan en rangos óptimos documentados:
      - Temperatura óptima: 18-28 °C
      - Humedad del aire: 60-80%
      - Humedad del suelo: 60-75% (riego cuando baja de 45%)
      - CO2: 800-1200 ppm (enriquecimiento)
      - Luz: 5000-40000 lux durante fotoperíodo
    """
    rng = np.random.default_rng(42)

    # ── Sensores internos ──
    temperature  = rng.normal(23, 4, n_samples).clip(10, 40)
    air_humidity = rng.normal(68, 12, n_samples).clip(30, 100)
    soil_humidity= rng.normal(55, 20, n_samples).clip(0, 100)
    light        = rng.normal(18000, 9000, n_samples).clip(0, 80000)
    co2          = rng.normal(900, 200, n_samples).clip(300, 2500)

    # ── Clima exterior ──
    weather_temp      = temperature + rng.normal(0, 5, n_samples)
    weather_humidity  = rng.normal(60, 15, n_samples).clip(0, 100)
    weather_rain_prob = rng.beta(1.5, 5, n_samples) * 100
    weather_wind      = rng.exponential(10, n_samples).clip(0, 80)
    weather_clouds    = rng.uniform(0, 100, n_samples)
    weather_temp_24h  = weather_temp + rng.normal(0, 3, n_samples)

    df = pd.DataFrame({
        "temperature"    : temperature,
        "air_humidity"   : air_humidity,
        "soil_humidity"  : soil_humidity,
        "light"          : light,
        "co2"            : co2,
        "weather_temp"   : weather_temp,
        "weather_humidity": weather_humidity,
        "weather_rain_prob": weather_rain_prob,
        "weather_wind"   : weather_wind,
        "weather_clouds" : weather_clouds,
        "weather_temp_24h": weather_temp_24h,
    })

    # ── Etiquetado agronómico ──
    def label_row(r):
        # Urgente: suelo muy seco + temperatura alta
        if r.soil_humidity < 30 and r.temperature > 28:
            return "urgent_irrigation"
        if r.soil_humidity < 30:
            return "urgent_irrigation"
        # Regar: suelo bajo del umbral óptimo, poca lluvia esperada
        if r.soil_humidity < 50 and r.weather_rain_prob < 40:
            return "irrigate"
        if r.soil_humidity < 45:
            return "irrigate"
        # Alta temperatura consume agua más rápido
        if r.soil_humidity < 60 and r.temperature > 30:
            return "irrigate"
        # No regar: lluvia inminente o suelo húmedo
        return "no_irrigation"

    df["label"] = df.apply(label_row, axis=1)

    # Añadir ruido de etiquetado (5%) — simula incertidumbre real
    noise_idx = rng.choice(df.index, size=int(n_samples * 0.05), replace=False)
    for i in noise_idx:
        df.loc[i, "label"] = rng.choice(CLASSES)

    return df


FEATURE_COLS = [
    "temperature", "air_humidity", "soil_humidity", "light", "co2",
    "weather_temp", "weather_humidity", "weather_rain_prob",
    "weather_wind", "weather_clouds", "weather_temp_24h",
]


# ─────────────────────────────────────────────────────────────
# 2. Entrenamiento
# ─────────────────────────────────────────────────────────────
def train_model(extra_df: Optional[pd.DataFrame] = None) -> dict:
    """
    Entrena (o reentrena) el Random Forest.
    Si se pasa extra_df, se combina con los datos sintéticos.
    Retorna métricas del entrenamiento.
    """
    logger.info("Iniciando entrenamiento del modelo ML…")
    Path("models").mkdir(exist_ok=True)

    # Dataset base
    df = _generate_training_data(2000)

    # Si hay datos reales acumulados, agregarlos con más peso
    if extra_df is not None and len(extra_df) >= 50:
        extra_df = extra_df.copy()
        # Duplicar datos reales para darles más peso en el entrenamiento
        df = pd.concat([df, extra_df, extra_df], ignore_index=True)
        logger.info(f"  → Incorporando {len(extra_df)} lecturas reales al entrenamiento")

    X = df[FEATURE_COLS]
    y = df["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Pipeline: StandardScaler + Random Forest
    pipeline = Pipeline([
        ("scaler", StandardScaler()),
        ("clf", RandomForestClassifier(
            n_estimators=200,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42,
            n_jobs=-1,
        ))
    ])

    pipeline.fit(X_train, y_train)

    # Métricas
    y_pred    = pipeline.predict(X_test)
    accuracy  = accuracy_score(y_test, y_pred)
    cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="accuracy")
    report    = classification_report(y_test, y_pred, output_dict=True)

    logger.info(f"  → Accuracy: {accuracy:.3f} | CV mean: {cv_scores.mean():.3f}")

    # Guardar modelo
    joblib.dump(pipeline, MODEL_PATH)

    metadata = {
        "trained_at"     : datetime.utcnow().isoformat(),
        "algorithm"      : "RandomForestClassifier",
        "version"        : f"v{datetime.utcnow().strftime('%Y%m%d')}",
        "accuracy"       : round(float(accuracy), 4),
        "cv_mean"        : round(float(cv_scores.mean()), 4),
        "cv_std"         : round(float(cv_scores.std()), 4),
        "n_train_samples": len(X_train),
        "n_features"     : len(FEATURE_COLS),
        "feature_names"  : FEATURE_COLS,
        "classes"        : CLASSES,
        "report"         : report,
        "has_real_data"  : extra_df is not None,
    }
    METADATA_PATH.write_text(json.dumps(metadata, indent=2))

    return metadata


# ─────────────────────────────────────────────────────────────
# 3. Carga del modelo
# ─────────────────────────────────────────────────────────────
_pipeline: Optional[Pipeline] = None
_metadata: dict = {}


def load_model() -> Pipeline:
    global _pipeline, _metadata
    if _pipeline is None:
        if not MODEL_PATH.exists():
            logger.info("Modelo no encontrado, entrenando desde cero…")
            train_model()
        _pipeline = joblib.load(MODEL_PATH)
        if METADATA_PATH.exists():
            _metadata = json.loads(METADATA_PATH.read_text())
        logger.info("Modelo cargado correctamente")
    return _pipeline


def get_metadata() -> dict:
    if not _metadata and METADATA_PATH.exists():
        return json.loads(METADATA_PATH.read_text())
    return _metadata


# ─────────────────────────────────────────────────────────────
# 4. Predicción
# ─────────────────────────────────────────────────────────────
def predict_irrigation(features: dict) -> dict:
    """
    Recibe un dict con las 11 features y retorna la predicción completa.
    Features faltantes (clima) se rellenan con la media del training set.
    """
    model = load_model()

    # Rellenar features de clima con valores por defecto si no están disponibles
    defaults = {
        "weather_temp"     : features.get("temperature", 23),
        "weather_humidity" : 65.0,
        "weather_rain_prob": 20.0,
        "weather_wind"     : 10.0,
        "weather_clouds"   : 30.0,
        "weather_temp_24h" : features.get("temperature", 23),
    }
    for col in FEATURE_COLS:
        if col not in features or features[col] is None:
            features[col] = defaults.get(col, 0.0)

    X = pd.DataFrame([{col: features[col] for col in FEATURE_COLS}])

    proba    = model.predict_proba(X)[0]
    classes  = model.classes_
    pred_cls = classes[np.argmax(proba)]
    confidence = float(np.max(proba))

    # Mapear clase → urgencia
    urgency_map = {
        "no_irrigation"    : "none",
        "irrigate"         : "medium",
        "urgent_irrigation": "high",
    }

    # Duración estimada basada en urgencia y humedad del suelo
    soil_deficit = max(0, 65 - features.get("soil_humidity", 50))
    duration_map = {
        "no_irrigation"    : None,
        "irrigate"         : int(10 + soil_deficit * 0.5),
        "urgent_irrigation": int(20 + soil_deficit * 0.8),
    }

    # Factores explicativos
    sensor_factors  = _explain_sensor_factors(features)
    weather_factors = _explain_weather_factors(features)

    # Importancias del RF para el top-3 de features
    rf_clf      = model.named_steps["clf"]
    importances = dict(zip(FEATURE_COLS, rf_clf.feature_importances_))
    top_features= sorted(importances, key=importances.get, reverse=True)[:3]

    return {
        "should_irrigate"        : pred_cls != "no_irrigation",
        "confidence"             : round(confidence, 4),
        "urgency"                : urgency_map[pred_cls],
        "estimated_duration_min" : duration_map[pred_cls],
        "raw_class"              : pred_cls,
        "class_probabilities"    : {cls: round(float(p), 4)
                                    for cls, p in zip(classes, proba)},
        "top_features"           : top_features,
        "sensor_factors"         : sensor_factors,
        "weather_factors"        : weather_factors,
    }


# ─────────────────────────────────────────────────────────────
# 5. Generadores de factores explicativos
# ─────────────────────────────────────────────────────────────
def _explain_sensor_factors(f: dict) -> list[str]:
    factors = []
    soil = f.get("soil_humidity", 0)
    temp = f.get("temperature", 0)
    co2  = f.get("co2", 0)
    light= f.get("light", 0)
    air  = f.get("air_humidity", 0)

    if soil < 35:
        factors.append(f"⚠️ Humedad del suelo crítica: {soil:.1f}% (óptimo 60-75%)")
    elif soil < 50:
        factors.append(f"🌱 Humedad del suelo baja: {soil:.1f}% — se recomienda riego pronto")
    elif soil > 80:
        factors.append(f"💧 Suelo saturado: {soil:.1f}% — evitar riego")
    else:
        factors.append(f"✅ Humedad del suelo óptima: {soil:.1f}%")

    if temp > 32:
        factors.append(f"🌡️ Temperatura alta: {temp:.1f}°C — aumenta evapotranspiración")
    elif temp < 15:
        factors.append(f"🌡️ Temperatura baja: {temp:.1f}°C — menor demanda hídrica")
    else:
        factors.append(f"✅ Temperatura óptima: {temp:.1f}°C")

    if co2 > 1500:
        factors.append(f"🌿 CO₂ elevado: {co2:.0f} ppm — mayor fotosíntesis y consumo de agua")
    elif co2 < 500:
        factors.append(f"⚠️ CO₂ bajo: {co2:.0f} ppm — fotosíntesis limitada")

    if air < 50:
        factors.append(f"💨 Humedad ambiental baja: {air:.1f}% — aumenta transpiración foliar")

    if light > 50000:
        factors.append(f"☀️ Radiación intensa: {light:.0f} lux — alta demanda hídrica")

    return factors[:5]


def _explain_weather_factors(f: dict) -> list[str]:
    factors = []
    rain  = f.get("weather_rain_prob")
    wind  = f.get("weather_wind")
    temp  = f.get("weather_temp")
    t24   = f.get("weather_temp_24h")

    if rain is None:
        return ["ℹ️ Sin datos climáticos — predicción basada solo en sensores"]

    if rain > 70:
        factors.append(f"🌧️ Lluvia probable ({rain:.0f}%) — se puede posponer el riego")
    elif rain > 40:
        factors.append(f"🌦️ Posible lluvia ({rain:.0f}%) — monitorear")
    else:
        factors.append(f"☀️ Baja probabilidad de lluvia ({rain:.0f}%)")

    if wind and wind > 25:
        factors.append(f"💨 Viento fuerte: {wind:.1f} km/h — evaporación acelerada")

    if temp and temp > 30:
        factors.append(f"🌡️ Temperatura exterior alta: {temp:.1f}°C")

    if t24 and temp and t24 > temp + 3:
        factors.append(f"📈 Pronóstico: temperatura subirá a {t24:.1f}°C en 24h")

    return factors[:4]
