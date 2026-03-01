// === UTILIDADES DE SENSORES ===
// Evalua el estado de un sensor basandose en los rangos optimos del jitomate.

import { SENSOR_CONFIGS } from "./constants"
import type { SensorType } from "./types"

export function getSensorStatus(
  type: SensorType,
  value: number
): "optimal" | "warning" | "critical" {
  const config = SENSOR_CONFIGS[type]
  if (value < config.criticalMin || value > config.criticalMax) return "critical"
  if (value < config.optimalMin || value > config.optimalMax) return "warning"
  return "optimal"
}

export function getSensorStatusLabel(status: "optimal" | "warning" | "critical"): string {
  const labels = {
    optimal: "Optimo",
    warning: "Precaucion",
    critical: "Critico",
  }
  return labels[status]
}

export function getSensorStatusColor(status: "optimal" | "warning" | "critical"): string {
  const colors = {
    optimal: "text-success",
    warning: "text-accent",
    critical: "text-destructive",
  }
  return colors[status]
}

export function getSensorStatusBg(status: "optimal" | "warning" | "critical"): string {
  const colors = {
    optimal: "bg-success/10",
    warning: "bg-accent/10",
    critical: "bg-destructive/10",
  }
  return colors[status]
}

export function formatSensorValue(type: SensorType, value: number): string {
  const config = SENSOR_CONFIGS[type]
  if (type === "light") {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return `${Math.round(value)}`
  }
  if (type === "co2") return `${Math.round(value)}`
  return `${value.toFixed(1)}`
}

export function getSensorPercentage(type: SensorType, value: number): number {
  const config = SENSOR_CONFIGS[type]
  return Math.max(0, Math.min(100, ((value - config.min) / (config.max - config.min)) * 100))
}
