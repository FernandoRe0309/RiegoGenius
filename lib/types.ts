// === TIPOS PRINCIPALES DE RIEGOGENIUS ===
// Todos los tipos del sistema, usados tanto en frontend como en API routes.

export type SensorType =
  | "temperature"
  | "air_humidity"
  | "soil_humidity"
  | "light"
  | "co2"

export interface SensorReading {
  type: SensorType
  value: number
  unit: string
  timestamp: string
  status: "optimal" | "warning" | "critical"
}

export interface SensorHistoryPoint {
  timestamp: string
  value: number
}

export interface SensorConfig {
  type: SensorType
  label: string
  unit: string
  icon: string
  min: number
  max: number
  optimalMin: number
  optimalMax: number
  criticalMin: number
  criticalMax: number
  color: string
}

// === CLIMA (Open-Meteo) ===

export interface UserLocation {
  lat: number
  lon: number
  city: string
  country?: string
}

export interface WeatherCurrent {
  temperature: number
  humidity: number
  precipitation: number
  wind_speed: number
  cloud_cover: number
  weather_code: number
}

export interface WeatherHourly {
  time: string
  temperature: number
  precipitation_probability: number
  humidity: number
}

export interface WeatherDaily {
  date: string
  temp_max: number
  temp_min: number
  precipitation_probability: number
  precipitation_sum: number
  weather_code: number
}

export interface WeatherData {
  location: UserLocation
  current: WeatherCurrent
  hourly: WeatherHourly[]
  daily: WeatherDaily[]
  updatedAt: string
}

export interface GeocodingResult {
  id: number
  name: string
  latitude: number
  longitude: number
  country: string
  admin1?: string
}

// === PREDICCIONES ML ===

export interface PredictionFactors {
  sensor_factors: string[]
  weather_factors: string[]
}

export interface Prediction {
  should_irrigate: boolean
  confidence: number
  recommendation: string
  factors: PredictionFactors
  timestamp: string
}

// === ALERTAS ===

export type AlertSeverity = "info" | "warning" | "critical"

export interface Alert {
  id: string
  sensor: SensorType
  message: string
  severity: AlertSeverity
  timestamp: string
  resolved: boolean
}

// === RIEGO ===

export interface IrrigationEvent {
  id: string
  startTime: string
  endTime?: string
  trigger: "manual" | "automatic" | "ml_recommendation"
  waterAmount?: number
}

export interface IrrigationStatus {
  active: boolean
  lastEvent?: IrrigationEvent
  todayUsage: number
  events: IrrigationEvent[]
}

// === UMBRALES (Configuracion) ===

export interface ThresholdConfig {
  sensor: SensorType
  min: number
  max: number
}
