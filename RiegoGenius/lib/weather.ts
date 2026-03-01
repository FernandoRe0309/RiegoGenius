// === OPEN-METEO API - CLIMA GRATUITO SIN API KEY ===
// Funciones para consultar la API de Open-Meteo.
// No requiere registro, no requiere API key. Solo un fetch con coordenadas.

import { WEATHER_CODES } from "./constants"
import type { GeocodingResult, WeatherData, UserLocation } from "./types"

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "wind_speed_10m",
      "cloud_cover",
      "weather_code",
    ].join(","),
    hourly: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation_probability",
    ].join(","),
    daily: [
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "precipitation_sum",
      "weather_code",
    ].join(","),
    forecast_days: "7",
    timezone: "auto",
  })

  const res = await fetch(`${FORECAST_URL}?${params}`)
  if (!res.ok) throw new Error("Error al obtener datos del clima")

  const data = await res.json()

  return {
    location: { lat, lon, city: "" },
    current: {
      temperature: data.current.temperature_2m,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      wind_speed: data.current.wind_speed_10m,
      cloud_cover: data.current.cloud_cover,
      weather_code: data.current.weather_code,
    },
    hourly: data.hourly.time.slice(0, 48).map((time: string, i: number) => ({
      time,
      temperature: data.hourly.temperature_2m[i],
      precipitation_probability: data.hourly.precipitation_probability[i],
      humidity: data.hourly.relative_humidity_2m[i],
    })),
    daily: data.daily.time.map((date: string, i: number) => ({
      date,
      temp_max: data.daily.temperature_2m_max[i],
      temp_min: data.daily.temperature_2m_min[i],
      precipitation_probability: data.daily.precipitation_probability_max[i],
      precipitation_sum: data.daily.precipitation_sum[i],
      weather_code: data.daily.weather_code[i],
    })),
    updatedAt: new Date().toISOString(),
  }
}

export async function searchCity(name: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({
    name,
    count: "5",
    language: "es",
  })

  const res = await fetch(`${GEOCODING_URL}?${params}`)
  if (!res.ok) throw new Error("Error al buscar ciudad")

  const data = await res.json()
  return (data.results || []).map((r: Record<string, unknown>) => ({
    id: r.id,
    name: r.name,
    latitude: r.latitude,
    longitude: r.longitude,
    country: r.country,
    admin1: r.admin1,
  }))
}

export function getWeatherDescription(code: number): string {
  return WEATHER_CODES[code]?.description ?? "Desconocido"
}

export function getWeatherIconName(code: number): string {
  return WEATHER_CODES[code]?.icon ?? "Cloud"
}
