// === CONSTANTES DE RIEGOGENIUS ===
// Rangos optimos del jitomate basados en la documentacion del proyecto.
// Fuente: proain.com, documentacion tecnica del capitulo I.

import type { SensorConfig, SensorType } from "./types"

// Configuracion de cada sensor con rangos optimos del jitomate
export const SENSOR_CONFIGS: Record<SensorType, SensorConfig> = {
  temperature: {
    type: "temperature",
    label: "Temperatura",
    unit: "°C",
    icon: "Thermometer",
    min: 0,
    max: 50,
    optimalMin: 15,
    optimalMax: 28,
    criticalMin: 8,
    criticalMax: 35,
    color: "var(--chart-5)",
  },
  air_humidity: {
    type: "air_humidity",
    label: "Humedad del Aire",
    unit: "%",
    icon: "Droplets",
    min: 0,
    max: 100,
    optimalMin: 60,
    optimalMax: 80,
    criticalMin: 40,
    criticalMax: 95,
    color: "var(--chart-4)",
  },
  soil_humidity: {
    type: "soil_humidity",
    label: "Humedad del Suelo",
    unit: "%",
    icon: "Sprout",
    min: 0,
    max: 100,
    optimalMin: 50,
    optimalMax: 75,
    criticalMin: 30,
    criticalMax: 90,
    color: "var(--chart-1)",
  },
  light: {
    type: "light",
    label: "Luz Solar",
    unit: "lux",
    icon: "Sun",
    min: 0,
    max: 100000,
    optimalMin: 20000,
    optimalMax: 70000,
    criticalMin: 5000,
    criticalMax: 90000,
    color: "var(--chart-3)",
  },
  co2: {
    type: "co2",
    label: "CO2",
    unit: "ppm",
    icon: "Wind",
    min: 200,
    max: 2000,
    optimalMin: 350,
    optimalMax: 1000,
    criticalMin: 200,
    criticalMax: 1500,
    color: "var(--chart-2)",
  },
}

// Lista ordenada de sensores para renderizar
export const SENSOR_ORDER: SensorType[] = [
  "temperature",
  "soil_humidity",
  "air_humidity",
  "light",
  "co2",
]

// Mapeo de codigos de clima Open-Meteo a descripciones en espanol
export const WEATHER_CODES: Record<number, { description: string; icon: string }> = {
  0: { description: "Despejado", icon: "Sun" },
  1: { description: "Mayormente despejado", icon: "Sun" },
  2: { description: "Parcialmente nublado", icon: "CloudSun" },
  3: { description: "Nublado", icon: "Cloud" },
  45: { description: "Niebla", icon: "CloudFog" },
  48: { description: "Niebla con escarcha", icon: "CloudFog" },
  51: { description: "Llovizna ligera", icon: "CloudDrizzle" },
  53: { description: "Llovizna moderada", icon: "CloudDrizzle" },
  55: { description: "Llovizna densa", icon: "CloudDrizzle" },
  61: { description: "Lluvia ligera", icon: "CloudRain" },
  63: { description: "Lluvia moderada", icon: "CloudRain" },
  65: { description: "Lluvia fuerte", icon: "CloudRain" },
  71: { description: "Nevada ligera", icon: "Snowflake" },
  73: { description: "Nevada moderada", icon: "Snowflake" },
  75: { description: "Nevada fuerte", icon: "Snowflake" },
  80: { description: "Chubascos ligeros", icon: "CloudRain" },
  81: { description: "Chubascos moderados", icon: "CloudRain" },
  82: { description: "Chubascos violentos", icon: "CloudRain" },
  95: { description: "Tormenta", icon: "CloudLightning" },
  96: { description: "Tormenta con granizo ligero", icon: "CloudLightning" },
  99: { description: "Tormenta con granizo fuerte", icon: "CloudLightning" },
}

// Nombres de dias en espanol
export const DAYS_ES = [
  "Domingo", "Lunes", "Martes", "Miercoles",
  "Jueves", "Viernes", "Sabado",
]

export const DAYS_SHORT_ES = [
  "Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab",
]

// Umbrales por defecto para alertas
export const DEFAULT_THRESHOLDS = SENSOR_ORDER.map((type) => ({
  sensor: type,
  min: SENSOR_CONFIGS[type].optimalMin,
  max: SENSOR_CONFIGS[type].optimalMax,
}))

// Intervalo de actualizacion de datos (en ms)
export const POLLING_INTERVAL = 30_000 // 30 segundos
export const WEATHER_CACHE_DURATION = 600_000 // 10 minutos
