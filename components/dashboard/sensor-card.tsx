"use client"

import { Card, CardContent } from "@/components/ui/card"
import { SENSOR_CONFIGS } from "@/lib/constants"
import {
  getSensorStatus,
  getSensorStatusLabel,
  getSensorStatusColor,
  getSensorStatusBg,
  formatSensorValue,
  getSensorPercentage,
} from "@/lib/sensor-utils"
import type { SensorType } from "@/lib/types"
import { Thermometer, Droplets, Sprout, Sun, Wind } from "lucide-react"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Thermometer,
  Droplets,
  Sprout,
  Sun,
  Wind,
}

interface SensorCardProps {
  type: SensorType
  value: number
  compact?: boolean
}

export function SensorCard({ type, value, compact }: SensorCardProps) {
  const config = SENSOR_CONFIGS[type]
  const status = getSensorStatus(type, value)
  const Icon = ICONS[config.icon] || Thermometer
  const percentage = getSensorPercentage(type, value)

  return (
    <Card className={`border-border/50 ${getSensorStatusBg(status)} transition-all`}>
      <CardContent className={compact ? "p-4" : "p-5"}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">
                {config.label}
              </p>
              <p className="mt-0.5 text-2xl font-bold tabular-nums text-card-foreground">
                {formatSensorValue(type, value)}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  {config.unit}
                </span>
              </p>
            </div>
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${getSensorStatusColor(status)} ${getSensorStatusBg(status)}`}
          >
            {getSensorStatusLabel(status)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{config.optimalMin}{config.unit}</span>
            <span>{config.optimalMax}{config.unit}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                status === "optimal"
                  ? "bg-success"
                  : status === "warning"
                    ? "bg-accent"
                    : "bg-destructive"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
