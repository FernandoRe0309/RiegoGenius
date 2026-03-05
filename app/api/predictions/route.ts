// app/api/predictions/route.ts
import { NextRequest, NextResponse } from "next/server"
import { apiGet, apiPost } from "@/lib/api-proxy"
import { getSensorStatus } from "@/lib/sensor-utils"
import { SENSOR_CONFIGS } from "@/lib/constants"
import type { Prediction, SensorReading } from "@/lib/types"

/** Convierte la respuesta de FastAPI al tipo Prediction que usa el frontend */
function adaptPrediction(p: Record<string, unknown>): Prediction {
  const urgency = p.urgency as string
  const urgencyMessages: Record<string, string> = {
    none: "No es necesario regar. El suelo tiene buena humedad.",
    low: "Las condiciones son estables. Monitorear periódicamente.",
    medium: "Se recomienda regar pronto. Las condiciones lo requieren.",
    high: "¡Riego urgente! El suelo está muy seco.",
  }
  return {
    should_irrigate: p.should_irrigate as boolean,
    confidence: p.confidence as number,
    recommendation: urgencyMessages[urgency] ?? "Monitorear las condiciones del cultivo.",
    factors: {
      sensor_factors: (p.sensor_factors as string[]) ?? [],
      weather_factors: (p.weather_factors as string[]) ?? [],
    },
    timestamp: p.timestamp as string,
  }
}

/**
 * GET /api/predictions
 * 1. Obtiene lectura actual de sensores
 * 2. Obtiene clima de Open-Meteo
 * 3. Guarda lectura en SQLite
 * 4. Corre el modelo Random Forest
 * 5. Devuelve Prediction en el formato que espera el frontend
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lat = sp.get("lat") ?? "19.43"
  const lon = sp.get("lon") ?? "-99.13"

  // 1. Lectura de sensores
  const { data: sensorData } = await apiGet("/sensors/current")
  const raw = sensorData.readings as Record<string, number>

  // 2. Clima externo (Open-Meteo, sin API key)
  let weatherFeatures: Record<string, number> = {}
  let hasWeather = false
  try {
    const wRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,cloud_cover` +
      `&hourly=temperature_2m&forecast_days=2`,
      { cache: "no-store" }
    )
    if (wRes.ok) {
      const w = await wRes.json()
      const c = w.current
      weatherFeatures = {
        weather_temp: c.temperature_2m,
        weather_humidity: c.relative_humidity_2m,
        weather_rain_prob: c.precipitation_probability ?? 20,
        weather_wind: c.wind_speed_10m,
        weather_clouds: c.cloud_cover,
        weather_temp_24h: w.hourly?.temperature_2m?.[24] ?? c.temperature_2m,
      }
      hasWeather = true
    }
  } catch {
    // Sin clima, el modelo usa defaults internamente
  }

  // 3. Guardar lectura completa en SQLite
  const fullReading = {
    source: sensorData.source ?? "simulated",
    ...raw,
    ...weatherFeatures,
  }
  const { data: savedReading } = await apiPost("/sensors/", fullReading)

  // 4. Correr predicción ML usando la lectura guardada
  const { data: mlResult } = await apiPost("/predictions/predict", {
    sensor_reading_id: savedReading.id,
  })

  // 5. Info del modelo entrenado
  const { data: modelInfo } = await apiGet("/predictions/model-info")

  // Adaptar respuesta al tipo Prediction del frontend
  const prediction = adaptPrediction(mlResult)

  // También devolver readings en formato SensorReading[] para las páginas que lo usan
  const readings: SensorReading[] = (
    ["temperature", "air_humidity", "soil_humidity", "light", "co2"] as const
  ).map((type) => ({
    type,
    value: raw[type] ?? 0,
    unit: SENSOR_CONFIGS[type].unit,
    timestamp: new Date().toISOString(),
    status: getSensorStatus(type, raw[type] ?? 0),
  }))

  return NextResponse.json({ prediction, sensors: readings, hasWeather, model: modelInfo })
}

/** POST /api/predictions — predicción con datos manuales */
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, status } = await apiPost("/predictions/predict", body)
  return NextResponse.json(adaptPrediction(data), { status })
}
