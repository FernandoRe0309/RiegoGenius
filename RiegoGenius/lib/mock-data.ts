// === DATOS SIMULADOS REALISTAS ===
// Genera datos de sensores con variacion sinusoidal (ciclo dia/noche).
// Basado en rangos optimos del jitomate de la documentacion.
// En produccion, estos se reemplazan con datos reales del Raspberry Pi 400.

import type { SensorReading, SensorType, Alert, IrrigationStatus, SensorHistoryPoint } from "./types"
import { SENSOR_CONFIGS, SENSOR_ORDER } from "./constants"
import { getSensorStatus } from "./sensor-utils"

// Genera un valor con variacion sinusoidal basada en la hora del dia
function generateSensorValue(type: SensorType, now: Date): number {
  const hour = now.getHours() + now.getMinutes() / 60
  const noise = (Math.random() - 0.5) * 2

  switch (type) {
    case "temperature": {
      // Ciclo dia/noche: pico a las 14h, minimo a las 5h
      const base = 22
      const amplitude = 6
      const value = base + amplitude * Math.sin(((hour - 5) / 24) * 2 * Math.PI)
      return Math.max(8, Math.min(38, value + noise))
    }
    case "air_humidity": {
      // Inverso a temperatura: mas humedo de noche
      const base = 68
      const amplitude = 12
      const value = base - amplitude * Math.sin(((hour - 5) / 24) * 2 * Math.PI)
      return Math.max(30, Math.min(95, value + noise * 2))
    }
    case "soil_humidity": {
      // Decrece lentamente durante el dia (evaporacion), sube con riego
      const base = 58
      const amplitude = 8
      const value = base - amplitude * Math.sin(((hour - 8) / 24) * 2 * Math.PI)
      return Math.max(15, Math.min(90, value + noise * 1.5))
    }
    case "light": {
      // Pico al mediodia, cero de noche
      if (hour < 6 || hour > 20) return 100 + Math.random() * 200
      const peak = 55000
      const value = peak * Math.sin(((hour - 6) / 14) * Math.PI)
      return Math.max(0, value + noise * 3000)
    }
    case "co2": {
      // Mas CO2 de noche (plantas respiran), menos de dia (fotosintesis)
      const base = 500
      const amplitude = 150
      const value = base + amplitude * Math.cos(((hour - 5) / 24) * 2 * Math.PI)
      return Math.max(250, Math.min(1200, value + noise * 20))
    }
    default:
      return 0
  }
}

export function generateCurrentReadings(now?: Date): SensorReading[] {
  const timestamp = now || new Date()
  return SENSOR_ORDER.map((type) => {
    const value = generateSensorValue(type, timestamp)
    return {
      type,
      value,
      unit: SENSOR_CONFIGS[type].unit,
      timestamp: timestamp.toISOString(),
      status: getSensorStatus(type, value),
    }
  })
}

export function generateHistory(
  type: SensorType,
  hours: number = 24,
  intervalMinutes: number = 30
): SensorHistoryPoint[] {
  const points: SensorHistoryPoint[] = []
  const now = new Date()
  const totalPoints = Math.floor((hours * 60) / intervalMinutes)

  for (let i = totalPoints; i >= 0; i--) {
    const time = new Date(now.getTime() - i * intervalMinutes * 60 * 1000)
    points.push({
      timestamp: time.toISOString(),
      value: generateSensorValue(type, time),
    })
  }
  return points
}

export function generateAllSensorHistory(
  hours: number = 24,
  intervalMinutes: number = 30
): Record<SensorType, SensorHistoryPoint[]> {
  const result = {} as Record<SensorType, SensorHistoryPoint[]>
  for (const type of SENSOR_ORDER) {
    result[type] = generateHistory(type, hours, intervalMinutes)
  }
  return result
}

export function generateAlerts(): Alert[] {
  const now = new Date()
  return [
    {
      id: "alert-1",
      sensor: "temperature",
      message: "Temperatura por encima de 30°C durante 45 minutos",
      severity: "warning",
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
    {
      id: "alert-2",
      sensor: "soil_humidity",
      message: "Humedad del suelo por debajo del 35%. Se recomienda regar.",
      severity: "critical",
      timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      resolved: false,
    },
    {
      id: "alert-3",
      sensor: "co2",
      message: "Niveles de CO2 elevados. Verificar ventilacion.",
      severity: "info",
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      resolved: true,
    },
  ]
}

export function generateIrrigationStatus(): IrrigationStatus {
  const now = new Date()
  return {
    active: false,
    lastEvent: {
      id: "irr-1",
      startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(now.getTime() - 5.8 * 60 * 60 * 1000).toISOString(),
      trigger: "automatic",
      waterAmount: 250,
    },
    todayUsage: 750,
    events: [
      {
        id: "irr-1",
        startTime: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 5.8 * 60 * 60 * 1000).toISOString(),
        trigger: "automatic",
        waterAmount: 250,
      },
      {
        id: "irr-2",
        startTime: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 17.7 * 60 * 60 * 1000).toISOString(),
        trigger: "ml_recommendation",
        waterAmount: 300,
      },
      {
        id: "irr-3",
        startTime: new Date(now.getTime() - 30 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(now.getTime() - 29.8 * 60 * 60 * 1000).toISOString(),
        trigger: "manual",
        waterAmount: 200,
      },
    ],
  }
}
