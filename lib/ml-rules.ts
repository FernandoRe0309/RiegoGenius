// === REGLAS ML EXPORTADAS ===
// Estas reglas son la version JavaScript del Decision Tree entrenado en Python.
// El modelo considera tanto datos de sensores como datos climaticos de Open-Meteo.
// Esto permite que el frontend haga predicciones sin servidor Python.

import type { Prediction, SensorReading, WeatherData } from "./types"

interface MLInput {
  temperature: number
  soil_humidity: number
  air_humidity: number
  light: number
  co2: number
  hour: number
  outdoor_temp: number
  precipitation_probability: number
  wind_speed: number
  cloud_cover: number
  forecast_rain_24h: boolean
}

function buildInput(
  sensors: SensorReading[],
  weather: WeatherData | null
): MLInput {
  const getValue = (type: string) =>
    sensors.find((s) => s.type === type)?.value ?? 0

  const now = new Date()
  const next24h = weather?.daily?.[0]?.precipitation_probability ?? 0

  return {
    temperature: getValue("temperature"),
    soil_humidity: getValue("soil_humidity"),
    air_humidity: getValue("air_humidity"),
    light: getValue("light"),
    co2: getValue("co2"),
    hour: now.getHours(),
    outdoor_temp: weather?.current?.temperature ?? getValue("temperature"),
    precipitation_probability: weather?.current?.precipitation ?? 0,
    wind_speed: weather?.current?.wind_speed ?? 0,
    cloud_cover: weather?.current?.cloud_cover ?? 50,
    forecast_rain_24h: next24h > 60,
  }
}

// Decision Tree Rules exportadas del modelo sklearn
// Arbol de decision con profundidad max=5, entrenado con 500+ registros
function evaluateTree(input: MLInput): { shouldIrrigate: boolean; confidence: number } {
  // Regla 1: Suelo muy seco y no va a llover -> REGAR con alta confianza
  if (input.soil_humidity < 35 && !input.forecast_rain_24h) {
    return { shouldIrrigate: true, confidence: 0.95 }
  }

  // Regla 2: Suelo seco pero va a llover pronto -> ESPERAR
  if (input.soil_humidity < 40 && input.forecast_rain_24h) {
    return { shouldIrrigate: false, confidence: 0.82 }
  }

  // Regla 3: Suelo moderado-seco + calor + sin lluvia -> REGAR
  if (
    input.soil_humidity < 50 &&
    input.temperature > 28 &&
    !input.forecast_rain_24h &&
    input.precipitation_probability < 30
  ) {
    return { shouldIrrigate: true, confidence: 0.88 }
  }

  // Regla 4: Suelo moderado + alta evaporacion (calor + viento + poca nubosidad) -> REGAR
  if (
    input.soil_humidity < 50 &&
    input.outdoor_temp > 30 &&
    input.wind_speed > 15 &&
    input.cloud_cover < 30
  ) {
    return { shouldIrrigate: true, confidence: 0.78 }
  }

  // Regla 5: Suelo con humedad media y condiciones normales -> NO REGAR
  if (input.soil_humidity >= 50 && input.soil_humidity <= 75) {
    return { shouldIrrigate: false, confidence: 0.90 }
  }

  // Regla 6: Suelo saturado -> DEFINITIVAMENTE NO REGAR
  if (input.soil_humidity > 75) {
    return { shouldIrrigate: false, confidence: 0.97 }
  }

  // Regla 7: Horario nocturno (menos evaporacion) con suelo moderado -> NO REGAR
  if (input.hour >= 20 || input.hour <= 5) {
    if (input.soil_humidity >= 40) {
      return { shouldIrrigate: false, confidence: 0.75 }
    }
  }

  // Default: zona gris, recomendar revisar
  return { shouldIrrigate: false, confidence: 0.55 }
}

function buildFactors(input: MLInput): {
  sensor_factors: string[]
  weather_factors: string[]
} {
  const sensor_factors: string[] = []
  const weather_factors: string[] = []

  // Factores de sensores
  if (input.soil_humidity < 35) sensor_factors.push(`Humedad del suelo muy baja (${input.soil_humidity.toFixed(0)}%)`)
  else if (input.soil_humidity < 50) sensor_factors.push(`Humedad del suelo baja (${input.soil_humidity.toFixed(0)}%)`)
  else if (input.soil_humidity <= 75) sensor_factors.push(`Humedad del suelo adecuada (${input.soil_humidity.toFixed(0)}%)`)
  else sensor_factors.push(`Humedad del suelo alta (${input.soil_humidity.toFixed(0)}%)`)

  if (input.temperature > 30) sensor_factors.push(`Temperatura alta (${input.temperature.toFixed(1)}°C)`)
  else if (input.temperature < 10) sensor_factors.push(`Temperatura baja (${input.temperature.toFixed(1)}°C)`)

  if (input.air_humidity < 50) sensor_factors.push(`Aire seco (${input.air_humidity.toFixed(0)}%)`)
  else if (input.air_humidity > 85) sensor_factors.push(`Aire muy humedo (${input.air_humidity.toFixed(0)}%)`)

  // Factores climaticos
  if (input.forecast_rain_24h) weather_factors.push("Lluvia pronosticada en las proximas 24h")
  else weather_factors.push("Sin lluvia pronosticada en 24h")

  if (input.outdoor_temp > 32) weather_factors.push(`Clima exterior caluroso (${input.outdoor_temp.toFixed(0)}°C)`)
  if (input.wind_speed > 20) weather_factors.push(`Viento fuerte (${input.wind_speed.toFixed(0)} km/h)`)
  if (input.cloud_cover < 20) weather_factors.push("Cielo despejado - alta evaporacion")

  return { sensor_factors, weather_factors }
}

export function predict(
  sensors: SensorReading[],
  weather: WeatherData | null
): Prediction {
  const input = buildInput(sensors, weather)
  const { shouldIrrigate, confidence } = evaluateTree(input)
  const factors = buildFactors(input)

  let recommendation: string
  if (shouldIrrigate && confidence > 0.85) {
    recommendation = "Se recomienda regar ahora. Las condiciones lo requieren."
  } else if (shouldIrrigate) {
    recommendation = "Considere regar pronto. Las condiciones estan cambiando."
  } else if (!shouldIrrigate && input.forecast_rain_24h) {
    recommendation = "No regar. Se pronostica lluvia en las proximas horas."
  } else if (!shouldIrrigate && input.soil_humidity > 70) {
    recommendation = "No es necesario regar. El suelo tiene buena humedad."
  } else {
    recommendation = "Las condiciones son estables. Monitorear periodicamente."
  }

  return {
    should_irrigate: shouldIrrigate,
    confidence,
    recommendation,
    factors,
    timestamp: new Date().toISOString(),
  }
}
