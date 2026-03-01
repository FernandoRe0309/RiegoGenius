"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SensorChart } from "@/components/dashboard/sensor-chart"
import { SENSOR_CONFIGS, SENSOR_ORDER } from "@/lib/constants"
import type { SensorHistoryPoint, SensorType } from "@/lib/types"
import { History, Calendar } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const TIME_RANGES = [
  { label: "6h", hours: 6 },
  { label: "12h", hours: 12 },
  { label: "24h", hours: 24 },
  { label: "48h", hours: 48 },
  { label: "7d", hours: 168 },
]

export default function HistorialPage() {
  const [selectedRange, setSelectedRange] = useState(24)
  const [selectedSensor, setSelectedSensor] = useState<SensorType>("temperature")

  // Fetch history for selected sensor and range
  const { data } = useSWR<{ history: SensorHistoryPoint[] }>(
    `/api/sensors/history?type=${selectedSensor}&hours=${selectedRange}`,
    fetcher
  )

  // Fetch all sensor histories for comparison view
  const allHistories = SENSOR_ORDER.map((type) => {
    const { data: h } = useSWR<{ history: SensorHistoryPoint[] }>(
      `/api/sensors/history?type=${type}&hours=${selectedRange}`,
      fetcher
    )
    return { type, data: h?.history || [] }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Historial</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualiza las tendencias historicas de todos tus sensores
        </p>
      </div>

      {/* Time range selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Rango:</span>
        <div className="flex gap-1">
          {TIME_RANGES.map((range) => (
            <button
              key={range.hours}
              onClick={() => setSelectedRange(range.hours)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedRange === range.hours
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="individual" className="w-full">
        <TabsList>
          <TabsTrigger value="individual">Sensor Individual</TabsTrigger>
          <TabsTrigger value="todos">Todos los Sensores</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="mt-4 flex flex-col gap-4">
          {/* Sensor selector */}
          <div className="flex flex-wrap gap-2">
            {SENSOR_ORDER.map((type) => {
              const config = SENSOR_CONFIGS[type]
              return (
                <button
                  key={type}
                  onClick={() => setSelectedSensor(type)}
                  className={`rounded-lg border px-4 py-2 text-xs font-medium transition-colors ${
                    selectedSensor === type
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {config.label}
                </button>
              )
            })}
          </div>

          {/* Main chart */}
          <SensorChart
            type={selectedSensor}
            data={data?.history || []}
            title={`${SENSOR_CONFIGS[selectedSensor].label} - Ultimas ${
              selectedRange >= 24
                ? `${selectedRange / 24}d`
                : `${selectedRange}h`
            }`}
          />

          {/* Stats */}
          {data?.history && data.history.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-4">
              {(() => {
                const values = data.history.map((p) => p.value)
                const config = SENSOR_CONFIGS[selectedSensor]
                const avg = values.reduce((s, v) => s + v, 0) / values.length
                const min = Math.min(...values)
                const max = Math.max(...values)
                const inRange = values.filter(
                  (v) => v >= config.optimalMin && v <= config.optimalMax
                ).length

                return [
                  { label: "Promedio", value: `${avg.toFixed(1)} ${config.unit}` },
                  { label: "Minimo", value: `${min.toFixed(1)} ${config.unit}` },
                  { label: "Maximo", value: `${max.toFixed(1)} ${config.unit}` },
                  {
                    label: "Tiempo en rango optimo",
                    value: `${((inRange / values.length) * 100).toFixed(0)}%`,
                  },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border/50">
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                ))
              })()}
            </div>
          )}
        </TabsContent>

        <TabsContent value="todos" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-2">
            {allHistories.map(({ type, data: historyData }) => (
              <SensorChart
                key={type}
                type={type}
                data={historyData}
                title={`${SENSOR_CONFIGS[type].label} - Ultimas ${
                  selectedRange >= 24
                    ? `${selectedRange / 24}d`
                    : `${selectedRange}h`
                }`}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
