"use client"

import useSWR from "swr"
import { SensorCard } from "@/components/dashboard/sensor-card"
import { SensorChart } from "@/components/dashboard/sensor-chart"
import { SENSOR_ORDER, SENSOR_CONFIGS, POLLING_INTERVAL } from "@/lib/constants"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SensorReading, SensorHistoryPoint, SensorType } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SensoresPage() {
  const { data: sensorData } = useSWR<{ readings: SensorReading[] }>(
    "/api/sensors",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  )

  const readings = sensorData?.readings || []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sensores</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado detallado de cada sensor y graficas historicas
        </p>
      </div>

      {/* Current values */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SENSOR_ORDER.map((type) => {
          const reading = readings.find((r) => r.type === type)
          return (
            <SensorCard key={type} type={type} value={reading?.value ?? 0} />
          )
        })}
      </div>

      {/* Individual charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {SENSOR_ORDER.map((type) => (
          <SensorChartLoader key={type} type={type} />
        ))}
      </div>

      {/* Info card */}
      <Card className="border-border/50 bg-primary/5">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-foreground">
            Rangos optimos del jitomate
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Estos rangos estan basados en la documentacion cientifica para el
            cultivo de jitomate en invernadero.
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {SENSOR_ORDER.map((type) => {
              const config = SENSOR_CONFIGS[type]
              return (
                <div
                  key={type}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <p className="text-xs font-medium text-foreground">
                    {config.label}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optimo: {config.optimalMin}-{config.optimalMax} {config.unit}
                  </p>
                  <p className="text-[10px] text-destructive/70">
                    Critico: {"<"}{config.criticalMin} o {">"}{config.criticalMax} {config.unit}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function SensorChartLoader({ type }: { type: SensorType }) {
  const { data } = useSWR<{ history: SensorHistoryPoint[] }>(
    `/api/sensors/history?type=${type}&hours=24`,
    fetcher
  )

  return (
    <SensorChart
      type={type}
      data={data?.history || []}
      title={`${SENSOR_CONFIGS[type].label} - Ultimas 24h`}
    />
  )
}
