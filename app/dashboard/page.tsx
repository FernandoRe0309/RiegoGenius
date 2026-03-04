"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { SensorCard } from "@/components/dashboard/sensor-card"
import { SensorChart } from "@/components/dashboard/sensor-chart"
import { PredictionCard } from "@/components/dashboard/prediction-card"
import { WeatherCard } from "@/components/dashboard/weather-card"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SENSOR_ORDER, POLLING_INTERVAL } from "@/lib/constants"
import type {
  SensorReading,
  WeatherData,
  Prediction,
  Alert,
  SensorHistoryPoint,
  IrrigationStatus,
} from "@/lib/types"
import { Droplets, Bell, Activity } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function DashboardPage() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setLocation({ lat: 19.43, lon: -99.13 })
      )
    } else {
      setLocation({ lat: 19.43, lon: -99.13 })
    }
  }, [])

  // Sensores
  const { data: sensorData } = useSWR<{ readings: SensorReading[] }>(
    "/api/sensors",
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  )

  // Clima
  const { data: weatherData } = useSWR<WeatherData>(
    location ? `/api/weather?lat=${location.lat}&lon=${location.lon}` : null,
    fetcher,
    { refreshInterval: 600_000 }
  )

  // ─── Predicción ML real desde FastAPI ─────────────────────
  // Cada vez que se refresca, guarda la lectura + predicción en SQLite
  const { data: predData } = useSWR<{ prediction: Prediction }>(
    location ? `/api/predictions?lat=${location.lat}&lon=${location.lon}` : null,
    fetcher,
    { refreshInterval: POLLING_INTERVAL }
  )
  const prediction = predData?.prediction ?? null

  // Alertas
  const { data: alertData } = useSWR<{ alerts: Alert[] }>("/api/alerts", fetcher)

  // Riego
  const { data: irrigationData } = useSWR<IrrigationStatus>("/api/irrigation", fetcher)

  // Historial de temperatura
  const { data: tempHistory } = useSWR<{ history: SensorHistoryPoint[] }>(
    "/api/sensors/history?type=temperature&hours=24",
    fetcher
  )

  const readings = sensorData?.readings || []
  const activeAlerts = alertData?.alerts?.filter((a) => !a.resolved) || []

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Resumen General</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vista general de tu cultivo en tiempo real
        </p>
      </div>

      {/* Top row: Weather + Prediction + Irrigation quick status */}
      <div className="grid gap-4 md:grid-cols-3">
        <WeatherCard weather={weatherData ?? null} loading={!location} />
        <PredictionCard prediction={prediction} loading={!predData} />
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Riego</p>
                <p className="mt-1 text-lg font-bold text-foreground">
                  {irrigationData?.active ? "Activo" : "Inactivo"}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {irrigationData?.lastEvent
                    ? `Último riego: ${new Date(irrigationData.lastEvent.startTime).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`
                    : "Sin eventos recientes"}
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Droplets className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {irrigationData?.todayUsage ?? 0} ml consumidos hoy
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sensor cards grid */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Sensores</h2>
          <span className="text-xs text-muted-foreground">Actualizacion cada 30s</span>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {SENSOR_ORDER.map((type) => {
            const reading = readings.find((r) => r.type === type)
            return (
              <SensorCard key={type} type={type} value={reading?.value ?? 0} compact />
            )
          })}
        </div>
      </div>

      {/* Temperature chart + Alerts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SensorChart
            type="temperature"
            data={tempHistory?.history || []}
            title="Temperatura - Ultimas 24h"
          />
        </div>

        {/* Recent alerts */}
        <Card className="border-border/50">
          <CardContent className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Alertas Recientes</h3>
              {activeAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-auto text-[10px]">
                  {activeAlerts.length}
                </Badge>
              )}
            </div>
            <div className="flex flex-col gap-3">
              {(alertData?.alerts || []).slice(0, 4).map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg border p-3 ${
                    alert.resolved
                      ? "border-border bg-muted/30"
                      : alert.severity === "critical"
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-accent/30 bg-accent/5"
                  }`}
                >
                  <p className="text-xs font-medium text-foreground">{alert.message}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString("es-MX")}
                    {alert.resolved && " - Resuelta"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
